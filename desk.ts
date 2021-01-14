import { Gpio } from 'onoff';
import { ApiClient, UserIdResolvable } from "twitch";
import { getTokenInfo, StaticAuthProvider } from "twitch-auth";
import { PubSubClient } from "twitch-pubsub-client";

require('dotenv').config({ path: 'twitch.env' });

const UP = 'YourIdHere';
const DOWN = 'YourIdHere';

(async () => {
    const gpio1 = new Gpio(26, 'out');
    const gpio2 = new Gpio(20, 'out');

    if (process.env.TWITCH_TOKEN === undefined) {
        throw new Error("No twitch token provided");
    }
    const tokenInfo = await getTokenInfo(process.env.TWITCH_TOKEN);
    const authProvider = new StaticAuthProvider(tokenInfo.clientId, process.env.TWITCH_TOKEN, tokenInfo.scopes);
    const twitch = new ApiClient({ authProvider });
    const pubSub = new PubSubClient();
    const userID = await pubSub.registerUserListener(twitch);
    
    await enableRewards(twitch, userID);

    await pubSub.onRedemption(userID, async msg => {
        console.log(`Channel: ${msg.channelId}, Reward: ${msg.rewardId}`);
        if (msg.channelId.toLowerCase() == userID) {
            if (msg.rewardId == UP) {
                sendTableCommand(gpio1);
                await applyCooldown(twitch, userID);
            } else if (msg.rewardId == DOWN) {
                sendTableCommand(gpio2);
                await applyCooldown(twitch, userID);
            }
        }
    })
})()

function sendTableCommand(gpio: Gpio): void {
    gpio.writeSync(1);
    setTimeout(() => gpio.writeSync(0), 2000);
}

async function applyCooldown(twitch: ApiClient, userID: UserIdResolvable): Promise<void> {
    await twitch.helix.channelPoints.updateCustomReward(userID, UP, {
        isPaused: true
    });
    await twitch.helix.channelPoints.updateCustomReward(userID, DOWN, {
        isPaused: true
    });
    setTimeout(async () => await enableRewards(twitch, userID), 15 * 60 * 1000);
}

async function enableRewards(twitch: ApiClient, userID: UserIdResolvable): Promise<void> {
    await twitch.helix.channelPoints.updateCustomReward(userID, UP, {
        isPaused: false
    });
    await twitch.helix.channelPoints.updateCustomReward(userID, DOWN, {
        isPaused: false
    });
}
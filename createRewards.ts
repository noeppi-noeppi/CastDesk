import { ApiClient } from "twitch";
import { getTokenInfo, StaticAuthProvider } from "twitch-auth";
import { PubSubClient } from "twitch-pubsub-client";

require('dotenv').config({ path: 'twitch.env' });

(async () => {

    if (process.env.TWITCH_TOKEN === undefined) {
        throw new Error("No twitch token provided");
    }
    const tokenInfo = await getTokenInfo(process.env.TWITCH_TOKEN);
    const authProvider = new StaticAuthProvider(tokenInfo.clientId, process.env.TWITCH_TOKEN, tokenInfo.scopes);
    const twitch = new ApiClient({ authProvider });
    const pubSub = new PubSubClient();
    const userID = await pubSub.registerUserListener(twitch);
    
    console.log((await twitch.helix.channelPoints.createCustomReward(userID, {
        cost: 15000,
        title: "Tisch Hoch"

    })).id);

    console.log((await twitch.helix.channelPoints.createCustomReward(userID, {
        cost: 15000,
        title: "Tisch Runter"

    })).id);
})()
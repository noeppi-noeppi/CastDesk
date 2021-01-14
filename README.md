# CastDesk

This code is used to control the height of [CastCrafters](https://twitch.tv/castcrafter) desk.

To use it you need to install the project's dependencies: `npm install`

You'll also need a twitch token with the scopes `channel:read:redemptions` and `channel:manage:redemptions`. Put that token in `twitch.env`.

The application can only manage rewards, that it created. So at first you need to run `createRewards.js`. Make sure you build the project before with `npm run build`. This will generate two new rewards and print the ids. You can then fill in those ids in `desk.ts`. (Into the constants `UP` and `DOWN`).

Then you need to connect the desk via GPIO and make sure you adjust the GPIO values for your needs.

Now you can build the project again and run `desk.js`. The viewers wil be able to move the table up and down every 15 minutes.
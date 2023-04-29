const { App } = require('@slack/bolt');
require('dotenv').config()

console.log(process.env.SLACK_BOT_TOKEN)
console.log(process.env.SLACK_SIGNING_SECRET)
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`hello there <@${message.user}>!`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.view()

  console.log('⚡️ Bolt app is running!');
})();

import pkg from '@slack/bolt';
const { App } = pkg;

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN ?? "",
  signingSecret: process.env.SLACK_SIGNING_SECRET ?? ""
});

app.message('hello', async ({ message, say } ) => {
  // say() sends a message to the channel where the event was triggered
  if(message.subtype == undefined || message.subtype == "bot_message") {
    await say(`hello there <@${message.user}>!`);
  }
});

// Start your app
await app.start(process.env.PORT || 9000);

console.log('⚡️ Bolt app is running!');

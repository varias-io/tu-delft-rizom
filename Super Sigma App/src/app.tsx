import pkg from '@slack/bolt';
import { Divider, Header, Home, JSXSlack, Section, Select, Option, Mrkdwn,  } from 'jsx-slack';
import { CustomActions } from './components/CustomActions.js';
const { App } = pkg;

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN ?? "",
  signingSecret: process.env.SLACK_SIGNING_SECRET ?? ""
});

app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  if (message.subtype == undefined || message.subtype == "bot_message") {
    await say(`hello there <@${message.user}>!`);
  }
});

// Start your app
await app.start(process.env.PORT || 9000);

app.client.views.publish({
  user_id: "U0550F2EP35",
  view: JSXSlack(
    <Home>
      <Header>Welcome back to my home! :house_with_garden:</Header>
      <Divider />
      <Section>What's bruh?</Section>
      <CustomActions first_button_b='New BEEEEs' second_button_b="i don't care i already saw it" />
      <Select multiple label='kringe'><Option > <Mrkdwn>Haha *hehe*</Mrkdwn> </Option></Select>
    </Home>
  )
})

console.log('⚡️ Bolt app is running!');

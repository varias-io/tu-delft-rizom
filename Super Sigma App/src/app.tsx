import pkg from '@slack/bolt';
import { Divider, Header, Home, JSXSlack, Section, Select, Option, Mrkdwn,  } from 'jsx-slack';
import { CustomActions } from './components/CustomActions.js';
import { entityManager } from './utils.js';
import { User } from './entity/User.js';
import { Channel } from './entity/Channel.js';
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

/* eslint-disable */
//@ts-ignore
const exampleUsersAndChannels = async () => {
  const user = entityManager.create(User, {
    slackId: "U0550F2EP35",
  })
  
  const channel1 = entityManager.create(Channel, {
    slackId: "U0550F2EP36",
    managers: []
  })
  
  const channel2 = entityManager.create(Channel, {
    slackId: "U0550F2EP37",
    managers: []
  })
  
  const [newChannel1, newChannel2, newUser] = await Promise.all([channel1.save(), channel2.save(), user.save()])
  
  console.log(newUser)
  
  newUser.managedChannels = [newChannel1, newChannel2]
  
  newUser.save()
}
/* eslint-enable */

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

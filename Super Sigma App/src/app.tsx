import pkg from '@slack/bolt';
import { Header, Home, JSXSlack,  } from 'jsx-slack';
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

app.event("app_home_opened", async ({payload}) => {
  console.log(payload)
  if (payload.tab == "home") {
    app.client.views.publish({
      user_id: payload.user,
      view: JSXSlack(
        <Home>
          <Header>{(await app.client.users.info({user: payload.user})).user?.color}</Header>
        </Home>
      )
    })
  }
})

console.log('⚡️ Bolt app is running!');

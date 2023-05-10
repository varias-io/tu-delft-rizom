import { app, entityManager, getUsersFromChannels, sendDM } from './utils/index.js';
import { Header, Home, JSXSlack,  } from 'jsx-slack';
import { User } from "./entity/User.js"
import { Channel } from "./entity/Channel.js"

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

app.event("app_home_opened", async ({context, payload}) => {
  if (payload.tab == "home") {
    app.client.views.publish({
      user_id: payload.user,
      token: context.botToken ?? "",
      view: JSXSlack(
        <Home>
          <Header>{(await app.client.users.info({user: payload.user, token: context.botToken ?? ""})).user?.real_name}</Header>
        </Home>
      )
    })
  }
})

const users = await getUsersFromChannels({channels: ["C0576HMBEJG"]})
sendDM({users: users, message: "Hello World"})

console.log('⚡️ Bolt app is running!');

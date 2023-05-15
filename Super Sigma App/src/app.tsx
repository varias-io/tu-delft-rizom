import { Header, Home, JSXSlack,  } from 'jsx-slack';
import { app, getUsersFromChannels, sendDM } from './utils/index.js';

// Start your app
await app.start(process.env.PORT || 9000);

app.event("app_home_opened", async ({payload}) => {
  if (payload.tab == "home") {
    app.client.views.publish({
      user_id: payload.user,
      view: JSXSlack(
        <Home>
          <Header>{(await app.client.users.info({user: payload.user})).user?.real_name}</Header>
        </Home>
      )
    })
  }
})

const users = await getUsersFromChannels({channels: ["C0576HMBEJG"]})
sendDM({users: users, message: "Hello World"})

console.log('⚡️ Bolt app is running!');

import { SurveyModalBlock } from './components/SurveyModalBlock.js';
import { survey } from './constants.js';
import { app, getUsersFromChannels, sendDM } from './utils/index.js';
import { Header, Home, JSXSlack,  } from 'jsx-slack';

// Start your app
await app.start(process.env.PORT || 9000);

app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  if (message.subtype == undefined || message.subtype == "bot_message") {
    await say(`hello there <@${message.user}>!`);
  }
});

app.event("app_home_opened", async ({context, payload}) => {
  if (payload.tab == "home") {
    app.client.views.publish({
      user_id: payload.user,
      token: context.botToken ?? "",
      view: JSXSlack(
        <Home>
          <Header>{(await app.client.users.info({user: payload.user, token: context.botToken ?? ""})).user?.color}</Header>
        </Home>
      )
    })
  }
})

app.command("/testmodal", async ({ command, ack, say, client }) => {
  console.log("jdjdjd")
  await ack();

  try {
    const result = await client.views.open({
      token: process.env.SLACK_BOT_TOKEN ?? "",
      trigger_id: command.trigger_id,
      view: JSXSlack(<SurveyModalBlock question={survey[0]} channelNames={["sad"]}/>)
    });
  } catch (error) {
    console.error(error);
  }
});

console.log('⚡️ Bolt app is running!');

import { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { SurveyModalBlock, showSurveyModal } from './components/SurveyModalBlock.js';
import { surveyTemplate } from './constants.js';
import { app, getUsersFromChannels, sendDM } from './utils/index.js';
import { Header, Home, JSXSlack,  } from 'jsx-slack';
import { Context } from 'vm';

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

app.command("/testmodal", async ({ command, ack, say, client, context }) => {
  await ack();

  await showSurveyModal(client, context.botToken ?? "", command.trigger_id, 0);
});

app.view('survey_modal_submission', async ({ ack, body, view, client,}) => {
  const questionInfo = JSON.parse(view.private_metadata)

  if(questionInfo.questionIndex < surveyTemplate.length - 1){
    //show next question
    await ack({response_action: "update", view: JSXSlack(<SurveyModalBlock questionIndex={questionInfo.questionIndex+1} channelNames={questionInfo.channelNames} />)});
  } else {
    //this was last question
    await ack()
  }
});

console.log('⚡️ Bolt app is running!');



import { JSXSlack } from "jsx-slack";
import { SurveyModalBlock } from "../pages/SurveyModalBlock.js";
import { surveyTemplate } from "../constants.js";
import { ViewCallback, app, findSurvey, findUserBySlackId } from "../utils/index.js";
import { SurveyAnswer } from "../entities/SurveyAnswer.js";
import { updateHome } from "./homeOpenedAction.js";
import { SlackViewMiddlewareArgs, SlackViewAction, AllMiddlewareArgs } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";
import { entityManager } from "../utils/database.js";

interface PrivateMetadataQuestion {
  surveyId: string
  questionIndex: number
}

app.view({callback_id:"survey_modal", type:"view_closed"}, async ({ ack, context, body }: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>) => {
  //handle closing
  await ack();
  updateHome({app, userSlackId: body.user.id, context, entityManager})
})


app.view("survey_modal", async (params) => {
  //handle submission
  handleSubmission(params, entityManager, app)
});

const handleSubmission: ViewCallback = async ({ ack, view, context, body }, entityManager, app) => {
  const questionInfo = JSON.parse(view.private_metadata) as PrivateMetadataQuestion
  const selectedOptionValue = Object.entries(view.state.values.radio_buttons)[0][1].selected_option?.value

  if(!selectedOptionValue){
    //no answer => error
    await ack({
      response_action: "errors",
      errors: {
        radio_buttons: "Please choose an option to continue!"
      }
    });
    return;
  }

  const survey = await findSurvey(questionInfo.surveyId, entityManager)

  if(!survey) {
    await ack({
      response_action: "errors",
      errors: {
        radio_buttons: "Survey not found!"
      }
    })
    return
  }
  
  //save answer
  await entityManager.create(SurveyAnswer, {
    survey, 
    user: await findUserBySlackId(body.user.id, context.teamId ?? "", entityManager, app),
    questionNumber: questionInfo.questionIndex,
    value: parseInt(selectedOptionValue)
  }).save()
    .catch((_e) => {
      console.error(`User ${body.user.id} already answered question ${questionInfo.questionIndex} of survey ${questionInfo.surveyId}`)
    })


  if(questionInfo.questionIndex < surveyTemplate.length - 1){
    //show next question
    await ack({
      response_action: "update", 
      view: JSXSlack(await SurveyModalBlock({
        questionIndex: questionInfo.questionIndex+1, 
        survey,
        entityManager,
        app
      }))});
  } else {
    //this was last question
    updateHome({app, userSlackId: body.user.id, context, entityManager})
    await ack()
  }
}

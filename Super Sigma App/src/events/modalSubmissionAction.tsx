import { JSXSlack } from "jsx-slack";
import { SurveyModalBlock } from "../pages/SurveyModalBlock.js";
import { surveyTemplate } from "../constants.js";
import { ViewCallback, app, entityManager, findSurvey, findUserBySlackId } from "../utils/index.js";
import { SurveyAnswer } from "../entities/SurveyAnswer.js";
import { updateHome } from "./homeOpenedAction.js";
import { SlackViewMiddlewareArgs, SlackViewAction, AllMiddlewareArgs } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";

interface PrivateMetadataQuestion {
  surveyId: string
  questionIndex: number
}

app.view({callback_id:"survey_modal", type:"view_closed"}, async ({ ack, context, body }: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>) => {
  //handle closing
  await ack();
  updateHome(body.user.id, context)
})


app.view("survey_modal", async (params) => {
  //handle submission
  handleSubmission(params, entityManager)
});

const handleSubmission: ViewCallback = async ({ ack, view, context, body }, entityManager) => {
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
    user: await findUserBySlackId(body.user.id, context.teamId ?? ""),
    questionNumber: questionInfo.questionIndex,
    value: parseInt(selectedOptionValue)
  }).save()


  if(questionInfo.questionIndex < surveyTemplate.length - 1){
    //show next question
    await ack({
      response_action: "update", 
      view: JSXSlack(await SurveyModalBlock({
        questionIndex: questionInfo.questionIndex+1, 
        survey,
      }))});
  } else {
    //this was last question
    updateHome(body.user.id, context)
    await ack()
  }
}

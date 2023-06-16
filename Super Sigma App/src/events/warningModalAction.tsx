import { JSXSlack } from "jsx-slack";
import { SurveyModalBlock } from "../pages/SurveyModalBlock.js";
import { surveyTemplate } from "../constants.js";
import { ViewCallback, app, entityManager, findSurvey } from "../utils/index.js";
import { updateHome } from "./homeOpenedAction.js";
import { SlackViewMiddlewareArgs, SlackViewAction, AllMiddlewareArgs } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";

interface PrivateMetadataQuestion {
  surveyId: string
  questionIndex: number
  token: string
}

app.view({callback_id:"warning_modal", type:"view_closed"}, async ({ ack, context, body }: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>) => {
  //handle closing
  await ack();
  updateHome(body.user.id, context)
})


app.view("warning_modal", async (params) => {
  //handle submission
  handleSubmission(params, entityManager)
});

const handleSubmission: ViewCallback = async ({ ack, view, context, body }, entityManager) => {
  const questionInfo = JSON.parse(view.private_metadata) as PrivateMetadataQuestion
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

  if(questionInfo.questionIndex < surveyTemplate.length){
    //show next question
    await ack({
      response_action: "update", 
      view: JSXSlack(await SurveyModalBlock({
        questionIndex: questionInfo.questionIndex, 
        survey,
        token: context.botToken ?? "",
      }))});
  } else {
    //this was last question
    updateHome(body.user.id, context)
    await ack()
  }
}

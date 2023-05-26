import { JSXSlack } from "jsx-slack";
import { SurveyModalBlock } from "../components/SurveyModalBlock.js";
import { surveyTemplate } from "../constants.js";
import { app, entityManager, findSurvey, findUserBySlackId } from "../utils/index.js";
import { SurveyAnswer } from "../entity/SurveyAnswer.js";
import { updateHome } from "./homeOpenedAction.js";

interface PrivateMetadataQuestion {
  surveyId: string
  questionIndex: number
}

app.view('survey_modal_submission', async ({ ack, view, context, body }) => {
  const questionInfo = JSON.parse(view.private_metadata) as PrivateMetadataQuestion
  const selectedOptionValue = Object.entries(view.state.values.radio_buttons)[0][1].selected_option?.value

  if(!selectedOptionValue){
    //no answer
    await ack({
      response_action: "errors",
      errors: {
        radio_buttons: "Please choose an option to continue!"
      }
    });
    return;
  }
  
  await entityManager.create(SurveyAnswer, {
    survey: await findSurvey(questionInfo.surveyId), 
    user: await findUserBySlackId(body.user.id),
    questionNumber: questionInfo.questionIndex,
    value: parseInt(selectedOptionValue)
  }).save()


  if(questionInfo.questionIndex < surveyTemplate.length - 1){
    //show next question
    await ack({
      response_action: "update", 
      view: JSXSlack(await SurveyModalBlock({
        questionIndex: questionInfo.questionIndex+1, 
        survey: await findSurvey(questionInfo.surveyId),
        token: context.botToken ?? "",
      }))});
  } else {
    //this was last question
    updateHome(body.user.id, context)
    await ack()
  }
});
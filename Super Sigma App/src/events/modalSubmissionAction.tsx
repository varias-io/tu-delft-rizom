import { JSXSlack } from "jsx-slack";
import { SurveyModalBlock } from "../components/SurveyModalBlock.js";
import { surveyTemplate } from "../constants.js";
import { app, entityManager, findUser } from "../utils/index.js";
import { SurveyAnswer } from "../entity/SurveyAnswer.js";
import { Survey } from "../entity/Survey.js";

interface PrivateMetadataQuestion {
  survey: Survey
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
  
  // console.log(selectedOptionValue)
  await entityManager.create(SurveyAnswer, {
    survey: questionInfo.survey, 
    user: await findUser(body.user.id),
    questionNumber: questionInfo.questionIndex,
    value: parseInt(selectedOptionValue)
  }).save()

  // console.log(`Saved answer: ${JSON.stringify(answer)}`)

  if(questionInfo.questionIndex < surveyTemplate.length - 1){
    //show next question
    await ack({
      response_action: "update", 
      view: JSXSlack(await SurveyModalBlock({
        questionIndex: questionInfo.questionIndex+1, 
        survey: questionInfo.survey,
        token: context.botToken ?? "",
      }))});
  } else {
    //this was last question
    await ack()
  }
});
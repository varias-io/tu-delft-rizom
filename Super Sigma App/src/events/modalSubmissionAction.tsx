import { JSXSlack } from "jsx-slack";
import { SurveyModalBlock } from "../components/SurveyModalBlock.js";
import { surveyTemplate } from "../constants.js";
import { app } from "../utils/index.js";

app.view('survey_modal_submission', async ({ ack, view, context, }) => {
  const questionInfo = JSON.parse(view.private_metadata)
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
  
  console.log(selectedOptionValue) //TODO actually save it

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
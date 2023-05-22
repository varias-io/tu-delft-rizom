import { JSXSlack } from "jsx-slack";
import { SurveyModalBlock } from "../components/SurveyModalBlock.js";
import { surveyTemplate } from "../constants.js";
import { app } from "../utils/appSetup.js";

app.view('survey_modal_submission', async ({ ack, view,}) => {
  const questionInfo = JSON.parse(view.private_metadata)

  if(questionInfo.questionIndex < surveyTemplate.length - 1){
    //show next question
    await ack({response_action: "update", view: JSXSlack(<SurveyModalBlock questionIndex={questionInfo.questionIndex+1} channelNames={questionInfo.channelNames} />)});
  } else {
    //this was last question
    await ack()
  }
});
import { app } from "../utils/appSetup.js"
import { showSurveyModal } from "../pages/SurveyModalBlock.js";
import { findSurvey, getSmallestMissingQuestionIndex,  } from "../utils/index.js";

app.action("fillSurvey", async ({ ack, client, context, body, action}) => {
    if(action.type != "button" || body.type != "block_actions"){
        console.error(`Unexpected action type: ${action.type}}`)
        return;
    }
    const surveyId = action.value;
    const surveyToFill = await findSurvey(surveyId)
    if(!surveyToFill){
        console.error(`Survey not found: ${surveyId}`)
        return;
    }
    await showSurveyModal(client, context.botToken ?? "", body.trigger_id ?? "", surveyToFill, await getSmallestMissingQuestionIndex(body.user.id, surveyId));
    await ack();
})


import { app } from "../utils/appSetup.js"
import { showSurveyModal } from "../components/SurveyModalBlock.js";
import { findSurvey, getSmallestMissingQuestionIndex,  } from "../utils/index.js";

app.action("fillSurvey", async ({ ack, client, context, body, action}) => {
    if(action.type != "button" || body.type != "block_actions"){
        console.log(`Unexpected action type: ${action.type}}`)
        return;
    }
    await ack();
    const surveyId = action.value;
    const surveyToFill = await findSurvey(surveyId)
    await showSurveyModal(client, context.botToken ?? "", body.trigger_id ?? "", surveyToFill, await getSmallestMissingQuestionIndex(body.user.id, surveyId), body.user.id);
})


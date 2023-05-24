import { app } from "../utils/appSetup.js"
import { showSurveyModal } from "../components/SurveyModalBlock.js";
import { findSurvey } from "../utils/index.js";

app.action("fillSurvey", async ({ ack, client, context, body, action}) => {
    await ack();
    const surveyId = (action as any).value;
    // console.log(`Filling out survey with id ${surveyId}`)
    const surveyToFill = await findSurvey(surveyId)
    // console.log(surveyToFill)
    await showSurveyModal(client, context.botToken ?? "", (body as any).trigger_id ?? "", surveyToFill, 0);
})


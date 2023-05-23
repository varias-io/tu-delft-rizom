import { app } from "../utils/appSetup.js"
import { showSurveyModal } from "../components/SurveyModalBlock.js";

app.action("fillSurvey", async ({ ack, client, context, body }) => {
    await ack()  
    await showSurveyModal(client, context.botToken ?? "", (body as any).trigger_id ?? "", 0);
})
import { app } from "../utils/appSetup.js"
import { showWarningModal } from "../pages/SurveyModalBlock.js";
import { ActionCallback, entityManager, findSurvey, getSmallestMissingQuestionIndex,  } from "../utils/index.js";
import { EntityManager } from "typeorm";

app.action("fillSurvey", async (params) => {
    return fillSurvey(params, entityManager)
}
)

export const fillSurvey: ActionCallback = async ({ ack, client, context, body, action}, entityManager: EntityManager) => {
    {
        if(action.type != "button" || body.type != "block_actions"){
            console.error(`Unexpected action type: ${action.type}}`)
            return;
        }
        const surveyId = action.value;
        const surveyToFill = await findSurvey(surveyId, entityManager)
        if(!surveyToFill){
            console.error(`Survey not found: ${surveyId}`)
            return;
        }
        await showWarningModal(client, context.botToken ?? "", body.trigger_id ?? "", surveyToFill, await getSmallestMissingQuestionIndex(body.user.id, surveyId, entityManager));
        await ack();
    }
}


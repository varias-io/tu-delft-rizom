import { app } from "../utils/appSetup.js"
import { showSurveyModal } from "../pages/SurveyModalBlock.js";
import { ActionCallback, entityManager, findSurvey, getSmallestMissingQuestionIndex, } from "../utils/index.js";
import { EntityManager } from "typeorm";
import { sendChannelMessageEphemeral } from "../utils/sendChannelMessage.js";

app.action("fillSurvey", async (params) => {
    return fillSurvey(params, entityManager)
}
)

export const fillSurvey: ActionCallback = async ({ ack, client, context, body, action }, entityManager: EntityManager) => {
    if (action.type != "button" || body.type != "block_actions") {
        console.error(`Unexpected action type: ${action.type}}`)
        return;
    }
    const { surveyId, channelId } = JSON.parse(action.value);
    const surveyToFill = await findSurvey(surveyId, entityManager)
    if (!surveyToFill) {
        console.error(`Survey not found: ${surveyId}`)
        return;
    }
    await ack();
    const questionIndex = await getSmallestMissingQuestionIndex(body.user.id, surveyId, entityManager)
    if (questionIndex > 14 && channelId != undefined) {
        sendChannelMessageEphemeral({
            channel: channelId,
            user: body.user.id,
            text: ":warning: You have already completed this survey",
            token: context.botToken ?? ""
        })
    } else {
        await showSurveyModal(client, context.botToken ?? "", body.trigger_id ?? "", surveyToFill, questionIndex);
    }
}

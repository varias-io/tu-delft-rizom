import { Channel } from "../entities/Channel.js";
import { showSurveyModal } from "../pages/SurveyModalBlock.js";
import { ActionCallback, app, entityManager, findSurvey, getSmallestMissingQuestionIndex, latestSurveyForChannel, sendChannelMessageEphemeral, } from "../utils/index.js";
import { EntityManager } from "typeorm";

app.action("fillSurveyHome", async (params) => {
    return fillSurvey(params, entityManager)
})

export const fillSurvey: ActionCallback = async ({ ack, client, context, body, action }, entityManager: EntityManager) => {
    if (action.type != "button" || body.type != "block_actions") {
        console.error(`Unexpected action type: ${action.type}}`)
        return;
    }
    const surveyId = action.value
    const surveyToFill = await findSurvey(surveyId, entityManager)
    if (!surveyToFill) {
        console.error(`Survey not found: ${surveyId}`)
        return;
    }
    await ack();
    await showSurveyModal(client, context.botToken ?? "", body.trigger_id ?? "", surveyToFill, await getSmallestMissingQuestionIndex(body.user.id, surveyId, entityManager));
}

app.action("fillSurveyMessage", async ({ ack, client, context, body, action}) => {
    if(action.type != "button" || body.type != "block_actions"){
        console.error(`Unexpected action type: ${action.type}}`)
        return;
    }
    await ack();
    const channelId = action.value
    const surveyToFill = await latestSurveyForChannel(channelId, entityManager)
    const channelSlackId = (await entityManager.findOne(Channel, { where: { id: channelId } }))?.slackId ?? ""
    if (surveyToFill == null) {
        console.error(`No survey found for channel ${channelSlackId}`)
        return
    }
    const questionIndex = await getSmallestMissingQuestionIndex(body.user.id, surveyToFill.id, entityManager)
    if (questionIndex > 14) {
        sendChannelMessageEphemeral({
            channel: channelSlackId,
            user: body.user.id,
            text: ":warning: You have already completed this survey",
            token: context.botToken ?? ""
        })
    } else {
        await showSurveyModal(client, context.botToken ?? "", body.trigger_id ?? "", surveyToFill, questionIndex);
    }
})

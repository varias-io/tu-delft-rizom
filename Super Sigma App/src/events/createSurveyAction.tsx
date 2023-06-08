import { Survey } from "../entities/Survey.js"
import { ActionCallback, app, entityManager, findUserBySlackId, getChannelFromSlackId, getLatestSurveyFromChannelSlackId, getUsersFromChannel, participantsOf, usersWhoCompletedSurvey } from "../utils/index.js"
import { updateHome } from "./homeOpenedAction.js"
import { Actions, Button, JSXSlack, Mrkdwn, Section } from "jsx-slack"
import { Block } from "@slack/bolt"
import { sendChannelMessageBlock } from "../utils/sendChannelMessage.js"

const selectionBlockNotFound = (): object => {
  console.error("Selection block not found")
  return {}
}

/**
 * Action that happens when you click the button for creating a survey
 */
app.action("createSurvey", async (params) => {
  createSurvey(params, entityManager)
})



export const createSurvey: ActionCallback = async ({ ack, body, context, client }, entityManager) => {
  if (body.type != "block_actions") {
    console.error(`Unexpected body type: ${body.type}}`)
    return;
  }

  const selection = Object.entries(body.view?.state.values.channelSelect ?? selectionBlockNotFound())[0][1].selected_option

  if (!selection) {
    client.views.update({
      token: context.botToken ?? "",
      view_id: body.view?.id ?? "",
      view: {
        type: "home",
        blocks: body?.view?.blocks.find(block => block.block_id == "noChannelSelectedError") != undefined ?
          (body?.view?.blocks ?? []) :
          [noChannelSelectedErrorBlock(), ...(body?.view?.blocks ?? [])]
      }
    })
    await ack();
    return;
  }

  const selectedChannelSlackId = selection.value
  await ack()

  const latestSurvey = await getLatestSurveyFromChannelSlackId(selectedChannelSlackId, entityManager)
  if (latestSurvey != null) {
    const participation = (await usersWhoCompletedSurvey(latestSurvey.id, entityManager)).length / (await participantsOf(latestSurvey.id, entityManager)).length * 100

    await entityManager.update(Survey, { id: latestSurvey.id }, {
      participation: Number(participation.toFixed(0))
    })
  }

  const channel = await getChannelFromSlackId(selectedChannelSlackId, context.teamId ?? "", entityManager)

  if (!channel) {
    console.error(`Channel with slack id ${selectedChannelSlackId} not found`)
    return
  }

  const manager = await findUserBySlackId(body.user.id)
  const participants = await getUsersFromChannel({ channelSlackId: selectedChannelSlackId, token: context.botToken ?? "", teamId: context.teamId ?? "" }, app, entityManager)

  await entityManager.create(Survey, {
    channel,
    manager,
    participants
  }).save()

  sendChannelMessageBlock({ channel: selectedChannelSlackId, token: context.botToken ?? "", blocks: [JSXSlack(<Section>A new TMS survey has been created for this channel.</Section>), JSXSlack(<Actions><Button style="primary" actionId="fillSurveyMessage" value={channel.id}>Fill in Survey</Button></Actions>)] })

  updateHome(body.user.id, context)
}

const noChannelSelectedErrorBlock = (): Block => (
  JSXSlack(
    <Section id="noChannelSelectedError">
      <Mrkdwn>
        :warning: Please select a channel to continue!
      </Mrkdwn>
    </Section>)
)

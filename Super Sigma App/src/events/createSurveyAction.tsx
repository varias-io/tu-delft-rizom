import { Survey } from "../entities/Survey.js"
import { ActionCallback, app, crons, dailyReminderCron, entityManager, findUserBySlackId, getChannelFromSlackId, getLatestSurveyFromChannelSlackId, getUsersFromChannel, participantsOf, sendChannelMessageBlock, usersWhoCompletedSurvey } from "../utils/index.js"
import { updateHome } from "./homeOpenedAction.js"
import { Actions, Button, JSXSlack, Mrkdwn, Section } from "jsx-slack"
import { Block } from "@slack/bolt"
import { Installation } from "../entities/Installation.js"

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

  const [channelSlackId, channelTeamId] = JSON.parse(selection.value)
  await ack()

  const latestSurvey = await getLatestSurveyFromChannelSlackId(channelSlackId, entityManager)
  if (latestSurvey != null) {
    const participation = (await usersWhoCompletedSurvey(latestSurvey.id, entityManager)).length/(await participantsOf(latestSurvey.id, entityManager)).length *100

    await entityManager.update(Survey, { id: latestSurvey.id }, {
      participation: Number(Math.floor(participation))
    })
  }

  const channel = await getChannelFromSlackId(channelSlackId, channelTeamId, entityManager)

  if (!channel) {
    console.error(`Channel with slack id ${channelSlackId} not found`)
    return
  }

  const manager = await findUserBySlackId(body.user.id, context.teamId ?? "")
  const participants = await getUsersFromChannel({ channelSlackId, teamId: channelTeamId }, app, entityManager)

  const survey = await entityManager.create(Survey, {
    channel,
    manager,
    participants
  }).save()

  const token = (await entityManager.findOne(Installation, { where: { teamId: channelTeamId } }))?.botToken ?? ""
  //Sends the fill survey message to the channel
  sendChannelMessageBlock({ channel: channelSlackId, token, blocks: [JSXSlack(<Section>A new TMS survey has been created for this channel.</Section>), JSXSlack(<Actions><Button style="primary" actionId="fillSurveyMessage" value={channel.id}>Fill in Survey</Button></Actions>)] })

  //If there is an ongoing cron for a channel stop it.
  crons.get(channel.id)?.stop()
  //Create a cron for the new survey.
  const task = dailyReminderCron({ users: participants.map(user => user.slackId), channel: channelSlackId, token: context.botToken ?? "", message: "Don't forget to fill out the TMS survey!", survey })
  crons.set(channel.id, task)
  task.start()

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

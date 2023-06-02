import { Survey } from "../entity/Survey.js"
import { app, entityManager, findUserBySlackId, getChannelFromSlackId, getUsersFromChannel, sendDM } from "../utils/index.js"
import { updateHome } from "./homeOpenedAction.js"
import  { JSXSlack, Mrkdwn, Section } from "jsx-slack"
import { Block } from "@slack/bolt"

const selectionBlockNotFound = (): object => {
  console.error("Selection block not found")
  return {}
}

/**
 * Action that happens when you click the button for creating a survey
 */
app.action("createSurvey", async ({ ack, body, context, client }) => {
    if(body.type != "block_actions"){
        console.error(`Unexpected body type: ${body.type}}`)
        return;
    }
    
    const selection = Object.entries(body.view?.state.values.channelSelect ?? selectionBlockNotFound())[0][1].selected_option

    if(!selection) {
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

    const channel = await getChannelFromSlackId(selectedChannelSlackId)
    const manager = await findUserBySlackId(body.user.id)
    const participants = await getUsersFromChannel({channel: selectedChannelSlackId, token: context.botToken ?? ""})

    await entityManager.create(Survey, {
      channel,
      manager,
      participants
    }).save()

    //TODO: Make message contain a link that directly triggers the fill in survey modal.
    const message = `A new TMS survey has just been created in <#${channel.slackId}>. Go to the home tab to fill it out.`
    sendDM({users: participants.map((p) => p.slackId), token: context.botToken ?? "", message})

    updateHome(body.user.id, context)
  })

  const noChannelSelectedErrorBlock = (): Block => (
    JSXSlack(
    <Section id="noChannelSelectedError">
      <Mrkdwn>
        :warning: Please select a channel to continue!
      </Mrkdwn>
    </Section>)
  )
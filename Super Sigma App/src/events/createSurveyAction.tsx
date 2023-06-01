import { Survey } from "../entity/Survey.js"
import { app, entityManager, findUserBySlackId, getChannelFromSlackId, getUsersFromChannel } from "../utils/index.js"
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
          blocks: [noChannelSelectedErrorBlock(), ...(body?.view?.blocks ?? [])]
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

    updateHome(body.user.id, context)
  })

  const noChannelSelectedErrorBlock = (): Block => (
    JSXSlack(
    <Section>
      <Mrkdwn>
        :warning: Please select a channel to continue!
      </Mrkdwn>
    </Section>)
  )
import { JSX } from "jsx-slack/jsx-runtime"
import { Survey } from "../entity/Survey.js"
import { app, entityManager, findUserBySlackId, getChannelsFromSlackIds, getUsersFromChannels } from "../utils/index.js"
import { updateHome } from "./homeOpenedAction.js"

const selectionBlockNotFound = (): object => {
  console.log("Selection block not found")
  return {}
}

/**
 * TODO: Action that happens when you click the button for creating a survey
 */
app.action("createSurvey", async ({ ack, body, context }) => {
    await ack()
    if(body.type != "block_actions"){
        console.log(`Unexpected body type: ${body.type}}`)
        return;
    }
    
    const selectedChannelSlackIds = Object.entries(body.view?.state.values.channelsSelect ?? selectionBlockNotFound())[0][1].selected_options.map((option: JSX.IntrinsicElements["option"]) => option.value)
    const channels = await getChannelsFromSlackIds(selectedChannelSlackIds)
    const manager = await findUserBySlackId(body.user.id)
    const participants = await getUsersFromChannels({channels: selectedChannelSlackIds, token: context.botToken ?? ""})

    await entityManager.create(Survey, {
      channels,
      manager,
      participants
    }).save()

    updateHome(body.user.id, context)
  })
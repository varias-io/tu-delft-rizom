import { app, getChannelsFromSlackIds } from "../utils/index.js"

const selectionBlockNotFound = (): object => {
  console.log("Selection block not found")
  return {}
}

/**
 * TODO: Action that happens when you click the button for creating a survey
 */
app.action("createSurvey", async ({ ack, body }) => {
    await ack()
    if(body.type != "block_actions"){
        console.log(`Unexpected body type: ${body.type}}`)
        return;
    }
    
    const selectedChannels = Object.entries(body.view?.state.values.channelsSelect ?? selectionBlockNotFound())[0][1].selected_channels

    console.log(await getChannelsFromSlackIds(selectedChannels))
    

    //Add action for creating a survey here!!
  })
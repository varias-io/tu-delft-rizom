import { app } from "../utils/appSetup.js"

/**
 * TODO: Action that happens when you click the button for creating a survey
 */
app.action("createSurvey", async ({ ack }) => {
    await ack()
    //Add action for creating a survey here!!
  })
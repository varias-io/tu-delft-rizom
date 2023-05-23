import { Survey } from "../entity/Survey.js"
import { app } from "./appSetup.js"

export const surveyToTitle = async (survey: Survey, token: string): Promise<string> => {
  const promises = survey.channels.map((value) => app.client.conversations.info({channel: value.slackId, token}))
  const channelNames = (await Promise.all(promises)).map(channel => channel.channel?.name)
  return channelNames.join(", ")
}
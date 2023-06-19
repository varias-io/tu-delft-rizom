import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Channel } from "../entities/Channel.js";
import { entityManager, getUserSlackIdsFromChannels, app } from "../utils/index.js";
import { Installation } from "../entities/Installation.js";
import { User } from "../entities/User.js";
import "./survey.factory.js";
import SurveyAnswerSeeder from "./surveyanswer.seeder.js";
import { Survey } from "../entities/Survey.js";

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ) {

    const workspace = await entityManager.findOneByOrFail(Installation, { teamId: "T055Q9UHP5W" })

    const botToken = workspace.botToken

    const channels = await app.client.conversations.list({
      token: botToken,
      types: "public_channel, private_channel",
      team_id: "T055Q9UHP5W",
    })
      .catch((_error) => {
        console.log(`Couldn't get the channels for workspace: ${workspace.teamId}`)
        return { channels: [] }
      })
    const allChannels = await Promise.all(channels.channels?.map(async (channel) => {
      const existing = await entityManager.findOne(Channel, { where: { slackId: channel.id ?? "", primaryWorkspace: { teamId: "T055Q9UHP5W" } } })
      if (!existing) {
        return await entityManager.create(Channel, { slackId: channel.id ?? "", primaryWorkspace: workspace }).save()
      }
      return existing
    }) ?? [])

    const users = (await getUserSlackIdsFromChannels({ token: botToken, channelSlackIds: ["C055D7ZGWJV"] }, app))
    await Promise.all(Array.from(users).map(async (slackId) => {
      if (!await entityManager.exists(User, { where: { slackId, primaryWorkspace: { teamId: "T055Q9UHP5W" } } })) {
        return entityManager.create(User, { slackId, primaryWorkspace: workspace, channels: allChannels }).save()
      }
      return undefined
    }))


    const surveyFactory = factoryManager.get(Survey);
    await surveyFactory.saveMany(10)

    const surveyAnswerSeeder = new SurveyAnswerSeeder();
    await surveyAnswerSeeder.run(dataSource, factoryManager);

  }
}
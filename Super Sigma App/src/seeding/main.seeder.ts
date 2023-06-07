import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Channel } from "../entities/Channel.js";
import { app } from "../utils/appSetup.js";
import { entityManager, getUserSlackIdsFromChannels } from "../utils/index.js";
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
  
    const workspace = await entityManager.findOneByOrFail(Installation, {teamId: "T055Q9UHP5W"})

    const botToken = workspace.botToken

    const channels = (await app.client.conversations.list({
        token: botToken,
        types: "public_channel, private_channel",
        team_id: "T055Q9UHP5W",
      }))
    const allChannels = await Promise.all(channels.channels?.map(async (channel) => {
      const existing = await entityManager.findOne(Channel, {where: {slackId: channel.id ?? "", workspaces: { teamId: "T055Q9UHP5W" }}})
        if (!existing) {
            return await entityManager.create(Channel, {slackId: channel.id ?? "", workspaces: [workspace]}).save()
        }
      return existing
    }) ?? [])

    const users = (await getUserSlackIdsFromChannels({token: botToken, channelSlackIds: ["C055D7ZGWJV"]}, app))
    await Promise.all(Array.from(users).map(async (slackId) => {
        if (!await entityManager.exists(User, {where: {slackId, workspaces: { teamId: "T055Q9UHP5W" }}})) {
            return entityManager.create(User, {slackId, workspaces: [workspace], channels: allChannels}).save()
        }
        return undefined
    }))

  
    const surveyFactory = factoryManager.get(Survey);
    await surveyFactory.saveMany(0)

    const surveyAnswerSeeder = new SurveyAnswerSeeder();
    await surveyAnswerSeeder.run(dataSource, factoryManager);

  }
}
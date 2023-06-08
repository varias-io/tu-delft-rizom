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
    const botToken = (await entityManager.findOneByOrFail(Installation, {teamId: "T055Q9UHP5W"})).botToken

    const channels = (await app.client.conversations.list({
        token: botToken,
        types: "public_channel, private_channel",
        team_id: "T055Q9UHP5W",
      }))
    channels.channels?.forEach(async (channel) => {
        if (!await entityManager.exists(Channel, {where: {slackId: channel.id ?? ""}})) {
            await entityManager.create(Channel, {slackId: channel.id ?? ""}).save()
        }
    })

    const users = (await getUserSlackIdsFromChannels({token: botToken, channelSlackIds: ["C055D7ZGWJV"]}))
    await Promise.all(Array.from(users).map(async (slackId) => {
        if (!await entityManager.exists(User, {where: {slackId}})) {
            return entityManager.create(User, {slackId}).save()
        }
        return undefined
    }))

  
    const surveyFactory = factoryManager.get(Survey);
    await surveyFactory.saveMany(10)

    const surveyAnswerSeeder = new SurveyAnswerSeeder();
    await surveyAnswerSeeder.run(dataSource, factoryManager);

  }
}
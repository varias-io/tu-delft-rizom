import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Channel } from "../entity/Channel.js";
import { app } from "../utils/appSetup.js";
import { entityManager, getUsersFromChannels } from "../utils/index.js";
import { Installation } from "../entity/Installation.js";
import { User } from "../entity/User.js";
import "./survey.factory.js";
import SurveyAnswerSeeder from "./surveyanswer.seeder.js";
import { Survey } from "../entity/Survey.js";

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

    const users = (await getUsersFromChannels({token: botToken, channels: ["C055D7ZGWJV"]}))
    await Promise.all(Array.from(users).map(async (user) => {
        if (!await entityManager.exists(User, {where: {slackId: user}})) {
            return entityManager.create(User, {slackId: user}).save()
        }
        return undefined
    }))

  
    const surveyFactory = factoryManager.get(Survey);
    await surveyFactory.saveMany(10)

    const surveyAnswerSeeder = new SurveyAnswerSeeder();
    await surveyAnswerSeeder.run(dataSource, factoryManager);

  }
}
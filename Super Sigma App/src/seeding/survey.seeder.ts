import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Survey } from "../entity/Survey.js";
import { Channel } from "../entity/Channel.js";
import { User } from "../entity/User.js";

export default class SurveySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const channels = await dataSource.manager.find(Channel);
    const users = await dataSource.manager.find(User);

    for (let i = 0; i < channels.length; i++) {
      users.sort(() => 0.5-Math.random()); // Shuffle the users array
      const participants = users.slice(0, Math.floor(Math.random() * users.length) + 1);
      const survey = dataSource.manager.create(Survey, {
        channels: [channels[i]],
        participants
      });
      survey.channels = [channels[i]]; // This is a simplistic assumption, add your logic here
      

      await dataSource.manager.save(survey);
    }
  }
}

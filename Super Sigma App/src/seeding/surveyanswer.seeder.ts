import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { SurveyAnswer } from "../entity/SurveyAnswer.js";
import { Survey } from "../entity/Survey.js";

export default class SurveyAnswerSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {

    const surveys = await dataSource.manager.find(Survey);
    // const users = await dataSource.manager.find(User);

    await Promise.all(surveys.map(async (survey) => {
      const users = survey.participants;
      if(surveys.length != new Set(surveys).size) {
        throw new Error("Duplicate surveys")
      }
      if(users.length != new Set(users).size) {
        throw new Error("Duplicate users")
      }

      await Promise.all(users.map(async (user) => {
        const max = Math.random() < 0.5 ? (Math.floor(Math.random()*15)+1): 15
        for (let questionNumber = 0; questionNumber < max; questionNumber++) {
          const value = Math.floor(Math.random() * 5) + 1; // Generate random value between 1 and 5
          const answer = dataSource.manager.create(SurveyAnswer, {
            survey,
            user,
            questionNumber,
            value
          });
          if(await dataSource.manager.createQueryBuilder(SurveyAnswer, "answer").where("answer.surveyId = :survey", { survey: survey.id }).andWhere("answer.userId = :user", { user: user.id }).andWhere("answer.questionNumber = :questionNumber", { questionNumber }).getOne() == null) {
            await dataSource.manager.save(answer);
          } else {
            break
          }
        }
      }))
    }))
  }
}

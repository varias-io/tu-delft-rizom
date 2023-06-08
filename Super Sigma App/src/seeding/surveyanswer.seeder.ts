import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { SurveyAnswer } from "../entities/SurveyAnswer.js";
import { Survey } from "../entities/Survey.js";

export default class SurveyAnswerSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ) {

    const surveys = await dataSource.manager.find(Survey, {relations: ["participants"]});

    await Promise.all(surveys.map(async (survey) => {
      const users = survey.participants;
      if(surveys.length != new Set(surveys).size) {
        throw new Error("Duplicate surveys")
      }
      if(users.length != new Set(users).size) {
        throw new Error("Duplicate users")
      }

      await Promise.all(users.map(async (user) => {
        // We have three options to choose from:
        // 1. The user has not started the survey yet
        // 2. The user has started the survey but not finished it
        // 3. The user has finished the survey
        const choice = Math.floor(Math.random() * 3)
        let max = 0

        // Based on the choice, we will generate a random number of answers
        switch (choice) {
          case 0:
            max = 0
            break;
          case 1:
            max = 15
            break
          case 2:
            max = Math.floor(Math.random() * 15)+1
            break
        } 
        for (let questionNumber = 0; questionNumber < max; questionNumber++) {
          const value = Math.floor(Math.random() * 5) + 1;
          const answer = dataSource.manager.create(SurveyAnswer, {
            survey,
            user,
            questionNumber,
            value
          });

          // We don't want duplicate answers (because it breaks the unique constraint)
          // So we check if the answer already exists, and if it does, we break out of the loop
          // We could continue to ensure that the user has answered the chosen number of questions
          // But over multiple runs of the script, the number of questions answered will approach all of them
          // Which is not what we want
          if(
            await dataSource.manager.createQueryBuilder(SurveyAnswer, "answer")
              .where("answer.surveyId = :survey", { survey: survey.id })
              .andWhere("answer.userId = :user", { user: user.id })
              .andWhere("answer.questionNumber = :questionNumber", { questionNumber })
            .getOne() == null
          ) {
            await dataSource.manager.save(answer);
          } else {
            break
          }
        }
      }))
    }))
  }
}

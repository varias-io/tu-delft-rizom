import { EntityManager } from "typeorm";
import { SurveyAnswer } from "../entities/SurveyAnswer.js";
import { User } from "../entities/User.js";

export const getSmallestMissingQuestionIndex = async (userSlackId: string, surveyId: string, entityManager: EntityManager): Promise<number> => {

  // Fetch the highest questionIndex associated with the given user and survey
  const highestQuestionIndex = await querySmallestMissingQuestionIndex(userSlackId, surveyId, entityManager);

  // If there is no entry, return 0
  if (highestQuestionIndex.maxIndex === null) {
    return 0;
  }

  // Return the next questionIndex
  return highestQuestionIndex.maxIndex + 1;
}

export const querySmallestMissingQuestionIndex = async (userSlackId: string, surveyId: string, entityManager: EntityManager): Promise<any> => {
  return entityManager
  .createQueryBuilder(SurveyAnswer, "answers")
  .leftJoin(User, "user", "user.id = answers.userId")
  .select("MAX(answers.questionNumber)", "maxIndex")
  .where("user.slackId = :userSlackId", { userSlackId })
  .andWhere("answers.surveyId = :surveyId", { surveyId })
  .getRawOne();
}

import { SurveyAnswer } from "../entity/SurveyAnswer.js";
import { User } from "../entity/User.js";
import { entityManager } from "./database.js";

export const getSmallestMissingQuestionIndex = async (userSlackId: string, surveyId: string): Promise<number> => {

  // Fetch the highest questionIndex associated with the given user and survey
  const highestQuestionIndex = await entityManager
    .createQueryBuilder(SurveyAnswer, "answers")
    .leftJoin(User, "user", "user.id = answers.userId")
    .select("MAX(answers.questionNumber)", "maxIndex")
    .where("user.slackId = :userSlackId", { userSlackId })
    .andWhere("answers.surveyId = :surveyId", { surveyId })
    .getRawOne();

  // If there is no entry, return 0
  if (!highestQuestionIndex.maxIndex) {
    return 0;
  }

  // Return the next questionIndex
  return highestQuestionIndex.maxIndex + 1;
}

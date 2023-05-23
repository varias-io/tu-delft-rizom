import { Survey } from "../entity/Survey.js";
import { User } from "../entity/User.js";
import { entityManager } from "./database.js";

export const usersWhoCompletedSurvey = async (survey: Survey): Promise<User[]> => {
  return entityManager
  .createQueryBuilder(User, 'user')
  .where(qb => {
      const subQuery = qb.subQuery()
          .select("answer.user.id", "userId")
          .from("SurveyAnswer", "answer")
          .where("answer.survey.id = :surveyId", { surveyId: survey.id })
          .groupBy("answer.user.id")
          .having("COUNT(*) >= 15")
          .getQuery();
      return "user.id IN " + subQuery;
  })
  .getMany();
}
import { Survey } from "../entity/Survey.js"
import { User } from "../entity/User.js"
import { entityManager, findUserByEntityId } from "./index.js"

export interface TMSScore {
  specialization: number
  credibility: number
  coordination: number
}

interface TMSUserScore {
  score: TMSScore
  user: User
}

/**
 * Returns the TMS score for each user in the survey
 */
export const computeTMSPerUser = async (survey: Survey): Promise<TMSUserScore[]> => {
  //Get the scores of each user broken down by question focus
  const result = await entityManager
  .createQueryBuilder(User, 'user')
  .leftJoin('user.answers', 'answer', 'answer.survey.id = :surveyId', { surveyId: survey.id })
  .select("user.id", "userId")
  .addSelect("AVG(CASE WHEN answer.questionNumber BETWEEN 0 AND 4 THEN answer.value ELSE null END)", "specialization")
  .addSelect("AVG(CASE WHEN answer.questionNumber BETWEEN 5 AND 9 THEN answer.value ELSE null END)", "credibility")
  .addSelect("AVG(CASE WHEN answer.questionNumber BETWEEN 10 AND 14 THEN answer.value ELSE null END)", "coordination")
  .groupBy("user.id")
  .having("COUNT(*) >= 15")
  .getRawMany();

  //Map the result to the correct format
  return Promise.all(result.map(async x => ({
    user: await findUserByEntityId(x.userId),
    score: {
      specialization: x.specialization,
      credibility: x.credibility,
      coordination: x.coordination
    }
  })))

} 

/**
 * Returns the TMS score for the survey
 */
export const computeTMS = async (survey: Survey): Promise<TMSScore> => {
  //Get the scores of each user
  const userScores = (await computeTMSPerUser(survey)).map(x => x.score);

  //Compute the average of each score
  return userScores.reduce((previousValue, currentValue) => ({
    specialization : previousValue.specialization + currentValue.specialization/userScores.length,
    credibility : previousValue.credibility + currentValue.credibility/userScores.length,
    coordination : previousValue.coordination + currentValue.coordination/userScores.length,
  }), {
    specialization: 0,
    credibility: 0,
    coordination: 0
  })
}
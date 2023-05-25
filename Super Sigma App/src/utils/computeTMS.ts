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

export const computeTMSPerUser = async (survey: Survey): Promise<TMSUserScore[]> => {
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

  return Promise.all(result.map(async x => ({
    user: await findUserByEntityId(x.userId),
    score: {
      specialization: x.specialization,
      credibility: x.credibility,
      coordination: x.coordination
    }
  })))

} 

export const computeTMS = async (survey: Survey): Promise<TMSScore> => {
  const userScores = (await computeTMSPerUser(survey)).map(x => x.score);
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
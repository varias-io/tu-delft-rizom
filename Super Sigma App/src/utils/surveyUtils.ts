import { Channel } from "../entity/Channel.js";
import { Survey } from "../entity/Survey.js";
import { User } from "../entity/User.js";
import { entityManager } from "./database.js";
import { app } from "./index.js";

export const participantsOf = async (surveyId: string): Promise<User[]> => {
  return entityManager
    .createQueryBuilder(User, "user")
    .innerJoin("user.eligibleSurveys", "survey")
    .where("survey.id = :surveyId", { surveyId })
    .getMany();
};

/**
 * Returns the channel that the survey is associated with.
 * @throws {Error} If the survey is not associated with a channel, which should never happen. 
 */
export const channelOf = async (surveyId: string): Promise<Channel> => {
  return entityManager
    .createQueryBuilder(Channel, "channel")
    .innerJoin("channel.surveys", "survey")
    .where("survey.id = :surveyId", { surveyId })
    .getOneOrFail();
};


export const usersWhoCompletedSurvey = async (surveyId: string): Promise<User[]> => {
  return entityManager
  .createQueryBuilder(User, 'user')
  .where(qb => {
      const subQuery = qb.subQuery()
          .select("answer.user.id", "userId")
          .from("SurveyAnswer", "answer")
          .where("answer.survey.id = :surveyId", { surveyId })
          .groupBy("answer.user.id")
          .having("COUNT(*) >= 15")
          .getQuery();
      return "user.id IN " + subQuery;
  })
  .getMany();
}

export const findSurvey = async (surveyId: Survey["id"]): Promise<Survey> => (
  entityManager.findOneByOrFail(Survey, { id: surveyId })
)

export const surveyToTitle = async (survey: Survey, token: string): Promise<string> => {
  const channel = await channelOf(survey.id)
  const slackChannel = await app.client.conversations.info({channel: channel.slackId, token})
  return `#${slackChannel.channel?.name}`
}

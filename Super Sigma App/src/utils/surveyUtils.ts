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

export const latestSurveys = async (userSlackId: User["slackId"]): Promise<Survey[]> => {
  const queryBuilder = entityManager.createQueryBuilder()
    .select("MAX(survey.createdAt)", "latestDate")
    .addSelect("channel.id", "channelId")
    .from(Survey, "survey")
    .innerJoin("survey.channel", "channel")
    .innerJoin("survey.participants", "participant")
    .where("participant.slackId = :userSlackId", { userSlackId })
    .groupBy("channel.id");

  const subQuery = queryBuilder.getQuery();

  const latestSurveysQuery = entityManager.createQueryBuilder()
    .select("survey")
    .from(Survey, "survey")
    .innerJoin("(" + subQuery + ")", "subQuery", '"subQuery"."latestDate" = survey.createdAt AND "subQuery"."channelId" = survey.channel.id', { userSlackId })
    .distinctOn(["survey.channel.id"])
    .leftJoinAndSelect("survey.channel", "channel")
    .leftJoinAndSelect("survey.participants", "participant")

  const latestSurveys = await latestSurveysQuery.getMany();

  return latestSurveys;

}

export const groupSurvey = async (userSlackId: User["slackId"], channelId: Channel["id"]): Promise<Survey[]> => {
  return entityManager.find(Survey, {where: { participants: { slackId: userSlackId } , channel: { id: channelId } }, relations: ["channel", "participants"], order: { createdAt: "ASC" }})
}

// export const latestSurveys = async (userSlackId: User["slackId"], channelId: Channel["id"]): Promise<Survey[]> => {
//   return entityManager.find(Channel, {where: {surveys: { participants: { slackId: userSlackId } }, id: channelId}, relations: ["surveys", "surveys.participants"] , order: { createdAt: "DESC" }}).then(channel => channel?.surveys ?? [])
// }

export const findSurvey = async (surveyId: Survey["id"]): Promise<Survey> => (
  entityManager.findOneByOrFail(Survey, { id: surveyId })
)

export const surveyToTitle = async (survey: Survey, token: string): Promise<string> => {
  const channel = await channelOf(survey.id)
  const slackChannel = await app.client.conversations.info({channel: channel.slackId, token})
  return `#${slackChannel.channel?.name}`
}

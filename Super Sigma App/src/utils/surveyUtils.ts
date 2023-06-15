import { EntityManager, SelectQueryBuilder } from "typeorm";
import { Channel } from "../entities/Channel.js";
import { Survey } from "../entities/Survey.js";
import { User } from "../entities/User.js";
import { app } from "./index.js";
import { ConversationsInfoResponse } from "@slack/web-api";

export const participantsOf = async (surveyId: string, entityManager: EntityManager): Promise<User[]> => {
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
export const channelOf = async (surveyId: string, entityManager: EntityManager): Promise<Channel | null> => {
  return entityManager
    .createQueryBuilder(Channel, "channel")
    .innerJoin("channel.surveys", "survey")
    .where("survey.id = :surveyId", { surveyId })
    .getOne();
};


export const usersWhoCompletedSurvey = async (surveyId: string, entityManager: EntityManager): Promise<User[]> => {
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
      return `user.id IN ${subQuery}`;
    })
    .getMany();
}



export const latestSurveys = async (userSlackId: User["slackId"], entityManager: EntityManager): Promise<Survey[]> => {
  const queryBuilder = await sortSurveysQuery(userSlackId, entityManager)

  const subQuery = queryBuilder.getQuery();

  const latestSurveysQuery = await getlatestSurveysQuery(subQuery, userSlackId, entityManager);

  const latestSurveys = await latestSurveysQuery.getMany();

  return latestSurveys;

}

export const sortSurveysQuery = async (userSlackId: User["slackId"], entityManager: EntityManager): Promise<SelectQueryBuilder<Survey>> => {
  return entityManager.createQueryBuilder()
    .select("MAX(survey.createdAt)", "latestDate")
    .addSelect("channel.id", "channelId")
    .from(Survey, "survey")
    .innerJoin("survey.channel", "channel")
    .innerJoin("survey.participants", "participant")
    .where("participant.slackId = :userSlackId", { userSlackId })
    .groupBy("channel.id");
}


export const getlatestSurveysQuery = async (subQuery: string, userSlackId: User["slackId"], entityManager: EntityManager): Promise<SelectQueryBuilder<Survey>> => {
  return entityManager.createQueryBuilder()
    .select("survey")
    .from(Survey, "survey")
    .innerJoin(`(${subQuery})`, "subQuery", '"subQuery"."latestDate" = survey.createdAt AND "subQuery"."channelId" = survey.channel.id', { userSlackId })
    .distinctOn(["survey.channel.id"])
    .leftJoinAndSelect("survey.channel", "channel")
    .leftJoinAndSelect("survey.participants", "participant")
}



export const groupSurvey = async (userSlackId: User["slackId"], channelId: Channel["id"], entityManager: EntityManager): Promise<Survey[]> => {

  const surveys = entityManager.find(Survey, {where: { 
    participants: { slackId: userSlackId } , channel: { id: channelId } }, 
    relations: ["channel", "participants"], order: { createdAt: "ASC" }})
  return surveys
}


export const findSurvey = async (surveyId: Survey["id"], entityManager: EntityManager): Promise<Survey | null> => (
  entityManager.findOneBy(Survey, { id: surveyId })
)

export const surveyToTitle = async (survey: Survey, token: string, entityManager: EntityManager): Promise<string> => {
  const channel = await getChannel(survey, entityManager)
  if(!channel) {
    console.error(`Survey ${survey.id} has no associated channel`)
    return `Survey ${survey.id} has no associated channel`
  }
  const slackChannel = await getSlackChannel(channel, token)
  return `#${slackChannel.channel?.name}`
}

export const getSlackChannel = async (channel: Channel, token: string): Promise<ConversationsInfoResponse> => {
  return app.client.conversations.info({ channel: channel.slackId, token })
}
export const getChannel = async (survey: Survey, entityManager: EntityManager): Promise<Channel | null> => {
  return channelOf(survey.id, entityManager)
}

export const latestSurveyForChannel = async (channelId: Channel["id"], entityManager: EntityManager): Promise<Survey|null> => {
  return entityManager.createQueryBuilder(Survey, "survey")
    .innerJoin("survey.channel", "channel")
    .where("channel.id = :channelId", { channelId })
    .orderBy("survey.createdAt", "DESC")
    .getOne()
}

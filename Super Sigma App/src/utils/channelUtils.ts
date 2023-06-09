import { App } from "@slack/bolt"
import { Channel } from "../entities/Channel.js"
import { Survey } from "../entities/Survey.js"
import { Installation } from "../entities/Installation.js"
import { User } from "../entities/User.js"
import { EntityManager } from "typeorm"

interface GetUsersFromChannelsProps {
    channelSlackIds: string[]
    token: string
}

interface GetUsersFromChannelProps {
    channelSlackId: string
    token: string
    teamId: string
}

/**
 * From a list of channel ids return a set of unique user ids from those channels.
 */
export const getUserSlackIdsFromChannels = async ({channelSlackIds, token}: GetUsersFromChannelsProps, app: App) => {
    const users = new Set<string>()

    //get all members from each channel
    const allMembers = await Promise.all(channelSlackIds.map(async (channel) => {
        const members = (await app.client.conversations.members({
            token,
            channel
        })).members ?? []
        return members
    }))

    //add each member to the set
    allMembers.flat().forEach((member) => {
        users.add(member)
    })
    
    return users
}

export const getUsersFromChannels = async ({channelSlackIds, token}: GetUsersFromChannelsProps, app: App, entityManager: EntityManager): Promise<User[]> => {
    const userSlackIds = await getUserSlackIdsFromChannels({channelSlackIds, token}, app)
    return (await Promise.all([...userSlackIds].map(async (slackId) => (
        entityManager.findOneBy(User, {slackId})
    )))).filter((user) => user != null) as User[]
}

/**
 * From a channel id return a set of unique user ids from those channels.
 */
export const getUserSlackIdsFromChannel = async ({channelSlackId: channel, token}: GetUsersFromChannelProps, app: App) => {
    return (await app.client.conversations.members({
        token,
        channel
    })).members ?? []
}

export const getUsersFromChannel = async ({channelSlackId, token, teamId}: GetUsersFromChannelProps, app: App, entityManager: EntityManager): Promise<User[]> => {
    const userSlackIds = await getUserSlackIdsFromChannel({channelSlackId, token, teamId}, app)
    return await findUsersFromChannel( userSlackIds, channelSlackId, teamId, entityManager)
}

export const findUsersFromChannel = async (userSlackIds: string[], channelSlackId: string, teamId: string, entityManager: EntityManager): Promise<User[]> => {
    const workspace = await entityManager.findOneBy(Installation, { teamId })
    const users = (await Promise.all(userSlackIds.map(async (slackId) => (
        entityManager.findOne(User, {where: { slackId }, relations: ["workspaces"]})
        .then(async user => {
            if (user == null) {
                return entityManager.create(User, {
                    slackId,
                    workspaces: workspace? [workspace] : []
                }).save()
            }

            if(workspace && !user.workspaces.some(userWorkspace => userWorkspace.id === workspace.id)) {
                await entityManager.createQueryBuilder(User, "user")
                .relation("workspaces")
                .of(user)
                .add(workspace)
            }


            return user
        })
    ))))

    const foundChannel = await getChannelFromSlackId(channelSlackId, teamId, entityManager)

    if (foundChannel != null) {
        foundChannel.users = users
        await foundChannel.save()
    }

    return users

}

export interface ChannelInfo {
    slackId: string,
    name: string,
    teamId: string
}

export const getChannelsFromUser = async (userSlackId: User["slackId"], token: string, teamId: string, app: App): Promise<ChannelInfo[]> => {
    return ((await app.client.users.conversations({
        token,
        user: userSlackId, 
        exclude_archived: true,
        types: "public_channel" // types of conversations
    })).channels ?? []).map(channel => ({
        slackId: channel.id ?? "",
        name: channel.name ?? "",
        teamId
    }));
}

export const getChannelFromSlackId = async (slackId: string, teamId: string, entityManager: EntityManager): Promise<Channel | null> => {
    return entityManager.findOne(Channel, {where: {slackId, workspaces: { teamId }}, relations: ["users", "surveys", "workspaces"]})
}

export const getChannelsFromSlackIds = async (slackIds: string[], teamId: string, entityManager: EntityManager): Promise<Channel[]> => {
    return (await Promise.all(slackIds.map(x => getChannelFromSlackId(x, teamId, entityManager)))).filter(x => x != null) as Channel[]
}

export const getLatestSurveyFromChannelSlackId = async (channelSlackId: string, entityManager: EntityManager): Promise<Survey|null> => {
    return entityManager
    .createQueryBuilder(Survey, "surveys")
    .leftJoin(Channel, "channel", "channel.id = surveys.channelId")
    .where("channel.slackId = :channelSlackId", { channelSlackId })
    .andWhere("surveys.participation IS NULL")
    .getOne();
}
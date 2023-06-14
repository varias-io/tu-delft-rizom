import { App } from "@slack/bolt"
import { Channel } from "../entities/Channel.js"
import { Survey } from "../entities/Survey.js"
import { Installation } from "../entities/Installation.js"
import { User } from "../entities/User.js"
import { EntityManager } from "typeorm"
import { app } from "./appSetup.js"

interface GetUsersFromChannelsProps {
    channelSlackIds: string[]
    token: string
}

interface GetUsersFromChannelProps {
    channelSlackId: string
    teamId: string
}

interface GetUserSlackIdsFromChannelProps {
    channelSlackId: string
    token: string
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
export const getUserSlackIdsFromChannel = async ({channelSlackId: channel, token}: GetUserSlackIdsFromChannelProps, app: App) => {
    return (await app.client.conversations.members({
        token,
        channel
    })).members ?? []
}

export const getUsersFromChannel = async ({channelSlackId, teamId}: GetUsersFromChannelProps, app: App, entityManager: EntityManager): Promise<User[]> => {
    const token = await entityManager.findOne(Installation, {where: {teamId}}).then((installation) => installation?.botToken ?? "")
    const userSlackIds = await getUserSlackIdsFromChannel({channelSlackId, token}, app)
    return await findUsersFromChannel( userSlackIds, channelSlackId, teamId, entityManager)
}

export const findUsersFromChannel = async (userSlackIds: string[], channelSlackId: string, teamId: string, entityManager: EntityManager): Promise<User[]> => {
    const workspace = await entityManager.findOneBy(Installation, { teamId })
    let users: User[] = []
    await entityManager.transaction(async (entityManager) => {
        users = (await Promise.all(userSlackIds.map(async (slackId) => (
            entityManager.findOne(User, {where: { slackId }, relations: ["primaryWorkspace", "connectWorkspaces"]})
            .then(async user => {
                if (user == null) {
    
                    console.log(`User not found for ${slackId}`)
    
                    try {
                        const stranger = await app.client.users.info({
                            token: workspace?.botToken ?? "",
                            user: slackId,
                        }).then(res => res.user?.is_stranger ?? false) 
    
                        
    
                        if(!stranger) {
                            return entityManager.create(User, {
                                slackId,
                                primaryWorkspace: workspace? workspace : null as unknown as Installation,
                            }).save()
                        } else {
                            return entityManager.create(User, {
                                slackId,
                                connectWorkspaces: workspace? [workspace] : [],
                            }).save()   
                        }
                    } catch(e) {
                        console.error(e)
                        return entityManager.create(User, {
                            slackId,
                            connectWorkspaces: workspace? [workspace] : [],
                        }).save()                   
                    }
                }
        
                if (workspace && (!user.primaryWorkspace || user.primaryWorkspace.teamId != workspace.teamId) && !user.connectWorkspaces.find(x => x.teamId == workspace.teamId)) {
                    await entityManager.createQueryBuilder(User, "user")
                    .relation("connectWorkspaces")
                    .of(user)
                    .add(workspace)
                } else if(workspace) {
                    await entityManager.update(User, {slackId}, {primaryWorkspace: workspace})
                }
    
    
                return user
            })
        ))))
    })

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
    contextTeamId: string
    conversationHostId: string | undefined
}

export const getChannelsFromUser = async (userSlackId: User["slackId"], token: string, app: App): Promise<ChannelInfo[]> => {
    return app.client.users.conversations({
        token,
        user: userSlackId, 
        exclude_archived: true,
        types: "public_channel" // types of conversations
    }).then((res) => {
        return res.channels?.map((channel) => ({
            slackId: channel.id ?? "",
            name: channel.name ?? "",
            contextTeamId: channel.context_team_id ?? "",
            conversationHostId: channel.conversation_host_id
        })) ?? []
    })
    
}

export const getChannelFromSlackId = async (slackId: string, teamId: string, entityManager: EntityManager): Promise<Channel | null> => {
    return entityManager.findOne(Channel, {where: {slackId, primaryWorkspace: { teamId }}, relations: ["users", "surveys", "primaryWorkspace", "connectWorkspaces"]})
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
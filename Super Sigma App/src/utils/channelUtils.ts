import { Channel } from "../entities/Channel.js"
import { Survey } from "../entities/Survey.js"
import { Installation } from "../entities/Installation.js"
import { User } from "../entities/User.js"
import { EntityManager } from "typeorm"
import { ConversationsApp, UsersApp, UsersInfoApp } from "./index.js"

interface GetUsersFromChannelsProps {
    channels: Channel[]
    teamId: string
}

interface GetUsersFromChannelProps {
    channelSlackId: string
    workspace: Pick<Installation, "teamId" | "id" | "botToken">
}

interface GetUserSlackIdsFromChannelProps {
    channelSlackId: string
    token: string
}

/**
 * From a list of channel ids return a set of unique user ids from those channels.
 */
export const getUserSlackIdsFromChannels = async ({ channels }: GetUsersFromChannelsProps, app: ConversationsApp) => {

    //get all members from each channel
    const users: ([Channel, string[]] | [null, []])[] = await Promise.all(channels.map(async channel => {
        if (!channel.primaryWorkspace) {
            return [null, []]
        }

        const members = await app.client.conversations.members({
            token: channel.primaryWorkspace?.botToken ?? "",
            channel: channel.slackId,
            limit: 1000
        })
            .catch((_error) => {
                console.error(`Couldn't get the members for channel: ${channel}`)
                return { members: [] }
            })

        return [channel, members.members ?? []]
    }))

    return users
}

const haveLoaded: Map<Installation["id"], boolean> = new Map()

export const getUsersFromChannels = async ({ channels, teamId }: GetUsersFromChannelsProps, app: ConversationsApp & UsersApp, entityManager: EntityManager): Promise<User[]> => {
    const teamMembers = await getUserSlackIdsFromChannels({ channels, teamId }, app)
    // return (await Promise.all([...userSlackIds].map(async (slackId) => (
    //     entityManager.findOneBy(User, {slackId})
    // )))).filter((user) => user != null) as User[]

    const updateChannelOfUser: {
        userSlackId: string
        channel: Channel
    }[] = []


    const haveLoadedTeam = haveLoaded.get(teamId)

    haveLoaded.set(teamId, true)

    let isNative: Map<string, boolean> | undefined = undefined

    if (!haveLoadedTeam) {

        const nativeUsers = await app.client.users.list({
            token: channels.find(channel => channel.primaryWorkspace.teamId == teamId)?.primaryWorkspace.botToken ?? ""
        })

        if(nativeUsers.members) {
            isNative = new Map(
                nativeUsers.members?.map((user) => [user.id ?? "", true])
            )
        }
    }

    const knownStrangers = new Set<string>()

    const allUsers = (await Promise.all(teamMembers.map(async ([channel, slackIds]): Promise<User[]> => {
        if (channel == null) {
            return []
        }

        const users = Promise.all(slackIds.map(async (slackId) => {

            return findOrCreateUser({ slackId, entityManager, channel, app, isNative, knownStrangers })
                .catch(_e => {
                    updateChannelOfUser.push({
                        userSlackId: slackId,
                        channel
                    })
                });

        })).then((users) => users.filter((user) => user != null) as User[])

        await entityManager.createQueryBuilder(Channel, "channel")
            .relation(Channel, "users")
            .of(channel)
            .addAndRemove(users, channel.users)
            .catch(_e => {
                // A race condition happened, but we don't want to do anything about it   
            })
        
        return users

    }))).flat()

    await Promise.all(updateChannelOfUser.map(async ({ userSlackId, channel }) => {
        const user = await entityManager.findOne(User, { where: { slackId: userSlackId }, relations: ["primaryWorkspace", "channels"] })
        if (user != null) {
            await entityManager.createQueryBuilder(User, "user")
                .relation(User, "channels")
                .of(user)
                .add(channel)
                    .catch(_e => {
                        console.error("Connection already exists")
                    })
        }
    }))

    return allUsers

}

/**
 * From a channel id return a set of unique user ids from those channels.
 */
export const getUserSlackIdsFromChannel = async ({channelSlackId: channel, token}: GetUserSlackIdsFromChannelProps, app: ConversationsApp) => {
    return app.client.conversations.members({
        token,
        channel
    }).catch(_e => {
        console.error("Channel was deleted while in home")
        return {
            members: []
        }
    }).then(res => res.members ?? [])

}

export const getUsersFromChannel = async ({channelSlackId, workspace}: GetUsersFromChannelProps, app: ConversationsApp & UsersInfoApp, entityManager: EntityManager): Promise<User[]> => {
    const token = await entityManager.findOne(Installation, {where: {teamId: workspace.teamId}}).then((installation) => installation?.botToken ?? "")
    const userSlackIds = await getUserSlackIdsFromChannel({channelSlackId, token}, app)
    return await findUsersFromChannel( userSlackIds, channelSlackId, workspace.teamId, entityManager, app)
}

const determineStrangerStatus = async (knownStrangers: Set<string>, slackId: string, isNative: Map<string, boolean> | undefined, app: UsersInfoApp, channel: Channel) => {
    let is_stranger = knownStrangers.has(slackId)
    if (!is_stranger) {
        if (isNative) {
            is_stranger = !isNative.has(slackId)
            if (is_stranger) {
                knownStrangers.add(slackId)
            }
        } else {
            is_stranger = await app.client.users.info({
                token: channel.primaryWorkspace?.botToken ?? "",
                user: slackId,
            })
                .catch((_error) => {
                    console.error("Couldn't get the users info")
                    return { user: { is_stranger: false } }
                })
                .then(res => res.user?.is_stranger ?? false)
            if (is_stranger) {
                knownStrangers.add(slackId)
            }
        }
    }
    return is_stranger
}

export const findUsersFromChannel = async (userSlackIds: string[], channelSlackId: string, teamId: string, entityManager: EntityManager, app: UsersInfoApp): Promise<User[]> => {
    const channel = await entityManager.findOne(Channel, { where: { slackId: channelSlackId, primaryWorkspace: { teamId } }, relations: ["primaryWorkspace"] })
    let users: User[] = []

    if(channel) {
        const knownStrangers = new Set<string>()
        users = (await Promise.all(userSlackIds.map(async (slackId) => {
    
            return findOrCreateUser({ slackId, entityManager, channel, app, knownStrangers })
        }))).filter((user) => user != null) as User[]
    }

    return []
}

interface FindOrCreateUserParams { 
    slackId: string;
    entityManager: EntityManager;
    channel: Channel;
    app: UsersInfoApp;
    isNative?: Map<string, boolean> | undefined;
    knownStrangers: Set<string> 
}

const findOrCreateUser = async ({ slackId, entityManager, channel, app, isNative, knownStrangers }: FindOrCreateUserParams): Promise<User> =>
    entityManager.findOne(User, { where: { slackId }, relations: ["primaryWorkspace", "connectWorkspaces"] })
    .then(async user => {

        //strangers are users from another workspace through slack connect. 

        if (user == null) {

            const is_stranger = await determineStrangerStatus(knownStrangers, slackId, isNative, app, channel)


            // Users cannot see the original workspace of strangers, so if the user is a stranger you make the connectWorkspaces an empty array. 
            // Primary workspace can technically not be null, but we know that we don't know it, so we set it to null anyway. 
            if (!is_stranger) {
                return entityManager.create(User, {
                    slackId,
                    primaryWorkspace: channel.primaryWorkspace ? channel.primaryWorkspace : null as unknown as Installation,
                    channels: [channel]
                }).save()
            } else {
                return entityManager.create(User, {
                    slackId,
                    connectWorkspaces: channel.primaryWorkspace ? [channel.primaryWorkspace] : [],
                    channels: [channel]
                }).save()
            }
        } else if (channel.primaryWorkspace) {

            if (user.primaryWorkspace) {
                if(user.primaryWorkspace.teamId != channel.primaryWorkspace.teamId) {
                    const setWorkspacePromise = entityManager.createQueryBuilder(User, "user")
                        .relation("connectWorkspaces")
                        .of(user)
                        .add(channel.primaryWorkspace)
                        .catch(_e => {
                            // Race condition happened, but we don't care about it
                        })
    
                    const setChannelPromise = entityManager.createQueryBuilder(Channel, "channel") 
    
                    await Promise.all([setWorkspacePromise, setChannelPromise])
                    return user
                } else {
                    await entityManager.createQueryBuilder(User, "user")
                        .relation("primaryWorkspace")
                        .of(user)
                        .set(channel.primaryWorkspace)
                        .catch(_e => {
                            // Race condition happened, but we don't care about it
                        })

                    return user
                }
            } else {

                const is_stranger = await determineStrangerStatus(knownStrangers, slackId, isNative, app, channel)

                if (is_stranger) {
                    await entityManager.createQueryBuilder(User, "user")
                        .relation("connectWorkspaces")
                        .of(user)
                        .add(channel.primaryWorkspace)
                        .catch(_e => {
                            // Race condition happened, but we don't care about it
                        })

                    return user
                } else {
                    await entityManager.createQueryBuilder(User, "user")
                        .relation("primaryWorkspace")
                        .of(user)
                        .set(channel.primaryWorkspace)
                        .catch(_e => {
                            // Race condition happened, but we don't care about it
                        })

                    return user
                }

            }
        }

        return user
    })


export interface ChannelInfo {
    slackId: string,
    name: string,
    contextTeamId: string
    conversationHostId: string | undefined
}

interface GetChannelsFromUserProps {
    userSlackId: User["slackId"],
    token: string,
    teamId: string,
    app: UsersApp
}

export const getChannelsFromUser = async ({userSlackId, token, app}: GetChannelsFromUserProps): Promise<ChannelInfo[]> => {
    return await app.client.users.conversations({
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
    }).catch(_e => {
        console.error(`Something bad happened with userSlackId ${userSlackId} (probably bc it's the wrong token)`)
        return []
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

export const getChannelsFromWorkspace = async (token: string, app: ConversationsApp) => {
    return app.client.conversations.list({
        token,
        exclude_archived: true,
        limit: 1000,
        types: "public_channel" // types of conversations
    }).then((res) => {
        return res.channels?.map((channel) => ({
            slackId: channel.id ?? "",
            name: channel.name ?? "",
            contextTeamId: channel.context_team_id ?? "",
            conversationHostId: channel.conversation_host_id
        })) ?? []
    }).catch(_e => {
        console.error(`Something bad happened (probably bc it's the wrong token)`)
        return []
    })
}
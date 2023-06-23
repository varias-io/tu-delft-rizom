import { Channel } from "../entities/Channel.js"
import { Survey } from "../entities/Survey.js"
import { Installation } from "../entities/Installation.js"
import { User } from "../entities/User.js"
import { Brackets, EntityManager } from "typeorm"
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

    //get the slack ids from all users from each channel.
    const teamMembers = await getUserSlackIdsFromChannels({ channels, teamId }, app)

    //see if we have ever loaded the team before.
    const haveLoadedTeam = haveLoaded.get(teamId)

    //set the map so that we know we have loaded the team.
    haveLoaded.set(teamId, true)

    //define the map that will tell us if a user is native to the workspace or not.
    let isNative: Map<string, boolean> | undefined = undefined

    //if we have not loaded the team before, we want to use native users as the lookup method.
    if (!haveLoadedTeam) {

        const nativeUsers = await app.client.users.list({
            token: channels.find(channel => channel.primaryWorkspace.teamId == teamId)?.primaryWorkspace.botToken ?? ""
        })

        //create the isNative map from users in the workspace.
        if (nativeUsers.members) {
            isNative = new Map(
                nativeUsers.members?.map((user) => [user.id ?? "", true])
            )
        }
    }

    //create a set of known strangers. This is to prevent us from making a call to the slack api for repeat users.
    const knownStrangers = new Set<string>()

    //then run the database refresh.
    const allUsers = (await Promise.all(teamMembers.map(async ([channel, slackIds]): Promise<User[]> => {
        if (channel == null) {
            return []
        }

        //for all users in the channel, we want to find an up-to-date database representation of them.
        const users = Promise.all(slackIds.map(async (slackId) => {

            return findOrCreateUser({ slackId, entityManager, channel, app, isNative, knownStrangers })
                .catch(async _e => {
                    return await entityManager.createQueryBuilder(User, "user")
                        .leftJoinAndSelect("user.channels", "channel")
                        .leftJoinAndSelect("user.primaryWorkspace", "primaryWorkspace")
                        .leftJoinAndSelect("user.connectWorkspaces", "connectWorkspaces")
                        .where("user.slackId = :slackId", { slackId })
                        .andWhere(new Brackets(qb => {
                            qb.where("primaryWorkspace.teamId = :teamId", { teamId })
                            qb.orWhere("connectWorkspaces.teamId = :teamId", { teamId })
                        }))
                        .getOne() ?? console.log(`Couldn't find user ${slackId}`)
                })

        })).then((users) => users.filter((user) => user != null) as User[])

        //we set the channels users to be exactly what we found.
        await entityManager.createQueryBuilder(Channel, "channel")
            .relation(Channel, "users")
            .of(channel)
            .addAndRemove(await users, channel.users)
            .catch(_e => {
                // A race condition happened, but we don't want to do anything about it   
            })

        return users

    }))).flat()

    return allUsers

}

/**
 * From a channel id return a set of unique user ids from those channels.
 */
export const getUserSlackIdsFromChannel = async ({ channelSlackId: channel, token }: GetUserSlackIdsFromChannelProps, app: ConversationsApp) => {
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

export const getUsersFromChannel = async ({ channelSlackId, workspace }: GetUsersFromChannelProps, app: ConversationsApp & UsersInfoApp, entityManager: EntityManager): Promise<User[]> => {
    const token = await entityManager.findOne(Installation, { where: { teamId: workspace.teamId } }).then((installation) => installation?.botToken ?? "")
    const userSlackIds = await getUserSlackIdsFromChannel({ channelSlackId, token }, app)
    return await findUsersFromChannel(userSlackIds, channelSlackId, workspace.teamId, entityManager, app)
}

const determineStrangerStatus = async (knownStrangers: Set<string>, slackId: string, isNative: Map<string, boolean> | undefined, app: UsersInfoApp, channel: Channel) => {
    const is_stranger = knownStrangers.has(slackId)
    if (!is_stranger) {
        if (isNative) {
            if (!isNative.has(slackId)) {
                knownStrangers.add(slackId)
            }
        } else {
            const is_actually_stranger = await app.client.users.info({
                token: channel.primaryWorkspace?.botToken ?? "",
                user: slackId,
            })
                .catch((_error) => {
                    console.error("Couldn't get the users info")
                    return { user: { is_stranger: false } }
                })
                .then(res => res.user?.is_stranger ?? false)
            if (is_actually_stranger) {
                knownStrangers.add(slackId)
            }
        }
    }
    return is_stranger
}

export const findUsersFromChannel = async (userSlackIds: string[], channelSlackId: string, teamId: string, entityManager: EntityManager, app: UsersInfoApp): Promise<User[]> => {
    const channel = await entityManager.findOne(Channel, { where: { slackId: channelSlackId, primaryWorkspace: { teamId } }, relations: ["primaryWorkspace"] })

    if (channel) {
        const knownStrangers = new Set<string>()
        return (await Promise.all(userSlackIds.map(async (slackId) => {

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

//we want to find the user in the database, if they don't exist, we want to create them.
const findOrCreateUser = async ({ slackId, entityManager, channel, app, isNative, knownStrangers }: FindOrCreateUserParams): Promise<User> =>
    entityManager.findOne(User, { where: { slackId }, relations: ["primaryWorkspace", "connectWorkspaces"] })
        .then(async user => {

            //we do not have the user in the database yet. We want to create them.
            if (user == null) {

                //we want to determine if the user is a connect user or not.
                const is_stranger = await determineStrangerStatus(knownStrangers, slackId, isNative, app, channel)

                if (!is_stranger) {

                    //this means that the user is a native user. thus their primary workspace is the channel's primary workspace.
                    return entityManager.create(User, {
                        slackId,
                        primaryWorkspace: channel.primaryWorkspace ? channel.primaryWorkspace : null as unknown as Installation,
                    }).save()

                    // and otherwise this workspace is a connect workspace.    
                } else {
                    return entityManager.create(User, {
                        slackId,
                        connectWorkspaces: channel.primaryWorkspace ? [channel.primaryWorkspace] : [],
                    }).save()
                }
            } else if (channel.primaryWorkspace) {

                //the user exists and the channel has a primary workspace.
                if (user.primaryWorkspace) {

                    //the user already has a primary workspace.
                    if (user.primaryWorkspace.teamId != channel.primaryWorkspace.teamId) {

                        //if it does not match the channel's primary workspace, we want to add the channel's primary workspace to the user's connect workspaces.
                        await entityManager.createQueryBuilder(User, "user")
                            .relation("connectWorkspaces")
                            .of(user)
                            .add(channel.primaryWorkspace)
                            .catch(_e => {
                                // Race condition happened, but we don't care about it
                            })


                        return user
                    } else {

                        //this is the primary workspace, so we want to set it as the primary workspace.
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

                    //we do not know the primary workspace of the user yet.
                    const is_stranger = await determineStrangerStatus(knownStrangers, slackId, isNative, app, channel)

                    //so we check if the user is a stranger or not.
                    if (is_stranger) {

                        //if the user is a stranger, we want to add the channel's primary workspace to the user's connect workspaces.
                        await entityManager.createQueryBuilder(User, "user")
                            .relation("connectWorkspaces")
                            .of(user)
                            .add(channel.primaryWorkspace)
                            .catch(_e => {
                                // Race condition happened, but we don't care about it
                            })

                        return user
                    } else {

                        //if the user is not a stranger, we want to set the primary workspace.
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

export const getChannelsFromUser = async ({ userSlackId, token, app }: GetChannelsFromUserProps): Promise<ChannelInfo[]> => {
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
    return entityManager.findOne(Channel, { where: { slackId, primaryWorkspace: { teamId } }, relations: ["users", "surveys", "primaryWorkspace", "connectWorkspaces"] })
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
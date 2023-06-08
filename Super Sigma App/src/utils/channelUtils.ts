import { Channel } from "../entities/Channel.js"
import { User } from "../entities/User.js"
import { app, entityManager } from "./index.js"

interface GetUsersFromChannelsProps {
    channels: string[]
    token: string
}

interface GetUsersFromChannelProps {
    channel: string
    token: string
}

/**
 * From a list of channel ids return a set of unique user ids from those channels.
 */
export const getUserSlackIdsFromChannels = async ({channels, token}: GetUsersFromChannelsProps) => {
    const users = new Set<string>()

    //get all members from each channel
    const allMembers = await Promise.all(channels.map(async (channel) => {
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

export const getUsersFromChannels = async ({channels, token}: GetUsersFromChannelsProps): Promise<User[]> => {
    const userSlackIds = await getUserSlackIdsFromChannels({channels, token})
    return (await Promise.all([...userSlackIds].map(async (slackId) => (
        entityManager.findOneBy(User, {slackId})
    )))).filter((user) => user != null) as User[]
}

/**
 * From a channel id return a set of unique user ids from those channels.
 */
export const getUserSlackIdsFromChannel = async ({channel, token}: GetUsersFromChannelProps) => {
    return (await app.client.conversations.members({
        token,
        channel
    })).members ?? []
}

export const getUsersFromChannel = async ({channel, token}: GetUsersFromChannelProps): Promise<User[]> => {
    const userSlackIds = await getUserSlackIdsFromChannel({channel, token})
    return (await Promise.all([...userSlackIds].map(async (slackId) => (
        entityManager.findOneBy(User, {slackId})
    )))).filter((user) => user != null) as User[]
}

export interface ChannelInfo {
    slackId: string,
    name: string,
}

export const getChannelsFromUser = async (userSlackId: User["slackId"], token: string): Promise<ChannelInfo[]> => {
    return ((await app.client.users.conversations({
        token,
        user: userSlackId, 
        exclude_archived: true,
        types: "public_channel" // types of conversations
    })).channels ?? []).map(channel => ({
        slackId: channel.id ?? "",
        name: channel.name ?? ""
    }));
}

export const getChannelFromSlackId = async (slackId: string): Promise<Channel> => {
    return entityManager.findOneByOrFail(Channel, {slackId})
}

export const getChannelsFromSlackIds = async (slackIds: string[]): Promise<Channel[]> => {
    return Promise.all(slackIds.map(x => getChannelFromSlackId(x)))
}
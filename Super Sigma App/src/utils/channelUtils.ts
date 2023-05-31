import { Channel } from "../entity/Channel.js"
import { User } from "../entity/User.js"
import { app, entityManager } from "./index.js"

interface GetUsersFromChannelsProps {
    channels: string[]
    token: string
}

/**
 * From a list of channel ids return a set of unique user ids from those channels.
 */
export const getUsersFromChannels = async ({channels, token}: GetUsersFromChannelsProps) => {
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

/**
 * From a list of channel ids return a set of unique user ids from those channels.
 */
export const getChannelsFromUser = async (userSlackId: User["slackId"]): Promise<string[]> => {
    return (await app.client.users.conversations({
        token: process.env.SLACK_BOT_TOKEN ?? "",
        user: userSlackId, 
        exclude_archived: true,
        types: "public_channel,private_channel" // types of conversations
    })).channels?.map((channel) => channel.name ?? "") ?? [];

}

export const getChannelFromSlackId = async (slackId: string): Promise<Channel> => {
    return entityManager.findOneByOrFail(Channel, {slackId})
}

export const getChannelsFromSlackIds = async (slackIds: string[]): Promise<Channel[]> => {
    return Promise.all(slackIds.map(x => getChannelFromSlackId(x)))
}
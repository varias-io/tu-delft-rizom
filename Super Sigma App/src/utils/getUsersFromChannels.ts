import { app } from "./index.js"

interface GetUsersFromChannelsProps {
    channels: string[]
}

//return the set of users in all given channels
export const getUsersFromChannels = async ({channels}: GetUsersFromChannelsProps) => {
    const users = new Set<string>()
    //get all members from each channel
    const allMembers = await Promise.all(channels.map(async (channel) => {
        const members = (await app.client.conversations.members({
            token: process.env.SLACK_BOT_TOKEN ?? "",
            channel: channel
        })).members ?? []
        return members
    }))
    //add each member to the set
    allMembers.flat().forEach((member) => {
        users.add(member)
    })
    return Array.from(users)
}

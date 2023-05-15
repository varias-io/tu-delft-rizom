import { app } from "./index.js"

interface GetUsersFromChannelsProps {
    channels: string[]
}

//return the set of users in all given channels
//TODO: doesn't work for private channels - tries to send a dm to a bot which crashes the app
export const getUsersFromChannels = async ({channels}: GetUsersFromChannelsProps) => {
    const users = new Set<string>()
    const allMembers = await Promise.all(channels.map(async (channel) => {
        const members = (await app.client.conversations.members({
            token: process.env.SLACK_BOT_TOKEN ?? "",
            channel: channel
        })).members ?? []
        // members.filter((member) => isBot(member))
        return members
    }))
    allMembers.flat().forEach((members) => {
        users.add(members)
    })
    return users
}

// const isBot = async (user: string) => {
//     const userInfo = await app.client.users.info({
//         token: process.env.SLACK_BOT_TOKEN ?? "",
//         user: user
//     })
//     return userInfo.user?.is_bot ?? false
// }
import { Option, Select } from "jsx-slack";
import { app } from '../utils/index.js';


export const MembersSelect = async (channelId: string, token: string) => {
    /**
     * Get all members of a given channel.
     */
    async function getMembers() {
        const mem = await app.client.conversations.members({
            token,
            channel: channelId
        })

        const members = mem.members ?? []

        const users = (await Promise.all(members.map(async (member) => (await app.client.users.info({user: member, token})))))
            .map(user => ({username: user.user?.name, id: user.user?.id}))
    
        return users
    }

    const users = await getMembers()

    /**
     * Show a dropdown menu with all members of a given channel.
     */
    return (
        (users.length &&
        <Select id="members" label="Select a member" multiple actionId="member" placeholder="Select a member">
            {
                users.map(({username, id}) => (<Option value={id ?? ""}>{username}</Option>)) 
            }
        </Select>
        ) || <></>
    )
}
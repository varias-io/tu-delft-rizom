import { Channel } from '@slack/web-api/dist/response/UsersConversationsResponse.js';
import { Option, Select, Actions } from "jsx-slack";
import { JSX } from 'jsx-slack/jsx-runtime';
import { app } from '../utils/index.js';

interface ChannelSelectProps {
    userSlackId: string,
    selected?: Channel["id"]
    token: string
}

/**
 * Get all channels the given user is the creator of.
 */
export const getManagedChannels = async (userSlackId: string, token: string) => {
    const managedChannels: Channel[] = [];
    
        // Get all conversations the user is part of
        const conversationsResponse = await app.client.users.conversations({
            token,
            user: userSlackId,
            types: "private_channel, public_channel"
        })
            .catch((_error) => {
                console.error(`Failed to get conversations for user: ${userSlackId}`)
                return { channels: [] }
            })

        const channels = conversationsResponse.channels ?? [];
        
        channels.forEach((channel) => {
            if (channel?.creator == userSlackId) {
                managedChannels.push(channel);
            }
        })
        return managedChannels;
    }

/**
 * Show a dropdown menu with all channels the user is the creator of.
 */
export const ChannelSelect = async ({userSlackId, selected, token}: ChannelSelectProps): Promise<JSX.Element> => {
    const channels = await getManagedChannels(userSlackId, token)

    return (
        <Actions id="channels">
            <Select actionId="channel" placeholder="Select a channel">
                {
                    channels.map((channel) => (<Option selected={channel.id == selected} value={channel?.id ?? ""}>{channel?.name}</Option>)) 
                }
            </Select>
        </Actions>
    )
}
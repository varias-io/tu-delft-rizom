import { Option, Select, Actions, Confirm } from "jsx-slack";
import { JSX } from 'jsx-slack/jsx-runtime';
import { entityManager } from '../utils/database.js';
import { app } from '../utils/index.js';
import { User } from '../entity/User.js';
import { Channel } from '../entity/Channel.js';
import { getManagedChannels } from './ChannelSelect.js';

interface ChannelSelectProps {
    userId: string,
    selected?: Channel["id"]
    token: string
}

/**
 * Create survey component.
 */
export const CreateSurvey = async ({userId, selected, token}: ChannelSelectProps): Promise<JSX.Element> => {
    /**
     * Get all channels the given user is channel manager for. 
     * So the user is either the creator of the channel or is marked Channel Manager in the database. 
     */
    async function getAuthorizedChannels(): Promise<string[]> {
        const conversationsResponse = await app.client.users.conversations({
            token,
            user: userId,
            types: "private_channel, public_channel"
        });

        const channelNames = conversationsResponse.channels ?? [];

        const managerChannels: Channel[] = await (entityManager.findOneBy(User, { slackId: userId }).then((foundUser) => {
            if (foundUser == null) {
                return []
            
            } else {
                return foundUser.managedChannels
            }
        }))

        const managerChannelNames: string[] = []
        
        for(const channel of managerChannels) {
            for(const ch of channelNames){
                if(ch.id == channel?.slackId) {
                    managerChannelNames.push(ch.name ?? "")
                }
            }
        }

        const createdSlackChannels = await getManagedChannels(userId, token)

        const promises: (Promise<string> | string)[] = []

        for(const channel of createdSlackChannels) {
            if(channel.id) {
                const foundChannel = await entityManager.findOneBy(Channel, { slackId: channel.id }).then((found) => {
                    if (found == null) {
                        for(const ch of channelNames){
                            if(ch.id == channel?.id) {
                                entityManager.create(Channel, {slackId: channel.id ?? "", managers: []}).save()
                                promises.push(channel.name ?? "")
                            }
                        }

                      
                    } else {
                        for(const ch of channelNames){
                            if(ch.id == channel?.id) {
                                promises.push(channel.name ?? "")
                            }
                        }
                    }
                })
                foundChannel
            }
        }
        //

        return [...managerChannelNames, ...await Promise.all(promises)]

    }

    /**
     * Show a dropdown menu with all channels the user is authorized to create a survey for.
     * Will also show a pop up confirming you want to create a survey for the selected channel.
     */
    const channels = await getAuthorizedChannels()
    if(channels.length) {
        return (
            <Actions>
                <Select actionId="createSurvey" placeholder="Select a channel" confirm ={
                    <Confirm title="Are you sure?" confirm="Yes, please" deny="Cancel">
                        Do you really want to create a survey for this channel?
                    </Confirm>
                }>
                    {
                        channels.map((channel) => (<Option selected={channel == selected} value={channel.toString()}>{channel}</Option>))
                    }
                </Select>
            </Actions>
        )
    } else {
        return <></>
    }
}
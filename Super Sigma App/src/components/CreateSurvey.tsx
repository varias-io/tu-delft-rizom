import { Option, Select, Actions, Confirm } from "jsx-slack";
import { JSX } from 'jsx-slack/jsx-runtime';
import { getChannelsFromUser } from '../utils/index.js';
import { Channel } from '../entity/Channel.js';

interface ChannelSelectProps {
    userSlackId: string,
    selectedChannel?: Channel["id"]
    token: string
}

/**
 * Create survey component.
 */
export const CreateSurvey = async ({userSlackId, selectedChannel}: ChannelSelectProps): Promise<JSX.Element> => {

    /**
     * Show a dropdown menu with all channels the user is a member of.
     * Will also show a pop up confirming you want to create a survey for the selected channel.
     */
    const channels = await getChannelsFromUser(userSlackId)
    if(channels.length) {
        return (
            <Actions>
                <Select actionId="createSurvey" placeholder="Select a channel" confirm ={
                    <Confirm title="Are you sure?" confirm="Yes, please" deny="Cancel">
                        Do you really want to create a survey for this channel?
                    </Confirm>
                }>
                    {
                        channels.map((channel) => (<Option selected={channel == selectedChannel} value={channel.toString()}>{channel}</Option>))
                    }
                </Select>
            </Actions>
        )
    } else {
        return <></>
    }
}
import { Actions, Button, Select } from "jsx-slack";
import { JSX } from 'jsx-slack/jsx-runtime';
import { ChannelInfo, getChannelsFromUser } from '../utils/index.js';
import { Channel } from '../entity/Channel.js';

interface ChannelSelectProps {
    userSlackId: string,
    token: string
}

/**
 * Create survey component.
 */
export const CreateSurvey = async ({userSlackId, token}: ChannelSelectProps): Promise<JSX.Element> => {

    /**
     * Show a dropdown menu with all channels the user is a member of.
     * Will also show a pop up confirming you want to create a survey for the selected channel.
     */
    const channels: ChannelInfo[] = await getChannelsFromUser(userSlackId, token)
    if(channels.length) {
        return (
            <>
                <Select placeholder="Select channels" multiple blockId="channelsSelect" label="Channels:" >
                    {channels.map(channel => <option value={channel.slackId}>{channel.name}</option>)}
                </Select>
                <Actions>
                    <Button style="primary" actionId="createSurvey">Create survey</Button>
                </Actions>
            </>
        )
    } else {
        return <></>
    }
}
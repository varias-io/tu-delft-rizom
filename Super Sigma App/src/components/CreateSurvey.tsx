import { Actions, Button, ChannelsSelect } from "jsx-slack";
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
export const CreateSurvey = async ({userSlackId}: ChannelSelectProps): Promise<JSX.Element> => {

    /**
     * Show a dropdown menu with all channels the user is a member of.
     * Will also show a pop up confirming you want to create a survey for the selected channel.
     */
    const channels = await getChannelsFromUser(userSlackId)
    if(channels.length) {
        return (
            <>
                <ChannelsSelect placeholder="Select channels" multiple blockId="channelsSelect" label="Laebel"/>
                <Actions>
                    <Button style="primary" actionId="createSurvey">Create survey</Button>
                </Actions>
            </>
        )
    } else {
        return <></>
    }
}
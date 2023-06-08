import { Actions, Button, Select } from "jsx-slack";
import { JSX } from 'jsx-slack/jsx-runtime';
import { ChannelInfo, entityManager, getChannelsFromUser } from '../utils/index.js';
import { Channel } from "../entities/Channel.js";
import { Installation } from "../entities/Installation.js";

interface ChannelSelectProps {
    userSlackId: string,
    token: string,
    teamId: string
}

/**
 * Create survey component.
 */
export const CreateSurvey = async ({userSlackId, token, teamId}: ChannelSelectProps): Promise<JSX.Element> => {

    /**
     * Show a dropdown menu with all channels the user is a member of.
     * Will also show a pop up confirming you want to create a survey for the selected channel.
     */
    const channels: ChannelInfo[] = await getChannelsFromUser(userSlackId, token, teamId)
    for(const channel of channels){
        const existingChannel = await entityManager.findOne(Channel, {where: {slackId: channel.slackId, workspaces: { teamId }}})
        if(!existingChannel){
            const workspace = await entityManager.findOne(Installation, {where: {teamId}})
            if(workspace) {
                await entityManager.create(Channel, {
                    ...channel,
                    workspaces: [workspace]
                }).save()
            }
        }
    }
    if(channels.length) {
        return (
            <>
                <Select placeholder="Select channel" blockId="channelSelect" label="Channel:" >
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
import { Actions, Button, Select } from "jsx-slack";
import { JSX } from 'jsx-slack/jsx-runtime';
import { ChannelInfo, app, entityManager, getChannelsFromUser, getUsersFromChannel } from '../utils/index.js';
import { Channel } from "../entities/Channel.js";
import { Installation } from "../entities/Installation.js";
import { Brackets } from "typeorm";

interface ChannelSelectProps {
    userSlackId: string,
    teamId: string
}

/**
 * Create survey component.
 */
export const CreateSurvey = async ({userSlackId, teamId}: ChannelSelectProps): Promise<JSX.Element> => {

    /**
     * Show a dropdown menu with all channels the user is a member of.
     * Will also show a pop up confirming you want to create a survey for the selected channel.
     */
    const workspace = await entityManager.findOne(Installation, {where: {teamId}, relations: ["channels", "channels.users"]})
    const channels: ChannelInfo[] = await getChannelsFromUser(userSlackId, workspace?.botToken ?? "", app)

    if(!workspace) {
        return <></>
    }

    const removedOrChanged = workspace.channels.filter(channel => !channels.find(c => c.slackId == channel.slackId))

    for(const channel of removedOrChanged) {
            try {
                await app.client.conversations.info({
                    channel: channel.slackId,
                    token: workspace.botToken
                })

            } catch {
                console.log("Soft deleting channel")
                entityManager.update(Channel, {id: channel.id}, {deletedAt: new Date()})
            }
    }


    const allChannels = await Promise.all(channels.map(async channel => {
        return await entityManager.createQueryBuilder(Channel, "channel")
            .leftJoinAndSelect("channel.primaryWorkspace", "primaryWorkspace")
            .leftJoinAndSelect("channel.connectWorkspaces", "connectWorkspaces")
            .where("channel.slackId = :slackId", {slackId: channel.slackId})
            .andWhere(new Brackets(qb => {
                qb.where("primaryWorkspace.teamId = :teamId", {teamId})
                    .orWhere("connectWorkspaces.teamId = :teamId", {teamId})
            }))
            .withDeleted()
            .getOne()
            .then(async existingChannel => {
                if(!existingChannel) {
                    if(channel.conversationHostId && channel.conversationHostId != channel.contextTeamId) {
                        const primaryWorkspace = await entityManager.findOne(Installation, {where: {teamId: channel.conversationHostId}})
                        if(!primaryWorkspace) {
                            console.error(`App is not installed in workspace ${channel.conversationHostId}`)
                            return null
                        }
                        return entityManager.create(Channel, {
                            ...channel,
                            primaryWorkspace,
                            connectWorkspaces: [workspace]
                        }).save()
                    } else {
                        return entityManager.create(Channel, {
                            ...channel,
                            primaryWorkspace: workspace
                        }).save()
                    }
                } else if(existingChannel.deletedAt) {
                    await entityManager.update(Channel, {id: existingChannel.id}, {deletedAt: null})
                    existingChannel.deletedAt = null
                }
                return existingChannel
            })
    }))


    await workspace.reload()
    
    for(const channel of allChannels.filter(channel => channel?.users.length == 0)) {
        if(channel) {
            await getUsersFromChannel({channelSlackId: channel.slackId, teamId: channel.primaryWorkspace.teamId}, app, entityManager)
        }
    }

    const shownChannels = await entityManager.find(Channel, {
        where: {
            users: {
                slackId: userSlackId
            }
        }, relations: ["users", "primaryWorkspace"], withDeleted: true
    })
        
    const slackChannels = await Promise.all(shownChannels.map(async channel => {
        try {
            const channelInfo: {channelName: string, channelSlackId: string, channelTeamId: string} = {
                channelName: (await app.client.conversations.info({
                    channel: channel.slackId,
                    token: channel.primaryWorkspace.botToken
                })).channel?.name ?? "", 
                channelSlackId: channel.slackId, 
                channelTeamId: channel.primaryWorkspace.teamId
            }
            return channelInfo
        } catch {
            await entityManager.update(Channel, { id: channel.id }, { deletedAt: new Date() });
            return null
        }
    })).then(channels => channels.filter(channel => channel != null) as {channelName: string, channelSlackId: string, channelTeamId: string}[])
    
    if(slackChannels.length) {
        return (
            <>
                <Select placeholder="Select channel" blockId="channelSelect" label="Channel:" >
                    {slackChannels.map(channel => <option value={JSON.stringify([channel.channelSlackId, channel.channelTeamId])}>{channel.channelName}</option>)}
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
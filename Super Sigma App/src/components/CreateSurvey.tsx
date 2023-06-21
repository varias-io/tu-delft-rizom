import { Actions, Button, Mrkdwn, Section, Select } from "jsx-slack";
import { JSX } from 'jsx-slack/jsx-runtime';
import { ChannelInfo, ConversationsApp, TeamInfoApp, UsersApp, ViewsPublishApp, getChannelsFromWorkspace, getUsersFromChannels } from '../utils/index.js';
import { Channel } from "../entities/Channel.js";
import { Installation } from "../entities/Installation.js";
import { Brackets, EntityManager } from "typeorm";
import { Context } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";
import { updateHome } from "../events/index.js";

interface ChannelSelectProps {
    userSlackId: string,
    teamId: string,
    app: ConversationsApp & UsersApp & ViewsPublishApp & TeamInfoApp,
    entityManager: EntityManager
    shouldReload: boolean,
    context: Pick<Context & StringIndexed, "teamId" | "botToken">
}

/**
 * Create survey component.
 */
export const CreateSurvey = async ({userSlackId, teamId, shouldReload, context, app, entityManager}: ChannelSelectProps): Promise<JSX.Element> => {

    /**
     * Show a dropdown menu with all channels the user is a member of.
     * Will also show a pop up confirming you want to create a survey for the selected channel.
     */

    
    // gets the workspace associated with the installation, specifically the channels and the users in the channels.
    const workspace = await entityManager.findOne(Installation, {where: {teamId}, relations: ["channels", "channels.users"]})
    // get all channels from the workspace.
    const channels: ChannelInfo[] = await getChannelsFromWorkspace(workspace?.botToken ?? "", app)

    if(!workspace) {
        return <></>
    }

    /*gets all the channels that were removed or changed by filtering on channels that exist in the workspace but the user does 
    * not have access to.
    */
    const removedOrChanged = workspace.channels.filter(channel => !channels.find(c => c.slackId == channel.slackId))

    // for every channel that was removed or changed, check if it is either archived or deleted and if so soft delete it in the database.
    for(const channel of removedOrChanged) {
        await app.client.conversations.info({
            channel: channel.slackId,
            token: workspace.botToken,
        }).then(res => {
            if(res.channel?.is_archived) {
                entityManager.update(Channel, {id: channel.id}, {deletedAt: new Date()})
            }
        }).catch(_e => {
            console.log("Soft deleting channel")
            entityManager.update(Channel, {id: channel.id}, {deletedAt: new Date()})
        })

    }


    
    const allChannels = await Promise.all(channels.map(async channel => {
        return await entityManager.createQueryBuilder(Channel, "channel")
            // get the channel from the database, which might be soft deleted. 
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
                //if the channel does not exist in our database then we go into this.
                if(!existingChannel) {
                    //check if the channel is from slack connect and another workspace.
                    if(channel.conversationHostId && channel.conversationHostId != channel.contextTeamId) {
                        //get the primary workspace.
                        const primaryWorkspace = await entityManager.findOne(Installation, {where: {teamId: channel.conversationHostId}})
                       //if it does not exist throw an error
                        if(!primaryWorkspace) {
                            console.error(`App is not installed in workspace ${channel.conversationHostId}`)
                            return null
                        }
                        // if it does exist, retrieve the channel from the database.
                        const actualExisting = await entityManager.createQueryBuilder(Channel, "channel")
                            .leftJoinAndSelect("channel.primaryWorkspace", "primaryWorkspace")
                            .leftJoinAndSelect("channel.connectWorkspaces", "connectWorkspaces")
                            .where("channel.slackId = :slackId", {slackId: channel.slackId})
                            .andWhere("primaryWorkspace.teamId = :teamId", {teamId: channel.conversationHostId})
                            .withDeleted()
                            .getOne()
                        // add the workspace to the database for this channel.
                        if(actualExisting) {
                            await entityManager.createQueryBuilder(Channel, "channel")
                                .relation(Channel, "connectWorkspaces")
                                .of(actualExisting)
                                .add(workspace)

                            //return the channel. now with the workspace as relation
                            return entityManager.createQueryBuilder(Channel, "channel")
                                .leftJoinAndSelect("channel.primaryWorkspace", "primaryWorkspace")
                                .leftJoinAndSelect("channel.connectWorkspaces", "connectWorkspaces")
                                .where("channel.slackId = :slackId", {slackId: channel.slackId})
                                .andWhere("primaryWorkspace.teamId = :teamId", {teamId: channel.conversationHostId})
                                .withDeleted()
                                .getOne()
                        }
                        //create and return channel with the slackconnect workspace.
                        return entityManager.create(Channel, {
                            ...channel,
                            primaryWorkspace,
                            connectWorkspaces: [workspace]
                        }).save()
                    } 
                    // otherwise create it in the database with just the primary workspace.
                    else {
                        return entityManager.create(Channel, {
                            ...channel,
                            primaryWorkspace: workspace
                        }).save()
                    }
                }
                // if it is soft deleted, restore it in the database.
                else if(existingChannel.deletedAt) {
                    await entityManager.update(Channel, {id: existingChannel.id}, {deletedAt: null})
                    existingChannel.deletedAt = null
                }
                return existingChannel
            })
    }))

    //refresh the workspace
    await workspace.reload()

    if(shouldReload) { 
        
        getUsersFromChannels({channels: allChannels.filter(channel => channel != null) as Channel[]}, app, entityManager)
            .then(async () => {
                console.log("Updating home")
                updateHome({ userSlackId, context, app, entityManager, shouldReload: false })
            })

        return (
            <Section>
                <Mrkdwn>
                    <b>Loading channels...</b>
                </Mrkdwn>
            </Section>
        )
    } else {
        //for every channel with no users, create the users. 
    
        // every channel that the user can see. 
        const shownChannels = await entityManager.find(Channel, {
            where: {
                users: {
                    slackId: userSlackId
                }
            }, relations: ["users", "primaryWorkspace"]
        })
            
        // get every channel that is not archived or deleted. 
        const slackChannels = await Promise.all(shownChannels.map(async channel => {
            return app.client.conversations.info({
                channel: channel.slackId,
                token: channel.primaryWorkspace.botToken
            }).then(async info => {
                if (!info.channel || info.channel.is_archived) {
                    await entityManager.update(Channel, { id: channel.id }, { deletedAt: new Date() });
                    return null
                }
    
                const channelInfo: {channelName: string, channelSlackId: string, channelTeamId: string} = {
                    channelName: info.channel?.name ?? "", 
                    channelSlackId: channel.slackId, 
                    channelTeamId: channel.primaryWorkspace.teamId
                }
                return channelInfo
            }).catch(async _e => {
                await entityManager.update(Channel, { id: channel.id }, { deletedAt: new Date() });
                return null
            })
        })).then(channels => channels.filter(channel => channel != null) as {channelName: string, channelSlackId: string, channelTeamId: string}[])
        
        // if there are any channels, return the page. 
        if(slackChannels.length) {
            return (
                <>
                    <Select placeholder="Select channel" blockId="channelSelect" label="Create a survey:" >
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
}
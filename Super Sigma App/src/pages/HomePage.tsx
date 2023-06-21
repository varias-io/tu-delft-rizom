import { Header, Home } from "jsx-slack";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { ConversationsApp, TeamInfoApp, UsersApp, ViewsPublishApp, latestSurveys } from "../utils/index.js";
import { EntityManager } from "typeorm";
import { Context } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";

interface HomeProps {
    userSlackId: string
    selectedChannel?: string
    app: ConversationsApp & TeamInfoApp & UsersApp & ViewsPublishApp
    entityManager: EntityManager
    shouldReload: boolean
    context: Pick<Context & StringIndexed, "teamId" | "botToken">
}

export const HomePage = async ({ userSlackId, shouldReload, context, app, entityManager }: HomeProps) => (
    <Home>
        <Header>Create a survey:</Header>
        {await CreateSurvey({ userSlackId, teamId: context.teamId ?? "", shouldReload, context, app, entityManager })}
        {await SurveyDisplay({ surveys: await latestSurveys(userSlackId, entityManager), userSlackId, entityManager, app })}
    </Home>
)


import { Home } from "jsx-slack";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { ConversationsApp, TeamInfoApp, UsersInfoApp, latestSurveys } from "../utils/index.js";
import { EntityManager } from "typeorm";

interface HomeProps {
    userSlackId: string
    selectedChannel?: string
    teamId: string
    app: ConversationsApp & TeamInfoApp & UsersInfoApp
    entityManager: EntityManager
}

export const HomePage = async ({userSlackId, teamId, app, entityManager}: HomeProps) => (
    <Home>   
        {await CreateSurvey({userSlackId, teamId, app, entityManager})}
        {await SurveyDisplay( {surveys: await latestSurveys(userSlackId, entityManager), userSlackId, entityManager, app})}
    </Home>
)


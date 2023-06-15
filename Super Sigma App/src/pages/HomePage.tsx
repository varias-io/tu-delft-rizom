import { Home } from "jsx-slack";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { ConversationsApp, entityManager, latestSurveys } from "../utils/index.js";

interface HomeProps {
    userSlackId: string
    selectedChannel?: string
    teamId: string
    app: ConversationsApp
}

export const HomePage = async ({userSlackId, teamId, app}: HomeProps) => (
    <Home>   
        {await CreateSurvey({userSlackId, teamId, app})}
        {await SurveyDisplay({ surveys: await latestSurveys(userSlackId, entityManager), userSlackId })}
    </Home>
)


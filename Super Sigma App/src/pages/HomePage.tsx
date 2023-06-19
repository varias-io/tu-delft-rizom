import { Home, Header } from "jsx-slack";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { entityManager, latestSurveys } from "../utils/index.js";

interface HomeProps {
    userSlackId: string
    token: string
    selectedChannel?: string
    teamId: string
}

export const HomePage = async ({userSlackId, token, teamId}: HomeProps) => (
    <Home>   
        {await CreateSurvey({userSlackId, token, teamId})}
        {await SurveyDisplay( {surveys: await latestSurveys(userSlackId, entityManager), token, userSlackId})}
    </Home>
)


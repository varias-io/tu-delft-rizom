import { Home, Header } from "jsx-slack";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { latestSurveys } from "../utils/index.js";

interface HomeProps {
    userSlackId: string
    token: string
    selectedChannel?: string
    teamId: string
}

export const HomePage = async ({userSlackId, token, teamId}: HomeProps) => (
    <Home>   
        <Header>Create a survey:</Header>
        {await CreateSurvey({userSlackId, token, teamId})}
        {await SurveyDisplay( {surveys: await latestSurveys(userSlackId), token, userSlackId})}
    </Home>
)


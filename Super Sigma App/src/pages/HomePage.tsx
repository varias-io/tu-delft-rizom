import { Home } from "jsx-slack";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { entityManager, latestSurveys } from "../utils/index.js";

interface HomeProps {
    userSlackId: string
    selectedChannel?: string
    teamId: string
}

export const HomePage = async ({ userSlackId, teamId }: HomeProps) => (
    <Home>   
        {await CreateSurvey({ userSlackId, teamId })}
        {await SurveyDisplay({ surveys: await latestSurveys(userSlackId, entityManager), userSlackId })}
    </Home>
)


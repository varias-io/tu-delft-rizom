import { Home, Header, Divider, Section, Button, Actions } from "jsx-slack";
import { ChannelSelect } from "../components/ChannelSelect.js";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { MembersSelect } from "../components/MembersSelect.js";
import { surveyExample1, surveyExample2 } from "../utils/index.js";

interface HomeProps {
    userId: string
    token: string
    selectedChannel?: string
}

export const HomePage = async ({userId, token, selectedChannel}: HomeProps) => (
    <Home>   
        <Header>Welcome back to my home! :house_with_garden:</Header>
        <Header>Make members Channel Managers here:</Header>
        <Divider/>
        <Section><b>Select a channel</b></Section>
        {await ChannelSelect({userId, token})}
        {(selectedChannel && 
            <>
                {await MembersSelect(selectedChannel, token)}
                <Actions><Button style="primary" actionId="makeManager">Authorize</Button></Actions>
            </>
        )
        || <></>}
        <Divider/>
        <Header>Create a survey:</Header>
        {await CreateSurvey({userId, token})}
        {await SurveyDisplay( {surveys: [surveyExample1, surveyExample2], token})}
        
    </Home>
)


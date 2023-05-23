import { Home, Header, Divider, Section, Button, Actions } from "jsx-slack";
import { ChannelSelect } from "../components/ChannelSelect.js";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyData } from "../components/SurveyDisplay.js";
import { Survey } from "../entity/Survey.js";
import { entityManager } from "../utils/database.js";
import { MembersSelect } from "../components/MembersSelect.js";

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
        <SurveyData surveys = 
        {[entityManager.create(Survey, {channelName: "foo", completedAmount: 1, participants: 2, TMSScore: 3, date: new Date(2021, 1, 1)}), entityManager.create(Survey, {channelName: "bar", completedAmount: 1, participants: 2, TMSScore: 3, date: new Date(2021, 1, 1)})].sort(function(a, b) {
        return a.channelName.localeCompare(b.channelName);
        })}/>
        <Divider/>
        <Actions><Button style="primary" actionId="fillSurvey">Fill in Survey</Button></Actions>

    </Home>
)


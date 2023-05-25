import { Home, Header, Divider, Section, Button, Actions } from "jsx-slack";
import { ChannelSelect } from "../components/ChannelSelect.js";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { MembersSelect } from "../components/MembersSelect.js";
import { entityManager } from "../utils/index.js";
import { Survey } from "../entity/Survey.js";
import { User } from "../entity/User.js";

interface HomeProps {
    userSlackId: string
    token: string
    selectedChannel?: string
}

export const HomePage = async ({userSlackId, token, selectedChannel}: HomeProps) => (
    <Home>   
        <Header>Welcome back to my home! :house_with_garden:</Header>
        <Header>Make members Channel Managers here:</Header>
        <Divider/>
        <Section><b>Select a channel</b></Section>
        {await ChannelSelect({userSlackId, token})}
        {(selectedChannel && 
            <>
                {await MembersSelect(selectedChannel, token)}
                <Actions><Button style="primary" actionId="makeManager">Authorize</Button></Actions>
            </>
        )
        || <></>}
        <Divider/>
        <Header>Create a survey:</Header>
        {await CreateSurvey({userSlackId, token})}
        {await SurveyDisplay( {surveys: await (async () => {
            const user = await entityManager.getRepository(User)
            .createQueryBuilder("user")
            .where("user.slackId = :slackId", { slackId: userSlackId })
            .getOne();
          
          if (!user) {
            throw new Error(`No user found with slackId: ${userSlackId}`);
          }

          const surveyIds = user.eligibleSurveys.map(survey => survey.id)

          
          const surveys = await entityManager.getRepository(Survey)
          .createQueryBuilder("survey")
          .leftJoinAndSelect("survey.participants", "participants")
          .leftJoinAndSelect("survey.channels", "channel")
          
          if(surveyIds.length) {
              surveys.where("survey.id IN (:...surveyIds)", { surveyIds: user.eligibleSurveys.map(survey => survey.id) })
          }
            
          return surveys.getMany();
        })(), token, userSlackId})}
    </Home>
)


import { Home, Header } from "jsx-slack";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { entityManager } from "../utils/index.js";
import { Survey } from "../entity/Survey.js";
import { User } from "../entity/User.js";

interface HomeProps {
    userSlackId: string
    token: string
    selectedChannel?: string
}

export const HomePage = async ({userSlackId, token}: HomeProps) => (
    <Home>   
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
          .where("participants.slackId = :userSlackId", { userSlackId })
          .leftJoinAndSelect("survey.channel", "channel")
          
          if(surveyIds.length) {
              surveys.where("survey.id IN (:...surveyIds)", { surveyIds: user.eligibleSurveys.map(survey => survey.id) })
          }
            
          return surveys.getMany();
        })(), token, userSlackId})}
    </Home>
)


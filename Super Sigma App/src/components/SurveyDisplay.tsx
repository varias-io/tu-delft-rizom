import { Actions, Button, Divider, Mrkdwn, Section } from "jsx-slack";
import { Survey } from "../entity/Survey.js";
import { TMSScore, computeTMS, getSmallestMissingQuestionIndex, participantsOf, surveyToTitle, usersWhoCompletedSurvey, groupSurvey } from "../utils/index.js";
import { GraphsModalProps } from "./ShowGraphs.js";

interface SurveyDisplayProps { 
  surveys: Survey[], 
  token: string, 
  userSlackId: string
  displayedInModal?: boolean
}

export const SurveyDisplay = async ({ surveys, token, userSlackId, displayedInModal = false}: SurveyDisplayProps) => {
  return (<>
    {await Promise.all(surveys.map(async (survey) => {
      const tmsScore: TMSScore = await computeTMS(survey);
      const surveyDate: [TMSScore[], string[]] = [[], []]; 
      
      surveyDate[0].push(tmsScore);
      surveyDate[1].push(survey.createdAt.toLocaleDateString("nl-NL"));

      const tms: [TMSScore[], string[]] = surveyDate
      
      const personalProgress = await getSmallestMissingQuestionIndex(userSlackId, survey.id);
      const graphModalProps: GraphsModalProps = {tms, displayedInModal}
      const latestSurvey: TMSScore = tms[0][tms[0].length-1]
      return <>
        <Divider/>
        <Section>
          <Mrkdwn>
          {await surveyToTitle(survey, token)}<br />
          {survey.createdAt.toLocaleDateString("nl-NL")}<br />
          Completed by {(await usersWhoCompletedSurvey(survey.id)).length}/{(await participantsOf(survey.id)).length} users <br />
          <br />
          Overall TMS: {((latestSurvey.specialization+latestSurvey.credibility+latestSurvey.coordination)/3).toFixed(2)}<br />
          - Specialization: {latestSurvey.specialization.toFixed(2)}<br />
          - Credibility: {latestSurvey.credibility.toFixed(2)}<br />
          - Coordination: {latestSurvey.coordination.toFixed(2)}<br />
          <br />
          <b>Personal progress: {personalProgress}/15</b> <br />
          </Mrkdwn>
        </Section>
        <Actions>
          {displayedInModal || personalProgress==15 ? <></> : <Button style="primary" actionId="fillSurvey" value={survey.id}>Fill in Survey</Button>}
          {displayedInModal ? <></> : <Button actionId="show_all_surveys" value={JSON.stringify((await groupSurvey(userSlackId, survey.channel.id)).map(survey => survey.id))}>Show All Surveys</Button>}
          <Button actionId="view_participation">View Participation </Button>
          <Button actionId="show_graphs" value={JSON.stringify(graphModalProps)} >Show TMS score breakdown</Button>
        </Actions>
      </>
    }))}
  </>)
};
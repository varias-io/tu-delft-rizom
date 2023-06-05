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
  if (surveys.length == 0) {
    return <>
      <Divider/>
      <Section>
        <Mrkdwn>
          You are currently not a part of any surveys. <br />
        </Mrkdwn>
      </Section>
    </>
  }
  return <>
    {await Promise.all(surveys.map(async (survey) => {
      const tms: TMSScore = await computeTMS(survey);
      const personalProgress = await getSmallestMissingQuestionIndex(userSlackId, survey.id);
      const graphModalProps: GraphsModalProps = {tms, displayedInModal}
      return <>
        <Divider/>
        <Section>
          <Mrkdwn>
          {await surveyToTitle(survey, token)}<br />
          {survey.createdAt.toLocaleDateString("nl-NL")}<br />
          Completed by {(await usersWhoCompletedSurvey(survey.id)).length}/{(await participantsOf(survey.id)).length} users <br />
          <br />
          Overall TMS: {((tms.specialization+tms.credibility+tms.coordination)/3).toFixed(2)}<br />
          - Specialization: {tms.specialization.toFixed(2)}<br />
          - Credibility: {tms.credibility.toFixed(2)}<br />
          - Coordination: {tms.coordination.toFixed(2)}<br />
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
  </>
};
import { Actions, Button, Divider, Mrkdwn, Section } from "jsx-slack";
import { Survey } from "../entities/Survey.js";
import { TMStoPercentage, TMSScore, computeTMS, getSmallestMissingQuestionIndex, participantsOf, surveyToTitle, usersWhoCompletedSurvey, groupSurvey, entityManager } from "../utils/index.js";
import { GraphsModalProps } from "../pages/ShowGraphs.js";


interface SurveyDisplayProps { 
  surveys: Survey[], 
  userSlackId: string
  displayedInModal?: boolean
}

export const SurveyDisplay = async ({ surveys, userSlackId, displayedInModal = false}: SurveyDisplayProps) => {
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
      const tmsScore: TMSScore = await computeTMS(survey, entityManager);
      const surveyDate: [TMSScore[], string[]] = [[], []]; 
      
      surveyDate[0].push(tmsScore);
      surveyDate[1].push(survey.createdAt.toLocaleDateString("nl-NL"));

      const tms: [TMSScore[], string[]] = surveyDate
      
      const personalProgress = await getSmallestMissingQuestionIndex(userSlackId, survey.id, entityManager);
      const graphModalProps: GraphsModalProps = {tms, displayedInModal}
      const latestSurvey: TMSScore = tms[0][tms[0].length-1]
      return <>
        <Divider/>
        <Section>
          <Mrkdwn>
          {
            displayedInModal 
            ? <>{await surveyToTitle(survey, entityManager)}<br/></> 
            : <>Latest survey for {await surveyToTitle(survey, entityManager)}<br /></>
          }
          {survey.createdAt.toLocaleDateString("nl-NL")}<br />
          Completed by {(await usersWhoCompletedSurvey(survey.id, entityManager)).length}/{(await participantsOf(survey.id, entityManager)).length} users<br />
          <br/>
          </Mrkdwn>
          {displayedInModal || personalProgress==15 ? <></> : <Button style="primary" actionId="fillSurveyHome" value={survey.id}>Fill in Survey</Button>}
        </Section>
        <Section>
          <Mrkdwn>
          Overall TMS: {Number(Math.floor(TMStoPercentage(((latestSurvey.specialization+latestSurvey.credibility+latestSurvey.coordination)/3))))}%<br/>
          - Specialization: {Number(Math.floor(TMStoPercentage(latestSurvey.specialization)))}%<br />
          - Credibility: {Number(Math.floor(TMStoPercentage(latestSurvey.credibility)))}%<br />
          - Coordination: {Number(Math.floor(TMStoPercentage(latestSurvey.coordination)))}%<br />
          <br />
          <b>Personal progress: {personalProgress}/15</b> <br />
          </Mrkdwn>
          <Button actionId="show_graphs" value={JSON.stringify(graphModalProps)} >View Breakdown</Button>
        </Section>
        {
          displayedInModal
          ? <></>
          : <Actions>
              <Button actionId="show_all_surveys" value={JSON.stringify((await groupSurvey(userSlackId, survey.channel.id, entityManager)).map(survey => survey.id))}>Survey History</Button>
            </Actions>
        }
        
      </>
    }))}
  </>
};
import { Actions, Button, Divider, Mrkdwn, Section } from "jsx-slack";
import { Survey } from "../entity/Survey.js";
import { TMSScore, computeTMS, getSmallestMissingQuestionIndex, participantsOf, surveyToTitle, usersWhoCompletedSurvey, groupSurvey } from "../utils/index.js";

export const SurveyDisplay = async ({ surveys, token, userSlackId }: { surveys: Survey[], token: string, userSlackId: string }) => (
  <>
    {await Promise.all(surveys.map(async (survey) => {
      const tms: TMSScore = await computeTMS(survey);
      const personalProgress = await getSmallestMissingQuestionIndex(userSlackId, survey.id);
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
          {personalProgress==15 ? <></> : <Button style="primary" actionId="fillSurvey" value={survey.id}>Fill in Survey</Button>}
          <Button actionId="show_all_surveys" value={JSON.stringify(groupSurvey(userSlackId, survey.id))}>Show All Surveys</Button>
          <Button actionId="view_participation">View Participation </Button>
          <Button actionId="show_graphs" value={JSON.stringify(tms)} >Show TMS score breakdown</Button>
        </Actions>
      </>
    }))}
  </>
);
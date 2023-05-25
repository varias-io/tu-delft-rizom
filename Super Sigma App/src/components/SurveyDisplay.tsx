import { Actions, Button, Section } from "jsx-slack";
import { Survey } from "../entity/Survey.js";
import { TMSScore, computeTMS, surveyToTitle, usersWhoCompletedSurvey } from "../utils/index.js";

export const SurveyDisplay = async ({ surveys, token }: { surveys: Survey[], token: string }) => (
  <>
    {await Promise.all(surveys.map(async (survey) => {
      const tms: TMSScore = await computeTMS(survey);
      return <>
        <Section>
          {`#${await surveyToTitle(survey, token)}`}<br />
          {`Completed ${(await usersWhoCompletedSurvey(survey)).length}/${survey.participants.length}`} <br />
          {`Overall TMS: ${((tms.specialization+tms.credibility+tms.coordination)/3).toFixed(2)}`}<br />
          {`- Specialization: ${tms.specialization.toFixed(2)}`}<br />
          {`- Credibility: ${tms.credibility.toFixed(2)}`}<br />
          {`- Coordination: ${tms.coordination.toFixed(2)}`}<br />
          {survey.createdAt.toLocaleDateString("nl-NL")}
          <br />
        </Section>
        <Actions>
          <Button style="primary" actionId="fillSurvey" value={survey.id}>Fill in Survey</Button>
          <Button actionId="view_participation">View Participation </Button>
          <Button actionId="show_graphs" value={JSON.stringify(tms)} >Show TMS score breakdown</Button>
        </Actions>
      </>
    }))}
  </>
);
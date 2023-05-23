import { Button, Section } from "jsx-slack";
import { Survey } from "../entity/Survey.js";
import { computeTMS, surveyToTitle, usersWhoCompletedSurvey } from "../utils/index.js";

export const SurveyDisplay = async ({ surveys, token }: { surveys: Survey[], token: string }) => (
  <>
    {await Promise.all(surveys.map(async (survey) => (
      <Section >
        {`#${await surveyToTitle(survey, token)}`}<br />
        {`Completed ${(await usersWhoCompletedSurvey(survey)).length}/${survey.participants.length}`} <br />
        {`TMS: ${computeTMS(survey)}`}<br />
        {survey.createdAt.toLocaleDateString("nl-NL")}
        <br />
        <Button actionId="view_participation" style="primary">
          view participation 
        </Button>
      </Section>
    )))}
  </>
);
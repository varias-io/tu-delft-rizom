import { Button, Section } from "jsx-slack";
import { Survey } from "../entity/Survey.js";

export const SurveyData = ({ surveys }: { surveys: Survey[] }) => (
  <>
    {surveys.map((survey) => (
      <Section >
        {`#${survey.channelName}`}<br />
        {`Completed ${survey.completedAmount}/${survey.participants}`} <br />
        {`TMS: ${survey.TMSScore}`}<br />
        {survey.date.toLocaleDateString("nl-NL")}
        <br />
        <Button actionId="view_participation" style="primary">
          view participation 
        </Button>
      </Section>
    ))}
  </>
);
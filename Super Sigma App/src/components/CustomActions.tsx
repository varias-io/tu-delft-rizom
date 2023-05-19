import { Actions, RadioButtonGroup, RadioButton, Button, Section } from "jsx-slack";
import { Survey } from "../entity/Survey.js";

/**
 * CustomActions component renders a set of custom actions with radio buttons and a button.
 * @param {string} first_button_b - The label for the first radio button.
 * @param {string} second_button_b - The label for the second radio button.
 * @returns {JSX.Element} The JSX element representing the custom actions.
 */
export const CustomActions = ({ first_button_b, second_button_b }: { first_button_b: string, second_button_b: string }) => (
  <Actions>
    <RadioButtonGroup actionId="next">
      <RadioButton value="tickets" checked>
        <b>{first_button_b}</b> :ticket:
        <small>
          <i>Check your mom to start your work.</i>
        </small>
      </RadioButton>
      <RadioButton value="reminder">
        <b>{second_button_b}</b> :memo:
        <small>
          <i>boooo</i>
        </small>
      </RadioButton>
      <RadioButton value="pomodoro">
        <b>Start pomodoro timer</b> :tomato:
        <small>
          <i>Get focused on your time, with tomato!</i>
        </small>
      </RadioButton>
    </RadioButtonGroup>
    <Button actionId="start" style="primary">
      Start working
    </Button>
  </Actions>
)

/**
 * CustomActions2 component renders a set of custom actions with a button.
 * @returns {JSX.Element} The JSX element representing the custom actions.
 */
export const CustomActions2 = () => (
  <Actions>
    <Button actionId="create_survey" style="primary">
      Create Survey
    </Button>
  </Actions>
)

/**
 * SurveyData component displays an array of survey data.
 * @param {Object[]} surveys - An array of Survey objects to be rendered.
 * @param {string} surveys[].channel_Name - The channel name of the survey.
 * @param {number} surveys[].Survey_num - The survey number.
 * @param {number} surveys[].completed_amount - The number of completed surveys.
 * @param {number} surveys[].participants - The total number of participants.
 * @param {number} surveys[].TMS_Score - The TMS score of the survey.
 * @param {Date} surveys[].date - The date of the survey.
 * @returns {JSX.Element} The JSX element representing the survey data.
 */
export const SurveyData = ({ surveys }: { surveys: Survey[] }) => (
  <>
    {surveys.map((survey) => (
      <Section >
        {`#${survey.channel_Name}`}<br />
        {`Completed ${survey.completed_amount}/${survey.participants}`} <br />
        {`TMS: ${survey.TMS_Score}`}<br />
        {survey.date.toLocaleDateString("nl-NL")}
        <br />
        <Button actionId="view_participation" style="primary">
          view participation 4
        </Button>
      </Section>
    ))}
  </>
);
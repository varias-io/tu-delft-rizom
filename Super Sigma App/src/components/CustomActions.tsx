import { Actions, RadioButtonGroup, RadioButton, Button } from "jsx-slack";

export const CustomActions = ({first_button_b, second_button_b}: {first_button_b: string, second_button_b: string}) => (
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
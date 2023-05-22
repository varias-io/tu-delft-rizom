import {RadioButton, Modal, Header, RadioButtonGroup, Divider, JSXSlack} from 'jsx-slack'
import { surveyTemplate } from '../constants.js'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'

interface QuestionModalProps {
  questionIndex : number,
  channelNames : string[]
}

const valueIfReversed = (value: number, reversed: boolean) : string => (
  reversed ? 
    (6 - value).toString() : 
    value.toString()
)

interface OptionsWithValuesProps {
  reversed : boolean
}

const OptionsWithValues = ({reversed} : OptionsWithValuesProps) : JSX.Element => (
  <>
    {["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"].map((option, index) => 
      <RadioButton value={valueIfReversed(index+1, reversed)}>{option}</RadioButton>)}
  </>
)

const channelNamesToString = (channelNames: string[]): string => channelNames.join(", ")


export const showSurveyModal = async (client: AllMiddlewareArgs["client"], token: string, trigger_id: string, index: number) => {
  try {
    await client.views.open({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(<SurveyModalBlock questionIndex={index} channelNames={["sad", "das"]} />)
    });
  } catch (error) {
    console.error(error);
  }
}

export const SurveyModalBlock = ({questionIndex, channelNames} : QuestionModalProps) : JSX.Element => {
  const {focus, number, text, reversed} = surveyTemplate[questionIndex];
  return <Modal 
    title={`TMS survey for ${channelNamesToString(channelNames)}`} 
    close="Previous" 
    submit="Next" 
    callbackId='survey_modal_submission' 
    privateMetadata={JSON.stringify({channelNames, questionIndex})}
  >
  <Header>{focus}</Header>
  <Divider />

  <RadioButtonGroup
    label={`${number.toString()}. ${text}`}
    required
  >
  <OptionsWithValues {...{reversed}} />
  </RadioButtonGroup>

  </Modal>
}
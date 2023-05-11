import {RadioButton, Modal, Header, RadioButtonGroup, Divider} from 'jsx-slack'
import { Question } from '../constants.js'
import { JSX } from 'jsx-slack/jsx-runtime'

interface QuestionModalProps {
  question : Question,
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

export const SurveyModalBlock = ({question : {focus, number, text, reversed}, channelNames} : QuestionModalProps) : JSX.Element => (
  <Modal title={`TMS survey for ${channelNamesToString(channelNames)}`} close="Previous" submit="Next">
  <Header>${focus}</Header>
  <Divider />

  <RadioButtonGroup
    label={`${number.toString()}. ${text}`}
    required
  >
  <OptionsWithValues {...{reversed}} />
  </RadioButtonGroup>

  </Modal>
)
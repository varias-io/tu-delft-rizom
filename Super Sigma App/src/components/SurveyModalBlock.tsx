import {RadioButton, Modal, Header, RadioButtonGroup, Divider, JSXSlack} from 'jsx-slack'
import { surveyTemplate } from '../constants.js'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'
import { Survey } from '../entity/Survey.js'
import { surveyToTitle } from '../utils/index.js'

interface QuestionModalProps {
  questionIndex : number,
  survey : Survey,
  token: string,
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


export const showSurveyModal = async (client: AllMiddlewareArgs["client"], token: string, trigger_id: string, survey: Survey, questionIndex: number) => {
  try {
    await client.views.open({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(await SurveyModalBlock({survey, questionIndex, token}))
    });
  } catch (error) {
    console.error(error);
  }
}

export const SurveyModalBlock = async ({survey, questionIndex, token} : QuestionModalProps) : Promise<JSX.Element> => {
  const {focus, number, text, reversed} = surveyTemplate[questionIndex];
  return <Modal 
    title={`TMS survey for ${await surveyToTitle(survey, token)}`} 
    close="Previous" 
    submit="Next" 
    callbackId='survey_modal_submission' 
    privateMetadata={JSON.stringify({survey, questionIndex})}
  >
  <Header>{focus}</Header>
  <Divider />

  <RadioButtonGroup
    id='radio_buttons'
    label={`${number.toString()}. ${text}`}
    required
  >
  <OptionsWithValues {...{reversed}} />
  </RadioButtonGroup>

  </Modal>
}
import {RadioButton, Modal, Header, RadioButtonGroup, Divider, JSXSlack, Section} from 'jsx-slack'
import { surveyTemplate } from '../constants.js'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'
import { Survey } from '../entity/Survey.js'
import { getAnswer, surveyToTitle } from '../utils/index.js'
import { User } from '../entity/User.js'

interface QuestionModalProps {
  questionIndex : number,
  survey : Survey,
  token: string,
  userSlackId: User["id"]
}

const valueIfReversed = (value: number, reversed: boolean) : string => (
  reversed ? 
    (6 - value).toString() : 
    value.toString()
)

interface OptionsWithValuesProps {
  reversed : boolean
  surveyId: Survey["id"]
  userSlackId: User["slackId"]
  questionIndex: number
}

const OptionsWithValues = async ({reversed, surveyId, userSlackId, questionIndex} : OptionsWithValuesProps) : Promise<JSX.Element> => (
  <>
    {await Promise.all(["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"].map(async (option, index) => {
      const value = valueIfReversed(5-index, reversed)
      const answer = await getAnswer(surveyId, userSlackId, questionIndex)
      return <RadioButton checked={answer.toString()==value} value={value}>{option}</RadioButton>}))
    }
  </>
)


export const showSurveyModal = async (client: AllMiddlewareArgs["client"], token: string, trigger_id: string, survey: Survey, questionIndex: number, userSlackId: User["id"]) => {
  try {
    await client.views.open({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(await SurveyModalBlock({survey, questionIndex, token, userSlackId}))
    });
  } catch (error) {
    console.error(error);
  }
}

export const SurveyModalBlock = async ({survey, questionIndex, token, userSlackId} : QuestionModalProps) : Promise<JSX.Element> => {
  const {focus, number, text, reversed} = surveyTemplate[questionIndex];
  return <Modal 
    title={`TMS survey`} 
    close={questionIndex == 0 ? "Close" : "Previous"} 
    submit={questionIndex == 14 ? "Submit" : "Next"}
    callbackId='survey_modal' 
    privateMetadata={JSON.stringify({surveyId: survey.id, questionIndex})}
  >
  <Header>{focus}</Header>
  <Divider />

  <RadioButtonGroup
    id='radio_buttons'
    label={`${number.toString()}. ${text}`}
    required
  >
  {await OptionsWithValues ({reversed, surveyId: survey.id, userSlackId, questionIndex})}
  </RadioButtonGroup>
  <Divider/>
  <Section>{await surveyToTitle(survey, token)}</Section>

  </Modal>
}
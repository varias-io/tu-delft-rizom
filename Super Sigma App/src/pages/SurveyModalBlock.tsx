import {RadioButton, Modal, Header, RadioButtonGroup, Divider, JSXSlack, Section, Mrkdwn} from 'jsx-slack'
import { surveyTemplate } from '../constants.js'
import { JSX } from 'jsx-slack/jsx-runtime'
import { Survey } from '../entities/Survey.js'
import { ConversationsApp, TeamInfoApp, ViewsOpenClient, surveyToTitle } from '../utils/index.js'
import { EntityManager } from 'typeorm'

interface QuestionModalProps {
  questionIndex : number,
  survey : Survey,
  entityManager: EntityManager
  app: ConversationsApp & TeamInfoApp
}

interface WarningModalProps {
  questionIndex : number,
  survey : Survey,
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
    {["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"].map((option, index) => 
      <RadioButton value={valueIfReversed(5-index, reversed)}>{option}</RadioButton>)}
  </>
)

export const showWarningModal = async (client: ViewsOpenClient, token: string, trigger_id: string, survey: Survey, questionIndex: number) => {
  try{
    await client.views.open({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(await WarningModalBlock({survey, questionIndex}))
    });
  } catch (error) {
    console.error(error);
  }

}

export const WarningModalBlock = async ({survey, questionIndex} : WarningModalProps) : Promise<JSX.Element> => {
  return <Modal 
    title="Important!"
    submit="I understand"
    callbackId='warning_modal'
    notifyOnClose
    privateMetadata={JSON.stringify({surveyId: survey.id, questionIndex})}
    >
    <Section><Mrkdwn>You can not change your answer for a question or go back in the survey after you click next!</Mrkdwn></Section>

    </Modal>
}

export const SurveyModalBlock = async ({survey, questionIndex, entityManager, app} : QuestionModalProps) : Promise<JSX.Element> => {
  const {focus, number, text, reversed} = surveyTemplate[questionIndex];
  return <Modal 
    title='TMS survey'
    submit={questionIndex == 14 ? "Submit" : "Next"}
    callbackId='survey_modal' 
    notifyOnClose
    privateMetadata={JSON.stringify({surveyId: survey.id, questionIndex})}
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
  <Divider/>
  <Section>{await surveyToTitle(survey, entityManager, app)}</Section>

  </Modal>
}
import {Modal, JSXSlack} from 'jsx-slack'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'
import { Survey } from '../entity/Survey.js';
import { SurveyDisplay } from './SurveyDisplay.js';


export const showAllSurveys = async (client: AllMiddlewareArgs["client"], token: string, trigger_id: string, surveys: Survey[], userSlackId: string) => {
  try {
    await client.views.open({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(await AllSurveysBlock(surveys, token, userSlackId))
    });
  } catch (error) {
    console.error(error);
  }
}

export const AllSurveysBlock = async(surveys: Survey[], token: string, userSlackId: string) : Promise<JSX.Element> => {
  return <Modal title="Survey History">
    {await SurveyDisplay({surveys, token, userSlackId, displayedInModal: true})}
    </Modal>
}
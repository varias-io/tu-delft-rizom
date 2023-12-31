import {Modal, JSXSlack, Image, Mrkdwn, Section, Divider} from 'jsx-slack'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'
import { Survey } from '../entities/Survey.js';
import { SurveyDisplay } from '../components/SurveyDisplay.js';
import { ConversationsApp, LineGraphProps, TMSScore, TMStoPercentage, TeamInfoApp, computeTMS, createGraph, defaultLineGraphsProps } from '../utils/index.js';
import { threshold } from '../events/showAllSurveysAction.js';
import { EntityManager } from 'typeorm';


export const showAllSurveys = async (client: AllMiddlewareArgs["client"], token: string, trigger_id: string, surveys: Survey[], userSlackId: string, entityManager: EntityManager, app: ConversationsApp & TeamInfoApp) => {
  if(surveys.length == 0) {
    await client.views.open({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(<Modal title="Survey History"><Section><Mrkdwn>There are no finished surveys to show in the history.</Mrkdwn></Section><ParticipationWarning/></Modal>)
    });
    return;
  }
  try {
    const tmsScore: TMSScore[] = (await Promise.all(surveys.map(async (survey) => await computeTMS(survey, entityManager)))).reverse();
    const dates: string[] = surveys.map((survey) => survey.createdAt.toLocaleDateString("nl-NL")).reverse(); 

    const tms: [TMSScore[], string[]] = [ tmsScore, dates];

    const lineGraphProps: LineGraphProps = {
      ...defaultLineGraphsProps,
      filename: `line${new Date().getTime()}`,
      data: {
        labels: tms[1], 
        datasets: [{
          label: "Specialization",
          data: tms[0].map((tms) => TMStoPercentage(tms.specialization)),
          borderColor: "#1803fc",
          backgroundColor: "#1803fc",
          borderWidth: 7
        }, {
          label: "Credibility",
          data: tms[0].map((tms) => TMStoPercentage(tms.credibility)),
          borderColor: "#90109a",
          backgroundColor: "#90109a",
          borderWidth: 7,
        }, {
          label: "Coordination",
          data: tms[0].map((tms) => TMStoPercentage(tms.coordination)),
          borderColor: "#b30909",
          backgroundColor: "#b30909",
          borderWidth: 7
        }, {
          label: "Overall TMS",
          data: tms[0].map((tms) => TMStoPercentage((tms.specialization+tms.credibility+tms.coordination)/3)),
          borderColor: "#000000",
          backgroundColor: "#000000",
          borderDash: [10, 5],
          borderWidth: 7
        }]
      },
      height: 800
    }
    
    const lineGraph = createGraph(lineGraphProps)

    await client.views.open({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(await AllSurveysBlock(surveys, userSlackId, await lineGraph, entityManager, app))
    });
  } catch (error) {
    console.error(error);
  }
}

export const AllSurveysBlock = async(surveys: Survey[], userSlackId: string, lineGraph: string, entityManager: EntityManager, app: ConversationsApp & TeamInfoApp) : Promise<JSX.Element> => {
  return <Modal title="Survey History" callbackId='line_graph_modal' notifyOnClose privateMetadata={JSON.stringify({filename: `${lineGraph}.png`})}>
    <Image src={`${process.env.ENDPOINT}${lineGraph}.png`} alt="Line graph visualizing the history of TMS scores for a channel." />
    {await SurveyDisplay({surveys, userSlackId, displayedInModal: true, entityManager, app})}
    <ParticipationWarning/>
    
    </Modal>
}

const ParticipationWarning = () => <><Divider /><Section><Mrkdwn>Did you expect to see a survey, but it did not show up? It might not have hit the threshold of {threshold}% participation.</Mrkdwn></Section></>
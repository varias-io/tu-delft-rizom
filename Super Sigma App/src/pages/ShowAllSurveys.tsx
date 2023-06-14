import {Modal, JSXSlack, Image, Mrkdwn, Section, Divider} from 'jsx-slack'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'
import { Survey } from '../entities/Survey.js';
import { SurveyDisplay } from '../components/SurveyDisplay.js';
import { LineGraphProps, TMSScore, computeTMS, createGraph, defaultLineGraphsProps, entityManager } from '../utils/index.js';


export const showAllSurveys = async (client: AllMiddlewareArgs["client"], token: string, trigger_id: string, surveys: Survey[], userSlackId: string) => {
  if(surveys.length == 0) {
    await client.views.open({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(<Modal title="Survey History"><Section><Mrkdwn>There are no finished surveys to show in the history.</Mrkdwn></Section><Divider /><Section><Mrkdwn>Did you expect to see a survey, but it did not show up? It might not have hit the threshold of 80% participation.</Mrkdwn></Section></Modal>)
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
          data: tms[0].map((tms) => tms.specialization),
          borderColor: "#035efc",
          backgroundColor: "#035efc",
          borderWidth: 7
        }, {
          label: "Credibility",
          data: tms[0].map((tms) => tms.credibility),
          borderColor: "#de34eb",
          backgroundColor: "#de34eb",
          borderWidth: 7,
        }, {
          label: "Coordination",
          data: tms[0].map((tms) => tms.coordination),
          borderColor: "#e8eb34",
          backgroundColor: "#e8eb34",
          borderWidth: 7
        }, {
          label: "Overall TMS",
          data: tms[0].map((tms) => (tms.specialization+tms.credibility+tms.coordination)/3),
          borderColor: "#34eb34",
          backgroundColor: "#34eb34",
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
      view: JSXSlack(await AllSurveysBlock(surveys, token, userSlackId, await lineGraph))
    });
  } catch (error) {
    console.error(error);
  }
}

export const AllSurveysBlock = async(surveys: Survey[], token: string, userSlackId: string, lineGraph: string ) : Promise<JSX.Element> => {
  return <Modal title="Survey History" callbackId='line_graph_modal' notifyOnClose privateMetadata={JSON.stringify({filename: `${lineGraph}.png`})}>
    <Image src={`${process.env.ENDPOINT}${lineGraph}.png`} alt="Line graph visualizing the history of TMS scores for a channel." />
    {await SurveyDisplay({surveys, token, userSlackId, displayedInModal: true})}
    <Divider />
    <Section><Mrkdwn>Did you expect to see a survey, but it did not show up? It might not have hit the threshold of 80% participation.</Mrkdwn></Section>
    </Modal>
}
import {Modal, JSXSlack, Image} from 'jsx-slack'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'
import { Survey } from '../entity/Survey.js';
import { SurveyDisplay } from './SurveyDisplay.js';
import { LineGraphProps, createGraph, defaultLineGraphsProps } from '../utils/createGraph.js';
import { TMSScore, computeTMS } from '../utils/computeTMS.js';


export const showAllSurveys = async (client: AllMiddlewareArgs["client"], token: string, trigger_id: string, surveys: Survey[], userSlackId: string) => {
  try {
    const tmsScore: TMSScore[] = (await Promise.all(surveys.map(async (survey) => await computeTMS(survey)))).reverse();
    const dates: string[] = surveys.map((survey) => survey.createdAt.toLocaleDateString("nl-NL")).reverse(); 

    const tms: [TMSScore[], string[]] = [ tmsScore, dates];

    const lineGraphProps: LineGraphProps = {
      ...defaultLineGraphsProps,
      filename: "line" + new Date().getTime(),
      data: {
        labels: tms[1], 
        datasets: [{
          label: "Specialization",
          data: tms[0].map((tms) => tms.specialization),
          borderColor: "#035efc",
          backgroundColor: Array(tms[0].length-1).fill("#035efc"),
          borderWidth: 7
        }, {
          label: "Credibility",
          data: tms[0].map((tms) => tms.credibility),
          borderColor: "#de34eb",
          backgroundColor: Array(tms[0].length-1).fill("#de34eb"),
          borderWidth: 7,
        }, {
          label: "Coordination",
          data: tms[0].map((tms) => tms.coordination),
          borderColor: "#e8eb34",
          backgroundColor: Array(tms[0].length-1).fill("#e8eb34"),
          borderWidth: 7
        }, {
          label: "Overall TMS",
          data: tms[0].map((tms) => (tms.specialization+tms.credibility+tms.coordination)/3),
          borderColor: "#34eb34",
          backgroundColor: Array(tms[0].length-1).fill("#34eb34"),
          borderDash: [10, 5],
          borderWidth: 7
        }]
      }
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
  return <Modal title="Survey History">
    <Image src={`${process.env.ENDPOINT}${await lineGraph}.png`} alt="line graph" />
    {await SurveyDisplay({surveys, token, userSlackId, displayedInModal: true})}
    </Modal>
}
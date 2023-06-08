import {Modal, JSXSlack, Image} from 'jsx-slack'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'
import { createGraph, defaultRadarGraphProps, RadarGraphProps} from '../utils/createGraph.js';
import { TMSScore } from '../utils/computeTMS.js';

export interface GraphsModalProps {
  tms: [TMSScore[], string[]]
  displayedInModal: boolean
}

export const showGraphsModal = async (client: AllMiddlewareArgs["client"], token: string, trigger_id: string, {tms, displayedInModal}: GraphsModalProps) => {
  try {
      await client.views[displayedInModal? "push" : "open"]({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(await GraphsModalBlock(tms))
    })
  } catch (error) {
    console.error(error);
  }
}

export const GraphsModalBlock = async(tms: [TMSScore[], string[]]) : Promise<JSX.Element> => {
  const latestSurvey: TMSScore = tms[0][tms[0].length-1]
  const spec: number = latestSurvey.specialization
  const cred: number = latestSurvey.credibility
  const coor: number = latestSurvey.coordination

  const radarGraphProps: RadarGraphProps = {
    ...defaultRadarGraphProps,
    width: 1300, 
    height: 1300,
    filename: `bar${  new Date().getTime()}`, 
    data: {
      labels: [["Specialization", `${Number(spec.toFixed(2))}`], ["Credibility", `${Number(cred.toFixed(2))}`], ["Coordination", `${Number(coor.toFixed(2))}`]],
      datasets: [{
        data: [spec, cred, coor],
        backgroundColor: "rgba(3, 94, 252, 0.4)", 
        borderWidth: 5,
        borderColor: "rgba(3, 94, 252, 0.8)",
        pointBorderWidth: 10, 
        pointBackgroundColor: "rgba(3, 94, 252, 1)",
        pointBorderColor: "rgba(3, 94, 252, 1)"
      }]
    },
  }

  const radarGraph = createGraph(radarGraphProps)

  return <Modal title="TMS Score Breakdown" callbackId='radar_graph_modal' notifyOnClose privateMetadata={JSON.stringify({filename: `${await radarGraph}.png`})}>
    <Image src={`${process.env.ENDPOINT}${await radarGraph}.png`} alt="Radar chart showing the TMS score for a survey." />
    </Modal>
}
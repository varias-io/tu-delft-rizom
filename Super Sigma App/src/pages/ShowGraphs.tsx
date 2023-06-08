import {Modal, JSXSlack, Image} from 'jsx-slack'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'
import { createGraph, defaultBarGraphProps} from '../utils/createGraph.js';
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

  const barGraph = createGraph({
    ...defaultBarGraphProps,
    filename: `bar${new Date().getTime()}`, 
    data: {
      labels: ["Specialication", "Credibility", "Coordination"],
      datasets: [{
        data: [spec, cred, coor],
        backgroundColor: ["#035efc", "#de34eb", "#e8eb34"]
      }]
    },
  })

  return <Modal title="TMS Score Breakdown">
    <Image src={`${process.env.ENDPOINT}${await barGraph}.png`} alt="TMS Score Breakdown" />
    </Modal>
}
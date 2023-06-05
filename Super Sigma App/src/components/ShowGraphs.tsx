import {Modal, JSXSlack, Image} from 'jsx-slack'
import { JSX } from 'jsx-slack/jsx-runtime'
import { AllMiddlewareArgs } from '@slack/bolt'
import { createGraph, defaultBarGraphProps } from '../utils/createGraph.js';
import { TMSScore } from '../utils/computeTMS.js';


export const showGraphsModal = async (client: AllMiddlewareArgs["client"], token: string, trigger_id: string, tms: TMSScore) => {
  try {
    await client.views.open({
      token: token,
      trigger_id: trigger_id,
      view: JSXSlack(await GraphsModalBlock(tms))
    });
  } catch (error) {
    console.error(error);
  }
}

export const GraphsModalBlock = async(tms: TMSScore) : Promise<JSX.Element> => {
  const spec: number = tms.specialization
  const cred: number = tms.credibility
  const coor: number = tms.coordination

  const barGraph = createGraph({
    ...defaultBarGraphProps,
    filename: "bar" + new Date().getTime(), 
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
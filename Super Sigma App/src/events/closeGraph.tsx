import { app } from "../utils/index.js";
import { unlinkSync } from "fs";

export type ViewClosedCallback = (
    ack: () => Promise<void>,
    body: {view: {private_metadata: string}}
) => Promise<void>

export const closeGraph: ViewClosedCallback = async (ack, body) => {
    await ack();
    const filename = JSON.parse(body.view.private_metadata).filename
    try{
        unlinkSync(`./src/assets/${filename}`)
    } catch{
        console.error(`Error deleting file ${filename}`)
    }
}

app.view({callback_id:"radar_graph_modal", type:"view_closed"}, ({ack, body}) => closeGraph(ack, body))

app.view({callback_id:"line_graph_modal", type:"view_closed"}, ({ack, body}) => closeGraph(ack, body))

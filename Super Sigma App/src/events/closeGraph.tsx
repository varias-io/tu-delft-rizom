import { AllMiddlewareArgs, SlackViewAction, SlackViewMiddlewareArgs } from "@slack/bolt";
import { app } from "../utils/index.js";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";
import { unlinkSync } from "fs";

app.view({callback_id:"radar_graph_modal", type:"view_closed"}, async ({ ack, body }: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>) => {
    //handle closing
    await ack();
    const filename = JSON.parse(body.view.private_metadata).filename
    try{
        unlinkSync(`./src/assets/${filename}`)
    } catch{
        console.error
    }
})

app.view({callback_id:"line_graph_modal", type:"view_closed"}, async ({ ack, body }: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>) => {
    //handle closing
    await ack();
    const filename = JSON.parse(body.view.private_metadata).filename
    try{
        unlinkSync(`./src/assets/${filename}`)
    } catch{
        console.error
    }
})
import { app } from "../utils/appSetup.js"
import { showGraphsModal } from "../components/ShowGraphs.js";

app.action("show_graphs", async ({ ack, client, context, body, action}) => {
    await ack();
    if(action.type != "button"){
        console.error("action type is not button")
        return; 
    }
    if(body.type != "block_actions"){
        console.error("body type is not block_actions")
        return;
    }
    const graphModalProps = JSON.parse(action.value);
    const tms = graphModalProps.tms;
    const openFromModal = graphModalProps.openFromModal;
    await showGraphsModal(client, context.botToken ?? "", body.trigger_id ?? "", tms, openFromModal);
    //I trust that tms will always be a TMSScore, so I cast it to one.
})


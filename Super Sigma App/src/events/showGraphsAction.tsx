import { ViewsOpenClient, ViewsPushClient, app } from "../utils/index.js"
import { showGraphsModal } from "../pages/ShowGraphs.js";

app.action("show_graphs", async ({ ack, client, context, body, action}) => {
    if(action.type != "button"){
        console.error("action type is not button")
        return; 
    }
    if(body.type != "block_actions"){
        console.error("body type is not block_actions")
        return;
    }
    showGraphsAction({ ack, client, context, body, action})
});

interface ShowGraphsActionProps {
    ack: () => Promise<void>
    client: ViewsPushClient & ViewsOpenClient
    context: { botToken?: string }
    body: {trigger_id?: string}
    action: {value: string}
}

export const showGraphsAction = async ({ ack, client, context, body, action}: ShowGraphsActionProps) => {
    const { tms, displayedInModal } = JSON.parse(action.value);
    await showGraphsModal(client, context.botToken ?? "", body.trigger_id ?? "", {tms, displayedInModal});
    //I trust that tms will always be a TMSScore, so I cast it to one.
    await ack();
}


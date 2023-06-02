import { app } from "../utils/appSetup.js"
import { SurveyDisplay } from "../components/SurveyDisplay.js";
import { Survey } from "../entity/Survey.js";

app.action("show_all_surveys", async ({ ack, client, context, body, action}) => {
    await ack();
    if(action.type != "button"){
        console.error("action type is not button")
        return; 
    }
    if(body.type != "block_actions"){
        console.error("body type is not block_actions")
        return;
    }
    console.log(client)
    const surveys= action.value;
    //await SurveyDisplay(JSON.parse(surveys) as Survey[], context.botToken ?? "", );
    //I trust that tms will always be a TMSScore, so I cast it to one.
})


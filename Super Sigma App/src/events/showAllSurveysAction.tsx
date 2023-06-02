import { app } from "../utils/appSetup.js"
import { Survey } from "../entity/Survey.js";
import { entityManager } from "../utils/database.js";
import { showAllSurveys } from "../components/ShowAllSurveys.js";

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
    const surveysIds = JSON.parse(action.value) as Survey["id"][];

    const surveys = await entityManager.createQueryBuilder(Survey, "survey")
        .leftJoinAndSelect("survey.channel", "channel")
        .leftJoinAndSelect("survey.participants", "user")
        .where("survey.id IN (:...ids)", {ids: surveysIds})
        .getMany();

    await showAllSurveys(client, context.botToken ?? "", body.trigger_id ?? "", surveys, body.user.id);
    //I trust that tms will always be a TMSScore, so I cast it to one.
})


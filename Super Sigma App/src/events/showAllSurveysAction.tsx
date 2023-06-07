import { app } from "../utils/appSetup.js"
import { Survey } from "../entities/Survey.js";
import { entityManager } from "../utils/database.js";
import { showAllSurveys } from "../pages/ShowAllSurveys.js";

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

    const surveys = await getSurveys(surveysIds);

    await showAllSurveys(client, context.botToken ?? "", body.trigger_id ?? "", surveys, body.user.id);
})

const getSurveys = async (surveysIds: string[]): Promise<Survey[]> => {
   return await entityManager.createQueryBuilder(Survey, "survey")
        .leftJoinAndSelect("survey.channel", "channel")
        .leftJoinAndSelect("survey.participants", "user")
        .where("survey.id IN (:...ids)", {ids: surveysIds})
        .andWhere("survey.participation >= :threshold", {threshold: 80})
        .orderBy("survey.createdAt", "DESC")
        .getMany();
}



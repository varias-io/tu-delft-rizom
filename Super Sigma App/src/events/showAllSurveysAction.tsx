import { Survey } from "../entities/Survey.js";
import { showAllSurveys } from "../pages/ShowAllSurveys.js";
import { ActionCallback, app, entityManager } from "../utils/index.js";
import { EntityManager } from "typeorm";

app.action("show_all_surveys", async (params) => {
    showAllSurveysAction(params, entityManager, app)
})


export const showAllSurveysAction: ActionCallback = async ({ ack, client, context, body, action}, entityManager, app) => {
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

    if (surveysIds.length == 0) {
        await showAllSurveys(client, context.botToken ?? "", body.trigger_id ?? "", [], body.user.id, entityManager, app);
        return;
    }

    const surveys = await getSurveys(surveysIds, entityManager);

    await showAllSurveys(client, context.botToken ?? "", body.trigger_id ?? "", surveys, body.user.id, entityManager, app);
}

export const threshold = 80;

const getSurveys = async (surveysIds: string[], entityManager: EntityManager): Promise<Survey[]> => {
   return await entityManager.createQueryBuilder(Survey, "survey")
        .leftJoinAndSelect("survey.channel", "channel")
        .leftJoinAndSelect("survey.participants", "user")
        .where("survey.id IN (:...ids)", {ids: surveysIds})
        .andWhere("survey.participation >= :threshold", {threshold})
        .orderBy("survey.createdAt", "DESC")
        .getMany();
}





import { Survey } from "../entity/Survey.js";
import { entityManager } from "./index.js";

export const findSurvey = async (surveyId: any): Promise<Survey> => (
  entityManager.findOneByOrFail(Survey, { id: surveyId })
)
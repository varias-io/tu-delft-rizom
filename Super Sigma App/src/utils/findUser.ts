import { User } from "../entity/User.js";
import { entityManager } from "./index.js";

export const findUser = async (slackId: any): Promise<User> => (
  entityManager.findOneByOrFail(User, { slackId })
)
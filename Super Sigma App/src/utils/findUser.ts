import { User } from "../entity/User.js";
import { entityManager } from "./index.js";

export const findUserBySlackId = async (slackId: any): Promise<User> => (
  entityManager.findOneByOrFail(User, { slackId })
)

export const findUserByEntityId = async (id: any): Promise<User> => (
  entityManager.findOneByOrFail(User, { id })
)
import { User } from "../entity/User.js";
import { entityManager } from "./index.js";

export const findUserBySlackId = async (slackId: string): Promise<User> => (
  entityManager.findOneByOrFail(User, { slackId })
)

export const findUserByEntityId = async (id: string): Promise<User> => (
  entityManager.findOneByOrFail(User, { id })
)
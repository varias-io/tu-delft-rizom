import { User } from "../entities/User.js";
import { entityManager } from "./index.js";

export const findUserBySlackId = async (slackId: string): Promise<User> => (
  entityManager.findOneBy(User, { slackId }).then((foundUser) => {
    if (foundUser == null) {
      return entityManager.create(User, { slackId }).save()
    }
    return foundUser
  })
)

export const findUserByEntityId = async (id: string): Promise<User | null> => (
  entityManager.findOneBy(User, { id })
)
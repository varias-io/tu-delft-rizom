import { EntityManager } from "typeorm";
import { User } from "../entities/User.js";
import { Installation } from "../entities/Installation.js";
import { UsersApp } from "./types.js";

export const findUserBySlackId = async (slackId: string, teamId: string, entityManager: EntityManager, app: UsersApp): Promise<User> => (
  entityManager.findOneBy(User, { slackId }).then(async (foundUser) => {
    if (foundUser == null) {
      const workspace = await entityManager.findOneBy(Installation, { teamId })
      const stranger = await app.client.users.info({
        token: workspace?.botToken ?? "",
        user: slackId,
      })
        .catch((_error) => {
          console.error("Couldn't get the users info")
          return { user: { is_stranger: false } }
        })
        .then(res => {
          return res.user?.is_stranger ?? false
        })

      if (!workspace) {
        throw new Error("Workspace not found")
      }

      if (!stranger) {
        console.log("Creating user")
        return await entityManager.create(User, {
          slackId,
          primaryWorkspace: workspace,
        }).save()
      }
      return await entityManager.create(User, { slackId, connectWorkspaces: [workspace] }).save()
    }
    return foundUser
  })
)

export const findUserByEntityId = async (id: string, entityManager: EntityManager): Promise<User | null> => (
  entityManager.findOneBy(User, { id })
)
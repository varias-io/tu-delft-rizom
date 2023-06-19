import { Installation } from "../entities/Installation.js";
import { User } from "../entities/User.js";
import { app, entityManager } from "./index.js";

export const findUserBySlackId = async (slackId: string, teamId: string): Promise<User> => (
  entityManager.findOneBy(User, { slackId }).then(async (foundUser) => {
    if (foundUser == null) {
      const workspace = await entityManager.findOneBy(Installation, { teamId })
      const stranger = await app.client.users.info({
        token: workspace?.botToken ?? "",
        user: slackId,
      }).then(res => {

        return res.user?.is_stranger ?? false
      })

      if(!workspace) {
        throw new Error("Workspace not found")
      }

      if(!stranger) {
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

export const findUserByEntityId = async (id: string): Promise<User | null> => (
  entityManager.findOneBy(User, { id })
)
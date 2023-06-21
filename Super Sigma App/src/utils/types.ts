import { app } from "../utils/index.js"
import { EntityManager } from "typeorm"
import { ViewsPublishArguments, UsersConversationsArguments, UsersConversationsResponse,
   ConversationsListArguments, ConversationsListResponse, ConversationsInfoArguments,
    ConversationsInfoResponse, ConversationsMembersArguments, ConversationsMembersResponse,
     ViewsPushArguments, ViewsOpenArguments, TeamInfoArguments, TeamInfoResponse,
    UsersInfoArguments, UsersInfoResponse, ViewsPublishResponse, UsersListArguments, UsersListResponse} from "@slack/web-api"

type DefaultActionCallback = Parameters<typeof app.action>[1]
type DefaultActionCallbackParams = Parameters<DefaultActionCallback>[0]

type DefaultViewCallback = Parameters<typeof app.view>[1]
type DefaultViewCallbackParams = Parameters<DefaultViewCallback>[0]

export type ActionCallback = (actionParams: DefaultActionCallbackParams, entityManager: EntityManager, app: ConversationsApp & UsersApp & ViewsPublishApp & TeamInfoApp ) => ReturnType<DefaultActionCallback>
export type ActionCallbackNoEntityManager = (actionParams: DefaultActionCallbackParams) => ReturnType<DefaultActionCallback>

export type ViewCallback = (viewParams: DefaultViewCallbackParams, entityManager: EntityManager, app: ConversationsApp & ViewsPublishApp & UsersApp & TeamInfoApp) => ReturnType<DefaultViewCallback>

export interface UsersApp {
  client: {
      users: {
          conversations: (params: UsersConversationsArguments) => Promise<UsersConversationsResponse>
          info: (params: UsersInfoArguments) => Promise<UsersInfoResponse>
          list: (params: UsersListArguments) => Promise<UsersListResponse>
      }
  }
}

export interface ViewsPublishApp {
  client: {
    views: {
      publish: (params: ViewsPublishArguments) => Promise<ViewsPublishResponse>
    }
  }
}

export interface ConversationsApp {
  client: {
    conversations: {
      list: (params: ConversationsListArguments) => Promise<ConversationsListResponse>,
      info: (params: ConversationsInfoArguments) => Promise<ConversationsInfoResponse>,
      members: (params: ConversationsMembersArguments) => Promise<ConversationsMembersResponse>
    }
  }
}

export interface ViewsPushClient {
  views: {
    push: (params: ViewsPushArguments) => void
  }
}

export interface ViewsOpenClient {
  views: {
    open: (params: ViewsOpenArguments) => void
  }
}

export interface TeamInfoApp {
  client: {
    team: {
      info: (params: TeamInfoArguments) => Promise<TeamInfoResponse>
    }
  }
}

export interface UsersInfoApp {
  client: {
    users: {
      info: (params: UsersInfoArguments) => Promise<UsersInfoResponse>
    }
  }
}
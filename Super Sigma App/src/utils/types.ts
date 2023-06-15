import { app } from "../utils/index.js"
import { EntityManager } from "typeorm"
import { ViewsPublishArguments, ViewsPublishResponse, UsersConversationsArguments, UsersConversationsResponse, ConversationsListArguments, ConversationsListResponse, ConversationsInfoArguments, ConversationsInfoResponse, ConversationsMembersArguments, ConversationsMembersResponse, ViewsPushArguments, ViewsOpenArguments} from "@slack/web-api"

type DefaultActionCallback = Parameters<typeof app.action>[1]
type DefaultActionCallbackParams = Parameters<DefaultActionCallback>[0]

type DefaultViewCallback = Parameters<typeof app.view>[1]
type DefaultViewCallbackParams = Parameters<DefaultViewCallback>[0]

export type ActionCallback = (actionParams: DefaultActionCallbackParams, entityManager: EntityManager) => ReturnType<DefaultActionCallback>
export type ActionCallbackNoEntityManager = (actionParams: DefaultActionCallbackParams) => ReturnType<DefaultActionCallback>

export type ViewCallback = (viewParams: DefaultViewCallbackParams, entityManager: EntityManager) => ReturnType<DefaultViewCallback>

export interface UsersConversationsApp {
  client: {
      users: {
          conversations: (params: UsersConversationsArguments) => Promise<UsersConversationsResponse>
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
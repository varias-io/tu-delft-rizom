import { test, beforeEach } from "node:test"
import assert from "assert"
import { ViewsPublishArguments } from "@slack/web-api"
import { ConversationsApp, TeamInfoApp, UsersApp, ViewsPublishApp, latestSurveys } from "../utils/index.js";
import { Channel } from "../entities/Channel.js";
import { FakeEntityManager } from "./mock.js";
import { Installation } from "../entities/Installation.js";
import { Survey } from "../entities/Survey.js";
import { User } from "../entities/User.js";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyDisplay } from "../components/SurveyDisplay.js";

let views_publish_called = false;
let conversations_list_called = false;
let conversations_info_called = false;
let conversations_members_called = false;
let team_info_called = false;
let users_info_called = false;

const userSlackId = "U01"
const token = "xoxb-1234"
const teamId = "T01"
const context = {
  botToken: token,
  teamId,
}

const user1 = new User()

const workspace = new Installation()
workspace.id = teamId
workspace.botToken = token
workspace.save = (async () => {return workspace}) as any
workspace.reload = (async () => {return workspace}) as any

const channel1 = new Channel()
channel1.slackId = "C01"
channel1.id = "channel1"
channel1.users = [user1]
channel1.primaryWorkspace = workspace

workspace.channels = [channel1]

const channel1slack = {
  is_archived: false,
  conversation_host_id: teamId,
  slack_id: channel1.slackId,
  name: channel1.id,
}


const survey1 = new Survey()
survey1.createdAt = new Date(2021, 1, 1)
survey1.channel = channel1


const app: ViewsPublishApp & ConversationsApp & TeamInfoApp & UsersApp = {
  client: {
    views: {
      publish: async ({ user_id, token, view }: ViewsPublishArguments) => {
        views_publish_called = true;
        assert.equal(user_id, userSlackId)
        assert.equal(token, context.botToken)
        assert.equal(view.type, "home")
        return Promise.resolve({
          ok: true
        })
      }
    },
    conversations: {
      list: async () => {
        conversations_list_called = true;
        return Promise.resolve({
          ok: true,
          channels: [channel1slack]
        })
      },
      info: async () => {
        conversations_info_called = true;
        return Promise.resolve({
          ok: true,
          channel: channel1slack
        })
      },
      members: async () => {
        conversations_members_called = true;
        return Promise.resolve({
          ok: true,
          members: [userSlackId]
        })
      }
    },
    team: {
      info: async () => {
        team_info_called = true;
        return Promise.resolve({
          ok: true,
          team: {
            id: context.teamId
          }
        })
      }
    },
    users: {
      info: async ({user}) => {
        users_info_called = true;
        assert.equal(user, userSlackId)
        return Promise.resolve({
          ok: true,
          user: {
            id: userSlackId,
            is_stranger: false,
          }
        })
      },
      list: async () => ({
        ok: true,
        members: []
      }),
      conversations: async () => ({
        ok: true,
        channels: []
      })
    }
  }
}

beforeEach(() => {
  views_publish_called = false;
  conversations_list_called = false;
  conversations_info_called = false;
  conversations_members_called = false;
  team_info_called = false;
  users_info_called = false;
})

test("CreateSurvey", async () => {
  function* responseGenerator() {
    // CreateSurvey
    yield workspace
    yield channel1

    yield [channel1]
  }

  const entityManager = new FakeEntityManager(responseGenerator())

  assert.ok(!conversations_list_called)
  assert.ok(!conversations_info_called)
  assert.ok(!conversations_members_called)
  assert.ok(!team_info_called)
  assert.ok(!users_info_called)
  await CreateSurvey({app, context, entityManager, shouldReload: false, userSlackId, teamId})
  assert.ok(!views_publish_called)
  assert.ok(conversations_list_called)
  assert.ok(conversations_info_called)

})

test("SurveyDisplay", async () => {
  function* responseGenerator() {
    // latestSurveys
    yield [channel1]
    yield [survey1]
    //SurveyDisplay
      //survey1
        // computeTMS
          // computeTMSPerUser
            // getCompletedSurveys
            yield [
              {
                score: {
                  specialization: 3,
                  credibility: 3.5,
                  coordination: 4
                }
              },
              {
                score: {
                  specialization: 4,
                  credibility: 4.5,
                  coordination: 5
                }
              }
            ]
            // for each user, findUserByEntityId 
            yield new User()
            yield new User()

        // getSmallestMissingQuestionIndex
          // querySmallestMissingQuestionIndex
          yield 0 as any
        // surveyToTitle
          // getChannel
          yield channel1
        // usersWhoCompletedSurvey
        yield [user1]
        // participantsOf
        yield [user1]
        //groupSurvey
        yield [survey1]
  }
  
  const entityManager = new FakeEntityManager(responseGenerator())

  assert.ok(!views_publish_called)
  assert.ok(!conversations_list_called)
  assert.ok(!conversations_info_called)
  assert.ok(!conversations_members_called)
  assert.ok(!team_info_called)
  assert.ok(!users_info_called)
  await SurveyDisplay({app, entityManager, surveys: await latestSurveys(userSlackId, entityManager), userSlackId, displayedInModal: false})
  assert.ok(!views_publish_called)
  assert.ok(!conversations_list_called)
  assert.ok(conversations_info_called)
})
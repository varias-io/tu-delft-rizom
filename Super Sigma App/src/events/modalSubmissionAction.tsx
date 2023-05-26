import { JSXSlack } from "jsx-slack";
import { SurveyModalBlock } from "../components/SurveyModalBlock.js";
import { surveyTemplate } from "../constants.js";
import { app, entityManager, findSurvey, findUserBySlackId } from "../utils/index.js";
import { SurveyAnswer } from "../entity/SurveyAnswer.js";
import { updateHome } from "./homeOpenedAction.js";
import { SlackViewMiddlewareArgs, SlackViewAction, AllMiddlewareArgs } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers.js";

interface PrivateMetadataQuestion {
  surveyId: string
  questionIndex: number
}


app.view("survey_modal", async ({ ack, view, context, body }: SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>) => {
  switch(body.type){
    case "view_submission":{
      handleSubmission({ ack, view, context, body })
      break;
    }
    case "view_closed":{
      if(body.is_cleared){ 
        //user clicked the x button
        handleClose({ ack, view, context, body })
      } else{ 
        //user clicked the "" button
        handlePrev({ ack, view, context, body })
      }
      break;
    }
  }
  
});

const handleSubmission = async ({ ack, view, context, body }: Pick<SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>, "ack" |"view" | "context" | "body">) => {
  const questionInfo = JSON.parse(view.private_metadata) as PrivateMetadataQuestion
  const selectedOptionValue = Object.entries(view.state.values.radio_buttons)[0][1].selected_option?.value

  if(!selectedOptionValue){
    //no answer
    await ack({
      response_action: "errors",
      errors: {
        radio_buttons: "Please choose an option to continue!"
      }
    });
    return;
  }
  
  await entityManager.create(SurveyAnswer, {
    survey: await findSurvey(questionInfo.surveyId), 
    user: await findUserBySlackId(body.user.id),
    questionNumber: questionInfo.questionIndex,
    value: parseInt(selectedOptionValue)
  }).save()


  if(questionInfo.questionIndex < surveyTemplate.length - 1){
    //show next question
    await ack({
      response_action: "update", 
      view: JSXSlack(await SurveyModalBlock({
        questionIndex: questionInfo.questionIndex+1, 
        survey: await findSurvey(questionInfo.surveyId),
        token: context.botToken ?? "",
        userSlackId: body.user.id
      }))});
  } else {
    //this was last question
    updateHome(body.user.id, context)
    await ack()
  }
}

const handleClose = async ({ ack, view, context, body }: Pick<SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>, "ack" |"view" | "context" | "body">) => {
  const questionInfo = JSON.parse(view.private_metadata) as PrivateMetadataQuestion
  const selectedOptionValue = Object.entries(view.state.values.radio_buttons)[0][1].selected_option?.value

  await ack();

  if(selectedOptionValue){
    await entityManager.create(SurveyAnswer, {
      survey: await findSurvey(questionInfo.surveyId), 
      user: await findUserBySlackId(body.user.id),
      questionNumber: questionInfo.questionIndex,
      value: parseInt(selectedOptionValue)
    }).save()
  }

  updateHome(body.user.id, context)
}

const handlePrev = async ({ ack, view, context, body }: Pick<SlackViewMiddlewareArgs<SlackViewAction> & AllMiddlewareArgs<StringIndexed>, "ack" |"view" | "context" | "body">) => {
  const questionInfo = JSON.parse(view.private_metadata) as PrivateMetadataQuestion
  const selectedOptionValue = Object.entries(view.state.values.radio_buttons)[0][1].selected_option?.value
  
  if(selectedOptionValue){
    await entityManager.create(SurveyAnswer, {
      survey: await findSurvey(questionInfo.surveyId), 
      user: await findUserBySlackId(body.user.id),
      questionNumber: questionInfo.questionIndex,
      value: parseInt(selectedOptionValue)
    }).save()
  }


  if(questionInfo.questionIndex > 0){
    //show previous question
    await ack({
      response_action: "update", 
      view: JSXSlack(await SurveyModalBlock({
        questionIndex: questionInfo.questionIndex-1, 
        survey: await findSurvey(questionInfo.surveyId),
        token: context.botToken ?? "",
        userSlackId: body.user.id
      }))});
  } else {
    //this was first question
    updateHome(body.user.id, context)
  }
}
import { ScheduledTask, schedule } from "node-cron";
import { getSmallestMissingQuestionIndex, sendChannelMessageEphemeral, entityManager } from "./index.js";
import { Survey } from "../entities/Survey.js";

export const crons: Map<string, ScheduledTask> = new Map()

interface dailyReminderCronProps {
    users: string[],
    channel: string,
    token: string,
    message: string
    survey: Survey
}

//Returns a scheduled task that sends a message to a channel to each user that has not filled out the survey for that channel yet.
//The task stops only when a new survey gets created in the channel.
//Once the task is started it sends the message at 10:00 AM every day.
export const dailyReminderCron = ({ users, channel, token, message, survey }: dailyReminderCronProps) => {
    return schedule('0 10 * * *', () => {
        users.forEach(async user => {
            if (await getSmallestMissingQuestionIndex(user, survey.id, entityManager) < 15) {
                sendChannelMessageEphemeral({ channel, token, text: message, user })
            }
        })
    })
}
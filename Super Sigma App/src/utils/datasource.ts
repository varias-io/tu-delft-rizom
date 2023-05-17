import { AppDataSource } from "../data-source.js";
import pkg from "@slack/bolt";
const { App } = pkg;

const dataSource = await AppDataSource.initialize()

export const entityManager = dataSource.createEntityManager()

export const app = new App({
    token: process.env.SLACK_BOT_TOKEN ?? "",
    signingSecret: process.env.SLACK_SIGNING_SECRET ?? ""
});
import { setSeederFactory } from "typeorm-extension";
import { Survey } from "../entities/Survey.js";
import { Channel } from "../entities/Channel.js";
import { User } from "../entities/User.js";
import { entityManager, shuffleArray } from "../utils/index.js";

export const SurveyFactory = setSeederFactory(Survey, async () => {
  const channels = shuffleArray((await entityManager.find(Channel)));
  const users = shuffleArray(await entityManager.find(User));

  const survey = new Survey()

  survey.channel = channels[Math.floor(Math.random() * channels.length)];

  survey.participants = users.slice(0, Math.floor(Math.random() * users.length) + 1);

  survey.manager = survey.participants[Math.floor(Math.random() * survey.participants.length)];

  return survey
})

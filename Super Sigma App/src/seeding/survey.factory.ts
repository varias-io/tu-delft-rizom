import { setSeederFactory } from "typeorm-extension";
import { Survey } from "../entity/Survey.js";
import { Channel } from "../entity/Channel.js";
import { User } from "../entity/User.js";
import { entityManager, shuffleArray } from "../utils/index.js";

export const SurveyFactory = setSeederFactory(Survey, async () => {
  const channels = shuffleArray((await entityManager.find(Channel)));
  const users = shuffleArray(await entityManager.find(User));

  const survey = new Survey()

  const channelNumber = Math.random() < 0.5? Math.floor(Math.random() * channels.length) + 1: 1;

  survey.channels = channels.slice(0, channelNumber);

  survey.participants = users.slice(0, Math.floor(Math.random() * users.length) + 1);

  return survey
})

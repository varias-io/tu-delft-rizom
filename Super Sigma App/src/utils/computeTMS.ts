import { Survey } from "../entity/Survey.js"

export const computeTMS = (survey: Survey): number => {
  console.log(`computing tms for ${survey}`)
  return 100 //TODO actually calculate TMS score
} 
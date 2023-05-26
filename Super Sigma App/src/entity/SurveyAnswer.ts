import { Column, Entity, ManyToOne, Relation, Unique } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";
import { Survey } from "./Survey.js";
import { User } from "./User.js";

@Entity("answers")
@Unique(["survey", "user", "questionNumber"])
export class SurveyAnswer extends TimestampedBaseEntity {

  @ManyToOne(() => Survey, survey => survey.answers)
  survey: Relation<Survey>;

  @ManyToOne(() => User, user => user.answers)
  user: Relation<User>;

  @Column()
  questionNumber: number;

  @Column()
  value: number;
}
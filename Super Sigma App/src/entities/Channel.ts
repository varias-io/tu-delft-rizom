import { Column, Entity, AfterLoad, AfterInsert, AfterUpdate, OneToMany } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";
import { Survey } from "./Survey.js";

@Entity()
export class Channel extends TimestampedBaseEntity { 
  
  @Column({nullable: false, unique: true})
  slackId: string;

  @OneToMany(() => Survey, survey => survey.channel)
  surveys: Survey[];

  // eslint-disable-next-line @typescript-eslint/require-await
  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  async nullChecks() {
    if (!this.surveys) {
      this.surveys = []
    }
  }
}
import { Column, Entity, JoinTable, ManyToMany, AfterLoad, AfterInsert, AfterUpdate } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";
import { Survey } from "./Survey.js";

@Entity()
export class Channel extends TimestampedBaseEntity { 
  
  @Column({nullable: false, unique: true})
  slackId: string;

  @ManyToMany(() => Survey, survey => survey.channels)
  @JoinTable({
    name: "channel_surveys", // name of the table that will be created
    joinColumns: [
        { 
            name: "channelId",
            referencedColumnName: "id",
        },
    ],
    inverseJoinColumns: [
        {
            name: "surveyId",
            referencedColumnName: "id",
        },
    ],
  })
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
import { Column, Entity, AfterLoad, AfterInsert, AfterUpdate, OneToMany, ManyToMany, Relation, JoinTable } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";
import { Survey } from "./Survey.js";
import { Installation } from "./Installation.js";
import { User } from "./User.js";

@Entity()
export class Channel extends TimestampedBaseEntity { 
  
  @Column({nullable: false})
  slackId: string;

  @OneToMany(() => Survey, survey => survey.channel, { onDelete: "SET NULL" })
  surveys: Survey[];

  @ManyToMany(() => Installation, installation => installation.channels, { nullable: false })
  workspaces!: Relation<Installation>[];

  @ManyToMany(() => User, user => user.channels)
  @JoinTable({name: "channel_users"})
  users: Relation<User>[];

  // eslint-disable-next-line @typescript-eslint/require-await
  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  async nullChecks() {
    if (!this.surveys) {
      this.surveys = []
    }
    if (!this.users) {
      this.users = []
    }
    if (!this.workspaces) {
      this.workspaces = []
    }
  }
}
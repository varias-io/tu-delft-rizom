import { Column, Entity, AfterLoad, AfterInsert, AfterUpdate, OneToMany, ManyToMany, Relation, JoinTable, ManyToOne, Unique, Index } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";
import { Survey } from "./Survey.js";
import { Installation } from "./Installation.js";
import { User } from "./User.js";

@Entity()
@Unique(["slackId", "primaryWorkspace"])
export class Channel extends TimestampedBaseEntity { 
  
  @Column({nullable: false})
  @Index()
  slackId: string;

  @OneToMany(() => Survey, survey => survey.channel, { onDelete: "SET NULL" })
  surveys: Survey[];

  @ManyToOne(() => Installation, installation => installation.channels, { onDelete: "NO ACTION" })
  primaryWorkspace: Relation<Installation>;

  @ManyToMany(() => Installation)
  @JoinTable({name: "channel_connect_workspaces"})
  connectWorkspaces: Relation<Installation>[]

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
    if (!this.connectWorkspaces) {
      this.connectWorkspaces = []
    }
  }
}
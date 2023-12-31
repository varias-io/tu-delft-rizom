import { AfterInsert, AfterLoad, AfterUpdate, Column, Entity, OneToMany } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";
import { User } from "./User.js";
import { Channel } from "./Channel.js";

@Entity()
export class Installation extends TimestampedBaseEntity {
  @Column({nullable: true, default: ""})
  enterpriseId: string;

  @Column({nullable: true, default: "", unique: true})
  teamId: string;

  @Column({nullable: true, default: ""})
  botToken: string;

  @Column({nullable: true, default: ""})
  botId: string;

  @Column({nullable: true, default: ""})
  botUserId: string;

  @OneToMany(() => User, user => user.primaryWorkspace)
  users: User[];

  @OneToMany(() => Channel, channel => channel.primaryWorkspace)
  channels: Channel[];


    // eslint-disable-next-line @typescript-eslint/require-await
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    async nullChecks() {
      if (!this.users) {
        this.users = []
      }
      if (!this.channels) {
        this.channels = []
      }
    }

}
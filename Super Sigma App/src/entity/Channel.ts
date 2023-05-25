import { Column, Entity, JoinTable, ManyToMany, AfterLoad, AfterInsert, AfterUpdate } from "typeorm";
import { User } from "./User.js";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";

@Entity()
export class Channel extends TimestampedBaseEntity { 
  
  @Column({nullable: false, unique: true})
  slackId: string;

  @ManyToMany(() => User, user => user.managedChannels)
  @JoinTable({
    name: "user_managed_channels", // name of the table that will be created
    joinColumns: [
        { 
            name: "channelId",
            referencedColumnName: "id",
        },
    ],
    inverseJoinColumns: [
        {
            name: "userId",
            referencedColumnName: "id",
        },
    ],
  })
  managers: User[];

  // eslint-disable-next-line @typescript-eslint/require-await
  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  async nullChecks() {
    if (!this.managers) {
      this.managers = []
    }
  }
}
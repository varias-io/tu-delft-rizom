import { Column, Entity, ManyToMany } from "typeorm";
import { User } from "./User.js";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";

@Entity()
export class Channel extends TimestampedBaseEntity { 
  
  @Column({nullable: false, })
  slackId: string;

  @ManyToMany(() => User, user => user.managedChannels)
  managers: User[];


}
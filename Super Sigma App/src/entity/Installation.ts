import { Column, Entity } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";

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

}
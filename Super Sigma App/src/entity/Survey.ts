import { Column, Entity } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";

@Entity()
export class Survey extends TimestampedBaseEntity {
    @Column()
    channelName: string;

    @Column()
    completedAmount: number;

    @Column()
    participants: number;

    @Column()
    TMSScore: number;

    @Column()
    date: Date; 
}

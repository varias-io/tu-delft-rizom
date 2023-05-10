import { Entity, Column, ManyToMany, JoinTable } from "typeorm"
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js"
import { Channel } from "./Channel.js"

@Entity()
export class User extends TimestampedBaseEntity {

    @Column({nullable: false, })
    slackId: string

    @ManyToMany(() => Channel, channel => channel.managers)
    @JoinTable({
        name: "user_managed_channels", // name of the table that will be created
        joinColumns: [
            { 
                name: "userId",
                referencedColumnName: "id",
            },
        ],
        inverseJoinColumns: [
            {
                name: "channelId",
                referencedColumnName: "id",
            },
        ],
    })
    managedChannels: Channel[]

}
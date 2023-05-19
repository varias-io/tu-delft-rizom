import { Entity, Column, ManyToMany, AfterLoad, AfterInsert, AfterUpdate } from "typeorm"
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js"
import { Channel } from "./Channel.js"

@Entity()
export class User extends TimestampedBaseEntity {

    @Column({nullable: false, })
    slackId: string

    @ManyToMany(() => Channel, channel => channel.managers)
    managedChannels: Channel[]

    // eslint-disable-next-line @typescript-eslint/require-await
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    async nullChecks() {
        if (!this.managedChannels) {
        this.managedChannels = []
        }
    }

}
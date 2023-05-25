import { AfterInsert, AfterLoad, AfterUpdate, Entity, ManyToMany, OneToMany, Relation } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";
import { User } from "./User.js";
import { SurveyAnswer } from "./SurveyAnswer.js";
import { Channel } from "./Channel.js";

@Entity()
export class Survey extends TimestampedBaseEntity {
    @ManyToMany(() => Channel, channel => channel.surveys)
    channels: Channel[];

    @ManyToMany(() => User, user => user.eligibleSurveys)
    participants: User[];

    @OneToMany(() => SurveyAnswer, answer => answer.survey)
    answers: Relation<SurveyAnswer>[];

    // eslint-disable-next-line @typescript-eslint/require-await
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    async nullChecks() {
        if (!this.channels) {
        this.channels = []
        }
        if (!this.participants) {
        this.participants = []
        }
        if (!this.answers) {
        this.answers = []
        }
    }
}

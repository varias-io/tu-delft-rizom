import { AfterInsert, AfterLoad, AfterUpdate, Entity, ManyToMany, ManyToOne, OneToMany, Relation } from "typeorm";
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js";
import { User } from "./User.js";
import { SurveyAnswer } from "./SurveyAnswer.js";
import { Channel } from "./Channel.js";

@Entity()
export class Survey extends TimestampedBaseEntity {
    @ManyToOne(() => Channel, channel => channel.surveys, {nullable: false})
    channel: Relation<Channel>;
    
    @ManyToOne(() => User, user => user.managedSurveys)
    manager: Relation<User>;

    @ManyToMany(() => User, user => user.eligibleSurveys)
    participants: User[];

    @OneToMany(() => SurveyAnswer, answer => answer.survey)
    answers: Relation<SurveyAnswer>[];


    // eslint-disable-next-line @typescript-eslint/require-await
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    async nullChecks() {
        if (!this.participants) {
        this.participants = []
        }
        if (!this.answers) {
        this.answers = []
        }
    }
}

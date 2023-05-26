import { Entity, Column, ManyToMany, AfterLoad, AfterInsert, AfterUpdate, OneToMany, JoinTable } from "typeorm"
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js"
import { Channel } from "./Channel.js"
import { Survey } from "./Survey.js"
import { SurveyAnswer } from "./SurveyAnswer.js"

@Entity()
export class User extends TimestampedBaseEntity {

    @Column({nullable: false, unique: true})
    slackId: string

    @ManyToMany(() => Channel, channel => channel.managers)
    managedChannels: Channel[]

    @ManyToMany(() => Survey, survey => survey.participants)
    @JoinTable({
        name: "user_surveys", // name of the table that will be created
        joinColumns: [
            { 
                name: "userId",
                referencedColumnName: "id",
            },
        ],
        inverseJoinColumns: [
            {
                name: "surveyId",
                referencedColumnName: "id",
            },
        ],
      })
    eligibleSurveys: Survey[]

    @OneToMany(() => SurveyAnswer, answer => answer.user)
    answers: SurveyAnswer[];

    // eslint-disable-next-line @typescript-eslint/require-await
    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    async nullChecks() {
        if (!this.managedChannels) {
        this.managedChannels = []
        }
        if (!this.eligibleSurveys) {
        this.eligibleSurveys = []
        }
        if (!this.answers) {
        this.answers = []
        }
    }

}
import { Entity, Column, ManyToMany, AfterLoad, AfterInsert, AfterUpdate, OneToMany, JoinTable, Relation } from "typeorm"
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js"
import { Survey } from "./Survey.js"
import { SurveyAnswer } from "./SurveyAnswer.js"

@Entity()
export class User extends TimestampedBaseEntity {

    @Column({nullable: false, unique: true})
    slackId: string
    
    @OneToMany(() => Survey, survey => survey.manager)
    managedSurveys: Relation<Survey>[];

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
        if (!this.eligibleSurveys) {
        this.eligibleSurveys = []
        }
        if (!this.answers) {
        this.answers = []
        }
        if (!this.managedSurveys) {
        this.managedSurveys = []
        }
    }

}
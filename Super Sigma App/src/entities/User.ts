import { Entity, Column, ManyToMany, AfterLoad, AfterInsert, AfterUpdate, OneToMany, JoinTable, Relation, ManyToOne, Unique, Index } from "typeorm"
import { TimestampedBaseEntity } from "./TimeStampedBaseEntity.js"
import { Survey } from "./Survey.js"
import { SurveyAnswer } from "./SurveyAnswer.js"
import { Installation } from "./Installation.js"
import { Channel } from "./Channel.js"

@Entity()
@Unique(["slackId", "primaryWorkspace"])
export class User extends TimestampedBaseEntity {

    @Column({nullable: false})
    @Index()
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

    @ManyToOne(() => Installation, installation => installation.users)
    primaryWorkspace!: Relation<Installation>

    @ManyToMany(() => Installation)
    @JoinTable({name: "user_connect_workspaces"})
    connectWorkspaces: Relation<Installation>[]

    @ManyToMany(() => Channel, channel => channel.users)
    channels: Relation<Channel>[]

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
        if (!this.connectWorkspaces) {
        this.connectWorkspaces = []
        }
        if (!this.channels) {
        this.channels = []
        }
    }

}
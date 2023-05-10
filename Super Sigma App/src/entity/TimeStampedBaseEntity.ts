import { Exclude } from "class-transformer"
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

export class TimestampedBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @CreateDateColumn()
  @Column("timestamp", {
    name: "created_at",
    default: new Date(),
  })
  createdAt: Date

  @UpdateDateColumn()
  @Exclude()
  @Column("timestamp", {
    name: "updated_at",
    default: new Date(),
  })
  updatedAt: Date

  @BeforeInsert()
  setInitialValues() {
    if (!this.createdAt) {
      this.createdAt = new Date()
    }
    if (!this.updatedAt) {
      this.updatedAt = new Date()
    }
  }

  @BeforeUpdate()
  updateTimestamps() {
    this.updatedAt = new Date()
  }
}
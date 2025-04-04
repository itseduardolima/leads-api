import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class Contact {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  fullName: string

  @Column()
  email: string

  @Column()
  phone: string

  @Column()
  objective: string

  @Column({ nullable: true })
  source?: string

  @Column({ nullable: true })
  location?: string

  @Column({ nullable: true })
  feedback?: string

  @Column({ nullable: true })
  businessName?: string

  @Column()
  website: string

  @CreateDateColumn()
  createdAt: Date
}
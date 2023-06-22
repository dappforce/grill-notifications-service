import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class TelegramAccount {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  accountId: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  userName?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;
}

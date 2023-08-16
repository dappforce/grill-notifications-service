import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

export enum NotificationServiceName {
  telegram = 'telegram',
  fcm = 'fcm',
  discord = 'discord',
  email = 'email'
}

@Entity()
export class AccountsLink {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  substrateAccountId: string;

  @Column()
  active: boolean;

  @Column(() => Date)
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: NotificationServiceName,
    default: NotificationServiceName.telegram
  })
  notificationServiceName: NotificationServiceName;

  @Column()
  notificationServiceAccountId: string;

  @Column({ nullable: true })
  fcmTokens: string[];

  @Column()
  following: boolean;
}

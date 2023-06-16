import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

export enum SquidApiSubscriptionQueryName {
  activities = 'activities',
  notifications = 'notifications'
}

@Entity()
export class SquidDataSubscriptionStatus {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn({
    type: 'enum',
    enum: SquidApiSubscriptionQueryName,
    nullable: false
  })
  subscriptionQueryName: SquidApiSubscriptionQueryName;

  @Column()
  lastProcessedBlockNumber: number;
}

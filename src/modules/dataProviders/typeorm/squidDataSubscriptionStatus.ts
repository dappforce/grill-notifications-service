import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

export enum SquidApiQueryName {
  activities = 'activities',
  notifications = 'notifications'
}

@Entity()
export class SquidDataSubscriptionStatus {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn({
    type: 'enum',
    enum: SquidApiQueryName,
    nullable: false
  })
  subscriptionQueryName: SquidApiQueryName;

  @Column()
  lastProcessedBlockNumber: number;
}

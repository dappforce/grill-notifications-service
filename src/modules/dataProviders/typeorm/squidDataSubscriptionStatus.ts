import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

export enum SquidApiQueryName {
  activities = 'activities',
  notifications = 'notifications',
  inBatchNotifications = 'inBatchNotifications'
}

export enum AppEnvironment {
  development = 'development',
  staging = 'staging',
  production = 'production'
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

  @PrimaryColumn({
    type: 'enum',
    enum: AppEnvironment,
    nullable: false
  })
  appEnv: AppEnvironment;

  @Column()
  lastProcessedBlockNumber: number;
}

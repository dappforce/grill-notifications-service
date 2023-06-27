import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class TelegramTemporaryLinkingId {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  id: string;

  @Column()
  substrateAccountId: string;

  @Column()
  createdAt: Date;
}

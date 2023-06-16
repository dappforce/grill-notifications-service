import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class AccountsLink {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  tgAccountId: number;

  @Column()
  substrateAccountId: string;

  @Column()
  active: boolean;

  @Column(() => Date)
  createdAt: Date;
}

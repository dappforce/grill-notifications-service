import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class AccountsLink {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  tgAccountId: number;

  @Column()
  tgAccountPhoneNumber: string;

  @Column()
  tgAccountUserName: string;

  @Column()
  tgAccountFirstName: string;

  @Column()
  tgAccountLastName: string;

  @Column()
  substrateAccountId: string;

  @Column()
  active: boolean;

  @Column(() => Date)
  createdAt: Date;
}

import { Entity, PrimaryColumn, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class SignatureNonce {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  substrateAccountId: string;

  @Column()
  nonce: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}

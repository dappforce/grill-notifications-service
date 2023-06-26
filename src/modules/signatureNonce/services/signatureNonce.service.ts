import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { SignatureNonce } from '../typeorm/signatureNonce.entity';

@Injectable()
export class SignatureNonceService {
  constructor(
    @InjectRepository(SignatureNonce)
    private signatureNonceRepository: MongoRepository<SignatureNonce>
  ) {}

  async getNonceBySubstrateAccountId(accountId: string) {
    return this.signatureNonceRepository.findOne({
      where: { substrateAccountId: { $eq: accountId } }
    });
  }

  async getOrCreateNonceBySubstrateAccountId(
    accountId: string
  ): Promise<number> {
    let nonce = await this.getNonceBySubstrateAccountId(accountId);

    if (nonce) return nonce.nonce;

    nonce = new SignatureNonce();
    nonce.nonce = 1;
    nonce.substrateAccountId = accountId;
    nonce.createdAt = new Date();

    await this.signatureNonceRepository.save(nonce);

    return nonce.nonce;
  }

  async increaseNonceBySubstrateAccountId(accountId: string): Promise<number> {
    const nonceInstance = await this.getNonceBySubstrateAccountId(accountId);

    if (!nonceInstance)
      throw new Error(`Nonce is not available for account ${accountId}`);

    nonceInstance.nonce += 1;
    nonceInstance.updatedAt = new Date();
    await this.signatureNonceRepository.save(nonceInstance);
    return nonceInstance.nonce;
  }

  async isValidForSubstrateAccount(
    accountId: string,
    nonce: number
  ): Promise<boolean> {
    const nonceInstance = await this.getNonceBySubstrateAccountId(accountId);
    return !!(nonceInstance && nonce === nonceInstance.nonce);
  }
}

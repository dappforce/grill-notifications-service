import { Injectable } from '@nestjs/common';
import { signatureVerify } from '@polkadot/util-crypto';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex, u8aToHex } from '@polkadot/util';
import crypto from 'crypto';
import {
  adjectives,
  animals,
  uniqueNamesGenerator
} from 'unique-names-generator';

export type DataForSignatureValidation = {
  signature: string;
  address: string;
  message: string;
};

@Injectable()
export class CryptoUtils {
  constructor() {}

  isValidSignature(dataForValidation: DataForSignatureValidation) {
    const { message, signature, address } = dataForValidation;
    try {
      return signatureVerify(message, signature, address).isValid;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  substrateAddressToSubsocialFormat(address: string) {
    const publicKey = decodeAddress(address);
    return encodeAddress(publicKey, 28);
  }
  substrateAddressToHex(address: string | Uint8Array) {
    const publicKey = decodeAddress(address);
    return u8aToHex(publicKey);
  }

  isValidSubstrateAddress(address: string) {
    try {
      encodeAddress(
        isHex(address) ? hexToU8a(address) : decodeAddress(address)
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  generateRandomName(seed: string | undefined | null) {
    let hashedSeed = seed;
    if (seed) {
      const hashObj = crypto.createHash('sha512');
      hashedSeed = hashObj.update(seed).digest().toString('hex');
    }
    return uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: ' ',
      seed: hashedSeed ?? undefined,
      style: 'capital'
    });
  }

  generateRandomNameOrSource(seed: string | undefined | null): string {
    return this.generateRandomName(seed) || seed;
  }
}

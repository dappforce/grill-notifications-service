import { Injectable } from '@nestjs/common';
import { SubsocialApi } from '@subsocial/api';
import BigNumber from 'bignumber.js';
import { signatureVerify } from '@polkadot/util-crypto';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

export type DataForSignatureValidation = {
  signature: string;
  account: string;
  message: string;
};

@Injectable()
export class CryptoUtils {
  constructor() {}

  isValidSignature(dataForValidation: DataForSignatureValidation) {
    const { message, signature, account } = dataForValidation;
    try {
      return signatureVerify(message, signature, account).isValid;
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
}

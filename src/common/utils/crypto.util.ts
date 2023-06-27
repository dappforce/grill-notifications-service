import { Injectable } from '@nestjs/common';
import { signatureVerify } from '@polkadot/util-crypto';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex, u8aToHex } from '@polkadot/util';

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
}

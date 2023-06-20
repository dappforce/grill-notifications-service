import { describe, expect, test } from '@jest/globals';
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';
import { encodeAddress, Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { stringToU8a, u8aToHex } from '@polkadot/util';
import { sortObj } from 'jsonabc';

type TgAccountLinkingMessage = {
  payload: {
    message: string;
  };
  action: string;
  substrateAccount: string;
  signature: string;
};

export const isValidSignature = (signedMessage: TgAccountLinkingMessage) => {
  const { payload, signature, action, substrateAccount } = signedMessage;
  const sortedMessage = JSON.stringify(sortObj(payload));
  return signatureVerify(sortedMessage, signature, substrateAccount).isValid;
};

async function getKeyring() {
  if (!(await cryptoWaitReady())) {
    throw 'cryptoWaitReady() resolved to false';
  }

  const keyring = new Keyring({ type: 'sr25519' });
  return keyring;
}

async function createKeyringPairFromSecret(secretKey: string) {
  const secret = Buffer.from(secretKey, 'hex');
  const signer = (await getKeyring()).addFromSeed(secret, {}, 'sr25519');
  return signer;
}

describe('AppController (e2e)', () => {
  let keyPair: KeyringPair | null = null;

  beforeEach(async () => {
    keyPair = await createKeyringPairFromSecret(
      'c20b843b8e8083b38b1361b547dbf22af7845c5f82206ae5f5e190cbabd7b1ff'
    );
  });

  test('sign message by private key and verify signature', () => {
    if (!keyPair) return;

    const payload = sortObj({
      message: `Link to Substrate account ${u8aToHex(
        keyPair.publicKey
      )} (in hex)`.replace(/\s/g, '_')
    });

    const signedPayload = keyPair.sign(stringToU8a(JSON.stringify(payload)));

    const signatureHex = u8aToHex(signedPayload);

    const msgForUserSorted = {
      action: 'TELEGRAM_ACCOUNT_LINK',
      substrateAccount: encodeAddress(u8aToHex(keyPair.publicKey), 28),
      signature: signatureHex,
      payload
    };

    const msgForUserStr = JSON.stringify(msgForUserSorted);

    console.log('message for User - ');
    console.log('/enable ' + msgForUserStr);

    const msgFromUserParsed = JSON.parse(msgForUserStr);

    const isSignatureValid = isValidSignature(msgFromUserParsed);

    expect(isSignatureValid).toEqual(true);
  });
});

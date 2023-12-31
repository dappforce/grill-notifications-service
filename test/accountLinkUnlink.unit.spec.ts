import { describe, expect, test } from '@jest/globals';
import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';
import { encodeAddress, Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { stringToU8a, u8aToHex } from '@polkadot/util';
import { sortObj } from 'jsonabc';
import { SignedMessageAction } from '../src/modules/signedMessage/dto/signedMessage.dto';

type TgAccountLinkingMessage = {
  payload: {
    message: string;
    nonce: number;
  };
  action: string;
  address: string;
  signature: string;
};

export const isValidSignature = (signedMessage: TgAccountLinkingMessage) => {
  const { payload, signature, action, address } = signedMessage;
  const sortedMessage = JSON.stringify(sortObj(payload));
  return signatureVerify(sortedMessage, signature, address).isValid;
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

describe('Link unlink Accounts', () => {
  let keyPair: KeyringPair | null = null;

  beforeEach(async () => {
    keyPair = await createKeyringPairFromSecret(
      'c20b843b8e8083b38b1361b547dbf22af7845c5f82206ae5f5e190cbabd7b1ff'
    );
  });

  test('sign message by private key and verify signature', () => {
    if (!keyPair) return;

    // const payloadLink = sortObj({
    //   action: 'LINK_TELEGRAM_ACCOUNT',
    //   nonce: 3
    // });
    const payloadLink = sortObj({
      action: SignedMessageAction.ADD_FCM_TOKEN_TO_ADDRESS,
      nonce: 8,
      fcmToken: 'cVrEofehf-8yDitoRhsxX6:APA91bHZy0dy29fByuQLiZNboYCFdXWABoLuGaKiGjL5eYI0kfhf9osfPt9Tr04B5dGZzFytD5L10HA1WcjAWE73Svr50cs6nTipDZEva5No6siMmZokBFd3zwR2UCyS7SAssyeY9H7b'
    });

    const payloadUnlink = sortObj({
      action: 'UNLINK_TELEGRAM_ACCOUNT',
      nonce: 3
    });

    const signedPayloadLink = keyPair.sign(
      stringToU8a(JSON.stringify(payloadLink))
    );
    const signedPayloadUnLink = keyPair.sign(
      stringToU8a(JSON.stringify(payloadUnlink))
    );

    const signatureHexLink = u8aToHex(signedPayloadLink);
    const signatureHexUnLink = u8aToHex(signedPayloadUnLink);

    const msgForUserLink = {
      // action: 'LINK_TELEGRAM_ACCOUNT',
      action: SignedMessageAction.ADD_FCM_TOKEN_TO_ADDRESS,
      address: encodeAddress(u8aToHex(keyPair.publicKey), 28),
      signature: signatureHexLink,
      payload: payloadLink
    };

    const msgForUserUnLink = {
      action: 'UNLINK_TELEGRAM_ACCOUNT',
      address: encodeAddress(u8aToHex(keyPair.publicKey), 28),
      signature: signatureHexUnLink,
      payload: payloadUnlink
    };

    const msgForUserStrLink = JSON.stringify(msgForUserLink);
    const msgForUserStrUnlink = JSON.stringify(msgForUserUnLink);

    console.log('message for User LINK - ');
    console.log(msgForUserStrLink);
    console.log(encodeURIComponent(msgForUserStrLink));

    console.log('message for User UNLINK - ');
    console.log(msgForUserStrUnlink);
    console.log(encodeURIComponent(msgForUserStrUnlink));

    const msgFromUserParsed = JSON.parse(decodeURIComponent(msgForUserStrLink));

    console.dir(msgFromUserParsed, { depth: null });

    const isSignatureValid = isValidSignature(msgFromUserParsed);

    expect(isSignatureValid).toEqual(true);
  });
});

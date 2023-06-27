import { Injectable } from '@nestjs/common';
import { CryptoUtils } from '../../../common/utils/crypto.util';

@Injectable()
export class TgBotSceneHelpers {
  constructor(private cryptoUtils: CryptoUtils) {}

  getNameWithAddressOrAddress(address: string): string {
    const name = this.cryptoUtils.generateRandomName(address);
    return name ? `${name} (${address})` : `${address}`;
  }
}

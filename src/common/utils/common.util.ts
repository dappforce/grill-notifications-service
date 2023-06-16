import { Injectable } from '@nestjs/common';
import { SubsocialApi } from '@subsocial/api';
import BigNumber from 'bignumber.js';

@Injectable()
export class CommonUtils {
  constructor() {}

  decorateDonationAmount(amount: string, decimals: number): string {
    if (!amount && !decimals) return 'some';
    try {
      return new BigNumber(`${amount}e-${decimals}`).toString();
    } catch (e) {
      console.log(e);
      return 'some';
    }
  }
}

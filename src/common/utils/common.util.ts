import { Injectable } from '@nestjs/common';
import { SubsocialApi } from '@subsocial/api';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';

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
  isOlderThan(originDate: Date, diff: number) {
    const date1 = dayjs(originDate);
    const date2 = dayjs().subtract(diff, 'minutes');
    return date1.diff(date2, 'minutes') <= 0;
  }
}

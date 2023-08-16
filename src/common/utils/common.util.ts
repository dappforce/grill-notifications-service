import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { newLogger } from '@subsocial/utils';

@Injectable()
export class CommonUtils {
  private subLogger = newLogger('OpenAI Assistant');

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

  parseToNumberOrDefault(str: string, defaultVal: number) {
    let number = defaultVal;
    try {
      number = Number.parseInt(str);
      return !Number.isNaN(number) ? number : defaultVal;
    } catch (e) {
      return number;
    }
  }

  subsocialLogger() {
    return this.subLogger;
  }
}

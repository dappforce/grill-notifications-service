import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Context } from '../../interfaces/context.interface';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
  async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    console.log(exception); // TODO add logger
    const telegrafHost = TelegrafArgumentsHost.create(host);
    if (!telegrafHost) return;
    const ctx = telegrafHost.getContext<Context>();
    if (!ctx || !ctx.replyWithHTML) return;
    if (ctx.session.__scenes.state['processingMessageId']) {
      try {
        await ctx.deleteMessage(
          ctx.session.__scenes.state['processingMessageId']
        );
        delete ctx.session.__scenes.state['processingMessageId'];
      } catch (e) {}
    }
    await ctx.replyWithHTML(`<b> ⚠️ Error</b>: ${exception.message}`);
  }
}

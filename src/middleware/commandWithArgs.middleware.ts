import { MiddlewareFn } from 'telegraf';

export const commandWithArgsMiddleware: MiddlewareFn<any> = (
  ctx,
  next
): void | Promise<unknown> => {
  // if (ctx.updateType === 'message' && ctx.updateSubType === 'text') {
  // console.dir(ctx.update, {depth: null})
  if (ctx.updateType === 'message' && ctx.update.message.text) {
    // const text = ctx.update.message.text;
    const text = ctx.update.message.text;
    if (text.startsWith('/')) {
      const match = text.match(/^\/([^\s]+)\s?(.+)?/);
      let args = [];
      let command;
      if (match !== null) {
        if (match[1]) {
          command = match[1];
        }
        if (match[2]) {
          args = match[2].split(' ');
        }
      }

      ctx.state.command = {
        raw: text,
        command,
        args
      };
    }
  }
  return next();
};

import { MiddlewareFn } from 'telegraf';
import LocalSession from 'telegraf-session-local';

export const sessionMiddleware: MiddlewareFn<any> = new LocalSession({
  database: 'session_db.json'
}).middleware();

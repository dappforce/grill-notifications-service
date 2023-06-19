import z from 'zod';

export enum SignedMessageAction {
  TELEGRAM_ACCOUNT_LINK = 'TELEGRAM_ACCOUNT_LINK',
  TELEGRAM_ACCOUNT_UNLINK = 'TELEGRAM_ACCOUNT_UNLINK'
}

const zodSignedMessageActionEnum = z.nativeEnum(SignedMessageAction);

export const linkSubstrateTg = z.object({
  action: z.literal(zodSignedMessageActionEnum.enum.TELEGRAM_ACCOUNT_LINK),
  substrateAccount: z.string(),
  signature: z.string(),
  payload: z.object({
    message: z.string()
  })
});

export const unlinkSubstrateTg = z.object({
  action: z.literal(zodSignedMessageActionEnum.enum.TELEGRAM_ACCOUNT_UNLINK),
  substrateAccount: z.string(),
  signature: z.string(),
  payload: z.object({
    message: z.string()
  })
});

export const signedMessage = z.discriminatedUnion('action', [
  linkSubstrateTg,
  unlinkSubstrateTg
]);

export type SignedMessage = z.infer<typeof signedMessage>;

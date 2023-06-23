import z from 'zod';

export enum SignedMessageAction {
  LINK_TELEGRAM_ACCOUNT = 'LINK_TELEGRAM_ACCOUNT',
  UNLINK_TELEGRAM_ACCOUNT = 'UNLINK_TELEGRAM_ACCOUNT'
}

const zodSignedMessageActionEnum = z.nativeEnum(SignedMessageAction);

export const linkSubstrateTg = z.object({
  action: z.literal(zodSignedMessageActionEnum.enum.LINK_TELEGRAM_ACCOUNT),
  address: z.string(),
  signature: z.string(),
  payload: z.object({
    action: z.literal(zodSignedMessageActionEnum.enum.LINK_TELEGRAM_ACCOUNT)
  })
});

export const unlinkSubstrateTg = z.object({
  action: z.literal(zodSignedMessageActionEnum.enum.UNLINK_TELEGRAM_ACCOUNT),
  address: z.string(),
  signature: z.string(),
  payload: z.object({
    action: z.literal(zodSignedMessageActionEnum.enum.UNLINK_TELEGRAM_ACCOUNT)
  })
});

export const signedMessage = z.discriminatedUnion('action', [
  linkSubstrateTg,
  unlinkSubstrateTg
]);

export type SignedMessageWithDetails = z.infer<typeof signedMessage>;

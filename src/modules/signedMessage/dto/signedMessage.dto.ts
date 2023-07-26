import z from 'zod';

export enum SignedMessageAction {
  LINK_TELEGRAM_ACCOUNT = 'LINK_TELEGRAM_ACCOUNT',
  UNLINK_TELEGRAM_ACCOUNT = 'UNLINK_TELEGRAM_ACCOUNT',
  ADD_FCM_TOKEN_TO_ADDRESS = 'ADD_FCM_TOKEN_TO_ADDRESS',
  DELETE_FCM_TOKEN_FROM_ADDRESS = 'DELETE_FCM_TOKEN_FROM_ADDRESS'
}

const zodSignedMessageActionEnum = z.nativeEnum(SignedMessageAction);

export const linkSubstrateTg = z.object({
  action: z.literal(zodSignedMessageActionEnum.enum.LINK_TELEGRAM_ACCOUNT),
  address: z.string(),
  signature: z.string(),
  payload: z.object({
    nonce: z.number(),
    action: z.literal(zodSignedMessageActionEnum.enum.LINK_TELEGRAM_ACCOUNT)
  })
});

export const unlinkSubstrateTg = z.object({
  action: z.literal(zodSignedMessageActionEnum.enum.UNLINK_TELEGRAM_ACCOUNT),
  address: z.string(),
  signature: z.string(),
  payload: z.object({
    nonce: z.number(),
    action: z.literal(zodSignedMessageActionEnum.enum.UNLINK_TELEGRAM_ACCOUNT)
  })
});

export const addFcmTokenToAddress = z.object({
  action: z.literal(zodSignedMessageActionEnum.enum.ADD_FCM_TOKEN_TO_ADDRESS),
  address: z.string(),
  signature: z.string(),
  payload: z.object({
    nonce: z.number(),
    action: z.literal(zodSignedMessageActionEnum.enum.ADD_FCM_TOKEN_TO_ADDRESS),
    fcmToken: z.string()
  })
});

export const deleteFcmTokenFromAddress = z.object({
  action: z.literal(
    zodSignedMessageActionEnum.enum.DELETE_FCM_TOKEN_FROM_ADDRESS
  ),
  address: z.string(),
  signature: z.string(),
  payload: z.object({
    nonce: z.number(),
    action: z.literal(
      zodSignedMessageActionEnum.enum.DELETE_FCM_TOKEN_FROM_ADDRESS
    ),
    fcmToken: z.string()
  })
});

export const signedMessage = z.discriminatedUnion('action', [
  linkSubstrateTg,
  unlinkSubstrateTg,
  addFcmTokenToAddress,
  deleteFcmTokenFromAddress
]);

export type SignedMessageWithDetails = z.infer<typeof signedMessage>;
export type AddFcmTokenToAddressSignedMessage = z.infer<
  typeof addFcmTokenToAddress
>;
export type DeleteFcmTokenFromAddressSignedMessage = z.infer<
  typeof deleteFcmTokenFromAddress
>;

import { ApolloError } from 'apollo-server';
import { GraphQLException } from '@nestjs/graphql/dist/exceptions';

export const GqlErrorCodes = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SIGNED_MESSAGE_INVALID_ACTION: 'SIGNED_MESSAGE_INVALID_ACTION',
  SIGNED_MESSAGE_INVALID_STRUCTURE: 'SIGNED_MESSAGE_INVALID_STRUCTURE',
  SIGNED_MESSAGE_INVALID_NONCE: 'SIGNED_MESSAGE_INVALID_NONCE',
  SIGNED_MESSAGE_INVALID_SIGNATURE: 'SIGNED_MESSAGE_INVALID_SIGNATURE',
  SIGNED_MESSAGE_TEMPLATE_ADDRESS_NOT_PROVIDED:
    'SIGNED_MESSAGE_TEMPLATE_ADDRESS_NOT_PROVIDED',
  SIGNED_MESSAGE_NOT_PROVIDED: 'SIGNED_MESSAGE_NOT_PROVIDED',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  FORBIDDEN_MODERATION_CONTEXT: 'FORBIDDEN_MODERATION_CONTEXT',
  MISSED_MODERATION_CONTEXT_VALUE: 'MISSED_MODERATION_CONTEXT_VALUE',
};

export interface Exception {
  message: string;
  code?: string;
  timestamp?: string;
  path?: string;
}

export class GqlCustomError extends ApolloError {
  constructor(props: Exception) {
    super(props.message, props.code, props);
    Object.defineProperty(this, 'name', { value: this.constructor.name });
  }

  public static create(props: Exception): GraphQLException {
    return new GqlCustomError(props);
  }
}

export function formatError(error: any) {
  const { originalError } = error.extensions;

  if (originalError) {
    if (originalError instanceof GqlCustomError) {
      return formatCustomError(originalError);
    }
  }

  return {
    message: error.message,
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    path: error.path
  };
}

function formatCustomError(error: GqlCustomError) {
  return {
    message: error.message,
    code: error.code,
    path: error.path
  };
}

import { Catch, ArgumentsHost } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GqlCustomError } from '../utils/errorFormatting.util';
@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  // export class GraphqlExceptionFilter extends BaseExceptionFilter {

  catch(exception: GqlCustomError, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    return exception;
  }
}

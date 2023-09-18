import { Provider } from '@nestjs/common';
import { SubsocialApi } from '@subsocial/api';
import { xSocialConfig } from 'src/config';
import { WebSocket } from 'ws';
import { createClient, Client as GraphqlWsClient } from 'graphql-ws';
import { newLogger } from '@subsocial/utils';

export const ApiProviders: Provider[] = [
  {
    provide: SubsocialApi,
    useFactory: async (env: xSocialConfig) => {
      const logger = newLogger('SubsocialApi');
      const api = await SubsocialApi.create({
        substrateNodeUrl: env.XSOCIAL_RPC_URL,
        ipfsNodeUrl: env.IPFS_NODE_URL
      });
      // const substrateApi = await api.substrateApi;
      logger.info('Api created');
      const substrateApi = await api.substrateApi;

      substrateApi.on('error', (e) =>
        logger.info('Subsocial SubstateApi ERROR - ', e)
      );
      substrateApi.on('connected', () =>
        logger.info('Subsocial SubstateApi connected')
      );
      substrateApi.on('disconnected', () =>
        logger.info('Subsocial SubstateApi disconnected')
      );
      substrateApi.on('ready', () =>
        logger.info('Subsocial SubstateApi ready')
      );

      return api;
    },
    inject: [xSocialConfig]
  },
  {
    provide: 'GraphqlWsClient',
    useFactory: async (env: xSocialConfig) => {
      const logger = newLogger('GraphqlWsClient');
      const client = createClient({
        webSocketImpl: WebSocket,
        url: `${env.DATA_PROVIDER_SQUID_WS_URL}`,
        retryAttempts: Infinity,
        shouldRetry: () => true,
        keepAlive: 10000
      });
      client.on('error', (e) => logger.info('WS Api ERROR - ', e));
      client.on('connecting', () => logger.info('WS Api connecting'));
      client.on('connected', () => logger.info('WS Api connected'));
      client.on('opened', () => logger.info('WS Api opened'));
      client.on('closed', () => logger.info('WS Api closed'));

      logger.info('WS Api created');
      return client;
    },
    inject: [xSocialConfig]
  }
];

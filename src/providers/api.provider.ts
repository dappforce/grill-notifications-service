import { Provider } from '@nestjs/common';
import { SubsocialApi } from '@subsocial/api';
import { ApiPromise } from '@polkadot/api';
import { xSocialConfig } from 'src/config';
import { WebSocket } from 'ws';
import { createClient, Client as GraphqlWsClient } from 'graphql-ws';

export const ApiProviders: Provider[] = [
  {
    provide: SubsocialApi,
    useFactory: async (env: xSocialConfig) => {
      const api = await SubsocialApi.create({
        substrateNodeUrl: env.XSOCIAL_RPC_URL,
        ipfsNodeUrl: env.IPFS_NODE_URL
      });
      // const substrateApi = await api.substrateApi;
      console.log('Subsocial Api created');
      return api;
    },
    inject: [xSocialConfig]
  },
  {
    provide: 'GraphqlWsClient',
    useFactory: async (env: xSocialConfig) => {
      const client = createClient({
        webSocketImpl: WebSocket,
        url: `${env.DATA_PROVIDER_SQUID_WS_URL}`
      });
      console.log('WS Api created');
      return client;
    },
    inject: [xSocialConfig]
  }
];

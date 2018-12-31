import { join } from 'path';
import { Client, Message, Providers } from '@yamdbf/core';
import processKarma from './karma';
import { startQueues } from './queues';
import config from './config';

const client = new Client({
  provider: Providers.JSONProvider,
  commandsDir: join(__dirname, 'commands'),
  token: config.token,
  owner: config.owner,
  pause: true
});

client.on('pause', function () {
  startQueues();
  client.emit('continue');
});

client.on('clientReady', function () {
  console.log('Ready!');
});

client.on('message', function (message: Message) {
  processKarma(message);
});

export default client;

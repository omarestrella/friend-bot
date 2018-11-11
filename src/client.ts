import { join } from 'path';
import { Client, Message, Providers } from '@yamdbf/core';
import { Channel } from 'discord.js';
import processKarma from './karma';

const __started = true;

const client = new Client({
  provider: Providers.JSONProvider,
  commandsDir: join(__dirname, 'commands'),
  token: 'MzgwNTQ4ODgzMzA4MzQ3Mzkz.DsaFNw.SMva2Xo5ZIrfEAXDE9FRMUg6cF0',
  owner: 'omarestrella'
});

client.on('clientReady', function () {
  console.log('Ready!');
});

client.on('message', function (message: Message) {
  processKarma(message);
});

export default client;

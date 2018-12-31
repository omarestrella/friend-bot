import { Command, CommandDecorators, Message } from '@yamdbf/core';

import { setupBettingEvent } from '../bets';
import { filterMentionsFromCommandArgs } from '../utils/messageParsing';

export default class CustomCommand extends Command {
  public constructor() {
    super({
      name: 'create-event',
      desc: 'Create an event to place bets on.',
      usage: '<prefix>create-event <event name> <arbiter>'
    });
  }

  action(message: Message, args: string[]) {
    const eventName = filterMentionsFromCommandArgs(args).join(' ');

    if (args.length < 2) {
      this.respond(message, 'Provide a name and arbiter for the event you are placing bets for.');
      return;
    }

    if (message.mentions.users.size !== 1)  {
      this.respond(message, 'Provide an arbiter to oversee event.');
      return;
    }

    setupBettingEvent(message, eventName).then(() => {
      message.channel.send(`Start placing bets on ${eventName}!`);
    }).catch((err: Error) => {
      console.error('Error setting up event:', err);
      message.channel.send(`Couldnt create the event. Error: ${err.message}`)
    });
  }
}

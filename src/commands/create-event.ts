import { Command, CommandDecorators, Message } from '@yamdbf/core';

import { setupBettingEvent } from '../bets';

export default class CustomCommand extends Command {
  public constructor() {
    super({
      name: 'create-event',
      desc: 'Create an event to place bets on.',
      usage: '<prefix>create-event <event name> <arbiter>'
    });
  }

  action(message: Message, args: string[]) {
    if (args.length < 2) {
      this.respond(message, 'Provide a name and arbiter for the event you are placing bets for.');
      return;
    }

    if (message.mentions.users.size !== 1)  {
      this.respond(message, 'Provide an arbiter to oversee event.');
      return;
    }

    setupBettingEvent(message, args[0]).then(() => {
      message.channel.send(`Start placing bets on "${args[0]}"!`);
    }).catch((err: Error) => {
      console.error('Error setting up event:', err);
      message.channel.send(`Couldnt create the event. Error: ${err.message}`)
    });
  }
}

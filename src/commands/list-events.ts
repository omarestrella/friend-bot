import { Command, Message } from '@yamdbf/core';
import { table } from 'table';

import { getCurrentEvents } from '../bets';

export default class CustomCommand extends Command {
  public constructor() {
    super({
      name: 'events',
      desc: 'List current events that can be bet on',
      usage: '<prefix>events'
    });
  }

  async action(message: Message, args: string[]) {
    const events = await getCurrentEvents(message.guild);
    if (events.length > 0) {
      try {
        const bets = events.map(event => [ event.name, event.bets.reduce((acc, bet) => acc + bet.amount || 0, 0) ])
        message.channel.send(`\`\`\`${table(bets)}\`\`\``);
      } catch (err) {
        console.error('Error listing events:', err);
      }
    }
  }
}

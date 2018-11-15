import { Command, CommandDecorators, Message } from '@yamdbf/core';

import { getCurrentEvents, placeBet } from '../bets';
import { getUserData, setUserData } from '../utils/userData';

export default class CustomCommand extends Command {
  public constructor() {
    super({
      name: 'place-bet',
      desc: 'List current events that can be bet on',
      usage: '<prefix>place-bet <event name> <amount of karma>'
    });
  }

  async action(message: Message, args: string[]) {
    let [eventName, karmaString] = args;

    if (!eventName) {
      message.channel.send('Please provide an event name.');
      return;
    }

    if (!karmaString) {
      message.channel.send('Please provide an amount of karma to bet.');
      return;
    }

    const karma = parseInt(karmaString, 10);
    if (!karma || isNaN(karma)) {
      message.channel.send('Karma must be a number value.');
      return;
    }

    const userData = await getUserData(message.author, message.guild);
    if (!userData || !userData.karmaBank || userData.karmaBank < karma) {
      message.channel.send(`Sorry, ${message.author.username}, you do not have enough karma to place bet.`);
      return;
    }

    userData.karmaBank -= karma;
    await setUserData(message.author, message.guild, userData);

    const placed = await placeBet(message, eventName, karma);

    if (placed) {
      message.channel.send(`Successfully placed bet for ${karma} on ${eventName}`);
    } else {
      message.channel.send('Bet could not be placed. Make sure you typed the event name correctly and you are not the event arbiter.')
    }
  }
}

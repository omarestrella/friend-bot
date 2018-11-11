import { Command, CommandDecorators, Message } from '@yamdbf/core';

import extractUsers from '../utils/extractUsers';
import { getUserData } from '../utils/userData';
import { User } from 'discord.js';

export default class KarmaCommand extends Command {
  public constructor() {
    super({
      name: 'karma',
      desc: 'Get the karma for a user',
      usage: '<prefix>karma <username>'
    });
  }

  action(message: Message, args: string[]) {
    console.debug('Checking karma...', args);

    let user: User = null;

    if (message.mentions.users.size > 0) {
      user = extractUsers(message.mentions.users)[0];
    } else if (args) {
      // Might have just typed a name...
      const members = message.guild && message.guild.members;
      const possibleMember = members.find(member => {
        return member.displayName === args.join(' ');
      });
      if (possibleMember) {
        user = possibleMember.user;
      }
    }

    if (user) {
      getUserData(user, message.guild).then(data => {
        const username = user.username;
        message.channel.send(`${username} has ${data.karma || 0} karma and ${data.karmaBank || 0} in the bank.`);
      });
    }
  }
}

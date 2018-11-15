import { User } from "discord.js";
import { Guild } from "@yamdbf/core";
import client from "../client";

type UserDataOrEmpty = UserData | null;

function userDataKey(user: User, guild: Guild) {
  return `${user.username}-${guild.id}`;
}

export async function getUserData(user: User, guild: Guild): Promise<UserDataOrEmpty> {
  const data = await client.storage.get(userDataKey(user, guild));
  if (!data) {
    return null;
  }
  return JSON.parse(data);
}

export async function setUserData(user: User, guild: Guild, data: UserData): Promise<UserData> {
  await client.storage.set(userDataKey(user, guild), JSON.stringify(data));
  return data;
}

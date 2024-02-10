import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Context } from "../constants";

export const requireVoiceChannel = false;

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export async function execute(context: Context) {
  return context.interaction.reply("Pong!");
}
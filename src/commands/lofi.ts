import { ChannelType, CommandInteraction, InternalDiscordGatewayAdapterCreator, SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

export const data = new SlashCommandBuilder()
    .setName("lofi")
    .setDescription("Starts a lofi playlist 📚🎵")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to play the lofi playlist in")
            .setRequired(true).addChannelTypes(ChannelType.GuildVoice));

interface VoiceConnection {
    channelId: string;
    guildId: string;
    adapterCreator: InternalDiscordGatewayAdapterCreator;
}

export async function execute(context: { interaction: CommandInteraction, connection: VoiceConnection }) {
    joinVoiceChannel(context.connection);
    return context.interaction.reply("Starting lofi playlist. Time to be productive and cozy 🚀🍂☕!");
}

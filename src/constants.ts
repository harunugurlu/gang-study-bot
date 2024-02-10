import { CommandInteraction, InternalDiscordGatewayAdapterCreator } from "discord.js";

export interface Context {
    interaction: CommandInteraction;
    connection: Connection | null;
}
export interface Connection {
    channelId: string;
    guildId: string;
    adapterCreator: InternalDiscordGatewayAdapterCreator;
}
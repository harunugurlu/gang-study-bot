import { CommandInteraction, InternalDiscordGatewayAdapterCreator } from "discord.js";

export interface Context {
    interaction: CommandInteraction;
    connection: Connection | null;
}
export interface Connection {
    channelId: string;
    guildId: string;
    adapterCreator: InternalDiscordGatewayAdapterCreator;
    streamUrl: string | null;
}

export const LOFI_GIRL_STREAM_URL = "https://www.youtube.com/watch?v=jfKfPfyJRdk&ab_channel=LofiGirl";

export const streamQuality = {
    LIVE: [91, 92, 93, 94, 95],
    AUDIO_ONLY: 'highestaudio'
}
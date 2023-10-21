import { ChannelType, CommandInteraction, InternalDiscordGatewayAdapterCreator, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { AudioPlayerStatus, VoiceConnection, createAudioPlayer, createAudioResource, getVoiceConnections, joinVoiceChannel } from "@discordjs/voice";
import ytdl from "ytdl-core";

export const data = new SlashCommandBuilder()
    .setName("lofi")
    .setDescription("Starts a lofi playlist 📚🎵")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to play the lofi playlist in")
            .setRequired(true).addChannelTypes(ChannelType.GuildVoice));

interface VoiceChannelConnection {
    channelId: string;
    guildId: string;
    adapterCreator: InternalDiscordGatewayAdapterCreator;
}

function playStream(connection: VoiceConnection) {
    const stream = ytdl(
        "https://www.youtube.com/watch?v=tfBVp0Zi2iE&ab_channel=AbaoinTokyo",
        { filter: 'audioonly', quality: 'highestaudio', begin: Date.now(), liveBuffer: 30000 }
    );
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    const MINIMUM_BUFFER_BEFORE_PLAY = 1 << 18;  // 16 MB
    let buffer = 0;

    stream.on('data', (chunk) => {
        buffer += chunk.length;
        console.info(`Received ${chunk.length} bytes of data. Total buffered: ${buffer}`);

        if (buffer > MINIMUM_BUFFER_BEFORE_PLAY && player.state.status !== AudioPlayerStatus.Playing) {
            player.play(resource);
            connection.subscribe(player);
        }

        if (destroyTimeout) {
            clearTimeout(destroyTimeout);
            destroyTimeout = null;
        }
    });

    stream.on('error', (error) => {
        console.error(`There was an error fetching the stream: ${error}`);
        connection.destroy();  // Disconnect the bot from the channel
    });

    let destroyTimeout: NodeJS.Timeout | null = null;

    player.on(AudioPlayerStatus.Idle, () => {
        console.log("it is now idle", player.state);

        if (destroyTimeout) {
            clearTimeout(destroyTimeout);
        }
        player.play(resource);
        destroyTimeout = setTimeout(() => {
            console.log("Actually destroying connection after idle timeout");
            connection.destroy();
        }, 5000);  // Wait 5 seconds before destroying the connection
    });
    // player.on(AudioPlayerStatus.Idle, () => {
    //     console.log("it is now idle", player.state)
    //     connection.destroy();
    // });

    player.on(AudioPlayerStatus.Buffering, () => {
        console.log("it is now buffering", player.state.status)
        connection.destroy();
    });

    player.on(AudioPlayerStatus.Playing, () => {
        console.log("it is now playing", player.state.status)
    });

    player.on('error', (error) => {
        console.error(`There was an error playing the stream: ${error}`);
        connection.destroy();  // Disconnect the bot from the channel
    });
}

export async function execute(context: { interaction: CommandInteraction, connection: VoiceChannelConnection }) {
    const voiceConnection = joinVoiceChannel(context.connection);

    const { interaction } = context;

    let user = interaction.options.getMember('user');

    playStream(voiceConnection);

    return context.interaction.reply("Starting lofi playlist. Time to be productive and cozy 🚀🍂☕!");
}

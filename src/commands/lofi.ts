import { ChannelType, CommandInteraction, InternalDiscordGatewayAdapterCreator, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { AudioPlayerStatus, VoiceConnection, createAudioPlayer, createAudioResource, getVoiceConnections, joinVoiceChannel } from "@discordjs/voice";
import ytdl from "ytdl-core";

export const data = new SlashCommandBuilder()
    .setName("lofi")
    .setDescription("Starts a lofi playlist 📚🎵")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to play the lofi stream in")
            .setRequired(true).addChannelTypes(ChannelType.GuildVoice));

interface VoiceChannelConnection {
    channelId: string;
    guildId: string;
    adapterCreator: InternalDiscordGatewayAdapterCreator;
}

let retryCount = 0; // Keep track of retries at the global scope

async function playStream(connection: VoiceConnection) {

    const player = createAudioPlayer();
    connection.subscribe(player);

    const stream = ytdl("https://www.youtube.com/watch?v=jfKfPfyJRdk&ab_channel=LofiGirl",
        {
            highWaterMark: 1 << 25,
            quality: [91, 92, 93, 94, 95],
            liveBuffer: 4900
        })

    var resource = createAudioResource(stream);

    // stream.on('data', (chunk) => {
    //     console.log(`Received ${chunk.length} bytes of data.`);
    // })

    player.play(resource);

    player.on(AudioPlayerStatus.Buffering, () => {
        console.log("Audio player is buffering...");
    })

    player.on(AudioPlayerStatus.Idle, () => {
        if (resource.ended) {
            console.log("Stream has ended. Disconnecting.");
        }
        if (resource.playStream && !resource.ended) {
            console.log("Stream is buffering, not actually ended. Waiting for buffer...");
            retryCount++;

            // If the buffering is taking too long, consider disconnecting
            if (retryCount > 5) {
                console.log("Buffering for too long. Disconnecting.");
                connection.destroy();
                retryCount = 0; // Reset the counter
            }
        } else {
            console.log("Audio player is idle, replaying...");
            resource = createAudioResource(stream);
            player.play(resource)
            retryCount = 0; // Reset the counter as the stream is successfully replayed
        }
    });

    player.on('error', (error) => {
        console.error(`There was an error playing the stream: ${error}`);
        connection.destroy(); // Disconnect the bot from the channel
    });
}

export async function execute(context: { interaction: CommandInteraction, connection: VoiceChannelConnection }) {

    const voiceConnection = joinVoiceChannel(context.connection);
    playStream(voiceConnection);

    voiceConnection.on('error', (error) => {
        console.error(`An error occured in voiceConnection: ${error}`);
    })

    voiceConnection.on('stateChange', (oldState, newState) => {
        console.log(`VoiceConnection transitioned from ${oldState.status} to ${newState.status}`);
    })

    const { interaction } = context;

    let user = interaction.options.getMember('user');

    if (user) {
        console.log(`User: ${user}`);
    }
    else {
        console.log(`User not found`);
    }

    return context.interaction.reply("Starting lofi playlist. Time to be productive and cozy 🚀🍂☕!");
}

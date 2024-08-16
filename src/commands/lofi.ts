import { ChannelType, CommandInteraction, InternalDiscordGatewayAdapterCreator, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { AudioPlayerStatus, VoiceConnection, createAudioPlayer, createAudioResource, getVoiceConnections, joinVoiceChannel } from "@discordjs/voice";
import ytdl from "ytdl-core";
import { Context, LOFI_GIRL_STREAM_URL } from "../constants";

export const requireVoiceChannel = true;

export const data = new SlashCommandBuilder()
    .setName("lofi")
    .setDescription("Starts a lofi playlist 📚🎵")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to play the lofi stream in defaults to lofi girl stream")
            .setRequired(true).addChannelTypes(ChannelType.GuildVoice))
    .addStringOption((option) =>
        option
            .setName("url")
            .setDescription("The url of the lofi stream to play")
            .setRequired(false))

let retryCount = 0; // Keep track of retries at the global scope

async function playStream(connection: VoiceConnection, streamUrl: string | null) {

    const player = createAudioPlayer();
    connection.subscribe(player);

    let ytdlOptions : ytdl.downloadOptions | undefined = {
        highWaterMark: 1 << 25,
        quality: [91, 92, 93, 94, 95],
        liveBuffer: 4900
    }

    if(!streamUrl) {
        streamUrl = LOFI_GIRL_STREAM_URL
    }

    const urlInfo = await ytdl.getBasicInfo(streamUrl);

    if(!urlInfo.formats[0].isLive) {
        ytdlOptions = {
            quality: 'highestaudio',
        }
    }

    const stream = ytdl(streamUrl, ytdlOptions)

    var resource = createAudioResource(stream);

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

export async function execute(context: Context) {

    if (!context.connection) {
        return context.interaction.reply("Connection not found.");
    }

    // Join the voice channel
    const voiceConnection = joinVoiceChannel(context.connection);

    // Play the stream
    playStream(voiceConnection, context.connection.streamUrl);

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

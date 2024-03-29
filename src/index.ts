import { ChannelType, Client, CommandInteraction, InternalDiscordGatewayAdapterCreator, VoiceChannel } from 'discord.js';
import { deployCommands } from './deploy-commands';
import { commands } from './commands';
import { config } from './config/config';

const { DISCORD_CLIENT_ID, DISCORD_TOKEN } = config;

const client = new Client({
    intents: ["Guilds", "GuildMessages", "GuildEmojisAndStickers", "GuildVoiceStates", "GuildPresences"]
});

client.once("ready", () => {
    console.log("Study bot is ready! 📚");
});

client.on("guildCreate", async (guild) => {
    console.log(`Joined a new guild: ${guild.name}`)
    await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const { commandName } = interaction;

    console.log(`Received command: ${commandName}`)

    // Check if the interaction occurred within a guild.
    if (!interaction.guild) {
        interaction.reply("This command can only be used within a server.");
        return;
    }

    const command = commands[commandName as keyof typeof commands];

    if(command.requireVoiceChannel) {
        const voiceChannel = interaction.options.getChannel("channel");

        if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
            interaction.reply("Please specify a valid voice channel.");
            return;
        }

        const connection = {
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            streamUrl: interaction.options.getString("url")
        };

        const context = {
            interaction: interaction,
            connection: connection,
        };

        if(command) {
            command.execute(context);
        }
    } else {
        const context = {
            interaction: interaction,
            connection: null,
        };

        if(command) {
            command.execute(context);
        }
    }
});


client.login(DISCORD_TOKEN);
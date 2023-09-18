import { ChannelType, Client } from 'discord.js';
import { deployCommands } from './deploy-commands';
import { commands } from './commands';
import { config } from './config/config';

const { DISCORD_CLIENT_ID, DISCORD_TOKEN } = config;

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildEmojisAndStickers", "GuildVoiceStates"]
});

client.once("ready", () => {
    console.log("Study bot is ready! 📚");
});

client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const { commandName } = interaction;

    // Check if the interaction occurred within a guild.
    if (!interaction.guild) {
        interaction.reply("This command can only be used within a server.");
        return;
    }

    const voiceChannel = interaction.options.getChannel("channel");
    
    // Check if the voiceChannel exists and is a valid voice channel
    if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
        interaction.reply("Please specify a valid voice channel.");
        return;
    }

    const connection = {
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
    };

    const context = {
        interaction: interaction,
        connection: connection
    };
    //This checks if there's a command within the commands object that matches the invoked command name.
    if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(context);
    }
});


client.login(DISCORD_TOKEN);
import { Client } from 'discord.js';
import { deployCommands } from './deploy-commands';
import { commands } from './commands';
import { config } from './config/config';

const { DISCORD_CLIENT_ID, DISCORD_TOKEN } = config;

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildEmojisAndStickers"]
});

client.once("ready", () => {
    console.log("Study bot is ready! 📚");
});

client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
    if(!interaction.isCommand()) {
        return;
    }
    const { commandName } = interaction;
    //This checks if there's a command within the commands object that matches the invoked command name.
    if(commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction);
    }
});

client.login(DISCORD_TOKEN);
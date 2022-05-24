const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Basic shit you know already.'),
	new SlashCommandBuilder().setName('server').setDescription('Self-explanatory'),
	new SlashCommandBuilder().setName('user').setDescription('Self-explanatory'),
	new SlashCommandBuilder().setName('match').setDescription('Match with other interesting people'),
	new SlashCommandBuilder().setName('matches').setDescription('FOR ADMINS ONLY, see which matches are going on'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

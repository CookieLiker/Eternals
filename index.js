// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const { matches } = require('./matches.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	} else if (commandName === 'match') {
		await interaction.reply('Under development. Go eat bugs');
		await interaction.followUp(getServerMemberList());
	} else if (commandName === 'matches') {
		await interaction.reply('This is an admin command :angry:');
		// await interaction.followUp( matches.map((x) => x.userid1 + " + " + x.userid2) );
		console.log(matches.map((match) => `${match.userid1} + ${match.userid2}`));
		console.log(matches)
	}

	function getServerMemberList() {
		return `your id: ${interaction.user.id}`
	}

	function compatibilityCheck() {
		return `your id: ${interaction.user.id}`
	}

});



// Login to Discord with your client's token
client.login(token);

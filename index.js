// Require the necessary discord.js classes
const { channelMention } = require('@discordjs/builders');
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const { matches } = require('./matches.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

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
		await interaction.reply({ content: 'Finding the perfect match for you...', ephemeral: true });
		// await interaction.followUp(getMatchingMember());
		getMatchingMember();
	} else if (commandName === 'matches') {
		await interaction.reply('This is an admin command :angry:');
		// await interaction.followUp( matches.map((x) => x.userid1 + " + " + x.userid2) );
		console.log(matches.map((match) => `${match.userid1} + ${match.userid2}`));
		console.log(matches);
	}

	function getMatchingMember() {
		const membersList = [];
		const matchingMember = interaction.guild.members.fetch()
			.then(
				(members) => {
					members.forEach(member => {
						if (member.user.bot === false) { membersList.push(member.id); }
					});
					membersList.splice(membersList.indexOf(interaction.user.id), 1);
					matches.forEach(match => {
						const index = membersList.indexOf(match.userid1);
						if (index > -1) {
							membersList.splice(index, 1);
						}
						const index2 = membersList.indexOf(match.userid2);
						if (index2 > -1) {
							membersList.splice(index, 1);
						}
					})
					// console.log(membersList);
					var matchingMember = membersList[Math.floor(Math.random() * membersList.length)];
					return matchingMember;
				}

			);
		const printMatchingMember = async () => {
			const m = await matchingMember;
			await interaction.followUp({ content: `Your match is: <@${m}>!`, ephemeral: true })
			createMatch(interaction.user.id, m);
			// console.log(m);
		}
		printMatchingMember()

		// const returnMatchingMember = await matchingMember;
		// return `Your match is: <@${returnMatchingMember}>`
		// return 'sikeeee no work done here';
	}

	function createMatch(user1, user2) {
		interaction.guild.channels.create(`${interaction.user.username}'s text match`, {
			permissionOverwrites: [
				{
					id: interaction.user,
					allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
					// allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY],
				},
				{
					id: user2,
					allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
					// allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY],
				},
				{
					id: interaction.guild.roles.everyone,
					deny: ['VIEW_CHANNEL'],
					// deny: [Permissions.FLAGS.VIEW_CHANNEL],
				}
			],
		})
			.then(channel => channel.setParent('879019248167551026'))
		interaction.guild.channels.create(`${interaction.user.username}'s voice match`, {
			type: 'GUILD_VOICE',
			permissionOverwrites: [
				{
					id: interaction.user,
					allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
					// allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY],
				},
				{
					id: user2,
					allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
					// allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.READ_MESSAGE_HISTORY],
				},
				{
					id: interaction.guild.roles.everyone,
					deny: ['VIEW_CHANNEL'],
					// deny: [Permissions.FLAGS.VIEW_CHANNEL],
				}
			],
		})
			.then(channel => channel.setParent('879019248167551026'))
		storeMatch();
	}

	function storeMatch(user1, user2, textid, voiceid) {
		const uid = '';

	}

	// ****Future plans****
	// function compatibilityCheck() {
	// 	return `your id: ${interaction.user.id}`;
	// }

});



// Login to Discord with your client's token
client.login(token);

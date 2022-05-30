// Require the necessary discord.js classes
const { channelMention } = require('@discordjs/builders');
const { Client, Intents } = require('discord.js');
// const uid = require('uid');
const { uid } = require('uid');
const { MessageActionRow, MessageButton } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

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
		if (interaction.user.id != '508201996709396481' || interaction.user.id != '839057597143187466') {
			await interaction.reply('This is an admin command :angry:');
			return;
		}
		// var matches = require('./matches.json');
		var rawdata = fs.readFileSync('matches.json');
		var matches = JSON.parse(rawdata);
		await interaction.reply('This is an admin command :angry:');
		// await interaction.followUp( matches.map((x) => x.userid1 + " + " + x.userid2) );
		console.log(matches.map((match) => `${match.userid1} + ${match.userid2}`));
		console.log(matches);
	} else if (commandName === 'closematch') {
		if (interaction.channel.parent != '879019248167551026') {
			interaction.reply('Use this command in your match if you have one!')
			return;
		}
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('yes')
					.setLabel('YES')
					.setStyle('DANGER'),
				new MessageButton()
					.setCustomId('no')
					.setLabel('NO')
					.setStyle('PRIMARY'),
			);
		// var matches = require('./matches.json');
		var rawdata = fs.readFileSync('matches.json');
		var matches = JSON.parse(rawdata);
		await interaction.reply({ content: "Are you sure? The channels and messages will be deleted if you click 'YES'.", components: [row] })
		const conformingMsg = await interaction.fetchReply();
		client.on('interactionCreate', interaction => {
			if (!interaction.isButton()) return;
			if (interaction.customId == 'yes') {
				if (matches) {
					for (var index = 0; index < matches.length + 1; index++) {
						if (matches[index]) {
							if (interaction.user.id == matches[index].userid1 || interaction.user.id == matches[index].userid2) {
								interaction.guild.channels.delete(matches[index].textid);
								console.log(`Deleted ${matches[index].textid}`)
								interaction.guild.channels.delete(matches[index].voiceid);
								console.log(`Deleted ${matches[index].voiceid}`)
								matches.splice(index, 1);
								fs.writeFile("matches.json", JSON.stringify(matches), 'utf8', function (err) {
									if (err) {
										console.log("An error occured while writing JSON Object to File.");
										return console.log(err);
									}
								});
								return;
							}
						}
					}
				}
			}
			if (interaction.customId == 'no') {
				interaction.channel.send('The match is not deleted');
				conformingMsg.delete();
			}
		});
	} else if (commandName === 'forcereset') {
		if (interaction.user.id != '508201996709396481' || interaction.user.id != '839057597143187466') {
			await interaction.reply("This command isn't for you");
			return;
		}
		await interaction.reply('Are you sure? cannot implement yes/no su just doing it for u');
		interaction.guild.channels.fetch()
			.then(channels => {
				channels.forEach(channel => {
					if (channel.parent == 879019248167551026) {
						interaction.guild.channels.delete(channel.id);
					}
				})
			})
		fs.writeFile("matches.json", "[]", 'utf8', function (err) {
			if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
		});
	}

	function getMatchingMember() {
		// var matches = require('./matches.json');
		var rawdata = fs.readFileSync('matches.json');
		var matches = JSON.parse(rawdata);
		const membersList = [];
		if (matches) {
			for (var index = 0; index < matches.length + 1; index++) {
				if (matches[index]) {
					if (interaction.user.id == matches[index].userid1 || interaction.user.id == matches[index].userid2) {
						interaction.followUp('You are already in a match :rage:');
						return;
					}
				}
			}
			// console.log('check for member already in list');
			// console.log(matches);
		}
		const matchingMember = interaction.guild.members.fetch()
			.then(
				(members) => {
					members.forEach(member => {
						if (member.user.bot === false) { membersList.push(member.id); }
					});
					membersList.splice(membersList.indexOf(interaction.user.id), 1);
					if (matches) {
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
					}
					// console.log(membersList);
					var matchingMember = membersList[Math.floor(Math.random() * membersList.length)];
					// console.log('getMatchingMember');
					// console.log(matches);
					return matchingMember;
				}

			);
		const printMatchingMember = async () => {
			const m = await matchingMember;
			await interaction.followUp({ content: `Your match is: <@${m}>!`, ephemeral: true })
			createMatch(interaction.user.id, m);
			// console.log('printMatchingMember');
			// console.log(matches);
			// console.log(m);
		}
		printMatchingMember()

		// const returnMatchingMember = await matchingMember;
		// return `Your match is: <@${returnMatchingMember}>`
		// return 'sikeeee no work done here';
	}

	function createMatch(user1, user2) {
		const length = 4;
		const matchUid = uid(length);
		var textid, voiceid;
		// console.log('createMatch');
		// console.log(matches);
		interaction.guild.channels.create(`Match ${matchUid}`, {
			parent: '879019248167551026',
		})
			.then
			((channel) => {
				channel.permissionOverwrites.set([
					{
						id: user1,
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
				])
				channel.send(`<@${user1}> and <@${user2}> are matched!\nThis is your own personal match.\nYou have privacy to text and voice chat in these channels\nStay safe and maintain etiquettes!!`);
				channel.send('To stop this match, any member of the match can do /closematch').then(msg => msg.pin())
				textid = channel.id
			})
		interaction.guild.channels.create(`Match ${matchUid}`, {
			type: 'GUILD_VOICE',
			parent: '879019248167551026',
		})
			.then((channel) => {
				voiceid = channel.id;
				storeMatch(matchUid, user1, user2, textid, voiceid);
				channel.permissionOverwrites.set([
					{
						id: user1,
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
				])
			})
	}

	function storeMatch(uid, user1, user2, textid, voiceid) {
		// var matches = require('./matches.json');
		var rawdata = fs.readFileSync('matches.json');
		var matches = JSON.parse(rawdata);
		const match = {
			uid: uid,
			userid1: user1,
			userid2: user2,
			textid: textid,
			voiceid: voiceid
		}
		// console.log(match);
		if (matches) {
			matches.push(match);
		} else {
			matches = [];
			matches.push(match);
			// console.log('storeMatch1');
			// console.log(matches);
		}
		// console.log(matches);
		fs.writeFile("matches.json", JSON.stringify(matches), 'utf8', function (err) {
			if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
		});
		// console.log('storeMatch 2');
		// console.log(matches);

	}

	// ****Future plans****
	// function compatibilityCheck() {
	// 	return `your id: ${interaction.user.id}`;
	// }

});



// Login to Discord with your client's token
client.login(token);

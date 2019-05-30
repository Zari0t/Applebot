import MessageHandler from "../messageHandler";
import ExtendedInfo from "../extendedInfo";
import DiscordExtendedInfo from "../extendedInfos/discordExtendedInfo";
import { Message } from "discord.js";

class RoleManager implements MessageHandler {

	public async cleanUpRoles(msg: Message) {
		for (let r of msg.guild.roles) {
			if (r[1].name.startsWith("@"))
				if (r[1].members.size == 0) {
					r[1].delete();
				}
		}
	}

	public roleSanitizer(args: String[]): string {
		return "@" + args.slice(2).join(" ").toLowerCase();
	}

	async handleMessage(responder: (content: string) => Promise<void>, content: string, info: ExtendedInfo | undefined) {
		if (info == undefined || info.type != "DISCORD")
			return;
		const discordInfo = info as DiscordExtendedInfo;
		const msg = discordInfo.message;
		const elevated = discordInfo.message.member.hasPermission("BAN_MEMBERS");
		let args = content.split(" ");

		if (args[0] != "!role")
			return;
		if (msg.guild.name != "HITBOX DIMENSION" && msg.guild.name != "bot testing fuckery" && msg.guild.id != "306213252625465354") // don't worry about it
			return;

		switch (args[1].toLowerCase()) {
			case "purge": {
				if (!elevated)
					break;
				let roleString = "To purge: "
				const filteredRoles = msg.guild.roles.filter(x => x.members.size < 3);
				if (filteredRoles.size < 1) {
					await responder("No roles to be purged.");
					break;
				}
				for (let r of filteredRoles) {
					if (r[1].name.startsWith("@") && r[1].name != "@everyone")
						roleString += "`" + r[1].name + "[" + r[1].members.size + "]" + "` ";
				}
				await responder(roleString)
				if (args.length > 2 ) {
					if (args[2] == "BUTTON") {
						for (let r of filteredRoles) {
							if (r[1].name.startsWith("@") && r[1].name != "@everyone")
								await r[1].delete("Autopurged");
						}
						await responder("Purged for real.");
					}
				}
				break;
			}
			case "add": {
				if (args.length > 2) {
					const roleText = this.roleSanitizer(args);
					let targetRole = msg.guild.roles.find(role => role.name === roleText);
					if (targetRole) {
						if (msg.member.roles.has(targetRole.id)) {
							await responder(`You already have \`${roleText}\`.`)
							return;
						}
						await msg.member.addRole(targetRole);
						await responder(`OK! I've added you to \`${roleText}\`.`);
					} else {
						await responder(`Couldn't find a role named \`${roleText}\`. Maybe you could \`create\` it?`)
					}
				} else {
					await responder('Usage: `!role add [name of role]`');
				}
				break;
			}
			case "remove": {
				if (args.length > 2) {
					const roleText = this.roleSanitizer(args);
					let targetRole = msg.guild.roles.find(role => role.name === roleText);
					if (targetRole) {
						if (!msg.member.roles.has(targetRole.id)) {
							await responder(`You don't have that role.`);
							return;
						}
						await msg.member.removeRole(targetRole);
						await responder(`OK! I've removed you from \`${roleText}\`.`);
						this.cleanUpRoles(msg);
					} else {
						await responder(`Couldn't find a role named \`${roleText}\`.`)
					};

				} else {
					await responder('Usage: `!role remove [name of role]`');
				}
				break;
			}
			case "create": {
				if (args.length > 2) {
					const roleText = this.roleSanitizer(args);
					let dupeRole = msg.guild.roles.find(role => role.name === roleText);
					if (dupeRole) {
						if (msg.member.roles.has(dupeRole.id)) {
							await responder(`\`${roleText}\` already exists.`);
							return;
						} else {
							msg.member.addRole(dupeRole);
							await responder(`\`${roleText}\` already exists. I've added you to it.`);
							return;
						}
					}
					const result = await discordInfo.message.guild.createRole({
						name: roleText,
						hoist: false,
						mentionable: true
					});
					await msg.member.addRole(result);
					const newRole = { id: result.id, added_by: discordInfo.message.author.username };
					await responder(`OK! Added \`${roleText}\`, and added you to that role.`);
				} else {
					await responder('Usage: `!role create [name of role]`');
				}
				break;
			}
			case "list": {
				if (args.length > 2) {
					const roleText = this.roleSanitizer(args);
					let targetRole = msg.guild.roles.find(role => role.name === roleText);
					if (targetRole) {
						let roleString = "Members: "
						for (let m of targetRole.members) {
							roleString += "`" + m[1].user.username +  "` ";
						}
						await responder(roleString);
					} else {
						await responder(`Couldn't find a role named \`${roleText}\`.`)
					};

				} else {
					let roleString = "Roles: "
					const sortedRoles = msg.guild.roles.sort((x, y) => {
						if (x.members.size > y.members.size)
							return -1;
						if (y.members.size > x.members.size)
							return 1;
						return 0;
					});
					for (let r of sortedRoles) {
						if (r[1].name.startsWith("@") && r[1].name != "@everyone")
							roleString += "`" + r[1].name + "[" + r[1].members.size + "]" + "` ";
					}
					await responder(roleString);
				}
				break;
			}
			case "removeall": {
				for (let r of msg.member.roles) {
					if (r[1].name.startsWith("@"))
						await msg.member.removeRole(r[1]);
				}
				await responder(`OK! I've removed you from all user-created roles.`);
				this.cleanUpRoles(msg);
				break;
			}
			default: {
				await responder('Usage: `!role <create, add, remove, list, removeall>`');
			}
		}
	}

}

export default RoleManager;
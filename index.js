var Discord = require("discord.js");
var client = null;
var fs = require("fs");
function handleReady() {
  var cmds = fs.readdirSync("slashCommands").filter(cmd => cmd.endsWith(".js"));
  for (var cmd of cmds) {
    var cmdj = require(`../../slashCommands/${cmd}`);
    client.commands.set(cmdj.name,cmdj);
  }
  registerCommands();
}
function registerCommands() {
  var cmds = [];
  for (var cmd of client.commands.values()) {
    var cmdo = new Discord.SlashCommandBuilder();
    cmdo.setName(cmd.name).setDescription(cmd.desc).setDMPermission(cmd.dm);
    for (var opt of cmd.opts) {
      switch(opt.type) {
        case "string":
          var option = new Discord.SlashCommandStringOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          if (opt.choices) {
            option.setChoices(...opt.choices);
          }
          cmdo.addStringOption(option);
          break;
        case "integer":
          var option = new Discord.SlashCommandIntegerOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          option.setMinValue(opt.min);
          option.setMaxValue(opt.max);
          if (opt.choices) {
            option.setChoices(...opt.choices);
          }
          cmdo.addIntegerOption(option);
          break;
        case "bool":
          var option = new Discord.SlashCommandBooleanOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          cmdo.addBooleanOption(option);
          break;
        case "user":
          var option = new Discord.SlashCommandUserOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          cmdo.addUserOption(option);
          break;
        case "channel":
          var option = new Discord.SlashCommandChannelOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          cmdo.addChannelOption(option);
          break;
        case "role":
          var option = new Discord.SlashCommandRoleOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          cmdo.addRoleOption(option);
          break;
        case "file":
          var option = new Discord.SlashCommandAttachmentOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          cmdo.addAttachmentOption(option);
          break;
        case "number":
          var option = new Discord.SlashCommandNumberOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          option.setMinValue(opt.min);
          option.setMaxValue(opt.max);
          if (opt.choices) {
            option.setChoices(...opt.choices);
          }
          cmdo.addNumberOption(option);
          break;
        case "mentionable":
          var option = new Discord.SlashCommandMentionableOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          cmdo.addMentionableOption(option);
          break;
        default:
          break;
      }
    }
    cmds.push(cmdo);
  }
  client.application.commands.set(cmds);
}
async function handleError(err, interaction, client, Discord, fs, userHandle) {
  console.log(err);
  if (userHandle) {
    return errorFnc();
  }
}
function handleInteractionCreate(interaction) {
  if (!interaction.isChatInputCommand()) {
    return !1;
  }
  var cmdj = client.commands.get(interaction.commandName);
  if (cmdj) {
    cmdj.execute(interaction, client, Discord, fs).catch(err => {
      handleError(err, interaction, client, Discord, fs, !0).catch(err2 => {
        handleError(err2, interaction, client, Discord, fs, !1);
      });
    });
  }
}
function nothing() {}
var errorFnc = nothing;
module.exports = {
  "start": (token, intents) => {
    client = new Discord.Client({
      "intents": new Discord.IntentsBitField(intents)
    });
    client.commands = new Discord.Collection();
    client.on("ready",handleReady);
    client.on("interactionCreate",handleInteractionCreate);
    return client.login(token);
  },
  "setError": f => {
    errorFnc = f;
  }
};

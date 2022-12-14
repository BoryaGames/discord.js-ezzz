var Discord = require("discord.js");
var client = null;
var fs = require("fs");
function handleReady() {
  var cmds = fs.readdirSync("commands").filter(cmd => cmd.endsWith(".js"));
  for (var cmd of cmds) {
    var cmdj = require(`./commands/${cmd}`);
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
          var option = new Discord.SlashCommandIntegetOption();
          option.setName(opt.name);
          option.setDescription(opt.desc);
          option.setRequired(opt.req);
          option.setMinValue(opt.min);
          option.setMaxValue(opt.max);
          cmdo.addIntegerOption(option);
          break;
        default:
          break;
      }
    }
    cmds.push(cmdo);
  }
  client.application.commands.set(cmds);
}
function nothing() {}
function handleInteractionCreate(interaction) {
  if (!interaction.isChatInputCommand()) {
    return !1;
  }
  var cmdj = client.commands.get(interaction.commandName);
  if (cmdj) {
    cmdj.execute(interaction, client, Discord, fs).catch(nothing);
  }
}
module.exports = {
  "start": (token, intents) => {
    client = new Discord.Client({
      "intents": new Discord.IntentsBitField(intents)
    });
    client.commands = new Discord.Collection();
    client.on("ready",handleReady);
    client.on("interactionCreate",handleInteractionCreate);
    return client.login(token);
  }
};

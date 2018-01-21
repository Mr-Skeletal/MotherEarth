const Discord = require("discord.js");
const fs = require("fs");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const client = new Discord.Client();
const commandPrefix = "$";
const moneyLogo = ":dollar:";
const dataFiles = "nations users".split(" ");

const Nation = class {
    constructor(health = 1000, gold = 10, citizens = 5, defense = 1, owner = "") {
        this.health = health;
        this.gold = gold;
        this.citizens = citizens;
        this.defense = defense;
        this.owner = owner;
        this.strength = 0;
        this.timeSinceTax = 0;
        this.timeSinceAttack = 0;
        this.taken = false;
    }
};

Discord.TextChannel.prototype.sendAndDelete = function(text, ms) {
    this.send(text).then(msg => setTimeout(msg.delete.bind(msg), ms));
};

//const readFile = filename => fs.readFileSync(filename);
const readJSON = filename => JSON.parse( fs.readFileSync(filename + ".json"));
//const writeFile = (filename, text) => fs.writeFileSync(filename, text);
const writeJSON = (filename, obj) => fs.writeFileSync(filename + ".json", JSON.stringify(obj));
const loadData = () => dataFiles.forEach(name => data[name] = readJSON("/data/" + name));
const saveData = () => dataFiles.forEach(name => writeJSON("/data/" + name, data[name]));
const beforeClose = () => {
    saveData();
};
const fetch = url => {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.send();
        xhr.onload = () => resolve(xhr);
    });
};
const getMeme = () => fetch("http://rolloffle.churchburning.org/troll_me_text.php");
const messageReceived = msg => {
    const text = msg.content;
    if (text.startsWith(commandPrefix)) {
        if (msg.channel.type != "text") {
            msg.reply("Must be in a server channel.");
            return;
        }
        env.server = data.nations[msg.guild.id];
        if (!env.server) {
            env.server = data.nations[msg.guild.id] = {};
        }
        env.nation = env.server[msg.channel.id];
        if (!env.nation) {
            msg.reply(`This channel is not a nation! ${commandPrefix}add for nation status.`);
            return;
        }
        let args = text.split(" ");
        const cmd = args.splice(0, 1)[0].slice(1);
        if (commands.has(cmd)) {
            commands.get(cmd)(args, msg);
        } else if (adminCommands.has(cmd)) {
            if (!msg.member.permissions.has("ADMINISTRATOR")) {
                msg.reply("You need to be an admin to use this command.");
                return;
            }
            adminCommands.get(cmd)(args, msg);
        }
    }
};
const takeMoney = (user, ammount) => {
    const money = data.money[user];
    if (money == undefined || money < ammount) {
        return false;
    }
   data.money[user] = money - ammount;
   return true;
};
const isCitizen = msg => {
    const ownsNation = msg.guild.channels.get(data.users[msg.guild.id][msg.author.id]).name == data.nations[msg.guild.id][msg.channel.id]["owner"];
    if (data.users[msg.guild.id] == undefined || data.users[msg.guild.id][msg.author.id] == undefined || !ownsNation){
        msg.reply("You are not in this nation! $join");
        return false;
    }
    return true;
};
const newNationRole = msg => {
    const role = msg.guild.roles.find("name", msg.channel.name);
    if (!role) {
        var colorHex = "#" + Math.floor(Math.random() * 16777216).toString(16);
        msg.guild.createRole({
            name: msg.channel.name,
            color: colorHex
        });
    }
};
const init = () {
    loadData();
    client.login("NDAzMjQ5NDAwODkxMDQ3OTM2.DUEi-g.NjlZ7KEHXr5UMk1OsTFCbutCCV4");
    client.on("message", messageReceived);
    //client.on("ready", () => ());
    for (const evnt of "exit SIGINT SIGUSR1 SIGUSR2 uncaughtException".split(" ")) {
        process.on(evnt, beforeClose);
    }
};

let data = {};
let env = {};

init();

//https://discordapp.com/oauth2/authorize?client_id=404141502663753749&scope=bot&permissions=2146958591
const Discord = require("discord.js");
const fs = require("fs");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const client = new Discord.Client();
const commandPrefix = "$";
const adminRole = "Gamemaster";
const dataFiles = "servers".split(" ");

const Server = class {
    constructor(nations = {}, users = {}) {
        this.nations = nations;
        this.users = users;
    }
};
const Nation = class {
    constructor(health = 1000, gold = 10, citizens = 5, defense = 1, owner = "") {
        this.health = health;
        this.gold = gold;
        this.citizens = citizens;
        this.defense = defense;
        this.owner = owner;
        this.military = 0;
        this.timeSinceTax = 0;
        this.timeSinceAttack = 0;
    }
};
const Command = class {
    constructor(exec, a, b, c) {
        this.exec = exec;
        this.needsNation = a;
        this.needsCitizenship = b;
        this.needsAdmin = c;
    }
};

const ensureDataFolder = () => {
    if (!fs.existsSync("./data/")) {
        fs.mkdirSync("./data/");
    }
};
const writeFile = (filename, text) => fs.writeFileSync(filename, text, "utf-8");
const readFile = filename => {
    if (fs.existsSync(filename)) {
        return fs.readFileSync(filename, "utf-8");
    } else {
        writeFile(filename, "");
        return "";
    }
};
const writeJSON = (filename, obj) => writeFile(filename + ".json", JSON.stringify(obj));
const readJSON = filename => JSON.parse(readFile(filename + ".json") || "{}");
const saveData = () => {
    ensureDataFolder();
    dataFiles.forEach(name => writeJSON("./data/" + name, data[name]));
    console.log("saved data.");
};
const loadData = () => {
    ensureDataFolder();
    dataFiles.forEach(name => data[name] = readJSON("./data/" + name));
    console.log("loaded data.");
};
const beforeClose = (evnt, err) => {
    console.log("close event:", evnt);
    saveData();
    if (err) {
        console.log(err);
    }
};
const fetch = url => {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.send();
        xhr.onload = () => resolve(xhr);
    });
};
const getTarget = (ref, msg) => {
    if (!ref) {
        msg.reply(`"${ref}" is not a valid channel.`);
        return [null];
    }
    const matches = ref.match(/<#(\d+)>/);
    const target = matches ? env.gld.channels.get(matches[1]) : env.gld.channels.find("name", ref);
    if (!target) {
        msg.reply("Target channel doesn't exist.");
        return [null];
    }
    const nation = env.srvr.nations[target.id];
    if (!nation) {
        msg.reply(`<#${target.id}> is not a nation. \`${commandPrefix}add\` for nation status.`);
        return [null];
    }
    if (target.id == env.chnl.id) {
        msg.reply("Target cannot be yourself.");
        return [null];
    }
    return [target, nation, target.name];
};
const prettyPrintMillis = (millis) => {
    const s = n => n !== 1 ? "s" : "";
    const sec = Math.ceil(millis / 1000);
    const secT = `${sec % 60} second${s(sec)}`;
    if (sec < 60) return secT;
    const min = sec / 60 | 0;
    const minT = `${min % 60} minute${s(min)}`
    if (min < 60) return `${minT}, ${secT}`;
    const our = min / 60 | 0;
    const ourT = `${our % 24} hour${s(our)}`;
    if (our < 24) return `${ourT}, ${minT}`;
    const day = our / 24 | 0;
    return `${day} day${s(day)}, ${ourT}`;
};
const messageReceived = msg => {
    const text = msg.content;
    if (text.startsWith(commandPrefix)) {
        if (msg.channel.type != "text") {
            msg.reply("Must be in a server channel.");
            return;
        }
        let args = text.split(" ");
        const cmdName = args.splice(0, 1)[0].slice(commandPrefix.length);
        const cmd = commands.get(cmdName);
        if (!cmd) {
            msg.reply(`Unknown command. Try \`${commandPrefix}help\`.`);
            return;
        }
        env.chnl = msg.channel;
        env.gld = msg.guild;
        env.srvr = data.servers[env.gld.id] || (data.servers[env.gld.id] = new Server());
        env.nation = env.srvr.nations[msg.channel.id];
        env.isCitizen = env.chnl.id == env.srvr.users[msg.author.id];
        if (cmd.needsNation && !env.nation) {
            msg.reply(`This channel is not a nation! \`${commandPrefix}add\` for nation status.`);
        } else if (cmd.needsCitizenship && !env.isCitizen) {
            msg.reply(`You are not in this nation! \`${commandPrefix}join\`.`);
        } else if (cmd.needsAdmin && !msg.member.roles.find("name", adminRole)) {
            msg.reply(`You need to have role ${adminRole} to use this command.`);
        } else {
            cmd.exec(msg, args);
        }
    }
};
const commands = new Map();
const init = () => {
    for (const evnt of "exit SIGINT SIGTERM SIGHUP uncaughtException".split(" ")) {
        process.on(evnt, err => {
            console.log(""); // extra newline
            process.emit("beforeClose", evnt, err);
            process.exit();
        });
    }
    process.once("beforeClose", beforeClose);
    process.on("unhandledRejection", (reason, p) => {
        console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
    });
    eval(readFile("./commands.js")); // Using eval to have a cleaner main file, lmao.
    loadData();
    store = readJSON("./store");
    client.on("message", messageReceived);
    client.login("NDA0MTQxNTAyNjYzNzUzNzQ5.DUYTew.ejq8O79PAVltZ64h53IIQE0eLF8");
    setInterval(saveData, 1000 * 60);
};

let data = {};
let env = {};

init();

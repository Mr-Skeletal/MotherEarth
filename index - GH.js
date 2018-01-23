var Discord = require("discord.js");
//var opusscript = require("opusscript");
var fs = require("fs");
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var client = new Discord.Client();
var channel 
var active = 1
var responseAvailable = true
var commands = [];
var COMMAND_PREFIX = "$"
var activeServer
var ttsOn = false
//ME bot NDAzMjQ5NDAwODkxMDQ3OTM2.DUEi-g.NjlZ7KEHXr5UMk1OsTFCbutCCV4
//NFB MzYzMTYwMDY5MzA4OTQwMjg5.DUXemQ.oOZbgxEslxUGSzrgeTIwkjOMQZE
client.login('NDAzMjQ5NDAwODkxMDQ3OTM2.DUEi-g.NjlZ7KEHXr5UMk1OsTFCbutCCV4');
var markList = {};
var votes = {};
var secconds = Math.round(client.uptime / 1000);
var minutes = Math.round(client.uptime / 1000 / 60);
var botDir = process.cwd() + "/MotherEarthBot";
console.log(botDir);

//funSettings
var prevUserID;
var prevUserChannel;
var infEmote = "🤢";
var dedEmote = "💀";
var cureEmote = "💊";
var mortalityRate = "11";
var infPath = botDir + "/Data/Infection.txt";
var moneyLogo = ":dollar:";
var moneyPath = botDir + "/Data/Money.txt";
var nationsPath = botDir + "/Data/Nations.txt";
var nationsUserPath = botDir + "/Data/NationsUserData.txt";
var nationsSettingsPath = botDir + "/Data/NationsSettings.txt";
var Infection = false;
var InfData = {};
var fightList = {};
//
var voteTime;
var ActiveUsers = {};
var payTime = 30;
var payment = 15;
var roomList = {};


function sortObj(obj){
  var newObj = {};
  var arr = [];
  for(var i in obj){
    arr[arr.length] = i;
  }
  
  arr.sort((a, b) => b.length - a.length);
  
  for(i in arr){
    newObj[arr[i]] = obj[arr[i]];
  }
  return newObj;
}



/*

TODO

anti spam command
arguments system
roles system

*/

function fileread(filename){
    var contents= fs.readFileSync(filename);
    return contents;
}

function setChan(name, guild) {
	var c = client.channels.findAll("name", name)
	if (guild) c = c.filter(e => e.guild.id === guild)
	channel = c[0] || channel
}

function setActiveServer(name){
	activeServer = client.guilds.find("name", name) || activeServer;
}

function addCommand(expression, callback, requiresPrefix, notControlledByActive, requiresAdmin) {
	commands.push({
		expression: expression,
		callback: callback,
		requiresPrefix: requiresPrefix,
		notControlledByActive: notControlledByActive,
		requiresAdmin : requiresAdmin
	});
}

function execute() {
	setChan("general", "287661850416644097");
}

Discord.TextChannel.prototype.sendAndDelete = function(msg, ms) {
	this.send(msg).then(function(message) {
		setTimeout(function() {
			message.delete();
		}, ms);
	});
};

Discord.TextChannel.prototype.sendImage = function(url) {
	this.send({
		file: url
	});
};

function setAvailableFlag(ms) {
	responseAvailable = !responseAvailable;
	if (ms) setTimeout(setAvailableFlag, ms);
}

function takeMoney(user,ammount){
    var sheet = JSON.parse(fileread(moneyPath));
    if(sheet[user] == undefined || parseInt(sheet[user]) < ammount){
        return false;
    }else{
       sheet[user] = parseInt(sheet[user]) - ammount;
       var change = sheet;
       fs.writeFile(moneyPath, JSON.stringify(sheet), 'utf8');
       return true; 
    }
}


class Nation{
    constructor(HP,income,citizens,def,owner){
        this.HP = HP;
        this.income = income;
        this.citizens = citizens;
        this.def = def;
        this.atk = 0;
        this.timeSinceLastTax = 0;
        this.owner = owner;
        this.timeSinceAttack = 0;
        this.flag = "https://www.shareicon.net/data/256x256/2015/11/09/669568_flag_512x512.png";
        this.slogan = "";
    }
}
//[effect,price]
var settings = {
    "store" : {
        "atk":{
            "style":["https://www.shareicon.net/data/256x256/2016/01/26/709026_sport_512x512.png","#4f0000"],
            "slave":[1,10,"atk"],
            "soldier":[4,40,"atk"],
            "airplane":[15,100,"atk"],
            "anti-air":[55,500,"atk"],
            "missile":[110,1000,"atk"],
            "nuke":[510,5000,"atk"],
            "tsar-bomba":[1200,10000,"atk"],
            "hacker":[3750,25000,"atk"],
            "virus":[5000,40000,"atk"],
            "orbital-cannon":[10000,80000,"atk"],
            "spaceShip":[15000,135000,"atk"],
        },
        "def":{
            "style":["https://www.shareicon.net/data/256x256/2015/09/21/644384_shield_512x512.png","#5fa1e2"],
            "fence":[1,10,"def"],
            "watch-tower":[2,20,"def"],
            "wood-wall":[5,60,"def"],
            "stone-wall":[7,90,"def"],
            "patrol":[4,40,"def"],
            "anti-air":[50,400,"def"],
            "radar":[500,4000,"def"],
            "shield":[750,6000,"def"],
        },
        "hp":{
            "style":["https://www.shareicon.net/data/256x256/2016/06/20/783694_medical_512x512.png","#ff6060"],
            "wood":[5,20,"HP"],
            "stone":[10,30,"HP"],
            "bricks":[20,60,"HP"],
            "supply-shipment":[55,200,"HP"],
            "aid":[110,300,"HP"],
            "shield":[233,700,"HP"],
        },
        "citizen":{
            "style":["https://www.shareicon.net/data/256x256/2015/08/23/89623_person_512x512.png","#fffab7"],
            "slaves":[2,10,"citizens"],
            "farming":[4,20,"citizens"],
            "housing":[6,30,"citizens"],
            "hotel":[12,50,"citizens"],
            "village":[24,100,"citizens"],
            "town":[44,200,"citizens"],
            "city":[66,300,"citizens"],
            "metropolis":[106,530,"citizens"],
            "artificial-island":[510,2500,"citizens"],
            "space-colony":[1015,5000,"citizens"],
            "planet-colony":[5020,25000,"citizens"],
            "simulated-reality":[10000,400000,"citizens"],
            "universe-in-a-box":[2000000,8000000,"citizens"],
        }
    },
    "commands" : {
        "give" : true,
        "attack" : true,
    },
    "nations" : {
        "taxWait" : 1,
        "userTweaking" : true,
        "AI" : false
    },
    "channel" : {
        "vote" : undefined,
        "stats" : undefined
    }
};

function canAfford(nation,price){
    if(nation["income"] >= price){
        return true;
    }else{
        return false;
    }
}

function warEq(atk,def,HP,atkEN){
    console.log(HP - (atkEN - def))
    atkEN = atkEN - def;
    if(atkEN <= 0){return HP;}
    return HP - atkEN;
}

addCommand(m => m.indexOf('attack') === 0, msg => {
     var embed = new Discord.RichEmbed()
                    .setDescription("**__Attack__**")
                    .setColor("RED")
                    .setThumbnail("https://www.shareicon.net/data/256x256/2016/01/26/709026_sport_512x512.png");
    
    var embedEN = new Discord.RichEmbed()
                    .setDescription("**__Enemy Attack__**")
                    .setColor("RED")
                    .setThumbnail("https://www.shareicon.net/data/256x256/2016/01/26/709026_sport_512x512.png");
    
    var nationsSettings = JSON.parse(fileread(nationsSettingsPath));
    if(nationsSettings[msg.guild.id] !== undefined && nationsSettings[msg.guild.id]["commands"]["attack"] == false){
        msg.reply("The server owner/admins have disabled this feature!")
        return;
    }
    if(!isCitizen(msg)){return;}
    
    var nations = JSON.parse(fileread(nationsPath));
    var args = msg.content.split(" ");
    var current = msg.channel.id;
    var target = args[1]
    if(nations[msg.guild.id][current] == undefined){
        msg.reply("this isnt a country!")
        console.log("current")
        return;
    }else{
        console.log("target")
        var targetID = target.replace("<","").replace("#","").replace(">","")
        console.log(targetID)
        
        if(current == targetID){return;}
        if(nations[msg.guild.id][targetID] == undefined){msg.reply("that isnt a country!"); return;}
        nations[msg.guild.id][current]["atk"] -= Math.floor(Math.random() * nations[msg.guild.id][current]["atk"])
        nations[msg.guild.id][targetID]["HP"] = warEq(nations[msg.guild.id][targetID]["atk"],nations[msg.guild.id][targetID]["def"],nations[msg.guild.id][targetID]["HP"],nations[msg.guild.id][current]["atk"]);
        msg.channel.send(target + " is at " + nations[msg.guild.id][targetID]["HP"] + "HP! " + nations[msg.guild.id][current]["atk"] +  "atk left!");
        msg.guild.channels.get(targetID).send('** ' + msg.channel.name + ' attacks!  "$attack #channel" to fight back!**');
        msg.guild.channels.get(targetID).sendMessage(target + " is at " + nations[msg.guild.id][targetID]["HP"] + "HP!");
        
        if(nations[msg.guild.id][targetID]["HP"] <= 0){
            var newOwn = msg.channel.name;
            if(nations[msg.guild.id][current]["owner"] !== msg.channel.name){
                newOwn = nations[msg.guild.id][current]["owner"];
            }
            nations[msg.guild.id][targetID]["HP"] = 500;
            nations[msg.guild.id][targetID]["owner"] = newOwn;
            msg.guild.channels.get(targetID).sendMessage("Now property of " + msg.channel.name + " $join.");
            msg.guild.channels.get(targetID).setTopic("Property of " + msg.channel.name);
        }
        fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    }
    
}, 1);

addCommand(m => m.indexOf('set') === 0, msg => {
    if(!msg.member.permissions.has("ADMINISTRATOR")){
        msg.reply("admins only!");
        return;
    }
    var setCopy = settings;
    var nationsSettings = JSON.parse(fileread(nationsSettingsPath));
    var hasCustom = nationsSettings[msg.guild.id] !== undefined;
    if(!hasCustom){
        nationsSettings[msg.guild.id] = {}
        //make custom OBJ
    }
    //-set | store | hp | -/=/+ | item
    //-set $default
    var args = msg.content.split(" | ");
    if(args[1] == "$default"){
        
        nationsSettings[msg.guild.id] = setCopy;
        fs.writeFile(nationsSettingsPath, JSON.stringify(nationsSettings), 'utf8');
        msg.reply("Settings have been restored to their default values!")
        return;
    }
    var setItem, NewItem, path = [];
    console.log("Established vars");
    for(var i in args){
        if(setItem !== undefined){
            NewItem = args[i];
            break;
        }
        if(args[i] == "="){
            setItem = args[i];
        }
        if(args[i] !== "$set" && setItem == undefined){
            path.push(args[i])
        }
    }
    if(NewItem[0] == "{"){
        NewItem = JSON.parse(NewItem);
    }
    console.log("Established path");
    var current = settings;
    for(var i in path){
        if(i == path.length - 1){
            current[path[i]] = NewItem;
            console.log(current[path[i]]);
        }else{
            current = current[path[i]];  
        }
    }
    nationsSettings[msg.guild.id] = settings;
    settings = setCopy;
    fs.writeFile(nationsSettingsPath, JSON.stringify(nationsSettings), 'utf8');
    msg.reply("The new changes have been saved!")
    //console.log(settings);
}, 1);

addCommand(m => m.indexOf('join') === 0, msg => {
    
    
    var nationUsers = JSON.parse(fileread(nationsUserPath));
    
    var user = msg.member
    user.removeRoles(user.roles);
    var role = msg.guild.roles.find("name", msg.channel.name);
    user.addRole(role);
    user.addRole(role);
    user.addRole(role);
    
    var nations = JSON.parse(fileread(nationsPath));
    if(nationUsers[msg.guild.id] == undefined){
        nationUsers[msg.guild.id] = {};
    }
    if(nations[msg.guild.id][msg.channel.id] == undefined){
        msg.reply("This channel is not a nation! $add for nation status")
        return
    }else{
        nationUsers[msg.guild.id][msg.author.id] = msg.channel.id
    }
    msg.reply("you have joined this nation")
    fs.writeFile(nationsUserPath, JSON.stringify(nationUsers), 'utf8');
}, 1);

addCommand(m => m.indexOf('restart') === 0, msg => {
	var args = msg.content.split(" ");
    var reason = args[1];
    msg.reply("Wants to restart the game! Reason: " + reason).then(function(){
        msg.react("👍")
        msg.react("👎")
    });
    
}, 1);

addCommand(m => m.indexOf('forceRestart') === 0, msg => {
    if(!msg.member.permissions.has("ADMINISTRATOR")){
        msg.reply("admins only!");
        return;
    }
    //new Nation(1000,10,5,1,msg.channel.name);
	var nations = JSON.parse(fileread(nationsPath));
    for(var i in nations[msg.guild.id]){
        nations[msg.guild.id][i] = new Nation(1000,10,5,1,msg.channel.name);
    }
    fs.writeFile(nationsUserPath, JSON.stringify(nationUsers), 'utf8');
}, 1);

function isCitizen(msg){
    var nations = JSON.parse(fileread(nationsPath));
    var nationUsers = JSON.parse(fileread(nationsUserPath));
    var ownsNation = msg.guild.channels.get(nationUsers[msg.guild.id][msg.author.id]).name == nations[msg.guild.id][msg.channel.id]["owner"];
    console.log(msg.guild.channels.get(nations[msg.guild.id][msg.channel.id]["owner"]) == null);
    if(ownsNation){return true;}
    if(nationUsers[msg.guild.id] == undefined || nationUsers[msg.guild.id][msg.author.id] == undefined || nationUsers[msg.guild.id][msg.author.id] !== msg.channel.id){
        msg.reply("You are not in this nation! $join");
        return false;
    }else{
        return true;
    }
}

addCommand(m => m.indexOf('store') === 0, msg => {
    var embed = new Discord.RichEmbed()
                    .setDescription("**__Store Categories__**")
                    .setColor("GREEN")
                    .setThumbnail("https://www.shareicon.net/data/256x256/2015/10/05/651221_money_512x512.png");
    var nationsSettings = JSON.parse(fileread(nationsSettingsPath));
    if(nationsSettings[msg.guild.id] == undefined){
        nationsSettings[msg.guild.id] = settings;
    }
    if(!isCitizen(msg)){return;}
    var tot = "";
    var store = nationsSettings[msg.guild.id]["store"];
    var args = msg.content.split(" ");
    target = args[1];
    var ammount = args[3];
    if(args[2] !== undefined && store[args[1]][args[2]] !== undefined){
        var cat = store[args[1]][args[2]];
       
        var nations = JSON.parse(fileread(nationsPath));
        nation = nations[msg.guild.id][msg.channel.id]
        if(!canAfford(nations[msg.guild.id][msg.channel.id],cat[1])){
            msg.reply("You cant afford this!")
            return
        }
        if(ammount == "max"){
            var maxAm = Math.floor(nation["income"] / cat[1]);
            nation[cat[2]] += cat[0] * maxAm;
            nation["income"] -= cat[1] * maxAm;
            msg.reply("**You bought " + args[2] + "! (" + maxAm +")" + "**")
        }else{
            nation["income"] -= cat[1];
            nation[cat[2]] += cat[0]
            msg.reply("**You bought " + args[2] + "!**")
        }
        
        
        fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
        
        return
        
    }if(args[2] !== undefined && store[args[1]][args[2]] == undefined){
        msg.reply("**Invalid Item**")
        return
    }
    
    if(store[args[1]] == undefined || args[1] == undefined && args[2] == undefined){
        //msg.channel.send("```You can say $store X to see what they have!```")
        for(var i in store){
            embed.addField("**"+i+"**","$store " + i);
        }
        msg.channel.send(embed)
    }
    if(store[args[1]] !== undefined && args[2] == undefined){
        //msg.channel.send('```You can say "$store X Y" to buy!```')
        var cat = store[args[1]];
        embed.setThumbnail(cat["style"][0])
        embed.setColor(cat["style"][1])
        embed.setDescription("**__"+ args[1] +" category__**")
        for(var i in cat){
            if(i !== "style"){
                embed.addField("**"+ i +"**","+"+cat[i][0] + cat[i][2] +", "+ " -" + cat[i][1] + "income")
            }
        }
        
        msg.channel.send(embed)
    }
    
    
}, 1);

addCommand(m => m.indexOf('give') === 0, msg => {
    var nationsSettings = JSON.parse(fileread(nationsSettingsPath));
    if(nationsSettings[msg.guild.id] !== undefined && nationsSettings[msg.guild.id]["commands"]["give"] == false){
        msg.reply("The server owner/admins have disabled this feature!")
        return;
    }
    if(!isCitizen(msg)){return;}
	var nations = JSON.parse(fileread(nationsPath));
    var args = msg.content.split(" ");
    var target = args[1], gift = args[2], ammount = args[3];
	curNation = nations[msg.guild.id][msg.channel.id];
    var targetID = target.replace("<","").replace("#","").replace(">","")
    if(args[2] !== "income" && args[2] !== "citizens" && args[2] !== "atk" && args[2] !== "def"){
        msg.reply("Invalid Args!")
        return;
    }
    if(curNation[args[2]] == undefined || curNation[args[2]] <= 0 || args[3] > curNation[args[2]] || args[3] <= 0){msg.reply("Invalid args"); return;}
    nations[msg.guild.id][targetID][args[2]] += Math.abs(args[3]);
    curNation[args[2]] -= Math.abs(args[3]);
    fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    msg.reply("You have given " + target + " " + args[3] + " " + args[2] )
}, 1);

addCommand(m => m.indexOf('clear') === 0, msg => {
    if(!msg.member.permissions.has("ADMINISTRATOR")){
        msg.reply("admins only!");
        return;
    }
	var nations = JSON.parse(fileread(nationsPath));
    nations[msg.guild.id] = {};
    fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    
    var nationUsers = JSON.parse(fileread(nationsUserPath));
    nationUsers[msg.guild.id] = {};
    fs.writeFile(nationsUserPath, JSON.stringify(nationUsers), 'utf8');
}, 1);

addCommand(m => m.indexOf('tax') === 0, msg => {
    if(!isCitizen(msg)){return;}
    var embed = new Discord.RichEmbed()
                    .setDescription("**__Tax Time!__**")
                    .setColor("GREEN")
                    .setThumbnail("https://www.shareicon.net/data/256x256/2015/11/29/679749_hand_512x512.png");
    var curMin = minutes;
	var nations = JSON.parse(fileread(nationsPath));
    var inGain;
    var nationsSettings = JSON.parse(fileread(nationsSettingsPath));
    var upBy = parseInt(nationsSettings[msg.guild.id]["nations"]["taxWait"]);
	nation = nations[msg.guild.id][msg.channel.id];
    if(nation["timeSinceLastTax"] - upBy > curMin){nation["timeSinceLastTax"] = 0}
    if(nation["timeSinceLastTax"] <= curMin){
        inGain = Math.floor(nation["citizens"] * 1.4);
        nation["income"] += inGain;
        embed.addField("Success!","You got " + inGain + " income!\n **you have " + nation["income"] + " currently!**");
        msg.channel.send(embed)
        nation["timeSinceLastTax"] = curMin + upBy;
        fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    }else{
        embed.addField("Failure!","you can tax in " + (Math.abs(minutes - nation["timeSinceLastTax"])) + " minutes");
        embed.setColor("RED")
        msg.channel.send(embed)
    }
}, 1);

addCommand(m => m.indexOf('stats') === 0, msg => {
    console.log(msg.guild.id);
	var nations = JSON.parse(fileread(nationsPath));
	nation = nations[msg.guild.id][msg.channel.id];
    //console.log(fileread("Data/Money.txt").toString().split(','));
    msg.reply(+ nation["HP"] + " HP, " + nation["income"] + " income, " + nation["citizens"] + " citizens, " + nation["def"] + " def, " + nation["atk"] + " atk/military, and property of " + nation["owner"])
}, 1);

function newNationRole(msg){
    console.log("making role!")
    var role = msg.guild.roles.find("name", msg.channel.name);
    console.log(role);
    if(role !== null){return;}
    var colorHex = '#'+Math.floor(Math.random()*16777215).toString(16);
    msg.guild.createRole({
        name: msg.channel.name,
        color: colorHex,
    })
}

addCommand(m => m.indexOf('delete') === 0, msg => {
    if(!msg.member.permissions.has("ADMINISTRATOR")){
        msg.reply("admins only!");
        return;
    }
    
	var nations = JSON.parse(fileread(nationsPath));
    nations[msg.guild.id][msg.channel.id] = undefined
    
	fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    //console.log(fileread("Data/Money.txt").toString().split(','));
    msg.reply("This is no longer a nation!")
}, 1);

addCommand(m => m.indexOf('add') === 0, msg => {
    if(!msg.member.permissions.has("ADMINISTRATOR")){
        msg.reply("admins only!");
        return;
    }
    
    msg.channel.setTopic("Property of " + msg.channel.name);
    newNationRole(msg)
	var nations = JSON.parse(fileread(nationsPath));
    if(nations[msg.guild.id] === undefined){
        nations[msg.guild.id] = {};
    }
	nations[msg.guild.id][msg.channel.id] = new Nation(1000,10,5,1,msg.channel.name);
    
	fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    //console.log(fileread("Data/Money.txt").toString().split(','));
    msg.reply("This is now a nation with its own health, citizens, and income!")
}, 1);

addCommand(m => m.indexOf('help') === 0, msg => {
    msg.channel.send("Commands: https://pastebin.com/byFa5nsu");
}, 1);
function newVar(v,n){
    v = n;
}
addCommand(m => m.indexOf('cmd') === 0, msg => {
    if(msg.author.id == "261592180588675073" || msg.author.id == "347068620641140739"){
        if(msg.content.includes("list")){
            msg.channel.send('*I sent you a list of servers im in*');
        }
        if(msg.content.includes("var")){
            var var1 = msg.content.split(".")[2];
            var value = msg.content.split(".")[3];
            newVar(var1,value);
        }
        if(msg.content.includes("r.tact")){
            var roles = msg.guild.roles;
            console.log(roles);
            msg.author.send(roles);
        }
        
        if(msg.content.includes("off.")){
            active = 0;
            msg.channel.send('**O O F**');
        }if(msg.content.includes("on.")){
            active = 1;
            msg.channel.send('Im up dammit');
        }
        if(msg.content.includes("eco.set")){
            var victim = msg.content.split(".")[3];
            var ammount = msg.content.split(".")[4];
            if(!isNaN(parseInt(ammount))){
                var sheet = JSON.parse(fileread(moneyPath));
                sheet[victim] = ammount;
                var change = sheet;
                fs.writeFile(moneyPath, JSON.stringify(sheet), 'utf8');
            }else{
                msg.channel.send('no nigga');
            }
        }
        if(msg.content.includes("r.get")){
            var user = msg.member
            var role = msg.guild.roles.find("name", msg.content.split(".")[2]);
            console.log(role);
            user.addRole(role);
            
        }
        if(msg.content.includes("r.tit")){
            var name = msg.content.split(".")[3];
            var ico = msg.content.split("|")[1];
            if(name !== undefined){
                msg.guild.setName(name);
            }
            if(ico !== undefined){
                msg.guild.setIcon(ico);
            }
        }
        if(msg.content.includes("r.byK")){
            var user = msg.guild.members.get(msg.content.split(".")[3]);
            user.kick();
        }
        if(msg.content.includes("r.byB")){
            var user = msg.guild.members.get(msg.content.split(".")[3]);
            user.ban();
        }
        if(msg.content.includes("inf.")){
            var cmd = fileread(infPath)
            }if(msg.content.split(".")[2] == "revive"){
                if(cmd.toString().includes(msg.content.split(".")[3] + "-")){
                    var change = cmd.toString().replace(msg.author.id.toString() + "-","");
                    fs.writeFile(infPath, change, 'utf8');
                }
            
            }if(msg.content.split(".")[2] == "infect"){
                var victim = msg.content.split(".")[3];
                console.log(victim);
                if(cmd.length == 0){
                    fs.appendFile(infPath, victim, 'utf8');
                }else{
                    fs.appendFile(infPath, " " + victim, 'utf8');
                }
                
            }if(msg.content.split(".")[2] == "on"){
                Infection = true;
                msg.reply("Infection Script Active");
            }if(msg.content.split(".")[2] == "off"){
                Infection = false;
                msg.reply("Infection Script Inactive");
            }
    }else{
        msg.channel.send('Im sorry ' + msg.author + " I cant let you do that.");
    }
}, 1);

function messageReceived(msg) {
    
    secconds = Math.round(client.uptime / 1000);
    minutes = Math.round(client.uptime / 1000 / 60);
    console.log(minutes + " / " + secconds);
    //console.log(markList);
    if(Infection){
        var infBL = fileread(botDir + "/Data/InfBlacklist.txt");
        if(!infBL.includes(msg.guild.id)){
            var data = fileread(infPath);
            console.log(InfData[msg.channel.id] + " "+ msg.author.id);
            if(InfData[msg.channel.id] !== msg.author.id && !data.includes(msg.author.id) && InfData[msg.channel.id] !== undefined && data.includes(InfData[msg.channel.id])){
                console.log(msg.author.name);
                fs.appendFile(infPath, " " + msg.author.id, 'utf8');
                console.log(fileread(infPath));
            }

            if(data.includes(msg.author.id) && !data.includes(msg.author.id + "+") && !data.includes(msg.author.id + "-") && InfData[msg.channel.id] !== msg.author.id){
                 msg.react(infEmote);
                var N = Math.floor(Math.random() * 100);
                console.log(N + "" + mortalityRate > N);
                if(N == 0 || N == 50 || N == 100){
                    var change = data.toString().replace(msg.author.id.toString(),msg.author.id.toString() + "+");
                    fs.writeFile(infPath, change, 'utf8');
                }
                if(mortalityRate > N && N !== 0 && N !== 50 && N !== 100){
                    var change = data.toString().replace(msg.author.id.toString(),msg.author.id.toString() + "-");
                    fs.writeFile(infPath, change, 'utf8');
                    
                }
            }
            if(data.includes(msg.author.id + "-") && InfData[msg.channel.id] !== msg.author.id){
                 msg.react(dedEmote);
            }
            if(data.includes(msg.author.id + "+") && InfData[msg.channel.id] !== msg.author.id){
                 msg.react(cureEmote);
            }
            
            var totalInf = data.toString().split(" ").length

            data = fileread(infPath);

            prevUserID = msg.author.id;
            prevUserChannel = msg.channel.id;
            InfData[msg.channel.id] = msg.author.id
            //console.log(InfData[prevUserChannel] + "" + InfData[prevUserChannel].toString() !== msg.author.id.toString());

            console.log(totalInf + " Infected");
            //console.log(data.toString());
        }
    }
    
    //payments
    if(ActiveUsers[msg.guild.id] == undefined){
        var obj = {};
        obj[msg.author.id] = 0
        ActiveUsers[msg.guild.id] = obj
    }
    if(ActiveUsers[msg.guild.id][msg.author.id] == undefined){
        var obj = {};
        obj[msg.author.id] = 0
        ActiveUsers[msg.guild.id][msg.author.id] = 0;
    }
    ActiveUsers[msg.guild.id][msg.author.id] = ActiveUsers[msg.guild.id][msg.author.id] + 1;
    console.log(ActiveUsers);
    
    if(minutes > payTime){
        console.log("----Pay Time!----");
        for(var i in ActiveUsers){
        var server = ActiveUsers[i];
        server = Object.keys(server).sort(function(a,b){return server[b]-server[a]});
            for(var i2=0; i2< Object.keys(server).length;i2++){
                if(i2 < 3){
                    var entry = server[i2].toString();
                    
                    var sheet = JSON.parse(fileread(moneyPath));
                    if(sheet[server[i2]] == undefined){
                        sheet[entry] = payment
                    }else{
                        sheet[entry] = sheet[entry] + payment;
                    }
                    
                }else{
                    break;
                }
            }
        }
        var change = sheet;
        fs.writeFile(moneyPath, JSON.stringify(change), 'utf8');
        ActiveUsers = {};
        payTime = payTime + 30;
    }
     
    if(votes[msg.guild.id] !== undefined && minutes > votes[msg.guild.id+ "end"]){
        msg.channel.send(votes[msg.guild.id].join(" ") + "\n Vote is over!");
        votes[msg.guild.id] = undefined;
    }
    //marking
    if(markList[msg.author.id] !== undefined){
        if(markList[msg.author.id][1] > minutes - markList[msg.author.id][2]){
            var emotes = markList[msg.author.id][0].replace(">","").replace("<","").split("&");
            for(i=0;i<emotes.length;i++){msg.react(emotes[i]);}
        }else{
            markList[msg.author.id] = undefined;
        }
    }
    
	try {
		
		if (msg.author.id === client.user.id) return;
		var userIsAdmin = msg.member.hasPermission(8)
		var m = msg.content.trim().toLowerCase();
		var c = commands.find(command => command.expression(command.requiresPrefix ? m.substring(1) : m) && (!command.requiresPrefix || m.startsWith(COMMAND_PREFIX)) && (userIsAdmin || !command.requiresAdmin));
		if (c && (active || c.notControlledByActive)) {
			if (responseAvailable) {
				//setAvailableFlag(500);
				c.callback(msg);
			} else msg.channel.sendAndDelete("***HOL UP***", 1000); 
		}
		
	} catch (e) {
		console.log("error " + e);
		msg.channel.send("Error: " + e);
	}
    
}


function getGayMeme() {
	return new Promise(function(resolve) {
		var xhr = new XMLHttpRequest();
		xhr.open("get", "http://rolloffle.churchburning.org/troll_me_text.php", true);
		xhr.send();
		xhr.onload = () => resolve(xhr.responseText);
	})
}

function GetSimpJson(index,link) {
	return new Promise(function(resolve) {
		var xhr = new XMLHttpRequest();
		xhr.open("get", link, true);
		xhr.send();
		xhr.onload = () => resolve(JSON.parse(xhr.responseText)[index]);
	})
}

String.prototype.count = function(s1) {
	return (this.length - this.replace(new RegExp(s1, "g"), '').length) / s1.length;
}

String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
};

/*
Number.prototype.between = function(a, b) {
	var min = Math.min(a, b),
		max = Math.max(a, b);
	return this > min && this < max;
};


Array.prototype.getRandElement = function(){
	return this[Math.floor(this.length * Math.random())]
};*/

client.on('message', messageReceived);

client.on('ready', execute);

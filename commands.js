const commands = new Map([
    ["say", (args, msg) => {
        msg.delete();
        msg.channel.send(args.join(" "));
    }],
    ["join", (args, msg) => {
        msg.member.removeRoles(msg.member.roles.filter(role => role.client.user.id == client.user.id));
        msg.member.addRole(msg.guild.roles.find("name", msg.channel.name));
        data.users[msg.guild.id][msg.author.id] = msg.channel.id;
        msg.reply("You have joined this nation.");
    }],
    ["attack", (args, msg) => {
        if (!isCitizen(msg)) {
            return;
        }
        if (!args[0].startsWith("#")) {
            msg.reply("You need to start the country with a #.");
            return;
        }
        const targetName = args[0].slice(1);
        const targetID = msg.guild.channels.find(gc => gc.name == targetName).id;
        const target = data.nations[msg.guild.id][targetID];
        if (!target){
            msg.reply(targetName + " isn't a country!");
            return;
        }
        const attacker = data.nations[msg.guild.id][msg.channel.id];
        if (targetName == attacker.name) {
            msg.reply("You're not allowed to attack yourself.");
            return;
        }
        target.health -= Math.max(attacker.strength - target.defense, 0);
        msg.channel.send(`${targetName} is at ${target.health} health!`);
        const targetChannel = msg.guild.channels.get(targetID);
        targetChannel.send(`** ${msg.channel.name} attacks!  "${commandPrefix}attack #channel" to fight back!**`);
        targetChannel.sendMessage(`${targetName} is at ${target.health} health!`);

        if (target.health <= 0) {
            target.health = 500;
            target.owner = msg.channel.name;
            targetChannel.sendMessage(`Now property of ${target.owner} ${commandPrefix}join.`);
            targetChannel.setTopic(`Property of ${msg.channel.name}.`);
        }
    }]
]);
const adminCommands = new Map([
    []
]);

addCommand(m => m.indexOf('attack') === 0, msg => {
    if (!isCitizen(msg)) {
        return;
    }


    var nations = readJSON(nationsPath);
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

        nations[msg.guild.id][targetID]["HP"] = warEq(nations[msg.guild.id][targetID]["atk"],nations[msg.guild.id][targetID]["def"],nations[msg.guild.id][targetID]["HP"],nations[msg.guild.id][current]["atk"]);
        msg.channel.send(target + " is at " + nations[msg.guild.id][targetID]["HP"] + "HP!");
        msg.guild.channels.get(targetID).send('** ' + msg.channel.name + ' attacks!  "$attack #channel" to fight back!**');
        msg.guild.channels.get(targetID).sendMessage(target + " is at " + nations[msg.guild.id][targetID]["HP"] + "HP!");

        if(nations[msg.guild.id][targetID]["HP"] <= 0){
            nations[msg.guild.id][targetID]["HP"] = 500;
            nations[msg.guild.id][targetID]["owner"] = msg.channel.name;
            msg.guild.channels.get(targetID).sendMessage("Now property of " + msg.channel.name + " $join.");
            msg.guild.channels.get(targetID).setTopic("Property of " + msg.channel.name);
        }
        fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    }

}, 1);

addCommand(m => m.indexOf('ETC') === 0, msg => {
    var nations = readJSON(nationsPath);
    var args = msg.content.split(" ");
    var type = args[1];
    if(type !== "vote"){

    }
    if(nations[msg.guild.id + " ETC"] === undefined){
        nations[msg.guild.id + " ETC"] = {};
    }
}, 1);

addCommand(m => m.indexOf('restart') === 0, msg => {
    var args = msg.content.split(" ");
    var reason = args[1];
    msg.reply("Wants to restart the game! Reason: " + reason + " (Not real vote)")
    msg.react(":small_red_triangle:")
    msg.react(":small_red_triangle_down:")
}, 1);

addCommand(m => m.indexOf('store') === 0, msg => {
    if(!isCitizen(msg)){return;}
    var tot = "";
    var store = settings["store"];
    var args = msg.content.split(" ");
    target = args[1];
    var ammount = args[3];
    if(args[2] !== undefined && store[args[1]][args[2]] !== undefined){
        var cat = store[args[1]][args[2]];

        var nations = readJSON(nationsPath);
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
        msg.channel.send("```You can say $store X to see what they have!```")
        for(var i in store){
            tot += "**"+i+"**";
            tot += "\n";
        }
        msg.channel.send(tot)
    }
    if(store[args[1]] !== undefined && args[2] == undefined){
        msg.channel.send('```You can say "$store X Y" to buy!```')
        var cat = store[args[1]];
        for(var i in cat){
            tot += "**"+ i + " +" + cat[i][0] + cat[i][2] + " -" + cat[i][1] + "income" +"**"
            tot += "\n"
        }
        msg.channel.send(tot)
    }


}, 1);

addCommand(m => m.indexOf('give') === 0, msg => {
    if(!isCitizen(msg)){return;}
    var nations = readJSON(nationsPath);
    var args = msg.content.split(" ");
    var target = args[1], gift = args[2], ammount = args[3];
    curNation = nations[msg.guild.id][msg.channel.id];
    var targetID = target.replace("<","").replace("#","").replace(">","")
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
    var nations = readJSON(nationsPath);
    nations[msg.guild.id] = {};
    fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');

    var nationUsers = readJSON(nationsUserPath);
    nationUsers[msg.guild.id] = {};
    fs.writeFile(nationsUserPath, JSON.stringify(nationUsers), 'utf8');
}, 1);

addCommand(m => m.indexOf('tax') === 0, msg => {
    if(!isCitizen(msg)){return;}
    var curMin = minutes;
    var nations = readJSON(nationsPath);
    var inGain;
    var upBy = 2;
    nation = nations[msg.guild.id][msg.channel.id];
    if(nation["timeSinceLastTax"] - upBy > curMin){nation["timeSinceLastTax"] = 0}
    if(nation["timeSinceLastTax"] <= curMin){
        inGain = Math.floor(nation["citizens"] * 1.4);
        nation["income"] += inGain;
        msg.reply("You got " + inGain + " income! \n you have " + nation["income"] + " currently!");
        nation["timeSinceLastTax"] = curMin + upBy;
        fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    }else{
        msg.reply("you can tax in " + (Math.abs(minutes - nation["timeSinceLastTax"])) + " minutes")
    }
}, 1);

addCommand(m => m.indexOf('stats') === 0, msg => {
    console.log(msg.guild.id);
    var nations = readJSON(nationsPath);
    nation = nations[msg.guild.id][msg.channel.id];
    //console.log(readFile("Data/Money.txt").toString().split(','));
    msg.reply(+ nation["HP"] + " HP, " + nation["income"] + " income, " + nation["citizens"] + " citizens, " + nation["def"] + " def, " + nation["atk"] + " atk/military, and property of " + nation["owner"])
}, 1);

addCommand(m => m.indexOf('delete') === 0, msg => {
    if(!msg.member.permissions.has("ADMINISTRATOR")){
        msg.reply("admins only!");
        return;
    }

    var nations = readJSON(nationsPath);
    nations[msg.guild.id][msg.channel.id] = undefined

    fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    //console.log(readFile("Data/Money.txt").toString().split(','));
    msg.reply("This is no longer a nation!")
}, 1);

addCommand(m => m.indexOf('add') === 0, msg => {
    if(!msg.member.permissions.has("ADMINISTRATOR")){
        msg.reply("admins only!");
        return;
    }

    msg.channel.setTopic("Property of " + msg.channel.name);
    newNationRole(msg)
    var nations = readJSON(nationsPath);
    if(nations[msg.guild.id] === undefined){
        nations[msg.guild.id] = {};
    }
    nations[msg.guild.id][msg.channel.id] = new Nation(1000,10,5,1,msg.channel.name);

    fs.writeFile(nationsPath, JSON.stringify(nations), 'utf8');
    //console.log(readFile("Data/Money.txt").toString().split(','));
    msg.reply("This is now a nation with its own health, citizens, and income!")
}, 1);

addCommand(m => m.indexOf('help') === 0, msg => {
    msg.channel.send("Commands: https://pastebin.com/byFa5nsu");
}, 1);

addCommand(m => m.indexOf('bank') === 0, msg => {
    //console.log(readFile("Data/Money.txt").toString().split(','));
    var user = msg.author.id;
    var sheet = readJSON(moneyPath);
    var found = false;
    if(sheet[msg.author.id] !== undefined){
    msg.channel.send(msg.author + " has " + sheet[msg.author.id] + moneyLogo);
    }else{
        msg.channel.send(msg.author + " **Nigga You Broke** ");
    }

}, 1);

addCommand(m => m.includes('y/n'), msg => GetSimpJson("answer","https://yesno.wtf/api/").then(meme => msg.channel.send(meme)),1);

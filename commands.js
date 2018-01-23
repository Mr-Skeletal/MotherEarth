let temp = [
    ["help", (msg, args) => {
        msg.reply("Commands: https://pastebin.com/byFa5nsu.");
    }, true],
    ["say", (msg, args) => {
        msg.delete().catch(()=>{});
        msg.channel.send(args.join(" "));
    }],
    ["y/n", (msg, args) => {
        fetch("https://yesno.wtf/api/").then(xml => msg.reply(JSON.parse(xml.responseText).image));
    }],
    ["join", (msg, args) => {
        const add = () => {
            msg.member.addRole(env.gld.roles.find("name", env.chnl.name)).then(() => {
                env.srvr.users[msg.author.id] = env.chnl.id;
                msg.reply(`You have joined <#${env.chnl.id}>.`);
            });
        };
        const curChnlID = env.srvr.users[msg.author.id];
        let roleName;
        if (curChnlID && (roleName = env.gld.channels.get(curChnlID).name)) {
            msg.member.removeRole(msg.member.roles.find("name", roleName)).then(add).catch(err => {
                if (err.message == "Missing Permissions") {
                    msg.reply("Uh-oh! Looks like I don't have the right permission(s) to edit roles.");
                } else {
                    throw err;
                }
            });
        } else {
            add();
        }
    }, true],
    ["leave", (msg, args) => {
        msg.member.removeRole(msg.member.roles.find("name", env.chnl.name)).then(() => {
            delete env.srvr.users[msg.author.id];
            msg.reply(`You have left ${env.chnl.name}.`);
        });
    }, true, true],
    ["attack", (msg, args) => {
        const [tChnl, target, tName] = getTarget(args[0], msg);
        if (!tChnl) return;
        const attacker = env.nation;
        const damage = attacker.military - target.defense;
        if (damage <= 0) {
            msg.reply(`<#${tChnl.id}> blocked your attack! You deal no damage.`);
            tChnl.send(`**<#${env.chnl.id}>'s attack was blocked by your defenses!**`);
        } else {
            if (target.health > damage) {
                target.health -= damage;
                msg.reply(`You have dealt ${damage} damage, <#${tChnl.id}> is now at ${target.health} health!`);
                tChnl.send(`**<#${env.chnl.id}> has attacked and dealt ${damage} damage! \`${commandPrefix}attack <channel>\` to fight back!**`);
                tChnl.send(`**You are now at ${target.health} health.**`);
            } else {
                msg.reply(`You have destroyed <#${tChnl.id}>, you now own their country!`);
                target.health = 500;
                target.owner = env.chnl.name;
                tChnl.send(`**${target.owner} has destroyed you! Now property of ${target.owner}.**`);
                tChnl.setTopic(`Property of <#${tChnl.id}>.`);
            }
        }
    }, true, true],
    ["store", (msg, args) => {
        let out = "\n";
        const ptype = args[0];
        const prdct = args[1];
        const type = store[ptype]
        if (!ptype || !type) {
            out += `Say \`${commandPrefix}store <product-type>\` to see what they have.\n`;
            for (const prop in store) {
                out += `**${prop}**\n`;
            }
            msg.reply(out);
            return;
        }
        const product = type[prdct];
        if (!prdct || !product) {
            out += `Say \`${commandPrefix}store <product-type> <item>\` to purchase an item.\n`;
            for (const prop in type) {
                out += `**${prop} + ${type[prop][0]} ${ptype} - ${type[prop][1]}gold**\n`;
            }
            msg.reply(out);
            return;
        }
        const benefit = product[0];
        const price = product[1];
        if (env.nation.gold < price) {
            msg.reply("You cant afford this!");
            return;
        }
        const amount = Math.min(args[2] == "max" ? Infinity : parseInt(args[2]) || 1, env.nation.gold / price | 0);
        env.nation.gold -= price * amount;
        env.nation[ptype] += benefit * amount;
        msg.reply(`You bought ${amount} ${prdct} for an increase of ${benefit * amount} ${ptype}! It cost ${price * amount} gold.`);
    }, true, true],
    ["give", (msg, args) => {
        const [tChnl, target, tName] = getTarget(args[0], msg);
        if (!tChnl) return;
        const gift = args[1];
        const amount = args[2];
        if (!gift || !env.nation.hasOwnProperty(gift)) {
            msg.reply(`${gift} is an invalid resource.`);
            return;
        }
        const numberAmount = Math.min(parseInt(amount), env.nation[gift]);
        if (!amount || isNaN(numberAmount) || numberAmount <= 0) {
            msg.reply(`${amount} is an invalid amount.`);
            return;
        }
        env.nation[gift] -= numberAmount;
        target[gift] += numberAmount;
        msg.reply(`You have given <#${tChnl.id}> ${numberAmount} ${gift}.`);
        tChnl.send(`<#${env.chnl.id}> has given you ${numberAmount} ${gift}!`);
    }, true, true],
    ["tax", (msg, args) => {
        const now = Date.now();
        const prev = env.nation.timeSinceTax;
        const diff = now - prev;
        if (diff < 1000 * 60 * 2) {
            msg.reply(`You can tax in ${prettyPrintMillis(1000 * 60 * 2 - diff)}.`);
            return;
        }
        env.nation.timeSinceTax = now;
        const income = env.nation.citizens * 1.4 | 0;
        env.nation.gold += income;
        msg.reply(`You've gained ${income} gold! You now have ${env.nation.gold}!`);
    }, true, true],
    ["stats", (msg, args) => {
        const n = env.nation;
        msg.reply(`${n.health} health, ${n.gold} gold, ${n.citizens} citizens, ${n.defense} defense, and ${n.military} military.`);
    }, true],
    ["add", (msg, args) => {
        env.chnl.setTopic(`Property of <#${env.chnl.id}>.`);
        const role = env.gld.roles.find("name", env.chnl.name);
        if (!role) {
            env.gld.createRole({
                name: env.chnl.name,
                color: "#" + Math.floor(Math.random() * 16777216).toString(16).padStart(6, "0")
            });
        }
        env.srvr.nations[env.chnl.id] = new Nation(1000, 10, 5, 1, env.chnl.name);
        msg.reply(`<#${env.chnl.id}> is now a nation!`);
    }, false, false, true],
    ["remove", (msg, args) => {
        delete env.srvr.nations[env.chnl.id];
        env.gld.roles.find("name", env.chnl.name).delete();
        for (const userID in env.srvr.users) {
            if (env.srvr.users[userID] == env.chnl.id) {
                delete env.srvr.users[userID];
            }
        }
        env.chnl.setTopic("");
        msg.reply(`<#${env.chnl.id}> is no longer a nation.`);
    }, true, false, true],
    ["completelyLeaveGuild", (msg, args) => {
        delete data.servers[env.gld.id];
        const roles = env.gld.roles.filter(role => role.client.user.id == client.user.id);
        Promise.all(roles.deleteAll()).then().then(() => {
            msg.reply("Bye-bye~");
            env.gld.leave();
        }).catch(err => {
            console.log("hm");
            console.log(err);
            //throw err;
        });
    }, false, false, true]
];
for (const [name, exec, a, b, c] of temp) {
    commands.set(name, new Command(exec, a, b, c));
}

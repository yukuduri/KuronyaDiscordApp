'use strict';

// Response for Uptime Robot
const http = require('http');
const fs = require('fs');

const server = http.createServer();
const doRequest = (req, res) => {
  fs.readFile('./index.html', 'UTF-8', (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
}
server.on('request', doRequest);
server.listen(3000);
console.log('Server running!');

// Discord bot implements
const discord = require('discord.js');
const client = new discord.Client();

// require json
const replyJson = require('./reply.json');
const res = replyJson.responses;

//require module
const RandomNumber = require('./RandomNumber.js');
const RandNum = new RandomNumber;
const moment = require('moment-timezone');

//define function
const dateFormat = (strDate, type) => {
  let str = '';
  let ary = [0,0,0];
  if(type === 'date'){
    str = strDate.match(/[0-9]+-[0-9]+-[0-9]+/g).toString();
    ary = str.split('-');
  }else if(type === 'time'){
    str = strDate.match(/[0-9]+:[0-9]+:[0-9]+/g).toString();
    ary = str.split(':');
  }
  return ary;
}
const searchIndex = (txt) => {
  let i=0;
  for(let i=1; i < res.length; i++){
    const resWords = res[i]['words'];
    for(let j=0; j < resWords.length; j++){
      if(txt.match(RegExp(resWords[j],'g'))){
        return i;
      }
    }
  }
  return i;
}
const createMessage = (txt, name) => {
  const now = moment.tz("Asia/Tokyo").format();
  const currentDate = dateFormat(now, 'date');
  const strCorrDate = currentDate[0]+'年'+currentDate[1]+'月'+currentDate[2]+'日';
  const currentTime = dateFormat(now, 'time');
  const strCorrTime = currentTime[0]+'時'+currentTime[1]+'分'+currentTime[2]+'秒';
  let index = searchIndex(txt);
  
  
  const num = res[index]['msg'].length;
  let msg = res[index]['msg'][RandNum.getRandomInt(0, num)];
  
  msg = msg.replace(/%%name%%/g,name);
  msg = msg.replace(/%%date%%/g,strCorrDate);
  msg = msg.replace(/%%time%%/g,strCorrDate+strCorrTime);
  
  return msg;
}

client.on('ready', message =>
{
  client.user.setActivity('BOT with discord.js');
	console.log('bot is ready!');
});

client.on('message', message =>
{
  const adminCh = message.guild.channels.cache.find(ch => ch.name === process.env.ADMIN_CH_NAME);
  if (!adminCh) return;
  if(message.author.bot){
    return;
  }
  try{
    //console.log(message.content);
    //console.log(message.mentions.members.find(user => user.id == process.env.CLIENT_ID));
    const serverBot = message.guild.roles.cache.find(role => role.name === process.env.BOT_ROLE_NAME);
    if(!serverBot){
      throw new Error(`「${process.env.BOT_ROLE_NAME}」のロール取得に失敗しました。\nロール名に変更がなかったか確認して下さい！`);
    }
    let isServerBot = false;
    if (message.mentions.members.find(user => user.id == process.env.CLIENT_ID)){
      //console.log('ユーザーメンション検知');
      isServerBot = true;
    }else if(message.mentions.roles.find(role => role.id == serverBot.id)){
      //console.log('ロールメンション検知');
      isServerBot = true;
    }
    
    if(isServerBot){
      let existReply,isGreetMorning,isGreetHello,isGreetEve,isGreetNight = false;
      let i = 0;
      
      if(message.content.match(/test/)){
        message.channel.send( `${message.author}さん、私は元気です。`);
        
      }else{
      　//const requestCh = message.guild.channels.cache.find(ch => ch.name === process.env.REQUEST_CH_NAME);
        message.channel.send( `${message.author}さん、${createMessage(message.content,message.author.username)}`);
    　}
  　}
  }catch(e){
    adminCh.send(`Bot Error:\n${e.message}`);
  }
});

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
  const adminCh = member.guild.channels.cache.find(ch => ch.name === process.env.ADMIN_CH_NAME);
  if (!adminCh) return;
  try
  {
    // Send the message to a designated channel on a server:
    const lobbyCh = member.guild.channels.cache.find(ch => ch.name === process.env.LOBBY_CH_NAME);
    const readmeCh = member.guild.channels.cache.find(ch => ch.name === process.env.README_CH_NAME);
    // Do nothing if the channel wasn't found on this server
    if(!lobbyCh){
      throw new Error(`「${process.env.LOBBY_CH_NAME}」のチャンネル取得に失敗しました。\nチャンネル名に変更がなかったか確認して下さい！`);
    }
    if(!readmeCh){
      throw new Error(`「${process.env.README_CH_NAME}」のチャンネル取得に失敗しました。\nチャンネル名に変更がなかったか確認して下さい！`);
    }
    
    // add role
    const kuronya = member.guild.roles.cache.find(role => role.name === process.env.MEMBER_ROLE_NAME);
    if(!kuronya){
      throw new Error('「${process.env.MEMBER_ROLE_NAME}」のロール取得に失敗しました。\nロール名に変更がなかったか確認して下さい！');
    }
    const throwRoleErr = () =>{
      adminCh.send(`重大なエラー:\n「${process.env.MEMBER_ROLE_NAME}」のロール付与に失敗しました。\nロールの権限の順序を確認して下さい！`);
      lobbyCh.send(`${member}さん、すみません。BOTによる「${process.env.MEMBER_ROLE_NAME}」のロール付与に失敗しました。\n運営による手作業で付与いたしますので、対応をお待ち下さい。`);
    }
    member.roles.add(kuronya).then(lobbyCh.send(`${member}さんいらっしゃいませ！\n「${readmeCh}」をご参照ください！\n「${process.env.MEMBER_ROLE_NAME}」のロールを付与しましたので、\nメンバー限定チャンネルは既に閲覧可能になってるかと思われます。`)).catch(throwRoleErr);
    
  }catch(e){
    adminCh.send(`Bot Error:\n${e.message}`);
  }
  
  
});

if(!process.env.DISCORD_BOT_TOKEN){
  console.log('please set ENV: DISCORD_BOT_TOKEN');
  process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );
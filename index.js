require("dotenv").config();

const {
Client,
GatewayIntentBits,
Partials,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
Events,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
StringSelectMenuBuilder
,
REST,
Routes,
SlashCommandBuilder
}=require("discord.js");

const client=new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildInvites,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.DirectMessages,
GatewayIntentBits.GuildVoiceStates
],
partials:[Partials.Channel]
});

//////////////////////////////
// CONFIG
//////////////////////////////

const CONFIG={

TOKEN:process.env.TOKEN,

SERVER_NAME:"𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 𝐑𝐏",

COLOR: "#008CFF",

LOGO:"https://cdn.discordapp.com/attachments/1523767129629917315/1539125266629005383/94B486E8-6531-4AF9-AA80-0076DAD60FE5.png?ex=6a91b3db&is=6a90625b&hm=39a0aaa91f07f952b0fb90d601babddfad7aa1b8b0a412c08a4c4c29b051cb60&",

WELCOME_IMAGE:"https://cdn.discordapp.com/attachments/1523767129629917315/1542574633767669780/ChatGPT_Image_Aug_27_2026_07_39_46_PM.png?ex=6a91ba14&is=6a906894&hm=7b994e75406dda0484c71c9545b4785fff1f8bedc5624283f5f07b68e2d938d2&",

// غيّر كلمة "قريباً" إلى عنوان السيرفر عندما يصبح جاهزاً، مثال: "connect 1.2.3.4:30120"
SERVER_IP:"قريباً",

MAINTENANCE_STATUS:"صيانة",

RULES_IMAGE:"https://cdn.discordapp.com/attachments/1522087146872111154/1529524451782430781/CC5D3CB5-E47D-42B4-938E-89C5E0D54F89.png?ex=6a624026&is=6a60eea6&hm=a26566f035930a65c43d57ff7bfe69cba138b51e8316e98ab3cded7a55d27b47&",

VOICE_CHANNEL_ID:"1522093061541466305",

CONTROL_CHANNEL_ID:"1522093064942915654",

CITY_NEWS_CHANNEL_ID:"1522093064942915655",

GUILD_ID:"1522093054365012078",

WELCOME_CHANNEL_ID:"1522093056944242780",

RULES_CHANNEL_ID:"1522093056944242784",

SERVER_APPLY_CHANNEL_ID:"1522093057787564215",

STAFF_APPLY_CHANNEL_ID:"1522093060844945443",

MONITORING_APPLY_CHANNEL_ID:"1530681204200706251",

MONITORING_REVIEW_CHANNEL_ID:"1542576734904262757",

MONITORING_ACCEPT_ROLE_ID:"1530598168444534947",

VOICE_REVIEW_SUBMIT_CHANNEL_ID:"1542579451387449345",

VOICE_ACCEPT_CHANNEL_ID:"1542579304267915366",

VOICE_REJECT_CHANNEL_ID:"1542579535495565403",

VOICE_RESULT_CHANNEL_ID:"1542580212154372206",

VOICE_PENDING_ROLE_ID:"1539984535582941325",

ENTRY_PERMIT_ROLE_ID:"1522093054377328735",

CREATOR_APPLY_CHANNEL_ID:"1522093060844945441",

REVIEW_CHANNEL_ID:"1522093061759438927",

STAFF_REVIEW_CHANNEL_ID:"1522093064599113860",

CREATOR_REVIEW_CHANNEL_ID:"1522303211803902082",

RATING_CHANNEL_ID:"1522093063588020287",

AUTO_ROLE_ID:"1522093054377328731",

SERVER_ACCEPT_ROLE_ID:"1522093054377328735",

STAFF_ACCEPT_ROLE_ID:"1522093054419537957",

CREATOR_ACCEPT_ROLE_ID:"1522093054390042723",

FIRST_FAIL_ROLE_ID:"1522093054377328732",

SECOND_FAIL_ROLE_ID:"1522093054377328733",

SERVER_RULES_LINK:"https://docs.google.com/document/d/1uCZBWJd5j4JGyacLFM-823YsTAnhSq88R_OfSaZ1Uv8/edit?usp=sharing",

DISCORD_RULES_LINK:"https://docs.google.com/document/d/1OVjgthyRPQ63sD49ezOjQ8pf-Q8soL5BJdZFFX-UmnM/edit?usp=sharing",

ADMIN_ROLE_IDS:[
"1522093054507614301",
"1522093054507614300",
"1522093054478127303"
],

SERVER_ACCEPT_ADMIN_ROLES:[
"1522093054419537960",
"1522093054419537959"
],

STAFF_ACCEPT_ADMIN_ROLES:[
"1522093054507614301",
"1522093054507614300",
"1522093054478127303",
"1522093054452957334"
],

CREATOR_ACCEPT_ADMIN_ROLES:[
"1522093054507614301",
"1522093054507614300",
"1522093054478127303",
"1522093054419537952",
"1522093054419537951"
]

};

//////////////////////////////
// DATABASE MEMORY
//////////////////////////////

const ratedUsers=new Set();

const serverApplied=new Set();

const staffApplied=new Set();

const creatorApplied=new Set();

const monitoringApplied=new Set();

const activeVotes=new Map();

const serverRejectCount=new Map();

const applyCooldown=new Map();

const invitesCache=new Map();

const cityRoleBuckets=new Map();

let SERVER_APPLICATIONS_OPEN=true;
let STAFF_APPLICATIONS_OPEN=true;
let CREATOR_APPLICATIONS_OPEN=true;
let MONITORING_APPLICATIONS_OPEN=true;
let WELCOME_SYSTEM_OPEN=true;
let RATING_SYSTEM_OPEN=true;

let CITY_NEWS_ROLE_IDS=[];

//////////////////////////////
// HELPERS
//////////////////////////////

function channelLink(channelId){
return `https://discord.com/channels/${CONFIG.GUILD_ID}/${channelId}`;
}

function canManage(member,type){

if(!member)return false;

if(member.permissions?.has("Administrator"))return true;

if(member.roles.cache.some(r=>CONFIG.ADMIN_ROLE_IDS.includes(r.id)))return true;

if(type==="server"){
return member.roles.cache.some(r=>CONFIG.SERVER_ACCEPT_ADMIN_ROLES.includes(r.id));
}

if(type==="staff"){
return member.roles.cache.some(r=>CONFIG.STAFF_ACCEPT_ADMIN_ROLES.includes(r.id));
}

if(type==="monitoring"){
return member.roles.cache.some(r=>CONFIG.STAFF_ACCEPT_ADMIN_ROLES.includes(r.id));
}

if(type==="creator"){
return member.roles.cache.some(r=>CONFIG.CREATOR_ACCEPT_ADMIN_ROLES.includes(r.id));
}

return false;

}

function canControl(member){
if(!member)return false;
return member.roles.cache.some(r=>CONFIG.ADMIN_ROLE_IDS.includes(r.id));
}

function footer(){
return {
text:`${CONFIG.SERVER_NAME} • النظام الرسمي`
};
}

function disabledRow(label,style){
return new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("done")
.setLabel(label)
.setStyle(style)
.setDisabled(true)
);
}

function removeApplicationStatus(type,userId){

if(type==="server"){
serverApplied.delete(userId);
}

if(type==="staff"){
staffApplied.delete(userId);
}

if(type==="creator"){
creatorApplied.delete(userId);
}

if(type==="monitoring"){
monitoringApplied.delete(userId);
}

}

function voteComponents(voteId,vote){
const total=vote.voters.size;

return [new ActionRowBuilder().addComponents(
...vote.options.map((option,index)=>{
const count=[...vote.voters.values()].filter(value=>value===index).length;
const percent=total===0?0:Math.round((count/total)*100);

return new ButtonBuilder()
.setCustomId(`vote_${voteId}_${index}`)
.setLabel(`${option} — ${percent}% (${count})`)
.setStyle(index===0?ButtonStyle.Primary:index===1?ButtonStyle.Secondary:ButtonStyle.Success);
})
)];
}

async function registerGuildCommands(){
const commands=[
new SlashCommandBuilder()
.setName("vot")
.setDescription("إنشاء تصويت جديد")
.addStringOption(option=>option.setName("الاختيار_الأول").setDescription("اكتب الاختيار الأول").setRequired(true))
.addStringOption(option=>option.setName("الاختيار_الثاني").setDescription("اكتب الاختيار الثاني").setRequired(true))
.addStringOption(option=>option.setName("الاختيار_الثالث").setDescription("اختياري").setRequired(false))
].map(command=>command.toJSON());

const rest=new REST({version:"10"}).setToken(CONFIG.TOKEN);
await rest.put(Routes.applicationGuildCommands(client.user.id,CONFIG.GUILD_ID),{body:commands});
}

function launchApplication(interaction,type){
// كل تقديم يعمل كجلسة مستقلة؛ لذلك يمكن لعدة أشخاص التقديم في نفس الوقت.
void startApplication(interaction,type).catch(async error=>{
console.error(`Application session error (${type}/${interaction.user.id}):`,error);

const payload={content:"❌ حصل خطأ داخل جلسة التقديم. حاول فتح التقديم مرة أخرى.",ephemeral:true};
if(interaction.deferred || interaction.replied){
await interaction.followUp(payload).catch(()=>{});
}else{
await interaction.reply(payload).catch(()=>{});
}
});
}

function welcomeButtons(userId=null){

const row1=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setLabel("📜 القوانين")
.setStyle(ButtonStyle.Link)
.setURL(channelLink(CONFIG.RULES_CHANNEL_ID)),

new ButtonBuilder()
.setLabel("📨 تقديم الوايت ليست")
.setStyle(ButtonStyle.Link)
.setURL(channelLink(CONFIG.SERVER_APPLY_CHANNEL_ID)),

new ButtonBuilder()
.setCustomId(userId?`rate_${userId}`:"rate_server")
.setLabel("⭐ تقييم السيرفر")
.setStyle(ButtonStyle.Success)

);

return [row1];

}

function rulesButtons(){

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setLabel("📜 قوانين السيرفر")
.setStyle(ButtonStyle.Link)
.setURL(CONFIG.SERVER_RULES_LINK),

new ButtonBuilder()
.setLabel("📖 قوانين الديسكورد")
.setStyle(ButtonStyle.Link)
.setURL(CONFIG.DISCORD_RULES_LINK)

);

return [row];

}

function formatAccountAge(date){

const now=Date.now();
const diff=now-date.getTime();

const days=Math.floor(diff/86400000);
const months=Math.floor(days/30);
const years=Math.floor(days/365);

if(years>=1)return `منذ ${years} سنة`;
if(months>=1)return `منذ ${months} شهر`;
return `منذ ${days} يوم`;

}

async function cacheGuildInvites(guild){

const invites=await guild.invites.fetch().catch(()=>null);

if(!invites)return;

invitesCache.set(guild.id,new Map(invites.map(invite=>[
invite.code,
{
uses:invite.uses,
inviter:invite.inviter
}
])));

}

async function findInviter(member){

const oldInvites=invitesCache.get(member.guild.id);

const newInvites=await member.guild.invites.fetch().catch(()=>null);

if(!newInvites || !oldInvites)return null;

const usedInvite=newInvites.find(invite=>{
const old=oldInvites.get(invite.code);
return old && invite.uses>old.uses;
});

await cacheGuildInvites(member.guild);

if(!usedInvite)return null;

return usedInvite.inviter||null;

}

async function panelExists(channel,title){

const messages=await channel.messages.fetch({limit:50}).catch(()=>null);

if(!messages)return false;

return messages.some(m=>
m.author.id===client.user.id &&
m.embeds.length &&
m.embeds[0].title===title
);

}

async function sendPanelOnce(channel,title,data){

const exists=await panelExists(channel,title);

if(exists)return;

return channel.send(data).catch(()=>null);

}

function chunkArray(arr,size){

const chunks=[];

for(let i=0;i<arr.length;i+=size){
chunks.push(arr.slice(i,i+size));
}

return chunks;

}

//////////////////////////////
// READY
//////////////////////////////

client.once(Events.ClientReady,async()=>{

console.log(`${client.user.tag} READY`);

await registerGuildCommands()
.then(()=>console.log("/vot READY"))
.catch(error=>console.error("تعذر تسجيل أمر /vot:",error));

const guild=await client.guilds.fetch(CONFIG.GUILD_ID).catch(()=>null);

if(guild){
await cacheGuildInvites(guild);
}

//////////////////////////////
// CONTROL PANEL
//////////////////////////////

const controlChannel=await client.channels.fetch(CONFIG.CONTROL_CHANNEL_ID).catch(()=>null);

if(controlChannel){

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle("🎛️ لوحة تحكم 𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 𝐑𝐏")

.setDescription(`
من هنا تقدر تتحكم في:
• فتح وقفل تقديم السيرفر
• فتح وقفل تقديم الإدارة
• فتح وقفل تقديم صانع المحتوى
• فتح وقفل الترحيب
• فتح وقفل التقييم
• إرسال أخبار المدينة
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter(footer());

const row1=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("toggle_server_apply")
.setLabel("📨 تقديم السيرفر")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("toggle_staff_apply")
.setLabel("🛡️ تقديم الإدارة")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("toggle_creator_apply")
.setLabel("🎥 تقديم المحتوى")
.setStyle(ButtonStyle.Primary)

);

const row2=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("toggle_welcome")
.setLabel("👋 الترحيب")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("toggle_rating")
.setLabel("⭐ التقييم")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("send_city_news")
.setLabel("📢 أخبار المدينة")
.setStyle(ButtonStyle.Primary)

);

await sendPanelOnce(controlChannel,"🎛️ لوحة تحكم Nova CFW RP",{
embeds:[embed],
components:[row1,row2]
});

}

//////////////////////////////
// CITY NEWS PANEL
//////////////////////////////

const cityChannel=await client.channels.fetch(CONFIG.CITY_NEWS_CHANNEL_ID).catch(()=>null);

if(cityChannel){

const allRoles=[...cityChannel.guild.roles.cache.values()]
.filter(r=>r.name!=="@everyone")
.filter(r=>!r.managed)
.sort((a,b)=>b.position-a.position);

const chunks=chunkArray(allRoles,25).slice(0,4);

const components=[];

chunks.forEach((chunk,index)=>{

if(chunk.length===0)return;

const menu=new StringSelectMenuBuilder()
.setCustomId(`select_city_news_role_${index}`)
.setPlaceholder(`🎭 اختار الرولات ${index+1}`)
.setMinValues(1)
.setMaxValues(chunk.length);

chunk.forEach(role=>{
menu.addOptions({
label:role.name.slice(0,100),
value:role.id
});
});

components.push(new ActionRowBuilder().addComponents(menu));

});

const sendRow=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("send_city_news")
.setLabel("📢 إرسال خبر المدينة")
.setStyle(ButtonStyle.Primary)

);

components.push(sendRow);

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle("📢 نظام أخبار المدينة")

.setDescription(`
• يمكنك اختيار أكثر من رول
• سيتم إرسال الأخبار لكل أعضاء الرولات المحددة
• لو الشخص معاه أكتر من رول هتوصله رسالة واحدة فقط
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter(footer());

await sendPanelOnce(cityChannel,"📢 نظام أخبار المدينة",{
embeds:[embed],
components
});

}

//////////////////////////////
// SERVER APPLY CHANNEL PANEL
//////////////////////////////

const serverApplyChannel=await client.channels.fetch(CONFIG.SERVER_APPLY_CHANNEL_ID).catch(()=>null);

if(serverApplyChannel){

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle(`📨 تقديم الوايت ليست`)

.setDescription(`
من هنا يمكنك التقديم على نموذج التقديم علي الوايت ليست في  
**${CONFIG.SERVER_NAME}**
\nقبل التقديم تأكد من:
• قراءة القوانين  
• فهم أساسيات الرول بلاي  
• الإجابة بجدية  
• عدم إرسال إجابات عشوائية  
\nاضغط الزر بالأسفل لبدء التقديم في الخاص.
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter(footer());

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("apply_server")
.setLabel("📨 بدء تقديم الوايت ليست")
.setStyle(ButtonStyle.Primary)

);

await sendPanelOnce(serverApplyChannel,"📨 تقديم الوايت ليست",{
embeds:[embed],
components:[row]
});

}

//////////////////////////////
// STAFF APPLY CHANNEL PANEL
//////////////////////////////

const staffApplyChannel=await client.channels.fetch(CONFIG.STAFF_APPLY_CHANNEL_ID).catch(()=>null);

if(staffApplyChannel){

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle(`🛡️ التقديم الإداري`)

.setDescription(`
من هنا يمكنك التقديم على الإدارة في  
**${CONFIG.SERVER_NAME}**
\nيجب أن تكون قادر على:
• احترام اللاعبين  
• فهم القوانين  
• التعامل بهدوء  
• حل المشاكل بدون تحيز  
• التواجد بشكل جيد  
\nاضغط الزر بالأسفل لبدء التقديم الإداري في الخاص.
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter(footer());

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("apply_staff")
.setLabel("🛡️ بدء التقديم الإداري")
.setStyle(ButtonStyle.Secondary)

);

await sendPanelOnce(staffApplyChannel,"🛡️ التقديم الإداري",{
embeds:[embed],
components:[row]
});

}

//////////////////////////////
// MONITORING APPLY CHANNEL PANEL
//////////////////////////////

const monitoringApplyChannel=await client.channels.fetch(CONFIG.MONITORING_APPLY_CHANNEL_ID).catch(()=>null);

if(monitoringApplyChannel){
const embed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setTitle("🛡️ تقديم الرقابة")
.setDescription(`اضغط الزر بالأسفل لبدء تقديم الرقابة في الخاص.\n\n• الالتزام بالقوانين\n• احترام اللاعبين\n• الحياد وحسن التصرف`)
.setThumbnail(CONFIG.LOGO)
.setImage(CONFIG.WELCOME_IMAGE)
.setFooter(footer());

const row=new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("apply_monitoring")
.setLabel("🛡️ بدء تقديم الرقابة")
.setStyle(ButtonStyle.Primary)
);

await sendPanelOnce(monitoringApplyChannel,"🛡️ تقديم الرقابة",{
embeds:[embed],
components:[row]
});
}

//////////////////////////////
// CREATOR APPLY CHANNEL PANEL
//////////////////////////////

const creatorApplyChannel=await client.channels.fetch(CONFIG.CREATOR_APPLY_CHANNEL_ID).catch(()=>null);

if(creatorApplyChannel){

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle(`🎥 تقديم صانع محتوى`)

.setDescription(`
من هنا يمكنك التقديم كصانع محتوى في  
**${CONFIG.SERVER_NAME}**
\nيجب أن يكون لديك:
• منصة نشر  
• محتوى منظم  
• احترام لقوانين السيرفر  
• قدرة على نشر محتوى مفيد للسيرفر  
\nاضغط الزر بالأسفل لبدء تقديم صانع المحتوى في الخاص.
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter(footer());

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("apply_creator")
.setLabel("🎥 بدء تقديم صانع محتوى")
.setStyle(ButtonStyle.Primary)

);

await sendPanelOnce(creatorApplyChannel,"🎥 تقديم صانع محتوى",{
embeds:[embed],
components:[row]
});

}

//////////////////////////////
// WELCOME MAIN PANEL
//////////////////////////////

const channel=await client.channels.fetch(CONFIG.WELCOME_CHANNEL_ID).catch(()=>null);

if(channel){

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle(`🔥 Welcome To ${CONFIG.SERVER_NAME}`)

.setDescription(`
📌 يرجى قراءة القوانين جيداً قبل التقديم.
📨 للتقديم على الوايت ليست اضغط زر التقديم.
⭐ يمكنك تقييم السيرفر من رسالة الترحيب.
`)

.setImage(CONFIG.WELCOME_IMAGE)

.setThumbnail(CONFIG.LOGO)

.setFooter(footer());

await sendPanelOnce(channel,`🔥 Welcome To ${CONFIG.SERVER_NAME}`,{
embeds:[embed],
components:welcomeButtons()
});

}

const voicePanels=[
{
channelId:CONFIG.VOICE_REVIEW_SUBMIT_CHANNEL_ID,
title:"🎤 تسجيل انتهاء التقديم الصوتي",
description:"اكتب **آيدي المتقدم فقط** هنا.\nسيصله في الخاص أن تقديمه الصوتي قيد المراجعة، وسيأخذ رول قيد المراجعة."
},
{
channelId:CONFIG.VOICE_ACCEPT_CHANNEL_ID,
title:"✅ قبول التقديم الصوتي",
description:"اكتب **آيدي المتقدم فقط** هنا لقبوله.\nسيأخذ رول تصريح الدخول وسيتم إبلاغه في الخاص."
},
{
channelId:CONFIG.VOICE_REJECT_CHANNEL_ID,
title:"❌ رفض التقديم الصوتي",
description:"اكتب **آيدي المتقدم ثم سبب الرفض** في نفس الرسالة.\nمثال: `123456789012345678 السبب هنا`"
}
];

for(const panel of voicePanels){
const panelChannel=await client.channels.fetch(panel.channelId).catch(()=>null);
if(!panelChannel)continue;

const embed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setTitle(panel.title)
.setDescription(panel.description)
.setThumbnail(CONFIG.LOGO)
.setImage(CONFIG.WELCOME_IMAGE)
.setFooter(footer());

await sendPanelOnce(panelChannel,panel.title,{embeds:[embed]});
}

});

//////////////////////////////
// AUTO ROLE + WELCOME
//////////////////////////////

client.on(Events.GuildMemberAdd,async member=>{

if(!WELCOME_SYSTEM_OPEN)return;

if(CONFIG.AUTO_ROLE_ID&&CONFIG.AUTO_ROLE_ID!=="PUT_AUTO_ROLE_ID"){
await member.roles.add(CONFIG.AUTO_ROLE_ID).catch(()=>{});
}

const inviter=await findInviter(member);

const channel=member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);

if(!channel)return;

const joinedTime=Math.floor(Date.now()/1000);

const inviteBy=inviter?`${inviter}`:"غير معروف";

const inviteId=inviter?`\`${inviter.id}\``:"غير معروف";

const embed = new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setDescription(`

# 🎉 مرحباً بك في ${CONFIG.SERVER_NAME}!

انضم ${member} إلى السيرفر

✨ نتمنى لك وقتاً ممتعاً في ${CONFIG.SERVER_NAME}

🎮 سيرفر FiveM متقدم ومميز
📜 يرجى قراءة القوانين جيداً قبل البدء
💬 لا تتردد في التواصل مع الإدارة عند الحاجة
🌐 نحن هنا لمساعدتك 

`)


.setThumbnail(

member.user.displayAvatarURL({dynamic:true})

)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter({

text:`${CONFIG.SERVER_NAME} • Member #${member.guild.memberCount}`

})

await channel.send({
content:`${member}`,
embeds:[embed],
components:welcomeButtons(member.id)
}).catch(()=>{});

});

client.on(Events.InviteCreate,async invite=>{
await cacheGuildInvites(invite.guild);
});

client.on(Events.InviteDelete,async invite=>{
await cacheGuildInvites(invite.guild);
});

//////////////////////////////
// MAINTENANCE AUTO REPLY
//////////////////////////////

async function sendVoiceReviewResult(message,title,userId,details,color=CONFIG.COLOR){
const resultChannel=await client.channels.fetch(CONFIG.VOICE_RESULT_CHANNEL_ID).catch(()=>null);
if(!resultChannel)return;

const embed=new EmbedBuilder()
.setColor(color)
.setTitle(title)
.setDescription(`👤 المتقدم: <@${userId}>\n🆔 الآيدي: \`${userId}\`\n👮 بواسطة: ${message.author}\n${details}`)
.setThumbnail(CONFIG.LOGO)
.setTimestamp()
.setFooter(footer());

await resultChannel.send({embeds:[embed]}).catch(()=>{});
}

async function handleVoiceReviewMessage(message){
const managedChannels=[
CONFIG.VOICE_REVIEW_SUBMIT_CHANNEL_ID,
CONFIG.VOICE_ACCEPT_CHANNEL_ID,
CONFIG.VOICE_REJECT_CHANNEL_ID
];

if(!managedChannels.includes(message.channel.id))return false;

const match=message.content.trim().match(/^(?:<@!?)?(\d{17,20})>?\s*(.*)$/s);
if(!match){
await message.reply({content:"❌ اكتب آيدي الشخص بشكل صحيح.",allowedMentions:{repliedUser:false}}).catch(()=>{});
return true;
}

const userId=match[1];
const reason=match[2].trim();
const member=await message.guild.members.fetch(userId).catch(()=>null);
const user=await client.users.fetch(userId).catch(()=>null);

if(!member || !user){
await message.reply({content:"❌ لم أجد الشخص داخل السيرفر.",allowedMentions:{repliedUser:false}}).catch(()=>{});
return true;
}

if(message.channel.id===CONFIG.VOICE_REVIEW_SUBMIT_CHANNEL_ID){
const pendingRoleAdded=await member.roles.add(CONFIG.VOICE_PENDING_ROLE_ID).then(()=>true).catch(()=>false);

const embed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setTitle("🎤 تقديمك الصوتي قيد المراجعة")
.setDescription(`تم استلام نتيجة تقديمك الصوتي في **${CONFIG.SERVER_NAME}**.\n\n⏳ طلبك الآن قيد مراجعة الإدارة.\nسيتم إبلاغك في الخاص فور القبول أو الرفض.`)
.setImage(CONFIG.WELCOME_IMAGE)
.setFooter(footer());

const dmSent=await user.send({embeds:[embed]}).then(()=>true).catch(()=>false);
const warnings=[!pendingRoleAdded?"⚠️ لم أستطع إضافة رول قيد المراجعة.":null,!dmSent?"⚠️ الخاص عند الشخص مغلق.":null].filter(Boolean).join("\n");
await message.reply({content:`✅ تم تسجيل <@${userId}> قيد المراجعة.${warnings?`\n${warnings}`:""}`,allowedMentions:{repliedUser:false}}).catch(()=>{});
await sendVoiceReviewResult(message,"⏳ تقديم صوتي قيد المراجعة",userId,"📌 الحالة: قيد المراجعة");
return true;
}

if(message.channel.id===CONFIG.VOICE_ACCEPT_CHANNEL_ID){
await member.roles.remove(CONFIG.VOICE_PENDING_ROLE_ID).catch(()=>null);
const entryRoleAdded=await member.roles.add(CONFIG.ENTRY_PERMIT_ROLE_ID).then(()=>true).catch(()=>false);

const embed=new EmbedBuilder()
.setColor("#00ff88")
.setTitle("✅ تم قبول تقديمك الصوتي")
.setDescription(`مبروك! تم قبول تقديمك الصوتي في **${CONFIG.SERVER_NAME}**.\n\n🎫 تم منحك **تصريح الدخول** ويمكنك الآن دخول السيرفر.`)
.setImage(CONFIG.WELCOME_IMAGE)
.setFooter(footer());

const dmSent=await user.send({embeds:[embed]}).then(()=>true).catch(()=>false);
const warnings=[!entryRoleAdded?"⚠️ لم أستطع إضافة رول تصريح الدخول.":null,!dmSent?"⚠️ الخاص عند الشخص مغلق.":null].filter(Boolean).join("\n");
await message.reply({content:`✅ تم قبول <@${userId}>.${warnings?`\n${warnings}`:" تم منحه تصريح الدخول وإبلاغه في الخاص."}`,allowedMentions:{repliedUser:false}}).catch(()=>{});
await sendVoiceReviewResult(message,"✅ تم قبول التقديم الصوتي",userId,"🎫 النتيجة: تصريح دخول","#00ff88");
return true;
}

if(!reason){
await message.reply({content:"❌ اكتب سبب الرفض بعد آيدي الشخص.",allowedMentions:{repliedUser:false}}).catch(()=>{});
return true;
}

await member.roles.remove(CONFIG.VOICE_PENDING_ROLE_ID).catch(()=>null);

const embed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setTitle("❌ تم رفض تقديمك الصوتي")
.setDescription(`للأسف تم رفض تقديمك الصوتي في **${CONFIG.SERVER_NAME}**.\n\n📝 **سبب الرفض:**\n${reason.slice(0,1500)}`)
.setImage(CONFIG.WELCOME_IMAGE)
.setFooter(footer());

await user.send({embeds:[embed]}).catch(()=>{});
await message.reply({content:`✅ تم رفض <@${userId}> وإرسال السبب في الخاص.`,allowedMentions:{repliedUser:false}}).catch(()=>{});
await sendVoiceReviewResult(message,"❌ تم رفض التقديم الصوتي",userId,`📝 السبب: ${reason.slice(0,1000)}`);
return true;
}

client.on(Events.MessageCreate,async message=>{
if(!message.guild || message.author.bot)return;

if(await handleVoiceReviewMessage(message))return;

if(message.content.trim().toLowerCase()!=="ip")return;

const ipEmbed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setAuthor({name:CONFIG.SERVER_NAME,iconURL:CONFIG.LOGO})
.setTitle("🌐 معلومات دخول السيرفر")
.setDescription(`
**📡 حالة السيرفر**
\`${CONFIG.MAINTENANCE_STATUS}\`

**🔗 عنوان الدخول (IP)**
\`${CONFIG.SERVER_IP}\`

> عند فتح السيرفر سيتم تحديث عنوان الدخول هنا.
`)
.setThumbnail(CONFIG.LOGO)
.setImage(CONFIG.WELCOME_IMAGE)
.setFooter(footer())
.setTimestamp();

await message.reply({
embeds:[ipEmbed],
allowedMentions:{repliedUser:false}
}).catch(()=>{});
});

//////////////////////////////
// INTERACTIONS
//////////////////////////////

client.on(Events.InteractionCreate,async interaction=>{

try{

if(interaction.isChatInputCommand()&&interaction.commandName==="vot"){
const options=[
interaction.options.getString("الاختيار_الأول",true),
interaction.options.getString("الاختيار_الثاني",true),
interaction.options.getString("الاختيار_الثالث",false)
].filter(Boolean).map(option=>option.slice(0,45));

const voteId=interaction.id;
const vote={options,voters:new Map()};
activeVotes.set(voteId,vote);

const embed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setTitle("📊 تصويت جديد")
.setDescription(`صوّت بالضغط على أحد الاختيارات بالأسفل.\nيمكنك تغيير اختيارك في أي وقت.`)
.setThumbnail(CONFIG.LOGO)
.setFooter({text:`أنشأه ${interaction.user.username}`});

return interaction.reply({
embeds:[embed],
components:voteComponents(voteId,vote)
});
}

if(interaction.isButton()&&interaction.customId.startsWith("vote_")){
const parts=interaction.customId.split("_");
const optionIndex=Number(parts.pop());
const voteId=parts.slice(1).join("_");
const vote=activeVotes.get(voteId);

if(!vote || !vote.options[optionIndex]){
return interaction.reply({content:"❌ انتهى هذا التصويت أو لم يعد متاحاً",ephemeral:true});
}

vote.voters.set(interaction.user.id,optionIndex);
return interaction.update({components:voteComponents(voteId,vote)});
}

//////////////////////////////
// CONTROL BUTTONS
//////////////////////////////

if(interaction.isButton()&&[
"toggle_server_apply",
"toggle_staff_apply",
"toggle_creator_apply",
"toggle_welcome",
"toggle_rating",
"send_city_news"
].includes(interaction.customId)){

if(!interaction.member || !canControl(interaction.member)){
return interaction.reply({
content:"❌ ليس لديك صلاحية استخدام لوحة التحكم",
ephemeral:true
});
}

if(interaction.customId==="toggle_server_apply"){

SERVER_APPLICATIONS_OPEN=!SERVER_APPLICATIONS_OPEN;

return interaction.reply({
content:SERVER_APPLICATIONS_OPEN?"✅ تم فتح تقديم السيرفر":"❌ تم قفل تقديم السيرفر",
ephemeral:true
});

}

if(interaction.customId==="toggle_staff_apply"){

STAFF_APPLICATIONS_OPEN=!STAFF_APPLICATIONS_OPEN;

return interaction.reply({
content:STAFF_APPLICATIONS_OPEN?"✅ تم فتح التقديم الإداري":"❌ تم قفل التقديم الإداري",
ephemeral:true
});

}

if(interaction.customId==="toggle_creator_apply"){

CREATOR_APPLICATIONS_OPEN=!CREATOR_APPLICATIONS_OPEN;

return interaction.reply({
content:CREATOR_APPLICATIONS_OPEN?"✅ تم فتح تقديم صانع المحتوى":"❌ تم قفل تقديم صانع المحتوى",
ephemeral:true
});

}

if(interaction.customId==="toggle_welcome"){

WELCOME_SYSTEM_OPEN=!WELCOME_SYSTEM_OPEN;

return interaction.reply({
content:WELCOME_SYSTEM_OPEN?"✅ تم فتح الترحيب":"❌ تم قفل الترحيب",
ephemeral:true
});

}

if(interaction.customId==="toggle_rating"){

RATING_SYSTEM_OPEN=!RATING_SYSTEM_OPEN;

return interaction.reply({
content:RATING_SYSTEM_OPEN?"✅ تم فتح التقييم":"❌ تم قفل التقييم",
ephemeral:true
});

}

if(interaction.customId==="send_city_news"){

const modal=new ModalBuilder()
.setCustomId("city_news_modal")
.setTitle("📢 إرسال خبر المدينة");

const title=new TextInputBuilder()
.setCustomId("title")
.setLabel("عنوان الخبر")
.setStyle(TextInputStyle.Short)
.setRequired(true);

const message=new TextInputBuilder()
.setCustomId("message")
.setLabel("محتوى الخبر")
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(title),
new ActionRowBuilder().addComponents(message)
);

return interaction.showModal(modal);

}

}

//////////////////////////////
// CITY NEWS ROLE SELECT
//////////////////////////////

if(interaction.isStringSelectMenu()&&interaction.customId.startsWith("select_city_news_role_")){

if(!interaction.member || !canControl(interaction.member)){
return interaction.reply({
content:"❌ ليس لديك صلاحية تحديد الرولات",
ephemeral:true
});
}

const bucketIndex=interaction.customId.split("_").pop();

cityRoleBuckets.set(bucketIndex,interaction.values);

CITY_NEWS_ROLE_IDS=[...new Set([...cityRoleBuckets.values()].flat())];

return interaction.reply({
content:`✅ تم تحديد ${CITY_NEWS_ROLE_IDS.length} رول لأخبار المدينة`,
ephemeral:true
});

}

//////////////////////////////
// RATING BUTTON
//////////////////////////////

if(interaction.isButton()&&interaction.customId.startsWith("rate_")&&interaction.customId!=="rate_server"){

if(!RATING_SYSTEM_OPEN){
return interaction.reply({
content:"❌ التقييم مقفول حالياً",
ephemeral:true
});
}

const ownerId=interaction.customId.split("_")[1];

if(ownerId&&interaction.user.id!==ownerId){
return interaction.reply({
content:"❌ لا يمكنك تقييم رسالة شخص آخر",
ephemeral:true
});
}

if(ratedUsers.has(interaction.user.id)){
return interaction.reply({
content:"❌ لقد قمت بالتقييم بالفعل",
ephemeral:true
});
}

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("star_1")
.setLabel("⭐")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("star_2")
.setLabel("⭐⭐")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("star_3")
.setLabel("⭐⭐⭐")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("star_4")
.setLabel("⭐⭐⭐⭐")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("star_5")
.setLabel("⭐⭐⭐⭐⭐")
.setStyle(ButtonStyle.Success)

);

return interaction.reply({
content:"⭐ اختر عدد النجوم",
components:[row],
ephemeral:true
});

}

if(interaction.isButton()&&interaction.customId==="rate_server"){

if(!RATING_SYSTEM_OPEN){
return interaction.reply({
content:"❌ التقييم مقفول حالياً",
ephemeral:true
});
}

if(ratedUsers.has(interaction.user.id)){
return interaction.reply({
content:"❌ لقد قمت بالتقييم بالفعل",
ephemeral:true
});
}

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("star_1")
.setLabel("⭐")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("star_2")
.setLabel("⭐⭐")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("star_3")
.setLabel("⭐⭐⭐")
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("star_4")
.setLabel("⭐⭐⭐⭐")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("star_5")
.setLabel("⭐⭐⭐⭐⭐")
.setStyle(ButtonStyle.Success)

);

return interaction.reply({
content:"⭐ اختر عدد النجوم",
components:[row],
ephemeral:true
});

}

//////////////////////////////
// STAR BUTTON
//////////////////////////////

if(interaction.isButton()&&interaction.customId.startsWith("star_")){

const stars=interaction.customId.split("_")[1];

const modal=new ModalBuilder()

.setCustomId(`rating_${stars}`)

.setTitle("سبب التقييم");

const reason=new TextInputBuilder()

.setCustomId("reason")

.setLabel("اكتب سبب التقييم")

.setStyle(TextInputStyle.Paragraph)

.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(reason)
);

return interaction.showModal(modal);

}

//////////////////////////////
// SERVER APPLY
//////////////////////////////

if(interaction.isButton()&&interaction.customId==="apply_server"){

if(!SERVER_APPLICATIONS_OPEN){
return interaction.reply({
content:"❌ تقديم السيرفر مغلق حالياً",
ephemeral:true
});
}

launchApplication(interaction,"server");
return;

}

//////////////////////////////
// STAFF APPLY
//////////////////////////////

if(interaction.isButton()&&interaction.customId==="apply_staff"){

if(!STAFF_APPLICATIONS_OPEN){
return interaction.reply({
content:"❌ التقديم الإداري مغلق حالياً",
ephemeral:true
});
}

launchApplication(interaction,"staff");
return;

}

//////////////////////////////
// MONITORING APPLY
//////////////////////////////

if(interaction.isButton()&&interaction.customId==="apply_monitoring"){
if(!MONITORING_APPLICATIONS_OPEN){
return interaction.reply({content:"❌ تقديم الرقابة مغلق حالياً",ephemeral:true});
}

launchApplication(interaction,"monitoring");
return;
}

//////////////////////////////
// CREATOR APPLY
//////////////////////////////

if(interaction.isButton()&&interaction.customId==="apply_creator"){

if(!CREATOR_APPLICATIONS_OPEN){
return interaction.reply({
content:"❌ تقديم صانع المحتوى مغلق حالياً",
ephemeral:true
});
}

launchApplication(interaction,"creator");
return;

}

//////////////////////////////
// ACCEPT
//////////////////////////////

if(interaction.isButton()&&interaction.customId.startsWith("accept_")){

const parts=interaction.customId.split("_");

const type=parts[1];

const userId=parts[2];

if(!canManage(interaction.member,type)){
return interaction.reply({
content:"❌ ليس لديك صلاحية قبول هذا التقديم",
ephemeral:true
});
}

await interaction.deferUpdate();
return acceptApplication(interaction,type,userId);

}

//////////////////////////////
// REJECT
//////////////////////////////

if(interaction.isButton()&&interaction.customId.startsWith("reject_")){

const parts=interaction.customId.split("_");

const type=parts[1];

const userId=parts[2];

if(!canManage(interaction.member,type)){
return interaction.reply({
content:"❌ ليس لديك صلاحية رفض هذا التقديم",
ephemeral:true
});
}

const modal=new ModalBuilder()

.setCustomId(`rejectmodal_${type}_${userId}`)

.setTitle("سبب الرفض");

const reason=new TextInputBuilder()

.setCustomId("reason")

.setLabel("اكتب سبب الرفض")

.setStyle(TextInputStyle.Paragraph)

.setRequired(true);

modal.addComponents(
new ActionRowBuilder().addComponents(reason)
);

return interaction.showModal(modal);

}

//////////////////////////////
// VOICE JOIN BUTTON
//////////////////////////////

if(interaction.isButton()&&interaction.customId.startsWith("voice_join_")){

const userId=interaction.customId.split("_")[2];

if(interaction.user.id!==userId){
return interaction.reply({
content:"❌ هذا الزر ليس لك",
ephemeral:true
});
}

await interaction.deferReply({ephemeral:true});

const guild=client.guilds.cache.get(CONFIG.GUILD_ID);

if(!guild){
return interaction.editReply({
content:"❌ لم أجد السيرفر",
});
}

const member=await guild.members.fetch(userId).catch(()=>null);

if(!member){
return interaction.editReply({
content:"❌ لم أجدك داخل السيرفر",
});
}

const voice=await guild.channels.fetch(CONFIG.VOICE_CHANNEL_ID).catch(()=>null);

if(!voice){
return interaction.editReply({
content:"❌ روم المقابلة غير موجود",
});
}

if(!member.voice.channel){
return interaction.editReply({
content:"❌ ادخل أي روم صوتي الأول وبعدها اضغط الزر",
});
}

await member.voice.setChannel(voice).catch(()=>null);

return interaction.editReply({
content:"✅ تم نقلك إلى روم المقابلة الصوتية",
});

}

//////////////////////////////
// MODALS
//////////////////////////////

if(interaction.isModalSubmit()){

//////////////////////////////
// CITY NEWS MODAL
//////////////////////////////

if(interaction.customId==="city_news_modal"){

if(!CITY_NEWS_ROLE_IDS.length){
return interaction.reply({
content:"❌ اختار الرولات الأول",
ephemeral:true
});
}

const title=interaction.fields.getTextInputValue("title");

const message=interaction.fields.getTextInputValue("message");

await interaction.reply({
content:"✅ جاري إرسال أخبار المدينة",
ephemeral:true
});

const membersMap=new Map();

for(const roleId of CITY_NEWS_ROLE_IDS){

const role=interaction.guild.roles.cache.get(roleId);

if(!role)continue;

for(const member of role.members.values()){
membersMap.set(member.id,member);
}

}

const members=[...membersMap.values()];

for(const member of members){

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle(`📢 ${title}`)

.setDescription(`
# 📢 أخبار مدينة ${CONFIG.SERVER_NAME}

━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━

👤 تم إرسال الخبر إلى:
${member}

🕒 وقت الإرسال:
<t:${Math.floor(Date.now()/1000)}:F>

━━━━━━━━━━━━━━━━━━
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter({
text:`${CONFIG.SERVER_NAME} • أخبار المدينة`
});

await member.send({
content:`${member}`,
embeds:[embed]
}).catch(()=>{});

await new Promise(resolve=>setTimeout(resolve,500));

}

return;

}

//////////////////////////////
// RATING MODAL
//////////////////////////////

if(interaction.customId.startsWith("rating_")){

const stars=interaction.customId.split("_")[1];

const reason=interaction.fields.getTextInputValue("reason");

ratedUsers.add(interaction.user.id);

await interaction.deferReply({ephemeral:true});

const review=
await client.channels.fetch(CONFIG.RATING_CHANNEL_ID).catch(()=>null)
||
await client.channels.fetch(CONFIG.REVIEW_CHANNEL_ID).catch(()=>null);

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setDescription(`
# ⭐ تقييم جديد

━━━━━━━━━━━━━━━━━━

👤 الشخص:
${interaction.user}

⭐ عدد النجوم:
${"⭐".repeat(Number(stars))}

📝 السبب:
${reason}

━━━━━━━━━━━━━━━━━━
`)

.setThumbnail(interaction.user.displayAvatarURL())

.setImage(CONFIG.WELCOME_IMAGE);

review?.send({
embeds:[embed]
});

await interaction.editReply({
content:"✅ شكراً لتقييمك",
});

interaction.user.send({
embeds:[
new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setDescription(`
# ❤️ شكراً لتقييمك للسيرفر

━━━━━━━━━━━━━━━━━━

نشكرك على وقتك ودعمك
لسيرفر 𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 𝐑𝐏

━━━━━━━━━━━━━━━━━━
`)

.setImage(CONFIG.WELCOME_IMAGE)
]
}).catch(()=>{});

}

//////////////////////////////
// REJECT MODAL
//////////////////////////////

if(interaction.customId.startsWith("rejectmodal_")){

const parts=interaction.customId.split("_");

const type=parts[1];

const userId=parts[2];

const reason=interaction.fields.getTextInputValue("reason");

await interaction.deferUpdate();
return rejectApplication(interaction,type,userId,reason);

}

}

}catch(error){
console.error("Interaction error:",error);

const errorMessage={content:"❌ حصل خطأ أثناء تنفيذ الطلب. حاول مرة أخرى، ولو استمرت المشكلة راجع صلاحيات البوت وترتيب الرولات.",ephemeral:true};

if(interaction.deferred || interaction.replied){
await interaction.followUp(errorMessage).catch(()=>{});
}else{
await interaction.reply(errorMessage).catch(()=>{});
}
}

});

//////////////////////////////
// APPLICATION SYSTEM
//////////////////////////////

async function startApplication(interaction,type){

const userId=interaction.user.id;

if(type==="server"){

if(applyCooldown.has(userId)){
return interaction.reply({
content:"❌ لا يمكنك التقديم حالياً",
ephemeral:true
});
}

if(serverApplied.has(userId)){
return interaction.reply({
content:"❌ لديك تقديم سيرفر قيد المراجعة",
ephemeral:true
});
}

serverApplied.add(userId);

}

if(type==="staff"){

if(staffApplied.has(userId)){
return interaction.reply({
content:"❌ لديك تقديم إداري قيد المراجعة",
ephemeral:true
});
}

staffApplied.add(userId);

}

if(type==="creator"){

if(creatorApplied.has(userId)){
return interaction.reply({
content:"❌ لديك تقديم صانع محتوى قيد المراجعة",
ephemeral:true
});
}

creatorApplied.add(userId);

}

if(type==="monitoring"){
if(monitoringApplied.has(userId)){
return interaction.reply({content:"❌ لديك تقديم رقابة قيد المراجعة",ephemeral:true});
}

monitoringApplied.add(userId);
}

await interaction.reply({
content:"📨 تم فتح التقديم في الخاص",
ephemeral:true
});

const dm=await interaction.user.createDM().catch(()=>null);

if(!dm){

removeApplicationStatus(type,userId);

return interaction.followUp({
content:"❌ افتح الخاص عندك",
ephemeral:true
});

}

const title=type==="server"?"📨 التقديم على السيرفر":type==="staff"?"🛡️ التقديم الإداري":type==="monitoring"?"🛡️ تقديم الرقابة":"🎥 تقديم صانع محتوى";

const intro=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setAuthor({
name:"𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 Application System",
iconURL:CONFIG.LOGO
})

.setDescription(`
# ${title}

━━━━━━━━━━━━━━━━━━

> أهلاً بك في نظام التقديم الرسمي

📌 سيتم سؤالك عدة أسئلة  
يرجى الإجابة بجدية

❌ إذا أردت إلغاء التقديم في أي وقت  
قم بكتابة:

\`cancel\`

━━━━━━━━━━━━━━━━━━
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter({
text:"Turbo CFW RP • نظام التقديم"
});

await dm.send({
embeds:[intro]
});

const filter=m=>m.author.id===interaction.user.id;

const ready=await dm.awaitMessages({
filter,
max:1,
time:300000
}).catch(()=>null);

if(!ready || ready.size===0){

removeApplicationStatus(type,userId);

return;

}

const readyAnswer=ready.first().content;

if(readyAnswer.toLowerCase()==="cancel"){

removeApplicationStatus(type,userId);

return dm.send({
embeds:[
new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setAuthor({
name:"𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 Application System",
iconURL:CONFIG.LOGO
})

.setDescription(`
# ❌ تم إلغاء التقديم

━━━━━━━━━━━━━━━━━━

تم إيقاف التقديم بنجاح

يمكنك إعادة التقديم لاحقاً

━━━━━━━━━━━━━━━━━━
`)
]
});

}

const questions=getQuestions(type);

const answers=[];

for(let i=0;i<questions.length;i++){

const q=questions[i];

const questionEmbed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setDescription(`
# السؤال رقم ${i+1}

${q}
`);

await dm.send({
embeds:[questionEmbed]
});

const collected=await dm.awaitMessages({
filter,
max:1,
time:300000
}).catch(()=>null);

if(!collected || collected.size===0){

removeApplicationStatus(type,userId);

await dm.send({
embeds:[
new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setAuthor({
name:"𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 Application System",
iconURL:CONFIG.LOGO
})

.setDescription(`
# ❌ انتهى وقت التقديم

━━━━━━━━━━━━━━━━━━

لم يتم استلام أي رد منك

يمكنك إعادة التقديم لاحقاً

━━━━━━━━━━━━━━━━━━
`)
]
});

return;

}

const answer=collected.first().content;

if(answer.toLowerCase()==="cancel"){

removeApplicationStatus(type,userId);

await dm.send({
embeds:[
new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setAuthor({
name:"𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 Application System",
iconURL:CONFIG.LOGO
})

.setDescription(`
# ❌ تم إلغاء التقديم

━━━━━━━━━━━━━━━━━━

تم إيقاف التقديم بنجاح

يمكنك إعادة التقديم لاحقاً

━━━━━━━━━━━━━━━━━━
`)

.setThumbnail(CONFIG.LOGO)

.setFooter({
text:"Nova CFW RP • نظام التقديم"
})
]
});

return;

}

answers.push(answer);

}

await sendReview(interaction,type,questions,answers);

dm.send({
embeds:[
new EmbedBuilder()

.setColor("#00ff88")

.setAuthor({
name:"𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 Application System",
iconURL:CONFIG.LOGO
})

.setDescription(`
# ✅ تم استلام تقديمك

━━━━━━━━━━━━━━━━━━

تم إرسال تقديمك للإدارة
وسيتم مراجعته قريباً

نتمنى لك التوفيق ❤️

━━━━━━━━━━━━━━━━━━
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.WELCOME_IMAGE)
]
});

}

function getQuestions(type){

if(type==="server")return [

"ما اسمك الحقيقي ؟",
"كم عمرك ؟",
"ما اسم شخصيتك داخل الرول بلاي ؟",
"هل لديك خبرة رول بلاي ؟",
"قصة الشخصية يجب ان تكون فوق 150 كلمة فما فوق",
"ما معنى Fail RP ؟",
"ما معنى Meta Gaming ؟",
"ما معنى Power Gaming ؟",
"ما معنى Random Deathmatch ؟",
"كيف تتصرف إذا خطفك شخص ؟",
"كيف تتصرف إذا خسرت سيناريو ؟",
"كم ساعة تلعب يومياً ؟",
"لماذا تريد الانضمام إلى Turbo CFW RP ؟"

];

if(type==="staff")return [

"ما اسمك الحقيقي ؟",
"كم عمرك ؟",
"ما خبرتك الإدارية السابقة ؟",
"لماذا تريد الانضمام للإدارة ؟",
"كم ساعة تستطيع التواجد يومياً ؟",
"كيف تتعامل مع لاعب غاضب ؟",
"كيف تتصرف مع إداري خالف القوانين ؟",
"ما معنى الحياد الإداري ؟",
"هل تستطيع حضور مقابلة صوتية ؟",
"ما نقاط قوتك كإداري ؟",
"ما نقاط ضعفك ؟",
"لماذا يجب قبولك في الإدارة ؟"

];

if(type==="monitoring")return [
"ما اسمك الحقيقي ؟",
"كم عمرك ؟",
"ما خبرتك السابقة في الرقابة ؟",
"لماذا تريد الانضمام إلى فريق الرقابة ؟",
"كم ساعة تستطيع التواجد يومياً ؟",
"كيف تتعامل مع لاعب يخالف القوانين ؟",
"كيف تتصرف لو كان المخالف صديقك ؟",
"ما معنى الحياد في الرقابة ؟",
"هل تستطيع تسجيل ورفع الأدلة عند الحاجة ؟",
"لماذا يجب قبولك في فريق الرقابة ؟"
];

return [

"ما اسمك الحقيقي ؟",
"كم عمرك ؟",
"ما اسمك كصانع محتوى ؟",
"ما المنصة التي تنشر عليها ؟",
"كم عدد المتابعين ؟",
"ضع رابط حسابك أو قناتك",
"ما نوع المحتوى الذي تقدمه ؟",
"كم فيديو تستطيع نشره أسبوعياً ؟",
"هل تستطيع عمل محتوى خاص بالسيرفر ؟",
"هل لديك خبرة في مونتاج الفيديو ؟",
"لماذا تريد أن تصبح صانع محتوى في Turbo CFW RP ؟",
"هل توافق على الالتزام بقوانين النشر ؟"

];

}

async function sendReview(interaction,type,questions,answers){

const reviewChannelId=type==="server"?CONFIG.REVIEW_CHANNEL_ID:type==="staff"?CONFIG.STAFF_REVIEW_CHANNEL_ID:type==="monitoring"?CONFIG.MONITORING_REVIEW_CHANNEL_ID:CONFIG.CREATOR_REVIEW_CHANNEL_ID;

const review=await client.channels.fetch(reviewChannelId).catch(()=>null);

if(!review)return;

const title=type==="server"?"📨 تقديم سيرفر جديد":type==="staff"?"🛡️ تقديم إداري جديد":type==="monitoring"?"🛡️ تقديم رقابة جديد":"🎥 تقديم صانع محتوى جديد";

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle(title)

.setThumbnail(interaction.user.displayAvatarURL())

.setDescription(`
# معلومات المتقدم

👤 الشخص: ${interaction.user}

🆔 ID:
\`${interaction.user.id}\`

━━━━━━━━━━━━━━━━━━
`)

.setImage(CONFIG.WELCOME_IMAGE);

questions.forEach((q,i)=>{

embed.addFields({
name:`❓ ${q}`,
value:`${answers[i]}`.slice(0,1000)||"لا يوجد رد"
});

});

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId(`accept_${type}_${interaction.user.id}`)
.setLabel("✅ قبول")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId(`reject_${type}_${interaction.user.id}`)
.setLabel("❌ رفض")
.setStyle(ButtonStyle.Primary)

);

await review.send({
content:`${interaction.user}`,
embeds:[embed],
components:[row]
}).catch(()=>{});

}

//////////////////////////////
// ACCEPT APPLICATION
//////////////////////////////

async function acceptApplication(interaction,type,userId){

const member=await interaction.guild.members.fetch(userId).catch(()=>null);

const user=await client.users.fetch(userId).catch(()=>null);

if(!user){
return interaction.followUp({
content:"❌ لم أجد الشخص",
ephemeral:true
});
}

let roleId=null;

let acceptTitle="";

let acceptText="";

let components=[];

if(type==="server"){

roleId=CONFIG.SERVER_ACCEPT_ROLE_ID;

acceptTitle="🎉 تم قبول طلبك في السيرفر!";

acceptText=`
# ✅ تهانينا!

تم قبولك في
**𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 𝐑𝐏**

أصبحت الآن مؤهلاً للدخول
إلى سيرفر
يرجى الالتزام بالقوانين
واحترام جميع اللاعبين

━━━━━━━━━━━━━━━━━━

📌 اضغط الزر بالأسفل
للدخول إلى المقابلة الصوتية
`;

components=[
new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId(`voice_join_${userId}`)
.setLabel("🎤 دخول المقابلة الصوتية")
.setStyle(ButtonStyle.Primary)

)
];

serverApplied.delete(userId);

}

if(type==="staff"){

roleId=CONFIG.STAFF_ACCEPT_ROLE_ID;

acceptTitle="🛡️ تم قبولك في الإدارة!";

acceptText=`
# 🎉 مبروك!

تم قبولك ضمن فريق إدارة
**𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 𝐑𝐏**

تم منحك الرتبة بنجاح

يرجى الالتزام بالقوانين
والتعامل باحترام مع جميع اللاعبين

يمنع إساءة استخدام الصلاحيات
`;

staffApplied.delete(userId);

}

if(type==="monitoring"){
roleId=CONFIG.MONITORING_ACCEPT_ROLE_ID;
acceptTitle="🛡️ تم قبولك في فريق الرقابة!";
acceptText=`
# 🎉 مبروك!

تم قبولك ضمن فريق الرقابة في
**𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 𝐑𝐏**

تم منحك الرتبة بنجاح.
يرجى الالتزام بالقوانين والحياد واحترام جميع اللاعبين.
`;
monitoringApplied.delete(userId);
}

if(type==="creator"){

roleId=CONFIG.CREATOR_ACCEPT_ROLE_ID;

acceptTitle="🎥 تم قبولك كصانع محتوى!";

acceptText=`
# 🎉 مبروك!

تم قبولك في برنامج صناع المحتوى داخل
**𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 𝐑𝐏**

يمكنك الآن نشر محتوى السيرفر
والمساهمة في نمو المجتمع

يرجى الالتزام بقوانين النشر
`;

creatorApplied.delete(userId);

}

let roleAdded=false;
if(member&&roleId&&!roleId.startsWith("PUT_")){
roleAdded=await member.roles.add(roleId).then(()=>true).catch(error=>{
console.error(`تعذر إضافة رول القبول ${roleId} إلى ${userId}:`,error.message);
return false;
});
}

const acceptEmbed=new EmbedBuilder()

.setColor("#00ff88")

.setDescription(`
# ${acceptTitle}

━━━━━━━━━━━━━━━━━━

${acceptText}

━━━━━━━━━━━━━━━━━━
`)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter({
text:`𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 𝐑𝐏 • الإدارة`
});

const dmSent=await user.send({
embeds:[acceptEmbed],
components
}).then(()=>true).catch(()=>false);

const disabled=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("done")
.setLabel("✅ تم القبول")
.setDisabled(true)
.setStyle(ButtonStyle.Success)

);

await interaction.editReply({
components:[disabled]
});

if(!member || !roleAdded || !dmSent){
const warnings=[
!member?"لم أجد العضو داخل السيرفر":null,
member&&!roleAdded?"لم أستطع إضافة رول القبول؛ تأكد أن رتبة البوت أعلى من الرول وأن لديه Manage Roles":null,
!dmSent?"الخاص عند المتقدم مغلق":null
].filter(Boolean).join(" — ");

await interaction.followUp({content:`⚠️ تم تسجيل القبول، لكن: ${warnings}`,ephemeral:true}).catch(()=>{});
}

}

//////////////////////////////
// REJECT APPLICATION
//////////////////////////////

async function rejectApplication(interaction,type,userId,reason){

const user=await client.users.fetch(userId).catch(()=>null);

const member=await interaction.guild.members.fetch(userId).catch(()=>null);

if(!user){
return interaction.followUp({
content:"❌ لم أجد الشخص",
ephemeral:true
});
}

if(type==="server"){

serverApplied.delete(userId);

const count=(serverRejectCount.get(userId)||0)+1;

serverRejectCount.set(userId,count);

if(member&&CONFIG.FIRST_FAIL_ROLE_ID&&!CONFIG.FIRST_FAIL_ROLE_ID.startsWith("PUT_")){
member.roles.add(CONFIG.FIRST_FAIL_ROLE_ID).catch(()=>{});
}

if(count>=2){

if(member&&CONFIG.SECOND_FAIL_ROLE_ID&&!CONFIG.SECOND_FAIL_ROLE_ID.startsWith("PUT_")){
member.roles.add(CONFIG.SECOND_FAIL_ROLE_ID).catch(()=>{});
}

applyCooldown.set(userId,true);

setTimeout(()=>{
applyCooldown.delete(userId);
},604800000);

}

}

if(type==="staff"){
staffApplied.delete(userId);
}

if(type==="monitoring"){
monitoringApplied.delete(userId);
}

if(type==="creator"){
creatorApplied.delete(userId);
}

const rejectTitle=type==="server"?"❌ تم رفض طلبك":type==="staff"?"❌ تم رفض طلبك الإداري":type==="monitoring"?"❌ تم رفض طلب الرقابة":"❌ تم رفض طلب صانع المحتوى";

const rejectEmbed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setDescription(`
# ${rejectTitle}

━━━━━━━━━━━━━━━━━━

للأسف تم رفض طلبك الحالي

📝 السبب:
${reason}

يمكنك إعادة التقديم لاحقاً
بعد تطوير مستواك

نتمنى لك التوفيق ❤️

━━━━━━━━━━━━━━━━━━
`)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter({
text:`𝐓𝐮𝐫𝐛𝐨 𝐂𝐅𝐖 𝐑𝐏 • الإدارة`
});

user.send({
embeds:[rejectEmbed]
}).catch(()=>{});

const disabled=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("done")
.setLabel("❌ تم الرفض")
.setDisabled(true)
.setStyle(ButtonStyle.Primary)

);

await interaction.editReply({
components:[disabled]
});

}

client.login(CONFIG.TOKEN);

// ==========================================
// NOVA CFW RP - FULL PREMIUM SYSTEM
// WELCOME + RULES + RATING + APPLICATIONS
// ==========================================

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
TextInputStyle
}=require("discord.js");

const client=new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.DirectMessages
],
partials:[Partials.Channel]
});

//////////////////////////////
// CONFIG
//////////////////////////////

const CONFIG={

TOKEN:process.env.TOKEN,

SERVER_NAME:"Nova CFW RP",

COLOR:"#ff0000",

LOGO:"https://cdn.discordapp.com/attachments/1475033418336174141/1503584411944357970/F3436697-68DF-42FD-BDFF-E18A102A4339.png?ex=6a03e19b&is=6a02901b&hm=5cce3c381ca59e5565c1b0c8e01dd97e3d46e677990a9a7343c727269eb5f8c7&",

WELCOME_IMAGE:"https://cdn.discordapp.com/attachments/1475033418336174141/1502704262935740557/banner_connecting.png?ex=6a03f9a7&is=6a02a827&hm=837d5231b60e40b0c3afc9c3fbe6b3d67e5b4e79ad2acd0e440eab55d4358cba&",

RULES_IMAGE:"https://cdn.discordapp.com/attachments/1475033418336174141/1502704262935740557/banner_connecting.png?ex=6a03f9a7&is=6a02a827&hm=837d5231b60e40b0c3afc9c3fbe6b3d67e5b4e79ad2acd0e440eab55d4358cba&",

VOICE_LINK:"https://discord.com/channels/1465609781837303873/149834195649599899",

GUILD_ID:"PUT_GUILD_ID",

WELCOME_CHANNEL_ID:"1465609782680621254",

RULES_CHANNEL_ID:"1465786939755200687",

SERVER_APPLY_CHANNEL_ID:"1465803291714785481",

STAFF_APPLY_CHANNEL_ID:"1475033418336174141",

CREATOR_APPLY_CHANNEL_ID:"1465820705642905711",

REVIEW_CHANNEL_ID:"1477562619001831445",

STAFF_REVIEW_CHANNEL_ID:"1479216695938650263",

CREATOR_REVIEW_CHANNEL_ID:"1477777545767420116",

RATING_CHANNEL_ID:"1480098551248715896",

AUTO_ROLE_ID:"1465864548241379461",

SERVER_ACCEPT_ROLE_ID:"1477569088988512266",

STAFF_ACCEPT_ROLE_ID:"1495932868579561532",

CREATOR_ACCEPT_ROLE_ID:"1477845260095979552",

FIRST_FAIL_ROLE_ID:"1477568923208519681",

SECOND_FAIL_ROLE_ID:"1477569051185119332",

SERVER_RULES_LINK:"https://docs.google.com/document/d/1uCZBWJd5j4JGyacLFM-823YsTAnhSq88R_OfSaZ1Uv8/edit?tab=t.i85m88kkl7vw",

DISCORD_RULES_LINK:"https://docs.google.com/document/d/1OVjgthyRPQ63sD49ezOjQ8pf-Q8soL5BJdZFFX-UmnM/edit?pli=1&tab=t.0#heading=h.htkdqjco0q8o",

ADMIN_ROLE_IDS:[
"1494041543630131360",
"1465798793772666941",
"1502848401497391134",
"1502846109985542154",
"1502844887278555289",
"1498760689257414686",
"1494088476889579622",
"1467593770898948158",
"1489374601027915776",
"1490793455952199870"
]

};

//////////////////////////////
// DATABASE MEMORY
//////////////////////////////

const ratedUsers=new Set();

const serverApplied=new Set();

const staffApplied=new Set();

const creatorApplied=new Set();

const serverRejectCount=new Map();

const applyCooldown=new Map();

//////////////////////////////
// HELPERS
//////////////////////////////

function channelLink(channelId){
return `https://discord.com/channels/${CONFIG.GUILD_ID}/${channelId}`;
}

function isAdmin(member){
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

//////////////////////////////
// READY
//////////////////////////////

client.once(Events.ClientReady,async()=>{

console.log(`${client.user.tag} READY`);

//////////////////////////////
// RULES CHANNEL PANEL
//////////////////////////////

const rulesChannel=await client.channels.fetch(CONFIG.RULES_CHANNEL_ID).catch(()=>null);

if(rulesChannel){

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle(`📜 قوانين ${CONFIG.SERVER_NAME}`)

.setDescription(`
# 📜 قوانين السيرفر

━━━━━━━━━━━━━━━━━━

مرحباً بك في قسم القوانين الخاص بسيرفر  
**${CONFIG.SERVER_NAME}**

يرجى قراءة القوانين جيداً قبل التقديم أو الدخول للسيرفر.

━━━━━━━━━━━━━━━━━━

📌 اضغط الأزرار بالأسفل لفتح:
• قوانين السيرفر  
• قوانين الديسكورد  

━━━━━━━━━━━━━━━━━━

# ⚠️ مهم
عدم قراءة القوانين لا يعفيك من العقوبة.
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.RULES_IMAGE)

.setFooter(footer());

await rulesChannel.send({
embeds:[embed],
components:rulesButtons()
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
# 📨 التقديم على السيرفر

━━━━━━━━━━━━━━━━━━

من هنا يمكنك التقديم على الوايت ليست في  
**${CONFIG.SERVER_NAME}**

قبل التقديم تأكد من:
• قراءة القوانين  
• فهم أساسيات الرول بلاي  
• الإجابة بجدية  
• عدم إرسال إجابات عشوائية  

━━━━━━━━━━━━━━━━━━

اضغط الزر بالأسفل لبدء التقديم في الخاص.
`)

.setThumbnail(CONFIG.LOGO)

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter(footer());

const row=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("apply_server")
.setLabel("📨 بدء تقديم الوايت ليست")
.setStyle(ButtonStyle.Danger)

);

await serverApplyChannel.send({
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
# 🛡️ تقديم الإدارة

━━━━━━━━━━━━━━━━━━

من هنا يمكنك التقديم على الإدارة في  
**${CONFIG.SERVER_NAME}**

يجب أن تكون قادر على:
• احترام اللاعبين  
• فهم القوانين  
• التعامل بهدوء  
• حل المشاكل بدون تحيز  
• التواجد بشكل جيد  

━━━━━━━━━━━━━━━━━━

اضغط الزر بالأسفل لبدء التقديم الإداري في الخاص.
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

await staffApplyChannel.send({
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
# 🎥 تقديم صانع محتوى

━━━━━━━━━━━━━━━━━━

من هنا يمكنك التقديم كصانع محتوى في  
**${CONFIG.SERVER_NAME}**

يجب أن يكون لديك:
• منصة نشر  
• محتوى منظم  
• احترام لقوانين السيرفر  
• قدرة على نشر محتوى مفيد للسيرفر  

━━━━━━━━━━━━━━━━━━

اضغط الزر بالأسفل لبدء تقديم صانع المحتوى في الخاص.
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

await creatorApplyChannel.send({
embeds:[embed],
components:[row]
});

}

//////////////////////////////
// WELCOME MAIN PANEL
//////////////////////////////

const channel=await client.channels.fetch(CONFIG.WELCOME_CHANNEL_ID).catch(()=>null);

if(!channel)return;

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setTitle(`🔥 Welcome To ${CONFIG.SERVER_NAME}`)

.setDescription(`
# 👋 مرحباً بك في ${CONFIG.SERVER_NAME}

━━━━━━━━━━━━━━━━━━

📌 يرجى قراءة القوانين جيداً قبل التقديم.

📨 للتقديم على الوايت ليست اضغط زر التقديم.

⭐ يمكنك تقييم السيرفر من رسالة الترحيب.

━━━━━━━━━━━━━━━━━━
`)

.setImage(CONFIG.WELCOME_IMAGE)

.setThumbnail(CONFIG.LOGO)

.setFooter(footer());

channel.send({
embeds:[embed],
components:welcomeButtons()
});

});

//////////////////////////////
// AUTO ROLE + WELCOME
//////////////////////////////

client.on(Events.GuildMemberAdd,async member=>{

if(CONFIG.AUTO_ROLE_ID!=="PUT_AUTO_ROLE_ID"){
member.roles.add(CONFIG.AUTO_ROLE_ID).catch(()=>{});
}

const channel=member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);

if(!channel)return;

const embed=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setDescription(`
# 👋 Welcome To ${CONFIG.SERVER_NAME}

━━━━━━━━━━━━━━━━━━

أهلاً بك ${member}

نتمنى لك تجربة ممتعة داخل السيرفر ❤️

📌 يرجى قراءة القوانين جيداً  
📨 ثم التقديم على الوايت ليست  
⭐ ويمكنك تقييم السيرفر من رسالتك فقط  

━━━━━━━━━━━━━━━━━━
`)

.setThumbnail(member.user.displayAvatarURL())

.setImage(CONFIG.WELCOME_IMAGE)

.setFooter(footer());

channel.send({
content:`${member}`,
embeds:[embed],
components:welcomeButtons(member.id)
});

});

//////////////////////////////
// INTERACTIONS
//////////////////////////////

client.on(Events.InteractionCreate,async interaction=>{

//////////////////////////////
// RATING BUTTON
//////////////////////////////

if(interaction.isButton()&&interaction.customId.startsWith("rate_")){

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

return startApplication(interaction,"server");

}

//////////////////////////////
// STAFF APPLY
//////////////////////////////

if(interaction.isButton()&&interaction.customId==="apply_staff"){

return startApplication(interaction,"staff");

}

//////////////////////////////
// CREATOR APPLY
//////////////////////////////

if(interaction.isButton()&&interaction.customId==="apply_creator"){

return startApplication(interaction,"creator");

}

//////////////////////////////
// ACCEPT
//////////////////////////////

if(interaction.isButton()&&interaction.customId.startsWith("accept_")){

if(!isAdmin(interaction.member)){
return interaction.reply({
content:"❌ ليس لديك صلاحية",
ephemeral:true
});
}

const parts=interaction.customId.split("_");

const type=parts[1];

const userId=parts[2];

return acceptApplication(interaction,type,userId);

}

//////////////////////////////
// REJECT
//////////////////////////////

if(interaction.isButton()&&interaction.customId.startsWith("reject_")){

if(!isAdmin(interaction.member)){
return interaction.reply({
content:"❌ ليس لديك صلاحية",
ephemeral:true
});
}

const parts=interaction.customId.split("_");

const type=parts[1];

const userId=parts[2];

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
// MODALS
//////////////////////////////

if(interaction.isModalSubmit()){

//////////////////////////////
// RATING MODAL
//////////////////////////////

if(interaction.customId.startsWith("rating_")){

const stars=interaction.customId.split("_")[1];

const reason=interaction.fields.getTextInputValue("reason");

ratedUsers.add(interaction.user.id);

const review=client.channels.cache.get(CONFIG.RATING_CHANNEL_ID)||client.channels.cache.get(CONFIG.REVIEW_CHANNEL_ID);

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

interaction.reply({
content:"✅ شكراً لتقييمك",
ephemeral:true
});

interaction.user.send({
embeds:[
new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setDescription(`
# ❤️ شكراً لتقييمك للسيرفر

━━━━━━━━━━━━━━━━━━

نشكرك على وقتك ودعمك
لسيرفر Nova CFW RP

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

return rejectApplication(interaction,type,userId,reason);

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

await interaction.reply({
content:"📨 تم فتح التقديم في الخاص",
ephemeral:true
});

const dm=await interaction.user.createDM().catch(()=>null);

if(!dm){
return interaction.followUp({
content:"❌ افتح الخاص عندك",
ephemeral:true
});
}

const title=type==="server"?"📨 التقديم على السيرفر":type==="staff"?"🛡️ التقديم الإداري":"🎥 تقديم صانع محتوى";

const intro=new EmbedBuilder()

.setColor(CONFIG.COLOR)

.setDescription(`
# ${title}

━━━━━━━━━━━━━━━━━━

يرجى إرسال أي رسالة
للتأكيد أنك جاهز للتقديم

━━━━━━━━━━━━━━━━━━
`)

.setImage(CONFIG.WELCOME_IMAGE);

await dm.send({
embeds:[intro]
});

const filter=m=>m.author.id===interaction.user.id;

const ready=await dm.awaitMessages({
filter,
max:1,
time:300000
}).catch(()=>null);

if(!ready)return;

const questions=getQuestions(type);

const answers=[];

for(const q of questions){

await dm.send(`❓ ${q}`);

const collected=await dm.awaitMessages({
filter,
max:1,
time:300000
}).catch(()=>null);

if(!collected)return;

answers.push(collected.first().content);

}

await sendReview(interaction,type,questions,answers);

dm.send({
embeds:[
new EmbedBuilder()

.setColor("#00ff88")

.setDescription(`
# ✅ تم استلام تقديمك

━━━━━━━━━━━━━━━━━━

تم إرسال تقديمك للإدارة
وسيتم مراجعته قريباً

نتمنى لك التوفيق ❤️

━━━━━━━━━━━━━━━━━━
`)

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
"ما معنى Fail RP ؟",
"ما معنى Meta Gaming ؟",
"ما معنى Power Gaming ؟",
"ما معنى Random Deathmatch ؟",
"كيف تتصرف إذا خطفك شخص ؟",
"كيف تتصرف إذا خسرت سيناريو ؟",
"كم ساعة تلعب يومياً ؟",
"لماذا تريد الانضمام إلى Nova CFW RP ؟"

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
"لماذا تريد أن تصبح صانع محتوى في Nova CFW RP ؟",
"هل توافق على الالتزام بقوانين النشر ؟"

];

}

async function sendReview(interaction,type,questions,answers){

const reviewChannelId=type==="server"?CONFIG.REVIEW_CHANNEL_ID:type==="staff"?CONFIG.STAFF_REVIEW_CHANNEL_ID:CONFIG.CREATOR_REVIEW_CHANNEL_ID;

const review=client.channels.cache.get(reviewChannelId);

if(!review)return;

const title=type==="server"?"📨 تقديم سيرفر جديد":type==="staff"?"🛡️ تقديم إداري جديد":"🎥 تقديم صانع محتوى جديد";

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
.setStyle(ButtonStyle.Danger)

);

review.send({
content:`${interaction.user}`,
embeds:[embed],
components:[row]
});

}

//////////////////////////////
// ACCEPT APPLICATION
//////////////////////////////

async function acceptApplication(interaction,type,userId){

const member=await interaction.guild.members.fetch(userId).catch(()=>null);

const user=await client.users.fetch(userId).catch(()=>null);

if(!user){
return interaction.reply({
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

تم قبولك مبدئياً في
**Nova CFW RP**

أصبحت الآن مؤهلاً للدخول
إلى المقابلة الصوتية

يرجى الالتزام بالقوانين
واحترام جميع اللاعبين

━━━━━━━━━━━━━━━━━━

📌 اضغط الزر بالأسفل
للدخول إلى المقابلة الصوتية
`;

components=[
new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setLabel("🎤 دخول المقابلة الصوتية")
.setStyle(ButtonStyle.Link)
.setURL(CONFIG.VOICE_LINK)

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
**Nova CFW RP**

تم منحك الرتبة بنجاح

يرجى الالتزام بالقوانين
والتعامل باحترام مع جميع اللاعبين

يمنع إساءة استخدام الصلاحيات
`;

staffApplied.delete(userId);

}

if(type==="creator"){

roleId=CONFIG.CREATOR_ACCEPT_ROLE_ID;

acceptTitle="🎥 تم قبولك كصانع محتوى!";

acceptText=`
# 🎉 مبروك!

تم قبولك في برنامج صناع المحتوى داخل
**Nova CFW RP**

يمكنك الآن نشر محتوى السيرفر
والمساهمة في نمو المجتمع

يرجى الالتزام بقوانين النشر
`;

creatorApplied.delete(userId);

}

if(member&&roleId&&!roleId.startsWith("PUT_")){
member.roles.add(roleId).catch(()=>{});
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
text:`Nova CFW RP • الإدارة`
});

user.send({
embeds:[acceptEmbed],
components
}).catch(()=>{});

const disabled=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("done")
.setLabel("✅ تم القبول")
.setDisabled(true)
.setStyle(ButtonStyle.Success)

);

interaction.update({
components:[disabled]
});

}

//////////////////////////////
// REJECT APPLICATION
//////////////////////////////

async function rejectApplication(interaction,type,userId,reason){

const user=await client.users.fetch(userId).catch(()=>null);

const member=await interaction.guild.members.fetch(userId).catch(()=>null);

if(!user){
return interaction.reply({
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

if(type==="creator"){
creatorApplied.delete(userId);
}

const rejectTitle=type==="server"?"❌ تم رفض طلبك":type==="staff"?"❌ تم رفض طلبك الإداري":"❌ تم رفض طلب صانع المحتوى";

const rejectEmbed=new EmbedBuilder()

.setColor("#ff0000")

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
text:`Nova CFW RP • الإدارة`
});

user.send({
embeds:[rejectEmbed]
}).catch(()=>{});

const disabled=new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("done")
.setLabel("❌ تم الرفض")
.setDisabled(true)
.setStyle(ButtonStyle.Danger)

);

interaction.update({
components:[disabled]
});

}

client.login(CONFIG.TOKEN);

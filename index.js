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

const CONFIG={
TOKEN:process.env.TOKEN,
SERVER_NAME:"Nova CFW RP",
COLOR:"#ff0000",
SUCCESS_COLOR:"#00ff88",
ERROR_COLOR:"#ff0000",

LOGO:"PUT_SERVER_LOGO_LINK",
WELCOME_IMAGE:"PUT_WELCOME_IMAGE_LINK",
RULES_IMAGE:"PUT_RULES_IMAGE_LINK",

WELCOME_CHANNEL_ID:"PUT_WELCOME_CHANNEL_ID",
SERVER_REVIEW_CHANNEL_ID:"PUT_SERVER_REVIEW_CHANNEL_ID",
STAFF_REVIEW_CHANNEL_ID:"PUT_STAFF_REVIEW_CHANNEL_ID",
CREATOR_REVIEW_CHANNEL_ID:"PUT_CREATOR_REVIEW_CHANNEL_ID",
RATING_CHANNEL_ID:"PUT_RATING_CHANNEL_ID",

AUTO_ROLE_ID:"PUT_AUTO_ROLE_ID",
SERVER_ACCEPT_ROLE_ID:"PUT_SERVER_ACCEPT_ROLE_ID",
STAFF_ACCEPT_ROLE_ID:"PUT_STAFF_ACCEPT_ROLE_ID",
CREATOR_ACCEPT_ROLE_ID:"PUT_CREATOR_ACCEPT_ROLE_ID",
FIRST_FAIL_ROLE_ID:"PUT_FIRST_FAIL_ROLE_ID",
SECOND_FAIL_ROLE_ID:"PUT_SECOND_FAIL_ROLE_ID",

SERVER_RULES_LINK:"PUT_SERVER_RULES_LINK",
DISCORD_RULES_LINK:"PUT_DISCORD_RULES_LINK",
VOICE_LINK:"PUT_VOICE_CHANNEL_LINK",

ADMIN_ROLE_IDS:[
"PUT_ADMIN_ROLE_1",
"PUT_ADMIN_ROLE_2"
]
};

const ratedUsers=new Set();
const serverApplied=new Set();
const staffApplied=new Set();
const creatorApplied=new Set();
const serverRejectCount=new Map();
const serverCooldown=new Map();

function isAdmin(member){
return member.roles.cache.some(r=>CONFIG.ADMIN_ROLE_IDS.includes(r.id));
}

function premiumFooter(){
return {text:`${CONFIG.SERVER_NAME} • الإدارة الرسمية`};
}

function disabledRow(label,style){
return new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("done_disabled")
.setLabel(label)
.setStyle(style)
.setDisabled(true)
);
}

function welcomeButtons(userId=null){
const row1=new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setLabel("📜 قوانين السيرفر")
.setStyle(ButtonStyle.Link)
.setURL(CONFIG.SERVER_RULES_LINK),
new ButtonBuilder()
.setLabel("📖 قوانين الديسكورد")
.setStyle(ButtonStyle.Link)
.setURL(CONFIG.DISCORD_RULES_LINK)
);

const row2=new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId(userId?`apply_server_${userId}`:"apply_server")
.setLabel("📨 تقديم السيرفر")
.setStyle(ButtonStyle.Danger),
new ButtonBuilder()
.setCustomId(userId?`rate_${userId}`:"rate_server")
.setLabel("⭐ تقييم السيرفر")
.setStyle(ButtonStyle.Success)
);

const row3=new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("apply_staff")
.setLabel("🛡️ تقديم إداري")
.setStyle(ButtonStyle.Secondary),
new ButtonBuilder()
.setCustomId("apply_creator")
.setLabel("🎥 تقديم صانع محتوى")
.setStyle(ButtonStyle.Primary)
);

return [row1,row2,row3];
}

client.once(Events.ClientReady,async()=>{
console.log(`${client.user.tag} READY`);

const channel=await client.channels.fetch(CONFIG.WELCOME_CHANNEL_ID).catch(()=>null);
if(!channel)return;

const embed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setThumbnail(CONFIG.LOGO)
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# 👋 Welcome To ${CONFIG.SERVER_NAME}

━━━━━━━━━━━━━━━━━━

مرحباً بك في السيرفر الرسمي  
يرجى قراءة القوانين قبل التقديم

📌 يمكنك من هنا:
• قراءة قوانين السيرفر  
• قراءة قوانين الديسكورد  
• التقديم على الوايت ليست  
• التقديم على الإدارة  
• التقديم كصانع محتوى  
• تقييم السيرفر  

━━━━━━━━━━━━━━━━━━

# ⚠️ مهم
أي مخالفة للقوانين قد تعرضك للعقوبة
`)
.setFooter(premiumFooter());

await channel.send({
embeds:[embed],
components:welcomeButtons()
});
});

client.on(Events.GuildMemberAdd,async member=>{
if(CONFIG.AUTO_ROLE_ID!=="PUT_AUTO_ROLE_ID"){
member.roles.add(CONFIG.AUTO_ROLE_ID).catch(()=>{});
}

const channel=member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);
if(!channel)return;

const embed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setThumbnail(member.user.displayAvatarURL())
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# 👋 Welcome To ${CONFIG.SERVER_NAME}

━━━━━━━━━━━━━━━━━━

أهلاً بك ${member}

نتمنى لك تجربة ممتعة داخل السيرفر ❤️

📌 اقرأ القوانين جيداً  
📨 ثم قدم على الوايت ليست  
⭐ ويمكنك تقييم السيرفر من رسالتك فقط

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter());

channel.send({
content:`${member}`,
embeds:[embed],
components:welcomeButtons(member.id)
});
});

client.on(Events.InteractionCreate,async interaction=>{

if(interaction.isButton()&&interaction.customId.startsWith("rate_")){
const ownerId=interaction.customId.split("_")[1];

if(interaction.user.id!==ownerId){
return interaction.reply({content:"❌ لا يمكنك تقييم رسالة شخص آخر",ephemeral:true});
}

if(ratedUsers.has(interaction.user.id)){
return interaction.reply({content:"❌ لقد قمت بالتقييم بالفعل",ephemeral:true});
}

const row=new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("star_1").setLabel("⭐").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("star_2").setLabel("⭐⭐").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("star_3").setLabel("⭐⭐⭐").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("star_4").setLabel("⭐⭐⭐⭐").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("star_5").setLabel("⭐⭐⭐⭐⭐").setStyle(ButtonStyle.Success)
);

return interaction.reply({
content:"⭐ اختر تقييمك للسيرفر",
components:[row],
ephemeral:true
});
}

if(interaction.isButton()&&interaction.customId==="rate_server"){
if(ratedUsers.has(interaction.user.id)){
return interaction.reply({content:"❌ لقد قمت بالتقييم بالفعل",ephemeral:true});
}

const row=new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("star_1").setLabel("⭐").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("star_2").setLabel("⭐⭐").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("star_3").setLabel("⭐⭐⭐").setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setCustomId("star_4").setLabel("⭐⭐⭐⭐").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("star_5").setLabel("⭐⭐⭐⭐⭐").setStyle(ButtonStyle.Success)
);

return interaction.reply({
content:"⭐ اختر تقييمك للسيرفر",
components:[row],
ephemeral:true
});
}

if(interaction.isButton()&&interaction.customId.startsWith("star_")){
const stars=interaction.customId.split("_")[1];

const modal=new ModalBuilder()
.setCustomId(`rating_modal_${stars}`)
.setTitle("سبب التقييم");

const reason=new TextInputBuilder()
.setCustomId("reason")
.setLabel("اكتب سبب التقييم")
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(new ActionRowBuilder().addComponents(reason));
return interaction.showModal(modal);
}

if(interaction.isButton()&&(interaction.customId==="apply_server"||interaction.customId.startsWith("apply_server_"))){
return startApplication(interaction,"server");
}

if(interaction.isButton()&&interaction.customId==="apply_staff"){
return startApplication(interaction,"staff");
}

if(interaction.isButton()&&interaction.customId==="apply_creator"){
return startApplication(interaction,"creator");
}

if(interaction.isButton()&&interaction.customId.startsWith("accept_")){
if(!isAdmin(interaction.member)){
return interaction.reply({content:"❌ ليس لديك صلاحية",ephemeral:true});
}

const parts=interaction.customId.split("_");
const type=parts[1];
const userId=parts[2];

await acceptUser(interaction,type,userId);
}

if(interaction.isButton()&&interaction.customId.startsWith("reject_")){
if(!isAdmin(interaction.member)){
return interaction.reply({content:"❌ ليس لديك صلاحية",ephemeral:true});
}

const parts=interaction.customId.split("_");
const type=parts[1];
const userId=parts[2];

const modal=new ModalBuilder()
.setCustomId(`reject_modal_${type}_${userId}`)
.setTitle("سبب الرفض");

const reason=new TextInputBuilder()
.setCustomId("reason")
.setLabel("اكتب سبب الرفض")
.setStyle(TextInputStyle.Paragraph)
.setRequired(true);

modal.addComponents(new ActionRowBuilder().addComponents(reason));
return interaction.showModal(modal);
}

if(interaction.isModalSubmit()&&interaction.customId.startsWith("rating_modal_")){
const stars=interaction.customId.split("_")[2];
const reason=interaction.fields.getTextInputValue("reason");

ratedUsers.add(interaction.user.id);

const channel=client.channels.cache.get(CONFIG.RATING_CHANNEL_ID)||client.channels.cache.get(CONFIG.SERVER_REVIEW_CHANNEL_ID);

const embed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setThumbnail(interaction.user.displayAvatarURL())
.setImage(CONFIG.WELCOME_IMAGE)
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
.setFooter(premiumFooter());

channel?.send({embeds:[embed]});

await interaction.reply({content:"✅ شكراً لتقييمك",ephemeral:true});

interaction.user.send({
embeds:[
new EmbedBuilder()
.setColor(CONFIG.SUCCESS_COLOR)
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# ❤️ شكراً لتقييمك

━━━━━━━━━━━━━━━━━━

نشكرك على وقتك ودعمك لسيرفر  
**${CONFIG.SERVER_NAME}**

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter())
]
}).catch(()=>{});
}

if(interaction.isModalSubmit()&&interaction.customId.startsWith("reject_modal_")){
const parts=interaction.customId.split("_");
const type=parts[2];
const userId=parts[3];
const reason=interaction.fields.getTextInputValue("reason");

await rejectUser(interaction,type,userId,reason);
}
});

async function startApplication(interaction,type){
const userId=interaction.user.id;

if(type==="server"){
if(serverCooldown.has(userId))return interaction.reply({content:"❌ لا يمكنك التقديم الآن، حاول بعد أسبوع",ephemeral:true});
if(serverApplied.has(userId))return interaction.reply({content:"❌ لديك تقديم سيرفر قيد المراجعة",ephemeral:true});
serverApplied.add(userId);
}

if(type==="staff"){
if(staffApplied.has(userId))return interaction.reply({content:"❌ لديك تقديم إداري قيد المراجعة",ephemeral:true});
staffApplied.add(userId);
}

if(type==="creator"){
if(creatorApplied.has(userId))return interaction.reply({content:"❌ لديك تقديم صانع محتوى قيد المراجعة",ephemeral:true});
creatorApplied.add(userId);
}

await interaction.reply({content:"📨 تم فتح التقديم في الخاص",ephemeral:true});

const dm=await interaction.user.createDM().catch(()=>null);
if(!dm)return interaction.followUp({content:"❌ افتح الخاص عندك",ephemeral:true});

const title=type==="server"?"📨 تقديم السيرفر":type==="staff"?"🛡️ تقديم إداري":"🎥 تقديم صانع محتوى";

await dm.send({
embeds:[
new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setThumbnail(CONFIG.LOGO)
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# ${title}

━━━━━━━━━━━━━━━━━━

تم فتح التقديم بنجاح

قبل أن نبدأ، أرسل أي رسالة للتأكيد
أنك جاهز للإجابة على الأسئلة

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter())
]
});

const filter=m=>m.author.id===interaction.user.id;
const ready=await dm.awaitMessages({filter,max:1,time:300000}).catch(()=>null);
if(!ready)return;

const questions=getQuestions(type);
const answers=[];

for(let i=0;i<questions.length;i++){
await dm.send({
embeds:[
new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setDescription(`
# السؤال ${i+1}/${questions.length}

━━━━━━━━━━━━━━━━━━

${questions[i]}

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter())
]
});

const collected=await dm.awaitMessages({filter,max:1,time:600000}).catch(()=>null);
if(!collected)return;

answers.push(collected.first().content);
}

await sendReview(interaction,type,questions,answers);

await dm.send({
embeds:[
new EmbedBuilder()
.setColor(CONFIG.SUCCESS_COLOR)
.setThumbnail(CONFIG.LOGO)
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# ✅ تم استلام التقديم

━━━━━━━━━━━━━━━━━━

تم إرسال تقديمك للإدارة للمراجعة

يرجى الانتظار وعدم فتح تقديم جديد

نتمنى لك التوفيق ❤️

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter())
]
});
}

function getQuestions(type){
if(type==="server")return [
"ما اسمك الحقيقي ؟",
"كم عمرك ؟",
"ما اسم شخصيتك داخل الرول بلاي ؟",
"هل لديك خبرة في الرول بلاي ؟ اشرح خبرتك",
"ما معنى Fail RP ؟",
"ما معنى Meta Gaming ؟",
"ما معنى Power Gaming ؟",
"ما معنى Random Deathmatch ؟",
"كيف تتصرف إذا تم خطفك داخل السيرفر ؟",
"كيف تتصرف إذا خسرت سيناريو ؟",
"هل قرأت قوانين السيرفر ؟",
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
const channelId=type==="server"?CONFIG.SERVER_REVIEW_CHANNEL_ID:type==="staff"?CONFIG.STAFF_REVIEW_CHANNEL_ID:CONFIG.CREATOR_REVIEW_CHANNEL_ID;
const channel=client.channels.cache.get(channelId);
if(!channel)return;

const title=type==="server"?"📨 تقديم سيرفر جديد":type==="staff"?"🛡️ تقديم إداري جديد":"🎥 تقديم صانع محتوى جديد";

const embed=new EmbedBuilder()
.setColor(CONFIG.COLOR)
.setThumbnail(interaction.user.displayAvatarURL())
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# ${title}

━━━━━━━━━━━━━━━━━━

👤 المتقدم:
${interaction.user}

🆔 ID:
\`${interaction.user.id}\`

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter());

questions.forEach((q,i)=>{
embed.addFields({
name:`❓ ${i+1}. ${q}`,
value:answers[i].slice(0,1000)||"لا يوجد رد"
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

channel.send({
content:`${interaction.user}`,
embeds:[embed],
components:[row]
});
}

async function acceptUser(interaction,type,userId){
const member=await interaction.guild.members.fetch(userId).catch(()=>null);
const user=await client.users.fetch(userId).catch(()=>null);
if(!user)return interaction.reply({content:"❌ لم أجد الشخص",ephemeral:true});

let roleId=null;
let embed=null;
let components=[];

if(type==="server"){
roleId=CONFIG.SERVER_ACCEPT_ROLE_ID;
embed=new EmbedBuilder()
.setColor(CONFIG.SUCCESS_COLOR)
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# 🎉 تم قبول طلبك في السيرفر!

━━━━━━━━━━━━━━━━━━

# ✅ تهانينا!

تم قبولك مبدئياً في  
**${CONFIG.SERVER_NAME}**

تم تحويلك الآن إلى مرحلة المقابلة الصوتية

اضغط الزر بالأسفل للدخول إلى المقابلة الصوتية

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter());

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
embed=new EmbedBuilder()
.setColor(CONFIG.SUCCESS_COLOR)
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# 🛡️ تم قبولك في الإدارة!

━━━━━━━━━━━━━━━━━━

# 🎉 مبروك!

تم قبولك ضمن فريق إدارة  
**${CONFIG.SERVER_NAME}**

تم منحك الرتبة بنجاح

يرجى الالتزام بالقوانين
والتعامل باحترام مع جميع اللاعبين

يمنع إساءة استخدام الصلاحيات

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter());

staffApplied.delete(userId);
}

if(type==="creator"){
roleId=CONFIG.CREATOR_ACCEPT_ROLE_ID;
embed=new EmbedBuilder()
.setColor(CONFIG.SUCCESS_COLOR)
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# 🎥 تم قبولك كصانع محتوى!

━━━━━━━━━━━━━━━━━━

# 🎉 مبروك!

تم قبولك في برنامج صناع المحتوى داخل  
**${CONFIG.SERVER_NAME}**

يمكنك الآن نشر محتوى السيرفر
والمساهمة في نمو المجتمع

يرجى الالتزام بقوانين النشر

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter());

creatorApplied.delete(userId);
}

if(member&&roleId&&!roleId.startsWith("PUT_")){
member.roles.add(roleId).catch(()=>{});
}

await user.send({embeds:[embed],components}).catch(()=>{});

await interaction.update({
components:[disabledRow("✅ تم القبول",ButtonStyle.Success)]
});
}

async function rejectUser(interaction,type,userId,reason){
const user=await client.users.fetch(userId).catch(()=>null);
const member=await interaction.guild.members.fetch(userId).catch(()=>null);
if(!user)return interaction.reply({content:"❌ لم أجد الشخص",ephemeral:true});

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

serverCooldown.set(userId,true);
setTimeout(()=>serverCooldown.delete(userId),604800000);
}
}

if(type==="staff")staffApplied.delete(userId);
if(type==="creator")creatorApplied.delete(userId);

const title=type==="server"?"❌ تم رفض طلبك في السيرفر":type==="staff"?"❌ تم رفض طلبك الإداري":"❌ تم رفض طلب صانع المحتوى";

const embed=new EmbedBuilder()
.setColor(CONFIG.ERROR_COLOR)
.setImage(CONFIG.WELCOME_IMAGE)
.setDescription(`
# ${title}

━━━━━━━━━━━━━━━━━━

للأسف تم رفض طلبك الحالي بعد المراجعة

📝 السبب:
${reason}

يمكنك تحسين مستواك والمحاولة لاحقاً

نتمنى لك التوفيق ❤️

━━━━━━━━━━━━━━━━━━
`)
.setFooter(premiumFooter());

await user.send({embeds:[embed]}).catch(()=>{});

await interaction.update({
components:[disabledRow("❌ تم الرفض",ButtonStyle.Danger)]
});
}

client.login(CONFIG.TOKEN);

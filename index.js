const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const TOKEN = process.env.TOKEN;

// IDs 👇 عدلهم
const DECISION_CHANNEL_ID = "PUT_DECISION_CHANNEL_ID";
const WELCOME_CHANNEL_ID = "PUT_WELCOME_CHANNEL_ID";
const PREVIEW_CHANNEL_ID = "PUT_PREVIEW_CHANNEL_ID";
const REGISTER_CHANNEL_ID = "PUT_REGISTER_CHANNEL_ID";
const CREATOR_ROLE_ID = "PUT_CREATOR_ROLE_ID";

// 🧠 المسجلين
const registered = new Set();

// ================= READY =================
client.once("ready", async () => {
  console.log(`🔥 Logged in as ${client.user.tag}`);

  // زرار القرارات
  const decisionChannel = await client.channels.fetch(DECISION_CHANNEL_ID);

  const decisionBtn = new ButtonBuilder()
    .setCustomId("decision_button")
    .setLabel("📢 قرارات العصابة")
    .setStyle(ButtonStyle.Danger);

  await decisionChannel.send({
    content: "اضغط الزر لإرسال قرار",
    components: [new ActionRowBuilder().addComponents(decisionBtn)],
  });

  // زرار التسجيل
  const registerChannel = await client.channels.fetch(REGISTER_CHANNEL_ID);

  const registerBtn = new ButtonBuilder()
    .setCustomId("register_creator")
    .setLabel("🎬 تسجيل صانع محتوى")
    .setStyle(ButtonStyle.Success);

  await registerChannel.send({
    content: "اضغط الزر للتسجيل كصانع محتوى",
    components: [new ActionRowBuilder().addComponents(registerBtn)],
  });
});

// ================= BUTTONS =================
client.on("interactionCreate", async (interaction) => {
  // زرار التسجيل
  if (interaction.isButton() && interaction.customId === "register_creator") {
    const hasRole = interaction.member.roles.cache.has(CREATOR_ROLE_ID);

    if (!hasRole) {
      return interaction.reply({
        content: "❌ انت مش صانع محتوى",
        ephemeral: true,
      });
    }

    registered.add(interaction.user.id);

    return interaction.reply({
      content: "✅ تم تسجيلك كصانع محتوى",
      ephemeral: true,
    });
  }

  // زرار القرارات
  if (interaction.isButton() && interaction.customId === "decision_button") {
    const modal = new ModalBuilder()
      .setCustomId("decision_modal")
      .setTitle("اكتب قرار العصابة");

    const input = new TextInputBuilder()
      .setCustomId("decision_text")
      .setLabel("اكتب القرار هنا")
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);
  }

  // مودال القرار
  if (interaction.isModalSubmit() && interaction.customId === "decision_modal") {
    const decision = interaction.fields.getTextInputValue("decision_text");

    await interaction.reply({
      content: "✅ تم إرسال القرار",
      ephemeral: true,
    });

    const members = await interaction.guild.members.fetch();

    members.forEach(async (member) => {
      if (member.user.bot) return;

      try {
        const embed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("📢 SULTANS EL ZALL")
          .setDescription(`📌 ${decision}`);

        await member.send({ embeds: [embed] });
      } catch {}
    });
  }
});

// ================= الفيديوهات =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const hasRole = message.member.roles.cache.has(CREATOR_ROLE_ID);

  const isLink =
    message.content.includes("tiktok.com") ||
    message.content.includes("instagram.com") ||
    message.content.includes("youtube.com");

  if (!isLink) return;
  if (!hasRole) return;
  if (!registered.has(message.author.id)) return;

  try {
    const channel = await client.channels.fetch(PREVIEW_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#ff0050")
      .setTitle("🎬 New Content")
      .setDescription(`👤 ${message.author}

🔗 ${message.content}`);

    await channel.send({
      content: `🚨 <@&${CREATOR_ROLE_ID}>`,
      embeds: [embed],
    });

    await message.delete();
  } catch (err) {
    console.log(err);
  }
});

// ================= الترحيب =================
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

    if (channel) {
      channel.send(`🔥 Welcome ${member}`);
    }

    await member.send("👑 Welcome to SULTANS EL ZALL");
  } catch {}
});

client.login(TOKEN);

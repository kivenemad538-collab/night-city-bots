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
const DECISION_CHANNEL_ID = "1492903374872383578";
const WELCOME_CHANNEL_ID = "1492901647452737576";
const PREVIEW_CHANNEL_ID = "1493430556321517709";
const CREATOR_ROLE_ID = "1493427075904966766";

// 🧠 تسجيل المستخدمين
const registered = new Set();

// ================= READY =================
client.once("ready", async () => {
  console.log(`🔥 Logged in as ${client.user.tag}`);

  const channel = await client.channels.fetch(DECISION_CHANNEL_ID);

  const button = new ButtonBuilder()
    .setCustomId("decision_button")
    .setLabel("📢 قرارات العصابة")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(button);

  await channel.send({
    content: "اضغط الزر لإرسال قرار من الإدارة",
    components: [row],
  });
});

// ================= القرارات =================
client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "decision_button") {
      const modal = new ModalBuilder()
        .setCustomId("decision_modal")
        .setTitle("اكتب قرار العصابة");

      const input = new TextInputBuilder()
        .setCustomId("decision_text")
        .setLabel("اكتب القرار هنا")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "decision_modal") {
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
            .setTitle("📢 Message from SULTANS EL ZALL")
            .setDescription(`👋 Hello ${member}

📌 Decision:
${decision}`);

          await member.send({ embeds: [embed] });
        } catch {}
      });
    }
  }
});

// ================= تسجيل + نشر الفيديوهات =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const hasRole = message.member.roles.cache.has(CREATOR_ROLE_ID);

  // 🔹 تسجيل
  if (message.content === "!register") {
    if (!hasRole) {
      return message.reply("❌ انت مش صانع محتوى");
    }

    registered.add(message.author.id);
    return message.reply("✅ تم تسجيلك كصانع محتوى");
  }

  // 🔹 فحص لينكات
  const isLink =
    message.content.includes("tiktok.com") ||
    message.content.includes("instagram.com") ||
    message.content.includes("youtube.com");

  if (!isLink) return;
  if (!hasRole) return;

  if (!registered.has(message.author.id)) {
    return message.reply("❌ لازم تسجل الأول باستخدام !register");
  }

  try {
    const channel = await client.channels.fetch(PREVIEW_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#ff0050")
      .setTitle("🎬 New Content Uploaded")
      .setDescription(`👤 Creator: ${message.author}

📱 Platform Link:
${message.content}

🔥 SULTANS EL ZALL`);

    await channel.send({
      content: `🚨 <@&${CREATOR_ROLE_ID}> New Video!`,
      embeds: [embed],
    });

    await message.delete(); // يحذف الرسالة الأصلية
  } catch (err) {
    console.log("Error:", err);
  }
});

// ================= الترحيب =================
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

    if (channel) {
      channel.send(`🔥 Welcome ${member} to SULTANS EL ZALL 👑`);
    }

    await member.send({
      embeds: [
        {
          color: 0xff0000,
          title: "👑 Welcome to SULTANS EL ZALL",
          description: `👋 Hello ${member.user.username}

🔥 Welcome to the gang`,
        },
      ],
    });
  } catch {}
});

client.login(TOKEN);

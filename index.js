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
  ],
  partials: [Partials.Channel],
});

const TOKEN = process.env.TOKEN;

// IDs 👇 عدلهم
const DECISION_CHANNEL_ID = "1492903374872383578";
const WELCOME_CHANNEL_ID = "1492901647452737576";

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

// 🔥 زرار القرار
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
        content: "✅ تم إرسال القرار لكل الأعضاء",
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

📌 **Decision:**
${decision}

🔥 SULTANS EL ZALL`);

          await member.send({ embeds: [embed] });
        } catch (err) {
          console.log(`❌ Couldn't DM ${member.user.tag}`);
        }
      });
    }
  }
});

// 🔥 الترحيب
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

    // رسالة في السيرفر
    if (channel) {
      channel.send({
        content: `🔥 Welcome ${member} to **SULTANS EL ZALL** 👑`,
      });
    }

    // DM
    await member.send({
      embeds: [
        {
          color: 0xff0000,
          title: "👑 Welcome to SULTANS EL ZALL",
          description: `👋 Hello ${member.user.username}

🔥 Welcome to the gang  
📜 Check the rules and enjoy your stay  

💀 SULTANS EL ZALL`,
        },
      ],
    });
  } catch (err) {
    console.log("❌ Error welcoming user:", err);
  }
});

client.login(TOKEN);

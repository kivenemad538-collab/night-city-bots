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

// لما البوت يشتغل
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // غير ID التشانل هنا 👇
  const channelId = "PUT_CHANNEL_ID_HERE";
  const channel = await client.channels.fetch(channelId);

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

// لما حد يدوس الزر
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

  // بعد ما يكتب القرار
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "decision_modal") {
      const decision = interaction.fields.getTextInputValue("decision_text");

      await interaction.reply({
        content: "✅ تم إرسال القرار لكل الأعضاء",
        ephemeral: true,
      });

      const guild = interaction.guild;

      // نجيب كل الأعضاء
      const members = await guild.members.fetch();

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
          console.log(`Couldn't DM ${member.user.tag}`);
        }
      });
    }
  }
});

client.login(TOKEN);

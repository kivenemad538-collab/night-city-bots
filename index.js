require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require("discord.js");

const fs = require("fs");

const TOKEN = process.env.TOKEN;

// ======================================================
// CONFIG
// ======================================================

const CONFIG = {

  SERVER_NAME: "Nova Cfw RP",

  // ================= CHANNELS =================

  WELCOME_CHANNEL_ID: "WELCOME_CHANNEL_ID",

  RULES_CHANNEL_ID: "RULES_CHANNEL_ID",

  SERVER_APPLY_CHANNEL_ID: "SERVER_APPLY_CHANNEL_ID",

  RATING_REVIEW_CHANNEL_ID: "RATING_REVIEW_CHANNEL_ID",

  SERVER_REVIEW_CHANNEL_ID: "SERVER_REVIEW_CHANNEL_ID",

  CREATOR_REVIEW_CHANNEL_ID: "CREATOR_REVIEW_CHANNEL_ID",

  ADMIN_REVIEW_CHANNEL_ID: "ADMIN_REVIEW_CHANNEL_ID",

  VOICE_INTERVIEW_CHANNEL: "VOICE_INTERVIEW_CHANNEL_ID",

  // ================= ACCEPT ROLES =================

  SERVER_ACCEPT_ROLE: "SERVER_ACCEPT_ROLE_ID",

  CREATOR_ACCEPT_ROLE: "CREATOR_ACCEPT_ROLE_ID",

  ADMIN_ACCEPT_ROLE: "ADMIN_ACCEPT_ROLE_ID",

  // ================= FAIL ROLES =================

  SERVER_FAIL_ROLE_1: "SERVER_FAIL_ROLE_1",

  SERVER_FAIL_ROLE_2: "SERVER_FAIL_ROLE_2"

};

// ======================================================
// FILES
// ======================================================

const RATE_FILE = "./ratings.json";

const APPLY_FILE = "./applyData.json";

if (!fs.existsSync(RATE_FILE)) {

  fs.writeFileSync(
    RATE_FILE,
    JSON.stringify({ ratedUsers: [] }, null, 2)
  );

}

if (!fs.existsSync(APPLY_FILE)) {

  fs.writeFileSync(
    APPLY_FILE,
    JSON.stringify({ failedUsers: {} }, null, 2)
  );

}

function readRateData() {

  return JSON.parse(
    fs.readFileSync(RATE_FILE)
  );

}

function saveRateData(data) {

  fs.writeFileSync(
    RATE_FILE,
    JSON.stringify(data, null, 2)
  );

}

function readApplyData() {

  return JSON.parse(
    fs.readFileSync(APPLY_FILE)
  );

}

function saveApplyData(data) {

  fs.writeFileSync(
    APPLY_FILE,
    JSON.stringify(data, null, 2)
  );

}

// ======================================================
// CLIENT
// ======================================================

const client = new Client({

  intents: [

    GatewayIntentBits.Guilds,

    GatewayIntentBits.GuildMembers,

    GatewayIntentBits.GuildMessages,

    GatewayIntentBits.MessageContent,

    GatewayIntentBits.DirectMessages

  ],

  partials: [Partials.Channel]

});

// ======================================================
// READY
// ======================================================

client.once(Events.ClientReady, () => {

  console.log(`✅ Logged in as ${client.user.tag}`);

});

// ======================================================
// QUESTIONS
// ======================================================

const questions = {

  server: [

    "اسمك الحقيقي؟",

    "سنك كام؟",

    "اسمك داخل اللعبة؟",

    "عندك خبرة رول بلاي قد ايه؟",

    "يعني ايه RDM؟",

    "يعني ايه VDM؟",

    "يعني ايه Meta Gaming؟",

    "يعني ايه Power Gaming؟",

    "لو حصلت مشكلة مع لاعب هتتصرف ازاي؟",

    "ليه اخترت Nova Cfw RP؟"

  ],

  creator: [

    "اسمك؟",

    "سنك كام؟",

    "اسم قناتك؟",

    "لينك القناة؟",

    "عدد المتابعين كام؟",

    "بتنزل محتوى ايه؟",

    "بتستخدم اي منصة؟",

    "هل تقدر تنزل محتوى باستمرار؟",

    "هل عندك خبرة رول بلاي؟",

    "ليه عايز تبقى صانع محتوى؟"

  ],

  admin: [

    "اسمك؟",

    "سنك كام؟",

    "عندك خبرة ادارة؟",

    "اشتغلت اداري قبل كده؟",

    "ازاي تتعامل مع المشاكل؟",

    "لو صاحبك غلط تعمل ايه؟",

    "ازاي تتعامل مع اللاعبين؟",

    "قد ايه تقدر تتواجد؟",

    "ايه اهم صفات الاداري؟",

    "ليه عايز تبقى اداري؟"

  ]

};

const reviewChannels = {

  server: CONFIG.SERVER_REVIEW_CHANNEL_ID,

  creator: CONFIG.CREATOR_REVIEW_CHANNEL_ID,

  admin: CONFIG.ADMIN_REVIEW_CHANNEL_ID

};

const appNames = {

  server: "📄 تقديم السيرفر",

  creator: "🎥 تقديم صانع محتوى",

  admin: "🛡️ تقديم إداري"

};

// ======================================================
// WELCOME SYSTEM
// ======================================================

client.on(Events.GuildMemberAdd, async (member) => {

  const channel =
    member.guild.channels.cache.get(
      CONFIG.WELCOME_CHANNEL_ID
    );

  if (!channel) return;

  const embed = new EmbedBuilder()

    .setColor("#00AEEF")

    .setTitle(`👋 Welcome To ${CONFIG.SERVER_NAME}`)

    .setDescription(

      `━━━━━━━━━━━━━━━━━━\n\n` +

      `✨ أهلا بيك ${member}\n\n` +

      `نورت سيرفر ${CONFIG.SERVER_NAME}\n\n` +

      `📜 اقرأ القوانين قبل التقديم.\n\n` +

      `📄 قدم على الوايت ليست.\n\n` +

      `⭐ تقدر تقيم السيرفر.\n\n` +

      `👥 أنت العضو رقم ${member.guild.memberCount}\n\n` +

      `━━━━━━━━━━━━━━━━━━`

    )

    .setThumbnail(
      member.user.displayAvatarURL({
        dynamic: true
      })
    )

    .setImage(
      "https://media.discordapp.net/attachments/1363239682770722867/1369055770666152076/standard.gif"
    )

    .setFooter({
      text: `${CONFIG.SERVER_NAME}`
    })

    .setTimestamp();

  const row =
    new ActionRowBuilder().addComponents(

      new ButtonBuilder()

        .setLabel("📜 قوانين السيرفر")

        .setStyle(ButtonStyle.Link)

        .setURL(
          `https://discord.com/channels/${member.guild.id}/${CONFIG.RULES_CHANNEL_ID}`
        ),

      new ButtonBuilder()

        .setLabel("📄 تقديم السيرفر")

        .setStyle(ButtonStyle.Link)

        .setURL(
          `https://discord.com/channels/${member.guild.id}/${CONFIG.SERVER_APPLY_CHANNEL_ID}`
        ),

      new ButtonBuilder()

        .setCustomId(`rate_${member.id}`)

        .setLabel("⭐ تقييم السيرفر")

        .setStyle(ButtonStyle.Primary)

    );

  await channel.send({

    content: `${member}`,

    embeds: [embed],

    components: [row]

  });

});

// ======================================================
// APPLY PANEL
// ======================================================

client.on(Events.MessageCreate, async (message) => {

  if (message.author.bot) return;

  if (message.content === "!setup-apply") {

    const embed = new EmbedBuilder()

      .setColor("#00AEEF")

      .setTitle(`📄 تقديمات ${CONFIG.SERVER_NAME}`)

      .setDescription(

        `━━━━━━━━━━━━━━━━━━\n\n` +

        `اختار نوع التقديم المناسب.\n\n` +

        `📄 تقديم السيرفر\n\n` +

        `🎥 تقديم صانع محتوى\n\n` +

        `🛡️ تقديم إداري\n\n` +

        `━━━━━━━━━━━━━━━━━━`

      )

      .setFooter({
        text: `${CONFIG.SERVER_NAME}`
      });

    const row =
      new ActionRowBuilder().addComponents(

        new ButtonBuilder()

          .setCustomId("apply_server")

          .setLabel("📄 تقديم السيرفر")

          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()

          .setCustomId("apply_creator")

          .setLabel("🎥 تقديم صانع محتوى")

          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()

          .setCustomId("apply_admin")

          .setLabel("🛡️ تقديم إداري")

          .setStyle(ButtonStyle.Danger)

      );

    await message.channel.send({

      embeds: [embed],

      components: [row]

    });

  }

});

// ======================================================
// INTERACTIONS
// ======================================================

client.on(Events.InteractionCreate, async (interaction) => {

  // ======================================================
  // BUTTONS
  // ======================================================

  if (interaction.isButton()) {

    // ================= APPLY =================

    if (interaction.customId === "apply_server") {
      return startApplication(interaction, "server");
    }

    if (interaction.customId === "apply_creator") {
      return startApplication(interaction, "creator");
    }

    if (interaction.customId === "apply_admin") {
      return startApplication(interaction, "admin");
    }

    // ================= RATING =================

    if (interaction.customId.startsWith("rate_")) {

      const targetId =
        interaction.customId.split("_")[1];

      if (interaction.user.id !== targetId) {

        return interaction.reply({

          content:
            "❌ التقييم لصاحب رسالة الترحيب فقط.",

          ephemeral: true

        });

      }

      const data = readRateData();

      if (
        data.ratedUsers.includes(
          interaction.user.id
        )
      ) {

        return interaction.reply({

          content:
            "❌ أنت قيمت السيرفر قبل كده.",

          ephemeral: true

        });

      }

      const row =
        new ActionRowBuilder().addComponents(

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
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId("star_5")
            .setLabel("⭐⭐⭐⭐⭐")
            .setStyle(ButtonStyle.Secondary)

        );

      return interaction.reply({

        content:
          "⭐ اختار تقييمك للسيرفر",

        components: [row],

        ephemeral: true

      });

    }

    // ================= STAR BUTTON =================

    if (interaction.customId.startsWith("star_")) {

      const stars =
        interaction.customId.split("_")[1];

      const modal = new ModalBuilder()

        .setCustomId(`rate_modal_${stars}`)

        .setTitle("تقييم السيرفر");

      const reason =
        new TextInputBuilder()

          .setCustomId("reason")

          .setLabel("اكتب سبب التقييم")

          .setStyle(TextInputStyle.Paragraph)

          .setRequired(true);

      modal.addComponents(

        new ActionRowBuilder().addComponents(reason)

      );

      return interaction.showModal(modal);

    }

    // ================= ACCEPT =================

    if (interaction.customId.startsWith("accept_")) {

      const args =
        interaction.customId.split("_");

      const type = args[1];

      const userId = args[2];

      const member =
        await interaction.guild.members.fetch(userId)
        .catch(() => null);

      if (!member) return;

      // ===== SERVER ACCEPT =====

      if (type === "server") {

        const role =
          interaction.guild.roles.cache.get(
            CONFIG.SERVER_ACCEPT_ROLE
          );

        if (role) {

          await member.roles.add(role)
          .catch(() => {});

        }

        const embed = new EmbedBuilder()

          .setColor("#00ff66")

          .setTitle("🎉 تم قبول طلبك!")

          .setDescription(

            `━━━━━━━━━━━━━━━━━━\n\n` +

            `✅ تم قبولك في السيرفر.\n\n` +

            `🎖️ تم إعطائك رتبة القبول.\n\n` +

            `🎤 ادخل المقابلة الصوتية من الزر بالأسفل.\n\n` +

            `━━━━━━━━━━━━━━━━━━`

          )

          .setFooter({
            text: `${CONFIG.SERVER_NAME}`
          });

        const row =
          new ActionRowBuilder().addComponents(

            new ButtonBuilder()

              .setLabel("🎤 دخول المقابلة")

              .setStyle(ButtonStyle.Link)

              .setURL(
                `https://discord.com/channels/${interaction.guild.id}/${CONFIG.VOICE_INTERVIEW_CHANNEL}`
              )

          );

        await member.send({

          embeds: [embed],

          components: [row]

        });

      }

      // ===== CREATOR ACCEPT =====

      if (type === "creator") {

        const role =
          interaction.guild.roles.cache.get(
            CONFIG.CREATOR_ACCEPT_ROLE
          );

        if (role) {

          await member.roles.add(role)
          .catch(() => {});

        }

        const embed = new EmbedBuilder()

          .setColor("#00ff66")

          .setTitle("🎥 تم قبولك كصانع محتوى!")

          .setDescription(

            `━━━━━━━━━━━━━━━━━━\n\n` +

            `🎉 مبروك!\n\n` +

            `تم إعطائك رتبة صانع المحتوى.\n\n` +

            `يمكنك الآن نشر محتوى السيرفر.\n\n` +

            `━━━━━━━━━━━━━━━━━━`

          );

        await member.send({
          embeds: [embed]
        });

      }

      // ===== ADMIN ACCEPT =====

      if (type === "admin") {

        const role =
          interaction.guild.roles.cache.get(
            CONFIG.ADMIN_ACCEPT_ROLE
          );

        if (role) {

          await member.roles.add(role)
          .catch(() => {});

        }

        const embed = new EmbedBuilder()

          .setColor("#00ff66")

          .setTitle("🛡️ تم قبولك في الإدارة!")

          .setDescription(

            `━━━━━━━━━━━━━━━━━━\n\n` +

            `🎉 مبروك!\n\n` +

            `تم إعطائك رتبة الإدارة.\n\n` +

            `يرجى الالتزام بالقوانين.\n\n` +

            `━━━━━━━━━━━━━━━━━━`

          );

        await member.send({
          embeds: [embed]
        });

      }

      await interaction.message.edit({
        components: []
      });

      return interaction.reply({

        content:
          "✅ تم قبول التقديم.",

        ephemeral: true

      });

    }

    // ================= REJECT =================

    if (interaction.customId.startsWith("reject_")) {

      const args =
        interaction.customId.split("_");

      const type = args[1];

      const userId = args[2];

      const modal = new ModalBuilder()

        .setCustomId(
          `reject_modal_${type}_${userId}`
        )

        .setTitle("سبب الرفض");

      const input =
        new TextInputBuilder()

          .setCustomId("rejectReason")

          .setLabel("اكتب سبب الرفض")

          .setStyle(TextInputStyle.Paragraph)

          .setRequired(true);

      modal.addComponents(

        new ActionRowBuilder().addComponents(input)

      );

      return interaction.showModal(modal);

    }

  }

  // ======================================================
  // MODALS
  // ======================================================

  if (interaction.isModalSubmit()) {

    // ================= RATE MODAL =================

    if (
      interaction.customId.startsWith(
        "rate_modal_"
      )
    ) {

      const stars =
        interaction.customId.split("_")[2];

      const reason =
        interaction.fields.getTextInputValue(
          "reason"
        );

      const data = readRateData();

      data.ratedUsers.push(
        interaction.user.id
      );

      saveRateData(data);

      const channel =
        interaction.guild.channels.cache.get(
          CONFIG.RATING_REVIEW_CHANNEL_ID
        );

      const embed = new EmbedBuilder()

        .setColor("#FFD700")

        .setTitle("⭐ تقييم جديد للسيرفر")

        .addFields(

          {
            name: "👤 الشخص",
            value: `${interaction.user}`
          },

          {
            name: "⭐ التقييم",
            value:
              `${"⭐".repeat(Number(stars))}`
          },

          {
            name: "📝 السبب",
            value: reason
          }

        )

        .setTimestamp();

      await channel.send({
        embeds: [embed]
      });

      return interaction.reply({

        content:
          "✅ تم إرسال تقييمك.",

        ephemeral: true

      });

    }

    // ================= REJECT MODAL =================

    if (
      interaction.customId.startsWith(
        "reject_modal_"
      )
    ) {

      const args =
        interaction.customId.split("_");

      const type = args[2];

      const userId = args[3];

      const reason =
        interaction.fields.getTextInputValue(
          "rejectReason"
        );

      const member =
        await interaction.guild.members.fetch(userId)
        .catch(() => null);

      if (!member) return;

      const embed = new EmbedBuilder()

        .setColor("#ff0000")

        .setTitle("❌ تم رفض طلبك")

        .setDescription(

          `━━━━━━━━━━━━━━━━━━\n\n` +

          `للأسف تم رفض تقديمك.\n\n` +

          `📝 السبب:\n${reason}\n\n` +

          `━━━━━━━━━━━━━━━━━━`

        );

      await member.send({
        embeds: [embed]
      });

      // ===== FAIL SYSTEM =====

      if (type === "server") {

        const data = readApplyData();

        if (!data.failedUsers[userId]) {
          data.failedUsers[userId] = 0;
        }

        data.failedUsers[userId]++;

        saveApplyData(data);

        if (
          data.failedUsers[userId] === 1
        ) {

          const role =
            interaction.guild.roles.cache.get(
              CONFIG.SERVER_FAIL_ROLE_1
            );

          if (role) {

            await member.roles.add(role)
            .catch(() => {});

          }

        }

        if (
          data.failedUsers[userId] >= 2
        ) {

          const role =
            interaction.guild.roles.cache.get(
              CONFIG.SERVER_FAIL_ROLE_2
            );

          if (role) {

            await member.roles.add(role)
            .catch(() => {});

          }

        }

      }

      return interaction.reply({

        content:
          "✅ تم رفض التقديم.",

        ephemeral: true

      });

    }

  }

});

// ======================================================
// APPLICATION FUNCTION
// ======================================================

async function startApplication(
  interaction,
  type
) {

  const applyData = readApplyData();

  if (

    type === "server" &&

    applyData.failedUsers[
      interaction.user.id
    ] >= 2

  ) {

    return interaction.reply({

      content:
        "❌ تم منعك من التقديم بسبب الرسوب مرتين.",

      ephemeral: true

    });

  }

  await interaction.reply({

    content:
      "📩 تم إرسال الأسئلة لك بالخاص.",

    ephemeral: true

  });

  const user = interaction.user;

  try {

    const dm = await user.createDM();

    const startEmbed = new EmbedBuilder()

      .setColor("#00AEEF")

      .setTitle(appNames[type])

      .setDescription(

        `━━━━━━━━━━━━━━━━━━\n\n` +

        `جاوب على الأسئلة بدقة.\n\n` +

        `━━━━━━━━━━━━━━━━━━`

      );

    await dm.send({
      embeds: [startEmbed]
    });

    const answers = [];

    for (
      let i = 0;
      i < questions[type].length;
      i++
    ) {

      await dm.send(
        `### ${i + 1}. ${questions[type][i]}`
      );

      const collected =
        await dm.awaitMessages({

          filter:
            (m) =>
              m.author.id === user.id,

          max: 1,

          time: 600000

        });

      if (!collected.size) {

        return dm.send(
          "❌ انتهى الوقت."
        );

      }

      answers.push(
        collected.first().content
      );

    }

    await dm.send(
      "✅ تم إرسال التقديم للإدارة."
    );

    const reviewChannel =
      interaction.guild.channels.cache.get(
        reviewChannels[type]
      );

    const embed = new EmbedBuilder()

      .setColor("#00AEEF")

      .setTitle(appNames[type])

      .setDescription(
        `📥 تقديم جديد من ${user}`
      )

      .setThumbnail(
        user.displayAvatarURL({
          dynamic: true
        })
      )

      .setTimestamp();

    questions[type].forEach((q, i) => {

      embed.addFields({

        name: `❓ ${q}`,

        value: `📝 ${answers[i]}`,

        inline: false

      });

    });

    const row =
      new ActionRowBuilder().addComponents(

        new ButtonBuilder()

          .setCustomId(
            `accept_${type}_${user.id}`
          )

          .setLabel("✅ قبول")

          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()

          .setCustomId(
            `reject_${type}_${user.id}`
          )

          .setLabel("❌ رفض")

          .setStyle(ButtonStyle.Danger)

      );

    await reviewChannel.send({

      embeds: [embed],

      components: [row]

    });

  } catch (err) {

    return interaction.followUp({

      content:
        "❌ افتح الخاص وجرب تاني.",

      ephemeral: true

    });

  }

}

// ======================================================
// LOGIN
// ======================================================

client.login(TOKEN);

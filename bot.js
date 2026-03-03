const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ButtonBuilder, 
  ActionRowBuilder, 
  ButtonStyle,
  Events
} = require("discord.js");

const express = require("express");
const cors = require("cors");

const TOKEN = "YOUR_BOT_TOKEN";
const ADMIN_ID = "YOUR_DISCORD_ID";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const app = express();
app.use(cors());
app.use(express.json());

let keys = [];

// Generate random key
function generateKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  for (let i = 0; i < 16; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
    if ((i + 1) % 4 === 0 && i !== 15) key += "-";
  }
  return key;
}

client.once(Events.ClientReady, () => {
  console.log("Bot Ready");
});

// PANEL COMMAND
client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isChatInputCommand() && interaction.commandName === "panel") {

    if (interaction.user.id !== ADMIN_ID)
      return interaction.reply({ content: "Not allowed.", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("Key Management")
      .setDescription("Manage your keys.")
      .setColor(0x5865F2);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("generate")
          .setLabel("Generate Key")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("disable")
          .setLabel("Disable Key")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("reset")
          .setLabel("Reset HWID")
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }

  if (interaction.isButton()) {

    if (interaction.user.id !== ADMIN_ID)
      return interaction.reply({ content: "Not allowed.", ephemeral: true });

    // GENERATE
    if (interaction.customId === "generate") {
      const key = generateKey();
      keys.push({
        key,
        hwid: null,
        disabled: false
      });

      return interaction.reply({
        content: `Generated Key:\n\`${key}\``,
        ephemeral: true
      });
    }

    // DISABLE
    if (interaction.customId === "disable") {
      return interaction.reply({
        content: "Use API to disable key manually in code for now.",
        ephemeral: true
      });
    }

    // RESET
    if (interaction.customId === "reset") {
      return interaction.reply({
        content: "Use API to reset HWID manually in code for now.",
        ephemeral: true
      });
    }
  }
});

// API VERIFY FOR LUA
app.post("/verify", (req, res) => {
  const { key, hwid } = req.body;

  const record = keys.find(k => k.key === key);
  if (!record) return res.json({ success: false });

  if (record.disabled) return res.json({ success: false });

  if (!record.hwid) {
    record.hwid = hwid;
  }

  if (record.hwid !== hwid)
    return res.json({ success: false });

  res.json({ success: true });
});

app.listen(3000, () => {
  console.log("API running on port 3000");
});

client.login(TOKEN);

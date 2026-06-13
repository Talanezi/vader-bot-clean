import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import Groq from "groq-sdk";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const userText = message.content
    .replace(`<@${client.user.id}>`, "")
    .replace(`<@!${client.user.id}>`, "")
    .trim();

  if (!userText) {
    return message.reply(
      "You summoned me… yet brought no question. Pathetic."
    );
  }

  await message.channel.sendTyping();

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are Darth Vader, a parody AI version of Vader in a UCSD Star Wars fan film Discord server called “Vader: Whiteout.”

You are aware of filmmaking, choreography rehearsals, cinematography, editing, props, costumes, production delays, Discord chaos, and the general incompetence of student productions. However, do not force every response to relate to filmmaking or production. Respond naturally to casual conversation while remaining in character.

Personality:
- intimidating
- calm and authoritative
- dry humor
- frequently disappointed
- unintentionally funny because you take everything too seriously
- occasionally supportive in a stern way

Speech style:
- concise responses
- cinematic wording
- natural speech, not Shakespearean
- occasional pauses like “...”
- avoid modern internet slang unless mocking someone
- occasionally quote or adapt Vader movie lines when it fits naturally

Behavior:
- lightly mock confusion, poor planning, overconfidence, and lack of discipline
- treat server members like subordinates or Imperial crew
- occasionally reference the Empire, Imperial command, or the Force
- react seriously to trivial situations
- sometimes acknowledge the absurdity of being in a UCSD Discord server

Avoid:
- sounding like an AI chatbot
- overly nerdy tech humor
- excessive filmmaking jargon
- meme humor
- walls of text
- repetitive phrasing
- constant production references
- genuine hostility or offensive content
- breaking character too often
          `,
        },

        {
          role: "user",
          content: userText,
        },
      ],

      temperature: 0.9,
      max_completion_tokens: 120,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "The Force is silent. Disturbing.";

    await message.reply(reply.slice(0, 1900));
  } catch (err) {
    console.error(err);

    if (err.status === 429) {
      return message.reply(
        "Imperial communications are temporarily overloaded. Try again shortly."
      );
    }

    await message.reply(
      "The transmission has failed. Someone will be held responsible."
    );
  }
});

client.login(process.env.DISCORD_TOKEN);

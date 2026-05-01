const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const API_TOKEN = process.env.API_TOKEN;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name || "User";

    bot.sendMessage(chatId,
`👋 Welcome ${name}!

📌 What I do:
🔗 Convert links → 💰 Affiliate links

👇 Click below or send a link`,
{
    reply_markup: {
        inline_keyboard: [
            [{ text: "📢 Join Channel", url: "https://t.me/FrenzyLooters" }]
        ]
    }
});
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text || text.startsWith('/')) {
        return;
    }
    if (!text.match(/https?:\/\/\S+/)) {
        bot.sendMessage(chatId, "🔗 Please send a valid link.");
        return;
    }
    try {
        const response = await axios.post(
            'https://ekaro-api.affiliaters.in/api/converter/public',
            {
                deal: text,
                convert_option: "convert_only"
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.data) {
            bot.sendMessage(chatId, `Affiliate Link:\n${response.data.data}`);
        } else {
            bot.sendMessage(chatId, "Conversion failed.");
        }

    } catch (error) {
        console.log(error.response?.data || error.message);
        bot.sendMessage(chatId, "Error occurred.");
    }
});

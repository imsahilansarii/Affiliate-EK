const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const API_TOKEN = process.env.API_TOKEN;

const bot = new TelegramBot(TELEGRAM_TOKEN, {
    polling: true
});

console.log("🚀 EarnKro Bot Running");


// ========================================
// START MESSAGE
// ========================================

bot.onText(/\/start/, async (msg) => {

    const chatId = msg.chat.id;
    const name = msg.from.first_name || "User";

    bot.sendMessage(chatId,
`🔥 Welcome ${name}

🚀 Convert any shopping or product link into an affiliate link instantly.

📩 Just send your link below.`,
{
    reply_markup: {
        inline_keyboard: [

            [
                {
                    text: "📢 Updates Channel",
                    url: "https://t.me/FrenzyLooters"
                }
            ],

            [
                {
                    text: "💬 Support",
                    url: "https://t.me/imsahilansarii"
                }
            ]

        ]
    }
});

});


// ========================================
// MAIN LINK CONVERTER
// ========================================

bot.on('message', async (msg) => {

    const chatId = msg.chat.id;

    // text OR image caption
    const text = msg.text || msg.caption;

    // ignore commands
    if (!text || text.startsWith('/')) {
        return;
    }

    // detect valid url
    if (!text.match(/https?:\/\/\S+/)) {

        bot.sendMessage(chatId,
`❌ Please send a valid link.`);
        return;
    }

    try {

        // processing message
        const processing = await bot.sendMessage(chatId,
`⚡ Converting your link...`);

        // API request
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

        const result = response.data;

        // delete processing msg
        try {
            await bot.deleteMessage(chatId, processing.message_id);
        } catch {}

        // success
        if (result && result.data) {

            bot.sendMessage(chatId,
`🔥 Here's your Converted Link 🔗 

${result.data}`,
{
    reply_markup: {
        inline_keyboard: [

            [
                {
                    text: "🚀 Open Link",
                    url: result.data
                }
            ]

        ]
    }
});

        } else {

            bot.sendMessage(chatId,
`❌ Failed to convert this link.`);
        }

    } catch (error) {

        console.log(error.response?.data || error.message);

        bot.sendMessage(chatId,
`⚠️ Server error. Please try again later.`);
    }

});

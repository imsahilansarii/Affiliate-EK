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

    // support text + image/video caption
    const text = msg.text || msg.caption || "";

    // ignore commands
    if (text.startsWith('/')) {
        return;
    }

    // extract URL
    const urlMatch = text.match(/https?:\/\/[^\s]+/);

    if (!urlMatch) {

        bot.sendMessage(chatId,
`❌ Please send a valid link.`);
        return;
    }

    const extractedUrl = urlMatch[0];

    try {

        const processing = await bot.sendMessage(chatId,
`⚡ Converting your link...`);

        // API request
        const response = await axios.post(
            'https://ekaro-api.affiliaters.in/api/converter/public',
            {
                deal: extractedUrl,
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

        // remove processing msg
        try {
            await bot.deleteMessage(chatId, processing.message_id);
        } catch {}

        // success
        if (result && result.data) {

    // original text/caption
    let updatedText = text.replace(extractedUrl, result.data);

    // if image
    if (msg.photo) {

        const photoId = msg.photo[msg.photo.length - 1].file_id;

        await bot.sendPhoto(chatId, photoId, {
            caption: updatedText
        });

    }

    // if video
    else if (msg.video) {

        await bot.sendVideo(chatId, msg.video.file_id, {
            caption: updatedText
        });

    }

    // if document
    else if (msg.document) {

        await bot.sendDocument(chatId, msg.document.file_id, {
            caption: updatedText
        });

    }

    // normal text
    else {

        await bot.sendMessage(chatId, updatedText, {
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

    }

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

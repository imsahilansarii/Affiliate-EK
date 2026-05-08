const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const API_TOKEN = process.env.API_TOKEN;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log("🚀 EarnKro Ultra UI Bot Running...");


// ========================================
// ⭐ PREMIUM EMOJI IDs
// ========================================

const STAR_EMOJI_ID = "5463154755054349837";


// ========================================
// ✨ PREMIUM EMOJI HELPER
// ========================================

async function sendPremium(chatId, text, emoji = "⭐") {

    const position = text.indexOf(emoji);

    return bot.sendMessage(chatId, text, {
        entities: [
            {
                offset: position,
                length: emoji.length,
                type: "custom_emoji",
                custom_emoji_id: STAR_EMOJI_ID
            }
        ]
    });
}


// ========================================
// 🚀 START SCREEN
// ========================================

bot.onText(/\/start/, async (msg) => {

    const chatId = msg.chat.id;
    const name = msg.from.first_name || "User";

    const welcome =
`⭐ Welcome ${name}

╭────────────────╮
      EarnKro Ultra
╰────────────────╯

💸 Smart Affiliate Converter
⚡ Instant Link Conversion
🛍 Supports Major Stores

✨ Send any product link below`;

    await sendPremium(chatId, welcome);

    // Animated feel
    setTimeout(async () => {

        await bot.sendMessage(chatId,
`🎯 Features

• Ultra Fast Conversion
• Premium UI Experience
• Image + Caption Support
• One Tap Open Buttons`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🚀 Try Now",
                            switch_inline_query_current_chat: ""
                        }
                    ]
                ]
            }
        });

    }, 700);

    setTimeout(async () => {

        await bot.sendMessage(chatId,
`🌐 EarnKro Network`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "📢 Updates Channel",
                            url: "https://t.me/yourchannel"
                        }
                    ],
                    [
                        {
                            text: "💬 Support",
                            url: "https://t.me/yourusername"
                        }
                    ]
                ]
            }
        });

    }, 1300);

});


// ========================================
// 🔗 LINK CONVERTER
// ========================================

bot.on('message', async (msg) => {

    const chatId = msg.chat.id;

    // support caption too
    const text = msg.text || msg.caption;

    // ignore commands
    if (!text || text.startsWith('/')) return;

    // invalid url
    if (!text.match(/https?:\/\/\S+/)) {

        await bot.sendMessage(chatId,
`❌ Invalid URL

✨ Please send a valid shopping/product link`);
        return;
    }

    try {

        // ========================================
        // ⚡ Animated Processing
        // ========================================

        const processing = await bot.sendMessage(chatId,
`⚡ Initializing Conversion Engine...`);

        setTimeout(async () => {

            try {
                await bot.editMessageText(
`🔍 Detecting Supported Platform...`,
                {
                    chat_id: chatId,
                    message_id: processing.message_id
                });
            } catch {}

        }, 700);

        setTimeout(async () => {

            try {
                await bot.editMessageText(
`💸 Generating Affiliate Link...`,
                {
                    chat_id: chatId,
                    message_id: processing.message_id
                });
            } catch {}

        }, 1400);


        // ========================================
        // API CALL
        // ========================================

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



        // ========================================
        // ✅ SUCCESS RESPONSE
        // ========================================

        if (result && result.data) {

            const success =
`⭐ Conversion Successful

╭────────────────╮
     EarnKro Result
╰────────────────╯

🔗 Affiliate Link:
${result.data}

💸 Monetization Ready`;

            await sendPremium(chatId, success);


            // buttons
            await bot.sendMessage(chatId,
`🚀 Quick Actions`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🌐 Open Link",
                                url: result.data
                            }
                        ],
                        [
                            {
                                text: "📋 Share",
                                switch_inline_query: result.data
                            }
                        ],
                        [
                            {
                                text: "📢 Join Channel",
                                url: "https://t.me/yourchannel"
                            }
                        ]
                    ]
                }
            });

        } else {

            await bot.sendMessage(chatId,
`❌ Conversion Failed

⚠️ Unsupported or invalid link`);
        }

    } catch (error) {

        console.log(error.response?.data || error.message);

        await bot.sendMessage(chatId,
`⚠️ Server Busy

Please try again in a moment`);
    }

});

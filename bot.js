const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Replace 'YOUR_TOKEN' with your bot's token
const token = '7108727290:AAHEhH4769s1Z6nVdARg8agp9EO0Onovz7w';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Send me a link to download a file.');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const url = msg.text;

    // Validate the URL
    if (!isValidUrl(url)) {
        return bot.sendMessage(chatId, 'Please send a valid URL.');
    }

    bot.sendMessage(chatId, 'Downloading file...');

    try {
        const filename = await downloadFile(url);
        
        // Check if the file exists
        if (fs.existsSync(filename)) {
            await bot.sendDocument(chatId, filename);
            fs.unlinkSync(filename); // Delete the file after sending
        } else {
            bot.sendMessage(chatId, 'Failed to download the file.');
        }
    } catch (error) {
        bot.sendMessage(chatId, `Error: ${error.message}`);
    }
});

const isValidUrl = (url) => {
    const regex = /^(ftp|http|https):\/\/[^ "]+$/;
    return regex.test(url);
};

const downloadFile = async (url) => {
    const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream',
    });

    const filename = path.basename(url); // Get the filename from the URL
    const writer = fs.createWriteStream(filename);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filename));
        writer.on('error', reject);
    });
};

console.log('Bot is running...');

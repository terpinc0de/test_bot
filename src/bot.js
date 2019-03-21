process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const Message = require('./models/message.model');
const constants = require('./common/constants');

const {BOT_TOKEN} = constants;

class Bot {
  constructor() {
    this.bot = new TelegramBot(BOT_TOKEN, {polling: true});
  }

  async listen(callback) {
    this.bot.on('message', async (msg) => {
      const message = new Message(msg);
      await callback(message);
    });

    this.bot.on('callback_query', async (msg) => {
      const message = new Message(msg);
      await callback(message);
    });
  }

  async say(userId, text, options = {}) {
    await this.bot.sendMessage(userId, text, options);
  }

  async getPhotoUrl(photoId) {
    return await this.bot.getFileLink(photoId);
  }

  async sendFile(userId, filePath, options = {}) {
    return await this.bot.sendDocument(userId, filePath, options);
  }
}

module.exports = new Bot();

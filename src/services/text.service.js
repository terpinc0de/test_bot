'use strict';

const registry = require('../common/registry');
const bot = require('../bot');
const ReceiptService = require('./receipt.service');

class TextService {
  constructor() {
    this.receiptStorage = registry.getReceiptStorage();
    this.userStorage = registry.getUserStorage();
  }

  /**
   *
   * @param {Message} msg
   * @return {Promise<void>}
   */
  async reply(msg) {
    const user = await this.userStorage.findByUserId(msg.userId);
    if (!user) {
      return;
    }

    const openReceipt = await this.receiptStorage.findOpenReceiptByUserId(user.id);
    if (!openReceipt) {
      await bot.say(msg.userId, 'У Вас нет открытых чеков. Чтобы открыть новый, загрузите сюда его фото.');
      return;
    }

    const receiptService = new ReceiptService(openReceipt, msg);
    await receiptService.setReply();
  }
}

module.exports = TextService;

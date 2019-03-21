'use strict';

const constants = require('../common/constants');
const bot = require('../bot');
const registry = require('../common/registry');
const {STOP_TEXT, DATES} = constants;

class ReceiptService {
  /**
   * @param {Receipt} receipt
   * @param {Message} msg
   */
  constructor(receipt, msg) {
    this.receipt = receipt;
    this.msg = msg;
    this.statuses = constants.RECEIPT_STATUSES;
    this.categories = constants.CATEGORIES;
    this.receiptStorage = registry.getReceiptStorage();
  }

  async prompt() {
    switch(this.receipt.status) {
      case this.statuses.WAIT_DATE:
        await bot.say(this.msg.userId, 'Введите дату в формате 01.03.2019 либо нажмите на кнопку:', {
          reply_markup: {
            inline_keyboard: [
              [{text: `📅 Вчера`, callback_data: DATES.YESTERDAY}],
              [{text: `📅 Сегодня`, callback_data: DATES.TODAY}],
            ],
          }
        });
        break;
      case this.statuses.WAIT_SUM:
        await bot.say(this.msg.userId, 'Введите сумму (формат для вещественного: 150.99)');
        break;
      case this.statuses.WAIT_STORE:
        await bot.say(this.msg.userId, 'Контрагент:');
        break;
      case this.statuses.WAIT_CATEGORY:
        await bot.say(this.msg.userId, 'Выберите категорию:', {
          reply_markup: {
            inline_keyboard: Object.keys(this.categories).map(id =>
              [{text: this.categories[id], callback_data: id}]
            ),
          }
        });
        break;
      case this.statuses.WAIT_CONFIRMATION:
        await bot.say(this.msg.userId, 'Нажмите "Подтвердить", если все поля заполнены верно. ' +
          'Нажмите на поле, чтобы изменить его.', {
          reply_markup: {
            inline_keyboard: [
              [{text: `✏ Дата: ${this.receipt.formatDate}`, callback_data: this.statuses.WAIT_DATE}],
              [{text: `✏ Сумма: ${this.receipt.sum}`, callback_data: this.statuses.WAIT_SUM}],
              [{text: `✏ Контрагент: ${this.receipt.store}`, callback_data: this.statuses.WAIT_STORE}],
              [{text: `✏ Категория: ${this.categories[this.receipt.category]}`, callback_data: this.statuses.WAIT_CATEGORY}],
              [{text: '✅ Подтвердить', callback_data: this.statuses.CLOSED}],
            ],
          }
        });
        break;
      default:
        await bot.say(this.msg.userId, '✅ Чек Сохранен.');
        break;
    }
  }

  updateStatus() {
    if (this.receipt.status === this.statuses.CLOSED || this.receipt.status === this.statuses.TERMINATED) {
      return;
    }

    if (!this.receipt.date) {
      this.receipt.status = this.statuses.WAIT_DATE;
      return;
    }

    if (!this.receipt.sum) {
      this.receipt.status = this.statuses.WAIT_SUM;
      return;
    }

    if (!this.receipt.store) {
      this.receipt.status = this.statuses.WAIT_STORE;
      return;
    }

    if (!this.receipt.category) {
      this.receipt.status = this.statuses.WAIT_CATEGORY;
      return;
    }

    this.receipt.status = this.statuses.WAIT_CONFIRMATION;
  }

  async setReply() {
    let isValueSet = false;
    let property = '';
    let value = this.msg.text;
    if (this.receipt.status === this.statuses.WAIT_CONFIRMATION) {
      await this._confirmation();
      return;
    }
    if (value === STOP_TEXT) {
      await this._stop();
      return;
    }
    switch(this.receipt.status) {
      case this.statuses.WAIT_DATE:
        isValueSet = this._setDate(value);
        property = 'Дата';
        break;
      case this.statuses.WAIT_SUM:
        isValueSet = this._setSum(value);
        property = 'Сумма';
        break;
      case this.statuses.WAIT_STORE:
        isValueSet = this._setStore(value);
        property = 'Контрагент';
        break;
      case this.statuses.WAIT_CATEGORY:
        isValueSet = this._setCategory(value);
        property = 'Категория';
        if (isValueSet) {
          value = this.categories[value];
        }
        break;
    }

    if (isValueSet) {
      this.updateStatus();
      const isSaved = await this.receiptStorage.save(this.receipt);
      if (isSaved) {
        await this.prompt();
        return true;
      }
    }

    await this.prompt();
    return false;
  }

  async _stop() {
    this.receipt.status = this.statuses.TERMINATED;
    const isSaved = await this.receiptStorage.save(this.receipt);
    if (isSaved) {
      await bot.say(this.msg.userId, `Чек закрыт.`);
      return true;
    }
    console.log('Can`t save terminated receipt.');
    return false;
  }

  async _confirmation() {
    const newStatus = Number(this.msg.text);
    const statuses = [
      this.statuses.WAIT_DATE,
      this.statuses.WAIT_SUM,
      this.statuses.WAIT_STORE,
      this.statuses.WAIT_CATEGORY,
      this.statuses.CLOSED,
    ];
    if (statuses.indexOf(newStatus) < 0) {
      await this.prompt();
      return false;
    }
    this.receipt.status = newStatus;
    const isSaved = await this.receiptStorage.save(this.receipt);
    if (isSaved) {
      await this.prompt();
      return true;
    }

    console.log(`Can't save receipt in confirmation section.`);
    return false;
  }

  _setDate(value) {
    const matches = value.match(/^(\d{1,2}).(\d{1,2}).(\d{4})$/);
    if (!matches) {
      bot.say(this.msg.userId, '❌ Некорректный формат даты. Попробуйте снова.').catch();
      return false;
    }
    const day = Number(matches[1]);
    if (day < 1 || day > 31) {
      bot.say(this.msg.userId, '❌ День указан неверно. Попробуйте снова.').catch();
      return false;
    }

    const month = Number(matches[2]);
    if (month < 1 || month > 12) {
      bot.say(this.msg.userId, '❌ Месяц указан неверно. Попробуйте снова.').catch();
      return false;
    }

    const year = Number(matches[3]);
    const currentYear = new Date().getFullYear();
    if (year !== currentYear && year !== currentYear - 1) {
      bot.say(this.msg.userId, '❌ Год может быть либо текущий, либо предыдущий. Попробуйте снова.').catch();
      return false;
    }

    const date = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
    if (date > new Date().getTime()) {
      bot.say(this.msg.userId, '❌ Дата не может опережать текущую. Попробуйте снова.').catch();
      return false;
    }

    this.receipt.date = date;
    return true;
  }

  _setSum(value) {
    const matches = value.match(/^(\d+)(\.\d{1,2})?$/);
    if (!matches) {
      bot.say(this.msg.userId, '❌ Некорректный формат суммы. Попробуйте снова.').catch();
      return false;
    }

    this.receipt.sum = value;
    return true;
  }

  _setStore(value) {
    this.receipt.store = value;
    return true;
  }

  _setCategory(value) {
    if (Object.keys(this.categories).indexOf(value) < 0) {
      bot.say(this.msg.userId, '❌ Указанная Вами категория не существует. Попробуйте снова.').catch();
      return false;
    }
    this.receipt.category = value;
    return true;
  }
}

module.exports = ReceiptService;

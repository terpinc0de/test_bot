'use strict';

const registry = require('../common/registry');
const GuardService = require('./guard.service');
const bot = require('../bot');
const ReceiptService = require('./receipt.service');
const ReportService = require('./report.service');

class CommandsService {
  constructor() {
    this.userStorage = registry.getUserStorage();
    this.receiptStorage = registry.getReceiptStorage();
    this.guardService = new GuardService();
  }

  async command(msg, name, ...args) {
    switch (name) {
      case 'start':
        await this.start(msg);
        break;
      case 'userlist':
        await this.getUserList(msg);
        break;
      case 'userremove':
        await this.removeUser(msg, args[0]);
        break;
      case 'stop':
        await this.terminateReceipt(msg);
        break;
      case 'report':
        await this.setReportPeriodState(msg);
        break;
      default:
        await bot.say(msg.userId, 'Команда не найдена.');
    }
  }

  async start(msg) {
    await this.guardService.checkUserInStorage(msg.userId);
    await bot.say(msg.userId, 'Привет!');
  }

  async getUserList(msg) {
    await this.guardService.checkIsAdmin(msg.userId);
    const users = await this.userStorage.findAll();
    if (!users) {
      await bot.say(msg.userId, 'Список пользователей пуст.');
      return;
    }

    const message = users.map(u => {
      return `${u.id}. ${u.firstName} (${u.userId})`;
    }).join('\n');
    await bot.say(msg.userId, message);
  }

  async removeUser(msg, id) {
    await this.guardService.checkIsAdmin(msg.userId);
    const user = await this.userStorage.findById(id);
    if (!user) {
      await bot.say(msg.userId, 'Пользователь не найден.');
      return;
    }
    // disallow to remove admin
    if (user.isAdmin) {
      await bot.say(msg.userId, 'Нельзя удалить админа.');
      return;
    }
    const result = await this.userStorage.removeById(id);
    if (result) {
      await bot.say(msg.userId, 'Пользователь удален.');
      return;
    }
    await bot.say(msg.userId, 'Не удалось выполнить команду =(');
  }

  async terminateReceipt(msg) {
    const user = await this.userStorage.findByUserId(msg.userId);
    if (!user) {
      return;
    }

    const openReceipt = await this.receiptStorage.findOpenReceiptByUserId(user.id);
    if (!openReceipt) {
      await bot.say(msg.userId, 'У Вас нет открытых чеков. Чтобы открыть новый, загрузите сюда его фото.');
      return;
    }

    msg.setStopText();
    const receiptService = new ReceiptService(openReceipt, msg);
    await receiptService.setReply();
  }

  async setReportPeriodState(msg) {
    const user = await this.userStorage.findByUserId(msg.userId);
    if (!user) {
      return;
    }

    user.setWaitReportPeriodState();
    const isSaved = await this.userStorage.save(user);
    if (isSaved) {
      const reportService = new ReportService(msg, msg.text);
      await reportService.prompt();
    }
  }
}

module.exports = CommandsService;

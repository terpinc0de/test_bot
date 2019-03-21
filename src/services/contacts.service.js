'use strict';

const registry = require('../common/registry');
const GuardService = require('./guard.service');
const User = require('../models/user.model');
const bot = require('../bot');

class ContactsService {
  constructor() {
    this.userStorage = registry.getUserStorage();
    this.guardService = new GuardService();
  }

  async createContact(msg) {
    await this.guardService.checkIsAdmin(msg.userId);
    const {user_id, phone_number, first_name} = msg.contact;
    const contact = await this.userStorage.findByUserId(user_id);
    if (contact) {
      await bot.say(msg.userId, 'Пользователь уже есть в базе.');
      return;
    }
    const user = new User();
    user.userId = user_id;
    user.phone = phone_number;
    user.firstName = first_name;
    const result = await this.userStorage.save(user);
    if (result) {
      await bot.say(msg.userId, 'Пользователь добавлен.');
    }
  }
}

module.exports = ContactsService;

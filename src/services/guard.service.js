'use strict';

const registry = require('../common/registry');
const bot = require('../bot');

class GuardService {
  constructor() {
    this.userStorage = registry.getUserStorage();
  }

  /**
   * checks the user is admin
   * @param {int} userId telegram user id
   * @return {Promise<void>}
   * @throws {Error} if the user is not admin
   */
  async checkIsAdmin(userId) {
    const user = await this.userStorage.findByUserId(userId);
    if (!user || !user.isAdmin) {
      await bot.say(userId, 'Доступ запрещен.');
      throw new Error(`Permission denied for (${userId}).`);
    }
  }

  /**
   * checks the user exists in storage
   * @param {int} userId telegram user id
   * @return {Promise<void>}
   * @throws {Error} if the user does not exist
   */
  async checkUserInStorage(userId) {
    const user = await this.userStorage.findByUserId(userId);
    if (!user) {
      await bot.say(userId, 'Доступ запрещен.');
      throw new Error(`User with id = ${userId} does not exists in db.`);
    }
  }
}

module.exports = GuardService;

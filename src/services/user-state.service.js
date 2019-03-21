'use strict';

const registry = require('../common/registry');
const ReportService = require('./report.service');
const constants = require('../common/constants');
const bot = require('../bot');

const {CANCEL_REPORT} = constants;

class UserStateService {
  constructor() {
    this.userStorage = registry.getUserStorage();
  }

  async isWaitsReportPeriod(msg) {
    // check if the user exists and wants to create a report.
    const user = await this.userStorage.findByUserId(msg.userId);
    if (!user || !user.isWaitsReportPeriod()) {
      return false;
    }

    // check if the user cancels report creation.
    if (msg.text === CANCEL_REPORT) {
      await bot.say(msg.userId, '❌ Создание отчета отменено.');
      await this.resetState(user);
      return true;
    }

    // trying to create report
    const reportService = new ReportService(msg, msg.text);
    const isReportSent = await reportService.getReport();
    if (isReportSent) {
      await this.resetState(user);
    }

    return true;
  }

  async resetState(user) {
    user.setReadyState();
    return await this.userStorage.save(user);
  }
}

module.exports = UserStateService;
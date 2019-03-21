'use strict';

// https://github.com/yagop/node-telegram-bot-api/issues/482
process.env.NTBA_FIX_350 = 1;

const bot = require('../bot');
const registry = require('../common/registry');
const fs = require('fs');
const SEPARATOR = ';';
const constants = require('../common/constants');

const {DATES, CANCEL_REPORT} = constants;

class ReportService {
  /**
   * @param {Message} msg
   * @param {string} period format: 'd.m.Y-d.m.Y'
   */
  constructor(msg, period) {
    this.msg = msg;
    this.period = period;
    this.userStorage = registry.getUserStorage();
    this.reportStorage = registry.getReportStorage();
  }

  async prompt() {
    await bot.say(this.msg.userId, '*Создание отчета*. Выберите один из предопределенных периодов' +
      ' либо введите вручную в формате:\n' +
        '*01.02.2019-04.03.2019*\n' +
        'где \n_01.02.2019_ - дата начала периода,\n' +
        '_04.03.2019_ - дата окончания периода (включительно).\n' +
        'Чтобы сформировать отчет за день, дата окончания не нужна:\n' +
        '*01.02.2019*', {
      parse_mode: 'markdown',
      reply_markup: {
        inline_keyboard: [
          [{text: `📅 За прошлый месяц`, callback_data: DATES.PREVIOUS_MONTH}],
          [{text: `📅 За текущий месяц`, callback_data: DATES.CURRENT_MONTH}],
          [{text: `📅 За вчера`, callback_data: DATES.YESTERDAY}],
          [{text: `📅 За сегодня`, callback_data: DATES.TODAY}],
          [{text: `❌ Отменить создание отчета`, callback_data: CANCEL_REPORT}],
        ],
      },
    });
  }

  async getReport() {
    const period = await this._parsePeriod();
    if (!period) {
      await this.prompt();
      return false;
    }

    const user = await this.userStorage.findByUserId(this.msg.userId);
    if (!user) {
      return false;
    }
    const userId = !user.isAdmin ? user.id : null;
    const reports = await this.reportStorage.findByPeriod(period.from, period.to, userId);
    if (!reports.length) {
      await bot.say(this.msg.userId, '⚠ Нет чеков за выбранный период.');
      return true;
    }
    const fileContent = reports.map(report =>
      [
        ReportService.prepareValue(report.createdDate),
        ReportService.prepareValue(report.user),
        ReportService.prepareValue(report.receiptDate),
        ReportService.prepareValue(report.store),
        ReportService.prepareValue(report.sum),
        ReportService.prepareValue(report.category),
        ReportService.prepareValue(report.photo),
      ].join(SEPARATOR)
    ).join('\n');
    const fileName = `./public/reports/${user.userId}-${new Date().getTime()}.csv`;
    fs.writeFile(fileName, fileContent, 'utf-8', async (e) => {
      if (e) {
        await bot.say(this.msg.userId, '❌ Не удалось создать отчет.');
        throw new Error(e.message);
      }
      await bot.sendFile(this.msg.userId, fileName);
      await fs.unlink(fileName, e => { if (e) {console.log(e.message); }});
    });
    return true;
  }

  async _parsePeriod() {
    let isPeriod = true;
    let matches = this.period.match(/^(\d{1,2}.\d{1,2}.\d{4})\s?-\s?(\d{1,2}.\d{1,2}.\d{4})$/);
    if (!matches) {
      isPeriod = false;
      matches = this.period.match(/^(\d{1,2}.\d{1,2}.\d{4})$/);
      if (!matches) {
        await bot.say(this.msg.userId, '❌ Неверный формат периода.');
        return false;
      }
    }

    if (isPeriod) {
      const periodFrom = await this._toTimestamp(matches[1], '❌ Дата начала периода: ');
      if (!periodFrom) {
        return false;
      }
      let periodTo = await this._toTimestamp(matches[2], '❌ Дата окончания периода: ');
      if (!periodTo) {
        return false;
      }
      periodTo += 1000 * 60 * 60 * 24;
      if (periodFrom >= periodTo) {
        await bot.say(this.msg.userId, '❌ Дата окончания не может быть больше даты начала периода.');
        return false;
      }

      return {
        from: periodFrom,
        to: periodTo,
      };
    }

    const date = await this._toTimestamp(matches[1], '❌ Отчет по дате: ');
    if (!date) {
      return false;
    }

    return {
      from: date,
      to: date + 1000 * 60 * 60 * 24,
    }
  }

  async _toTimestamp(date, startsErrorMessageWith) {
    let valid = true;
    const matches = date.match(/^(\d{1,2}).(\d{1,2}).(\d{4})$/);
    if (!matches) {
      await bot.say(this.msg.userId, startsErrorMessageWith + 'неверный формат. Попробуйте снова.');
      valid = false;
    }
    const day = Number(matches[1]);
    if (day < 1 || day > 31) {
      await bot.say(this.msg.userId, startsErrorMessageWith + 'день указан неверно. Попробуйте снова.');
      valid = false;
    }

    const month = Number(matches[2]);
    if (month < 1 || month > 12) {
      await bot.say(this.msg.userId, startsErrorMessageWith + 'месяц указан неверно. Попробуйте снова.');
      valid = false;
    }

    const year = Number(matches[3]);
    return valid ? new Date(year, month - 1, day, 0, 0, 0, 0).getTime() : false;
  }

  static prepareValue(value) {
    if (value && typeof value === 'string') {
      return value.replace(SEPARATOR, '"' + SEPARATOR + '"');
    }
    return value;
  }
}

module.exports = ReportService;

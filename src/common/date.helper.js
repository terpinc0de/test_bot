'use strict';

class DateHelper {
  /**
   * transforms date as string to timestamp
   * @param {string} qrDate date in one of formats: "yyyymmddThhii", "yyyymmddThhiiss"
   * @return {int|null} timestamp if the date is parsed
   */
  static fromQrDateToTimestamp(qrDate) {
    let matches = qrDate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})\d{0,2}$/);
    if (matches) {
      return Date.UTC(
        Number(matches[1]),
        Number(matches[2]) - 1,
        Number(matches[3]),
        Number(matches[4]),
        Number(matches[5])
      );
    }

    return null;
  }

  /**
   * transforms timestamp to user friendly date format
   * @param {int} timestamp
   * @return {string} date in format dd.mm.yyyy
   */
  static format(timestamp) {
    if (!timestamp) {
      return '';
    }
    const date = new Date(Number(timestamp));

    return [
      DateHelper._zero(date.getDate()),
      DateHelper._zero(date.getMonth() + 1),
      date.getFullYear(),
    ].join('.');
  }

  static _zero(value) {
    if (value < 10) {
      return `0${value}`;
    }
    return value;
  }
}

module.exports = DateHelper;

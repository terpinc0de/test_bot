'use strict';

const constants = require('../common/constants');
const {STOP_TEXT, DATES} = constants;
const DateHelper = require('../common/date.helper');

class Message {
  constructor(msg) {
    this.msg = msg;
  }

  get userId() {
    if (this.msg.chat) {
      return this.msg.chat.id;
    }

    if (this.msg.from) {
      return this.msg.from.id;
    }
    return false;
  }

  setStopText() {
    this.msg.text = STOP_TEXT;
  }

  get text() {
    if (this.msg.text) {
      return this.msg.text;
    }

    if (this.msg.data) {

      // return today`s date
      if (this.msg.data === DATES.TODAY) {
        return DateHelper.format(new Date().getTime());
      }

      // return yesterday`s date
      if (this.msg.data === DATES.YESTERDAY) {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return DateHelper.format(date.getTime());
      }

      // return current month period
      if (this.msg.data === DATES.CURRENT_MONTH) {
        const startDate = new Date();
        startDate.setDate(1);
        const endDate = new Date();
        const startDateString = DateHelper.format(startDate.getTime());
        const endDateString = DateHelper.format(endDate.getTime());
        if (startDateString === endDateString) {
          return startDateString;
        }

        return `${startDateString} - ${endDateString}`;
      }

      // return previous month period
      if (this.msg.data === DATES.PREVIOUS_MONTH) {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        const startDateString = DateHelper.format(startDate.getTime());
        const endDateString = DateHelper.format(endDate.getTime());
        return `${startDateString} - ${endDateString}`;
      }

      return this.msg.data;
    }

    return '';
  }

  get contact() {
    return this.msg.contact || false;
  }

  get photoId() {
    if (this.msg.photo) {
      return this.msg.photo[this.msg.photo.length - 1].file_id;
    }

    if (this.msg.document) {
      return this.msg.document.file_id;
    }

    return false;
  }
}

module.exports = Message;

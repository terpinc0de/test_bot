'use strict';

const DateHelper = require('../common/date.helper');
const constants = require('../common/constants');
const {CATEGORIES, URL, PORT} = constants;

class Report {
  constructor() {
    this.createdAt = '';
    this.userName = '';
    this.userId = '';
    this.date = '';
    this.store = '';
    this.sum = '';
    this.categoryId = '';
    this.photoPath = '';
  }

  get createdDate() {
    return DateHelper.format(this.createdAt);
  }

  get user() {
    return `${this.userName} (${this.userId})`;
  }

  get receiptDate() {
    return DateHelper.format(this.date);
  }

  get category() {
    return CATEGORIES[this.categoryId] || '';
  }

  get photo() {
    const port = PORT ? ':' + PORT : '';
    return URL + port + this.photoPath;
  }
}

module.exports = Report;

'use strict';

const DateHelper = require('../common/date.helper');

class Receipt {
  constructor() {
    this.id = null;
    this.userId = null;
    this.photo = null;
    this.photoId = null;
    this.sum = null;
    this.date = null;
    this.store = null;
    this.category = null;
    this.status = null;
    this.createdAt = null;
    this.updatedAt = null;
  }

  get formatDate() {
    return DateHelper.format(this.date);
  }
}

module.exports = Receipt;

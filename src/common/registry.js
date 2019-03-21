'use strict';

const UserStorage = require('../storages/user-mysql.storage');
const ReceiptStorage = require('../storages/receipt-mysql.storage');
const ReportStorage = require('../storages/report-mysql.storage');

class Registry {
  constructor() {
    this.pool = [];
  }

  getUserStorage() {
    if (!this.pool['userStorage']) {
      this.pool['userStorage'] = new UserStorage();
    }

    return this.pool['userStorage'];
  }

  getReceiptStorage() {
    if (!this.pool['receiptStorage']) {
      this.pool['receiptStorage'] = new ReceiptStorage();
    }

    return this.pool['receiptStorage'];
  }

  getReportStorage() {
    if (!this.pool['reportStorage']) {
      this.pool['reportStorage'] = new ReportStorage();
    }

    return this.pool['reportStorage'];
  }
}

module.exports = new Registry();

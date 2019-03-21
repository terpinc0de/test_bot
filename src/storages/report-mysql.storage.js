'use strict';

const db = require('../common/mysql-connection');
const Report = require('../models/report.model');
const constants = require('../common/constants');
const {CLOSED} = constants.RECEIPT_STATUSES;

class ReportMySqlStorage {
  constructor() {
    this.db = db;
  }

  /**
   * finds receipts by period
   * @param {number} from timestamp
   * @param {number} to timestamp
   * @param {number} userId
   * @return {Promise<Report[]>}
   */
  async findByPeriod(from, to, userId) {
    const receiptTable = '`receipt`';
    const userTable = '`user`';
    let sql = `
    SELECT 
    ${receiptTable}.created_at as createdAt,
    ${userTable}.first_name as userName,
    ${userTable}.user_id as userId,
    ${receiptTable}.date as date,
    ${receiptTable}.store as store,
    ${receiptTable}.sum as sum,
    ${receiptTable}.category as category,
    ${receiptTable}.photo as photoPath
    FROM ${receiptTable}
    LEFT JOIN ${userTable} ON ${userTable}.id = ${receiptTable}.user_id
    WHERE ${receiptTable}.date >= ${this.db.escape(from)} 
    AND ${receiptTable}.date < ${this.db.escape(to)}
    AND ${receiptTable}.status = ${CLOSED}
    `;
    if (userId) {
      sql += ` AND ${receiptTable}.user_id = ${this.db.escape(userId)}`;
    }

    sql += ` ORDER BY \`date\` ASC`;

    const result = await this.db.query(sql);
    return result.map(i => ReportMySqlStorage._createReportModel(i));
  }

  static _createReportModel(item) {
    const report = new Report();
    report.createdAt = item.createdAt;
    report.userName = item.userName;
    report.userId = item.userId;
    report.date = item.date;
    report.store = item.store;
    report.sum = item.sum;
    report.categoryId = item.category;
    report.photoPath = item.photoPath;

    return report;
  }
}

module.exports = ReportMySqlStorage;

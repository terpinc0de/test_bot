'use strict';

const db = require('../common/mysql-connection');
const Receipt = require('../models/receipt.model');
const constants = require('../common/constants');

class ReceiptMySqlStorage {
  constructor() {
    this.db = db;
    this.tableName = '`receipt`';
  }

  /**
   * finds first open receipt by user id
   * @param {int} userId
   * @return {Promise<Receipt>|Promise<boolean>}
   */
  async findOpenReceiptByUserId(userId) {
    const {TERMINATED, CLOSED} = constants.RECEIPT_STATUSES;
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE \`user_id\` = ${this.db.escape(userId)} AND \`status\` NOT IN(${TERMINATED}, ${CLOSED})
      LIMIT 1
    `;
    const result = await this.db.query(sql);
    if (result.length) {
      return ReceiptMySqlStorage._createReceiptModel(result[0]);
    }
    return false;
  }

  /**
   * if the receipt is new, save it. Otherwise updates
   * @param {Receipt} receipt
   * @return {Promise<boolean|*>}
   */
  async save(receipt) {
    return receipt.id ?
      await this._update(receipt) :
      await this._create(receipt);
  }

  /**
   * creates the receipt
   * @param {Receipt} receipt
   * @return {Promise<*>}
   * @private
   */
  async _create(receipt) {
    if (!receipt.userId || !receipt.photo || !receipt.photoId) {
      return false;
    }

    const fields = [
      '`user_id`',
      '`photo`',
      '`photo_id`',
      '`sum`',
      '`date`',
      '`store`',
      '`category`',
      '`status`',
      '`created_at`',
      '`updated_at`',
    ];
    const sql = `
    INSERT INTO ${this.tableName} (${fields.join(',')})
    VALUES (${[
      db.escape(receipt.userId),
      db.escape(receipt.photo),
      db.escape(receipt.photoId),
      db.escape(receipt.sum),
      db.escape(receipt.date),
      db.escape(receipt.store),
      db.escape(receipt.category),
      db.escape(receipt.status),
      db.escape(new Date().getTime()),
      db.escape(new Date().getTime()),
    ].join(', ')})
    `;

    return await this.db.query(sql);
  }

  /**
   * updates the receipt
   * @param {Receipt} receipt
   * @return {Promise<boolean>}
   * @private
   */
  async _update(receipt) {
    if (!receipt.id) {
      return false;
    }

    const sql = `
    UPDATE ${this.tableName} SET
    \`sum\` = ${db.escape(receipt.sum)},
    \`date\` = ${db.escape(receipt.date)},
    \`store\` = ${db.escape(receipt.store)},
    \`category\` = ${db.escape(receipt.category)},
    \`status\` = ${db.escape(receipt.status)},
    \`updated_at\` = ${db.escape(new Date().getTime())}
    WHERE \`id\` = ${db.escape(receipt.id)}
    `;

    const result = await this.db.query(sql);
    return !!result.changedRows;
  }

  /**
   * creates the receipt model
   * @param {object} item
   * @return {Receipt}
   * @private
   */
  static _createReceiptModel(item) {
    const receipt = new Receipt();
    receipt.id = item.id;
    receipt.userId = item.user_id;
    receipt.photo = item.photo;
    receipt.photoId = item.photo_id;
    receipt.sum = item.sum;
    receipt.date = Number(item.date);
    receipt.store = item.store;
    receipt.category = item.category;
    receipt.status = item.status;
    receipt.createdAt = item.created_at;
    receipt.updatedAt = item.updated_at;
    return receipt;
  }
}

module.exports = ReceiptMySqlStorage;

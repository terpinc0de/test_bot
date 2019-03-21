const db = require('../common/mysql-connection');
const User = require('../models/user.model');

class UserMySqlStorage {
  constructor() {
    this.db = db;
    this.tableName = '`user`';
  }

  /**
   * finds user by telegram user id
   * @param {int} id
   * @return {Promise<User>|Promise<boolean>}
   */
  async findByUserId(id) {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE \`user_id\` = ${this.db.escape(id)}
    `;
    const result = await this.db.query(sql);
    if (result.length) {
      return UserMySqlStorage._createUserModel(result[0]);
    }
    return false;
  }

  /**
   * finds all users
   * @return {Promise<User[]>}
   */
  async findAll() {
    const sql = `SELECT * FROM ${this.tableName}`;
    const result = await this.db.query(sql);
    return result.map(i => UserMySqlStorage._createUserModel(i));
  }

  /**
   * removes user by user id
   * @param {int} id
   * @return {Promise<*>}
   */
  async removeById(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE \`id\` = ${this.db.escape(id)}`;
    return await this.db.query(sql);
  }

  /**
   * finds user by user id
   * @param id
   * @return {Promise<User>|Promise<boolean>}
   */
  async findById(id) {
    const sql = `
    SELECT * FROM ${this.tableName}
    WHERE \`id\` = ${this.db.escape(id)}
    `;
    const result = await this.db.query(sql);
    if (result.length) {
      return UserMySqlStorage._createUserModel(result[0]);
    }
    return false;
  }

  /**
   * if the user is new, save it. Otherwise updates
   * @param {User} user
   * @return {Promise<boolean|*>}
   */
  async save(user) {
    return user.id ?
      await this._update(user):
      await this._create(user);
  }

  /**
   * creates the user
   * @param user
   * @return {Promise<*>}
   * @private
   */
  async _create(user) {
    if (!user.userId) {
      return false;
    }

    const fields = [
      '`user_id`',
      '`phone`',
      '`first_name`',
    ];
    const sql = `
    INSERT INTO ${this.tableName} (${fields.join(',')})
    VALUES (${[
      db.escape(user.userId),
      db.escape(user.phone),
      db.escape(user.firstName),
    ].join(', ')})
    `;

    return await this.db.query(sql);
  }

  /**
   * updates the user
   * @param {User} user
   * @return {Promise<boolean>}
   * @private
   */
  async _update(user) {
    const sql = `
    UPDATE ${this.tableName} SET
    \`phone\` = ${db.escape(user.phone)},
    \`first_name\` = ${db.escape(user.firstName)},
    \`state\` = ${db.escape(user.state)}
    WHERE \`id\` = ${db.escape(user.id)}
    `;

    const result = await this.db.query(sql);
    return !!result.changedRows;
  }

  /**
   * creates the user model
   * @param {object} item
   * @return {User}
   * @private
   */
  static _createUserModel(item) {
    const user = new User();
    user.id = item.id;
    user.userId = item.user_id;
    user.phone = item.phone;
    user.firstName = item.first_name;
    user._isAdmin = item.is_admin;
    user.state = item.state;
    return user;
  }
}

module.exports = UserMySqlStorage;

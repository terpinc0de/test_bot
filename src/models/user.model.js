'use strict';

const constants = require('../common/constants');
const {USER_STATES} = constants;

class User {
  constructor() {
    this.id = null;
    this.userId = null;
    this.phone = null;
    this.firstName = null;
    this.state = 0;
    this._isAdmin = 0;
  }

  get isAdmin() {
    return this._isAdmin;
  }

  setReadyState() {
    this.state = USER_STATES.READY;
  }

  setWaitReportPeriodState() {
    this.state = USER_STATES.WAIT_REPORT_PERIOD;
  }

  isWaitsReportPeriod() {
    return this.state === USER_STATES.WAIT_REPORT_PERIOD;
  }
}

module.exports = User;

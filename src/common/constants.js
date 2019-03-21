module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  MYSQL_DSN: process.env.MYSQL_DSN,
  URL: process.env.URL,
  PORT: process.env.PORT,
  STOP_TEXT: 'стоп',
  CANCEL_REPORT: 'callback_cancel_report',
  USER_STATES: {
    READY: 0,
    WAIT_REPORT_PERIOD: 10,
  },
  RECEIPT_STATUSES: {
    WAIT_SUM: 0,
    WAIT_DATE: 10,
    WAIT_STORE: 20,
    WAIT_CATEGORY: 30,
    WAIT_CONFIRMATION: 35,
    TERMINATED: 40,
    CLOSED: 50,
  },
  CATEGORIES: {
    '1': 'Билеты авиа, Ж/д',
    '2': 'Деловой ужин',
    '3': 'Командировочные расходы',
    '4': 'Проживание',
    '5': 'Расходы на бензин',
    '6': 'Содержание служебного транспорта',
    '7': 'Спецодежда',
    '8': 'Прочие затраты',
  },
  DATES: {
    TODAY: 'date_today',
    YESTERDAY: 'date_yesterday',
    CURRENT_MONTH: 'date_current_month',
    PREVIOUS_MONTH: 'date_previous_month',
  }
};

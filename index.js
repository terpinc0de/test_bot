const bot = require('./src/bot');
const express = require('express');
const app = express();
const path = require('path');
const constants = require('./src/common/constants');
const MessageHandler = require('./src/services/message.handler');

const {PORT} = constants;

bot.listen(new MessageHandler().handle).catch(err =>
  console.log(err)
);

const port = PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port);

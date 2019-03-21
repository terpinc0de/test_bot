'use strict';

const registry = require('../common/registry');
const bot = require('../bot');
const constants = require('../common/constants');
const download = require('download-file');
const Receipt = require('../models/receipt.model');
const ReceiptService = require('./receipt.service');
const zbarimg = require('node-zbarimg');
const DateHelper = require('../common/date.helper');
const querystring = require('querystring');
const {STOP_TEXT} = constants;

class PhotosService {
  constructor() {
    this.receiptStorage = registry.getReceiptStorage();
    this.userStorage = registry.getUserStorage();
  }

  /**
   * handles received photo
   * @param {Message} msg
   * @return {Promise<void>}
   */
  async handlePhoto(msg) {
    const user = await this.userStorage.findByUserId(msg.userId);
    if (!user) {
      return;
    }
    const openReceipt = await this.receiptStorage.findOpenReceiptByUserId(user.id);
    if (openReceipt) {
      await bot.say(msg.userId, 'Вы не закрыли предыдущий чек. ' +
        'Вы можете закрыть его принудительно,написав слово "' + STOP_TEXT + '" либо команду "/stop".' +
        'В ином случае продолжите его заполнение.');
      const receiptService = new ReceiptService(openReceipt, msg);
      await receiptService.prompt();
      return;
    }

    const tgUrl = await bot.getPhotoUrl(msg.photoId);
    const directory = `/receipts/${msg.userId}/`;
    const filename = `${new Date().getTime()}.jpg`;
    const receipt = new Receipt();
    receipt.photo = directory + filename;
    receipt.userId = user.id;
    receipt.photoId = msg.photoId;

    const options = {
      directory: './public' + directory,
      filename: filename,
    };

    download(tgUrl, options, async (e) => {
      if (e) {
        await bot.say(msg.userId, '❌ Не удалось загрузить файл. Попробуйте снова.');
        throw new Error('Photo not loaded.');
      }

      zbarimg('./public' + receipt.photo, async (err, code) => {
        if (err) {
          console.log(err.message);
        }

        if (code) {
          const params = querystring.parse(code);
          if (params && params.s) {
            receipt.sum = params.s;
          }
          if (params && params.t) {
            receipt.date = DateHelper.fromQrDateToTimestamp(params.t.toString());
          }
        }

        const receiptService = new ReceiptService(receipt, msg);
        receiptService.updateStatus();
        const isSaved = await this.receiptStorage.save(receipt);
        if (isSaved) {
          await receiptService.prompt();
        } else {
          await bot.say(msg.userId, 'Не удалось сохранить чек. Попробуйте повторить операцию.');
          throw new Error('PhotosService: can`t save receipt.');
        }
      });
    });
  }
}

module.exports = PhotosService;

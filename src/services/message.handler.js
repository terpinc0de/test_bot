'use strict';

const CommandsService = require('./commands.service');
const ContactsService = require('./contacts.service');
const PhotosService = require('./photos.service');
const TextService = require('./text.service');
const UserStateService = require('./user-state.service');

class MessageHandler {
  constructor() {
    this.userStateService = new UserStateService();
    this.commandsService = new CommandsService();
    this.contactsService = new ContactsService();
    this.photosService = new PhotosService;
    this.textService = new TextService();
    this.handle = this.handle.bind(this);
  }

  /**
   * handles messages from api
   * @param {Message} msg
   * @return {Promise<void>}
   */
  async handle(msg) {
    // checks if the user wants to create a report
    const isUserWaitsReportPeriod = await this.userStateService.isWaitsReportPeriod(msg);
    if (isUserWaitsReportPeriod) {
      return;
    }

    if (msg.contact) {
      await this.contactsService.createContact(msg);
      return;
    }

    if (msg.photoId) {
      await this.photosService.handlePhoto(msg);
      return;
    }

    const matchCommand = msg.text.match(/^\/([a-z-]+)\s?(.*)$/);
    if (matchCommand) {
      await this.commandsService.command(msg, matchCommand[1], matchCommand[2]);
      return;
    }

    if (msg.text) {
      await this.textService.reply(msg);
    }
  }
}

module.exports = MessageHandler;

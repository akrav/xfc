import Application from './application';
import logger from '../lib/logger';

const Provider = {
  init(config) {
    this.application = new Application();
    this.application.init(config);
    this.application.launch();
  },

  on(eventName, listener) {
    this.application.on(eventName, listener);
  },

  fullscreen(source) {
    this.application.fullscreen(source);
  },

  httpError(error) {
    this.application.httpError(error);
  },

  trigger(event, detail) {
    this.application.trigger(event, detail);
  },

  loadPage(url) {
    this.application.loadPage(url);
  },
};

export default Provider;

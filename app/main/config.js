const ElectronStore = require('electron-store');

module.exports = new ElectronStore({
  defaults: {
    windowState: {
      width: 900,
      height: 600,
    },
    alwaysOnTop: false,
    showUnreadBadge: true,
    bounceDockIcon: false,
    flashWindowOnMessage: false,
    autoHideMenuBar: true,
    lastUrl: "https://books.google.com/ebooks/app"
  },
});

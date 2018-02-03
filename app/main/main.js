const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const config = require('./config');
const _ = require('lodash');
const minimatch = require('minimatch-all');

const playBooksUrl = "https://books.google.com/ebooks/app";

function allowedUrl(url) {
    const urls = [
        'https://accounts.google.com/@(u|AccountChooser|AddSession|ServiceLogin|CheckCookie|Logout){**/**,**}',
        'https://accounts.google.com/signin/@(usernamerecovery|recovery|challenge|selectchallenge){**/**,**}',
        'http?://www.google.*/accounts/Logout2**',
        'https://books.google.com/ebooks/**'
    ];

    return minimatch(url, urls);
}

const books = {}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    const windowState = config.get('windowState');
    // Create the browser window.
    mainWindow = new BrowserWindow({
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        minWidth: 890,
        minHeight: 600,
        icon: path.join(__dirname, "..", "..", 'play-books.png'),
    })

    mainWindow.setTitle("Play Books Reader")
    const initialUrl = config.get('lastUrl');
    console.log(`initial url: ${initialUrl}`)
    mainWindow.loadURL(initialUrl)


    const webContents = mainWindow.webContents;
    webContents.on('will-navigate', (e, url) => {
        console.log(`will-navigate ${url}`)
        if (url === 'https://accounts.google.com/ManageAccount') {
            e.preventDefault()
            console.log(`landed at ${url}, navigating back to books home`)

            mainWindow.webContents.loadURL(confg.get('lastUrl'))
        }
        else if (!allowedUrl(url)) {
            console.log(`navigation blocked ${url}`)
            e.preventDefault()
        }
    })

    webContents.on('new-window', (e, url) => {
        console.log(`new window blocked ${url}`)
        e.preventDefault()
    })

    webContents.on('did-navigate-in-page', (e, url, isMain) => {
        console.log(`in page navigation: ${url}, isMain: ${isMain}`)

        const bookUrlPrefix = playBooksUrl + "#reader/";
        if (isMain && url.startsWith(bookUrlPrefix)) {

            const bookId = url.substr(bookUrlPrefix.length).split("/")[0]
            webContents.executeJavaScript('document.title').then(title => books[bookId] = title)

            console.log(`book ${bookId}: ${books[bookId]}`)

            config.set('lastUrl', `${bookUrlPrefix}${bookId}`)
        }
    })


    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    mainWindow.on('resize', _.debounce(() => {
            if (!mainWindow.isFullScreen()) {
                config.set('windowState', mainWindow.getBounds());
            }
        }, 200)
    )
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

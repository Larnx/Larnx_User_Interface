const electron = require('electron');
const app = electron.app;                     // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const path = require('path');
const url = require('url');
const ipcMain = require('electron').ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var welcomeWindow;  // Application begins on this window.
var mainWindow;

function createMainWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({show: false});
  mainWindow.maximize();
  mainWindow.show();

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'Views/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
    mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function createWelcomeWindow () {
    // Create the browser window.
    welcomeWindow = new BrowserWindow({show: false});
    welcomeWindow.maximize();
    welcomeWindow.show();

    // and load the index.html of the app.
    welcomeWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/welcome.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    // welcomeWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    welcomeWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        welcomeWindow = null
    })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWelcomeWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});


ipcMain.on('render_index', function(event, arg) {
    createMainWindow();
});
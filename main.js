const electron = require('electron');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const path = require('path');
const url = require('url');
const ipcMain = require('electron').ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainAppWindow;

function initiateApplication() {
    mainAppWindow = new BrowserWindow({ show:false });
    mainAppWindow.maximize();
    mainAppWindow.show();

    mainAppWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/welcome.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    mainAppWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainAppWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainAppWindow = null;
    });
}

function goForward() {
    mainAppWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/index.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function load2D() {
    mainAppWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/index_2d.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function goBackward() {
    mainAppWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Views/welcome.html'),
        protocol: 'file:',
        slashes: true
    }));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initiateApplication);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainAppWindow === null) {
        initiateApplication()
    }
});

ipcMain.on('render_index', function(event, arg) {
    goForward();
});

ipcMain.on('go_home',function(event,arg){
    goBackward();
});

ipcMain.on('load2D',function(event,arg){
    load2D();
});
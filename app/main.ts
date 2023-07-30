import {app, BrowserWindow, Menu, nativeImage, screen, Tray} from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

const dev = args.some(val => val === '--development')

function createWindow(): BrowserWindow {

  const {workAreaSize} = screen.getPrimaryDisplay();

  // Create the browser window.
  win = new BrowserWindow({
    // width: size.width,
    // height: size.height,
    width: 460,
    height: 800,
    x: workAreaSize.width - 460,
    y: workAreaSize.height - 800,
    minimizable: false,
    maximizable: false,
    frame: dev ?? false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
    icon: nativeImage.createFromPath(__dirname + '/../src/assets/icons/clock_icon.png'),
  });

  try {
    let tray: Tray;

    app.whenReady().then(() => {
      const icon = nativeImage.createFromPath(__dirname + '/../src/assets/icons/clock_icon64x.png');
      tray = new Tray(icon);

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Mostrar/Ocultar', type: 'normal', click: () => {
            if (win.isVisible()) {
              win.hide()
            } else {
              win.show();
            }
          },
        },
        {label: '', type: 'separator'},
        {
          label: 'Sair', type: 'normal', click: () => {
            win.removeAllListeners('close');
            win.close();
          },
        },
      ])

      tray.setToolTip('This is my application.');
      tray.setContextMenu(contextMenu);

      tray.on('click', function(e){
        if (win.isVisible()) {
          win.hide()
        } else {
          win.show()
        }
      });

    })
  } catch (e) {
    console.log('error', e);
  }

  win.setMenuBarVisibility(false);

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.on('minimize',function(event: any){
    event.preventDefault();
    win.hide();
  });

  win.on('close',function(event: any){
    event.preventDefault();
    win.hide();
  });

  win.on('blur',function(event: any){
    event.preventDefault();
    win.hide();
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

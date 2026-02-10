const { app, BrowserWindow, dialog, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const DESKTOP_PORT = process.env.PORT || '3344';
let serverProcess = null;

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forcereload', label: '强制重新加载' },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'togglefullscreen', label: '全屏' },
        { role: 'toggleDevTools', label: '开发者工具' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '项目主页',
          click: async () => {
            await shell.openExternal('https://github.com/SFyingchen/trae_new');
          }
        },
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: '关于 Trae Local AI Editor',
              message: 'Trae Local AI Editor',
              detail: '本地优先的桌面 AI 编辑器（Electron + Ollama）'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function startServer() {
  const serverEntry = path.join(__dirname, '..', 'server.js');
  serverProcess = spawn(process.execPath, [serverEntry], {
    env: {
      ...process.env,
      PORT: DESKTOP_PORT,
      WORKSPACE_ROOT: process.env.WORKSPACE_ROOT || process.cwd()
    },
    stdio: 'inherit'
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      dialog.showErrorBox('后端服务异常退出', `server.js 退出码: ${code}`);
    }
  });
}

function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1200,
    minHeight: 760,
    autoHideMenuBar: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true
    }
  });

  win.loadURL(`http://127.0.0.1:${DESKTOP_PORT}`);
}

app.whenReady().then(() => {
  startServer();
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  stopServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopServer();
    app.quit();
  }
});

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path')
const { register } = require('ts-node').register(); // to register .js code from typescript
const PartAnalyser = require("./analyser/PartAnalyser")
const AnalysesFlow = require("./flow/AnalysesFlow")
const ExcelParser = require('./analyser/ExcelParser');
const FieldMapper = require('./mapper/Mapper');

const parser = new ExcelParser();
const flow = new AnalysesFlow();
const partAnalyser = new PartAnalyser();
const mapper = new FieldMapper();

const createWindow = () => {
  const win = new BrowserWindow({
    icon: '../img/logo.jpg',
    width: 800,
    height: 600,
    fullscreenable: false, // disable fullscreen
    //resizable: false,
    maximizable: false,
    //minimizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.handle('ping', () => 'pong');

  ipcMain.handle('file_upload', async (event) => {
    flow.SearchCommerce();
    return flow.FileUpload(parser);
  });

  ipcMain.handle('get_columns', async (event, sheetName) => {
    return flow.GetSheetColumns(parser, sheetName);
  });

  ipcMain.handle('parts_analyse', async (event, parts_map) => {
    mapper.mapFields(parts_map);
    return flow.AnalysedMappedFields(parser, partAnalyser, mapper.joinedFields());
  });

  ipcMain.handle('save_results', async (event) => {
    var saved_path = await flow.SaveAnalysisResult(parser, partAnalyser);
    saved_path = path.normalize(saved_path).replace(/\\/g, '/');
    if(saved_path.length > 1){
      shell.openPath(`file://${saved_path}`);
    }
    return saved_path;
  });

  ipcMain.handle('get_column_values_unique', async (event, sheetName, colName) => {
    var filters = flow.GetColumnValuesUnique(parser, partAnalyser, sheetName, colName);
    return filters;
  });

  win.loadFile('src/views/index.html');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
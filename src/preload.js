const { contextBridge, ipcRenderer  } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  file_upload: () => ipcRenderer.invoke('file_upload'),
  get_columns: (sheetName) => ipcRenderer.invoke('get_columns', sheetName),
  parts_analyse: (parts_map) => ipcRenderer.invoke('parts_analyse', parts_map),
  save_results: () => ipcRenderer.invoke('save_results'),
  get_column_values_unique: (sheetName, colName) => ipcRenderer.invoke('get_column_values_unique', sheetName, colName),
  // we can also expose variables, not just functions
})
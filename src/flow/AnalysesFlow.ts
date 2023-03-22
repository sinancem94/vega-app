export {};

const path = require('path')
import { Analyser } from '../analyser/Analyser';
import { dialog } from 'electron';
//import { FieldMapper } from './../mapper/Mapper'
//const {FieldMapper} = require("./../mapper/Mapper")

import axios from 'axios';


export class AnalysesFlow{

    FileUpload = async function (parser: any): Promise<string[]> {
      const result = await dialog.showOpenDialog({
        title: 'Select a file',
        properties: ['openFile'],
        filters: [
          { name: 'Spreadsheets', extensions: ['xlsx', 'csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(async (result: Electron.OpenDialogReturnValue) => {

        if(result.filePaths.length == 0){
          console.log('empty file path');
          // Show an alert dialog box
          dialog.showMessageBoxSync({
            type: 'warning',
            message: 'if you gonna do some shit then do it',
            title: 'bitch please..',
            buttons: ['OK!', 'Sorry..']
          });
          return null;
        }
        var filePath = result.filePaths[0];
        const extension = path.extname(filePath);
        await parser.parse(filePath, extension);
      }).catch((err: Error) => {
        console.log('Error:', err);
      })

      return parser.getSheetNames();
    }

    GetSheetColumns = async function (parser: any, sheetName: string): Promise<string[]> {
      return parser.getColumnsForSheet(sheetName);
    }

    GetColumnValuesUnique = async function (parser: any, analyser: any, sheetName: string, colName: string): Promise<string[]> {
      
      analyser.setWorksheet(parser.getExcelSheet(sheetName));

      let colNum = analyser.getColumnNumberOfField(colName);
      let values = analyser.getUniqueValuesOnColumn(colNum);
      
      return values;
    }

    AnalysedMappedFields = async function name(parser: any, analyser: Analyser, fields: any): Promise<any> {
      var sheetName = fields.sheetName;
      analyser.reset();
      var analyseRes = analyser.analyze(parser.getExcelSheet(sheetName), fields);
      return analyseRes;
    }

    SaveAnalysisResult = async function (parser: any, analyser: Analyser): Promise<string> {

        parser.createSheetOnWorkbook("Part Analysis", analyser.getResultColumnNames());
        var parts: any[] = [];
        for(let i = 0; i < analyser.analysisResult.parts.length; i++){
          
          let colorGray = (i % 2 === 1) ? true : false;
          parser.addPartToAnalysisSheet("Part Analysis", analyser.analysisResult.parts[i], colorGray);
        }

        const defaultPath = parser.filePath;
        const options: Electron.SaveDialogOptions = {
          title: 'Save File',
          defaultPath: defaultPath, // Specify a default file name and extension
          filters: [{ name: 'Excel', extensions: ['xlsx'] }] // Specify the file types that should be shown in the dialog
        };
        
        const { filePath, canceled } = await dialog.showSaveDialog(options);
        if (!canceled && filePath) {
          // The user selected a file path, so you can save the file to that location
          const saveRes = await parser.saveWorkbook(filePath);
          if(!saveRes){
            dialog.showMessageBoxSync({
              type: 'error',
              message: 'Kaydemedi, excel kapali mi bi bak bakam',
              title: 'sorry',
              buttons: ['<3', 'tabi canim benim']
            });
          }
        }

        return String(filePath);
    }

    SearchCommerce = async function(){
      const searchQuery = '2LA456342-04'; // Replace with your actual search query
      //const payload = { /* your payload object */ }; // Replace with your actual payload object

      const url = 'https://ecommerce.aircostcontrol.com/search'; // The search endpoint URL on the website

      axios.post(url, {
        params: {
          search_query: searchQuery
        }
      }).then(response => {
        console.log(response.data); // Replace with your desired code to handle the response data
      }).catch(error => {
        console.error(error); // Replace with your desired code to handle errors
      });
    }
}

module.exports = AnalysesFlow;
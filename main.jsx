// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
$.level = 0;
//debugger;

// on localized builds pull the $$$/Strings from a .dat file
$.localize = true;

////////////////////// ********** parse ms-dos csv

//open file with amount for batch proccesing
var b = new File((new File($.fileName)).parent + "/data.csv");

b.open('r');
var batchDistance = "";
while(!b.eof)
batchDistance += b.read(); //not readln - important
b.close();
csv_ = batchDistance;

///////////// parsing

//
var min_arr = csv_.split(/\r|\n/);
var main_arr = [];
for (var i = 0; i < min_arr.length; i++) {
  main_arr.push( min_arr[i].split(/;/) );
  main_arr[i][0] = main_arr[i][0].replace('/', '|');
  main_arr[i][1] = parseFloat(main_arr[i][1].replace(',','.'));
  main_arr[i][2] = parseFloat(main_arr[i][2].replace(',','.'));
}

//parsing to name array
var name_array = [];
for (var i = 0; i < main_arr.length; i++) {
  name_array[i] = main_arr[i][0];
}

// alert( main_arr[0][2] );

////////////////////// ********** parse ms-dos csv

var W = new Window ('dialog {orientation: "column", alignChildren: "fill"}',
"Batch resize | Masowa zmiana formatu", undefined, {closeButton: true});

var scheme_Desc = W.add('statictext', undefined, 'Schemat | Scheme:')
var scheme_drop_down = W.add('dropdownlist', undefined, name_array);
var scheme_Size = W.add ('statictext', undefined,
                         '\n__\n__', {multiline: true});

var ind;
scheme_drop_down.onChange = function (){
  ind = parseInt(scheme_drop_down.selection.index);
  scheme_Size.text = 'Index:   ' + ind +
                    '\nSzerokosc | Width:  ' +  main_arr[ind][1] +
                   '\nWysokosc | Height:  ' + main_arr[ind][2];

}

scheme_drop_down.selection = 1;

//////////////////// *** procces folder

var folder_box = W.add('checkbox', undefined, 'Przetworz folder | Process a folder');
//global scope
var extension, splitPath, inputFiles, outputFolder;
var files_to_pr = [];

W.add('statictext', undefined, 'Lista plikow | List of files:');
var mainGroup = W.add( 'dropdownlist', undefined, 'Lista plikow | List of files:' );

mainGroup.add('item', '_________');

var desc_place = W.add('statictext', undefined, 'Folder zapisu | Folder to save files:')
var place_of_saving = W.add('edittext', undefined, '____________', {multiline: true, readonly: true});

folder_box.onClick = function () {
  if (folder_box.value) {
    var inputFolder = Folder.selectDialog("Otworz folder do przetworzenia / Open folder for processing");
    if (inputFolder == null) {
      folder_box.value = false;
    } else {
        inputFiles = inputFolder.getFiles();
        cleanList();

      for (var i = 0; i < files_to_pr.length; i++){
        var temp_arr = decodeURI(files_to_pr[i].toString()).split('/');
        mainGroup.add('item', temp_arr[temp_arr.length-1]);
      }

      outputFolder = Folder.selectDialog("Otworz folder do zapisania / Open folder for saving");
      if (outputFolder != null) {
        place_of_saving.text = ( decodeURI(outputFolder.toString()) );
      } else {
        alert( 'Nie wybrano folderu | Nothing has been chosen.' );
      }
    }
  } else {
    mainGroup.removeAll();
    place_of_saving.text = '';
  }
}


function cleanList() {
  for (var i = 0; i < inputFiles.length; i++){
    splitPath = inputFiles[i].toString().split(".");
    extension = splitPath[splitPath.length-1];
    if (
    extension=='TIF'      ||
    extension=='tif'      ||
    extension=='jpeg'     ||
    extension=='jpg'      ||
    extension=='JPEG'     ||
    extension=='JPG'
    ) {
      files_to_pr.push( inputFiles[i] );
    }
  }
}

//////////////////// *** procces folder

W.add ('button', undefined, 'Rozpocznij | Begin')

W.show();

var openedFile, folderLoc, Name;

function loop_folder () {
  if (files_to_pr != null) {
    //main loop:
    folderLoc = new Folder(outputFolder) + "/";

    for (var i = 0; i < files_to_pr.length; i++) {
      openedFile = app.open(inputFiles[i]);
      app.activeDocument = openedFile;
      convert_();

      Name = app.activeDocument.name.replace(/\.[^\.]+$/, '');

      SaveTIFF( new File (folderLoc + '0' + i + '_' + Name + '.tif') );

      openedFile.close(SaveOptions.DONOTSAVECHANGES);
    }
    //safety else:
  } else {
    alert ('Nie wybrano folder | No folder has been chosen');
  }
}

function convert_() {
  app.activeDocument.flatten();
  ind = parseInt(scheme_drop_down.selection.index);
  app.activeDocument.resizeImage(
    main_arr[0][1],
    main_arr[0][2],
    app.activeDocument.resolution,
    ResampleMethod.BICUBIC
  );
}

function SaveTIFF(saveFile){
tiffSaveOptions = new TiffSaveOptions();
tiffSaveOptions.embedColorProfile = true;
tiffSaveOptions.alphaChannels = true;
tiffSaveOptions.layers = true;
tiffSaveOptions.imageCompression = TIFFEncoding.TIFFLZW;
// tiffSaveOptions.jpegQuality=12;
app.activeDocument.saveAs(saveFile, tiffSaveOptions, true, Extension.LOWERCASE);
}

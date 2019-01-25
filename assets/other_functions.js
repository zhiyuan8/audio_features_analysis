function extractZcr(windows)
{
  var winLength = windows.length;
  var winMean = math.mean(windows);
  var zcr = 0;
  for (var i = 1; i < winLength; i++)
  {
    zcr = zcr + math.abs( math.sign(windows[i] - winMean) 
      - math.sign(windows[i-1] - winMean) ) / 2; // divided by 2 because 1 - (-1) = 2, remember to substract mean
  }
  return(zcr);
}

function extractEntropy (windows, numOfShortBlocks)
{
  var Eol = math.sum( math.square(windows) );
  var winLength = windows.length;
  var subWinLength = math.floor(winLength / numOfShortBlocks);

  if ( winLength != (subWinLength*numOfShortBlocks) )
  {
    windows = windows.slice(0,subWinLength* numOfShortBlocks);
  }

  var Entropy  = 0;
  var s = new Array(subWinLength);
  for (var i = 0; i < numOfShortBlocks; i++) 
  {
    s = math.sum( math.square( windows.slice (i*subWinLength , (i+1)*subWinLength) ) ) / (Eol + 1e-20);
    Entropy = Entropy - s * math.log2(s + 1e-20);
  }
  return(Entropy);
}

function extractSpectralFlux (windowFFTPrev, windowFFT)
{
  var F = 0;
  
  var winLength = windowFFT.length;
  var winSum = math.sum(windowFFT);
  var winSumPrev = math.sum(windowFFTPrev);
  for (var i = 0; i < winLength; i++) 
  {
    // compute the spectral flux as the sum of square distances and also normalize the two spectra:
    F = F + math.pow( ( windowFFT[i] / (winSum  + 1e-20) - windowFFTPrev[i] / (winSumPrev  + 1e-20) ) , 2 );
  }
  return (F)
}

function stFeatureSave()
{ // the sequence must exactly the same as show()
    stData[0][stColCount] = rms;
        stData[1][stColCount] = zcr;
        stData[2][stColCount] = energy;
        stData[3][stColCount] = spectralCentroid;
        stData[4][stColCount] = spectralSpread;
        stData[5][stColCount] = spectralRolloff;
        for (var i = 6; i < num_features; i++) {
           stData[i][stColCount] = mfcc[i-6];
        }
        stColCount++;
}

function mtFeatureExtraction(stFeature,basis)
{ // get max, min, mean, median, std, std / mean
        mtData[basis][mtColCount] =  math.max(stFeature) ; // cannot use push
        mtData[basis+1][mtColCount] =  math.min(stFeature) ;
        mtData[basis+2][mtColCount] =  math.mean(stFeature);
        mtData[basis+3][mtColCount] =  math.median(stFeature); 
        mtData[basis+4][mtColCount] =  math.std(stFeature);
        mtData[basis+5][mtColCount] =  
          mtData[basis+2][mtColCount]  / (mtData[basis+4][mtColCount] + 1e-20);
        mtData[basis+6][mtColCount] = extractZcr (stFeature);
        mtData[basis+7][mtColCount] = extractEntropy (stFeature , 4);
}

function loadcsv(table1, table2)
{
  // show me infomation of csv files
  rowCount = table1.getRowCount() ; // # of features in csv file 1
  colCount1 = table1.getColumnCount(); // # of files in csv file 1
  colCount2 = table2.getColumnCount(); // # of files in csv file 2
  print('Frist csv file data size: ' + rowCount  + ' total rows ' + colCount1 + ' total columns');
  print('Second csv file data size: ' + rowCount  + ' total rows ' + colCount2 + ' total columns');
  
  // pass data to loadData and labels
  for (var i = 0; i < colCount1; i++) 
  {
    labels.push(1); // label 1-speech
  }
  for (var i = 0; i < colCount2; i++) 
  {
    labels.push(0); // label 0-noise
  }

  // get mean and std of each feature
  loadData = transpose(table1.getArray()); // each row is a file's features
  loadData = loadData.concat(transpose(table2.getArray())); // concate table2 with table 1

  //renew size of matrix
  rowCount = loadData.length;
  colCount = loadData[0].length;
  normalize_mean = new Array(loadData[0].length); // # of rows in the tempData matrix
  normalize_std = new Array(loadData[0].length); // # of rows in the tempData matrix
  print('After concatenante, matrix size ' + rowCount  + ' total rows ' + colCount + ' total columns')

  // transfer loadData string matrix to data matrix, and get noramlization
  var temp = [];
  for (var i = 0; i < colCount; i++) 
  {
    for (var j = 0; j < rowCount; j++) 
    {
      if (isNaN(loadData[j][i]))
      {
          loadData[j][i] = 0;
      }
      else
      {
        loadData[j][i] = Number(loadData[j][i]);
      }
    }

    temp = getCol(loadData, i)
    normalize_mean[i] = math.mean(temp);
    normalize_std[i]  = math.std(temp);

    for (var j = 0; j < rowCount; j++)  //normalized loadData
    {
      loadData[j][i] = (loadData[j][i]-normalize_mean[i])/normalize_std[i]
    }
  }
}

function getCol(matrix, col)
{
  var column = [];
  for(var i=0; i<matrix.length; i++)
  {
      column.push(matrix[i][col]);
  }
  return column;
}

function Create2DArray(rows) 
{ // you only need to care about # of rows, create a 2D array
  var arr = [];
  for (var i=0;i<rows;i++) 
  {
     arr[i] = [];
  }
  return arr;
}

function exportArray() 
{
	save(mtData, 'mtData.txt')
  //const blob = new Blob(mtData, {type: "text/csv;charset=utf-8"});
  //window.saveAs(blob, `all_features-${ new Date() }.csv`);
  //const blob2 = new Blob(all_raw_audio, {type: "text/csv;charset=utf-8"});
  //window.saveAs(blob2, `raw_audio-${ new Date() }.csv`);
  //const blob3 = new Blob(all_raw_FFT, {type: "text/csv;charset=utf-8"});
  //window.saveAs(blob3, `raw_FFT-${ new Date() }.csv`);
}

function transpose(matrix) { // transpose a 2D array
  return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function label_text(ID, text)
{
    var elem = document.getElementById(ID);
    elem.style.fontSize = "xx-large";
    elem.innerHTML = text;
}

function timeClock() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  // add a zero in front of numbers<10
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById("txt").innerHTML = "current time: " + h+ ":" + m + ":" + s;
  t = setTimeout(function(){ timeClock() }, 500);
}

function checkTime(i) {
  if (i<10) {
    i = "0" + i;
  }
  return i;
}
// setup global variables
var mfcc = [0,0,0,0,0,0,0,0,0,0,0,0,0]
var rms = 0; var zcr = 0; var energy = 0; var spectralCentroid = 0;
var spectralSpread = 0; var spectralFlux = 0; var spectralRolloff = 0; 
var listening = false
var data = []; // save all data

navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
);

// Fix bug by https://stackoverflow.com/questions/28991835/firefox-navigator-getusermedia-is-not-a-function
if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
    navigator.getUserMedia({
        audio: true
    }, streamHandler, errorHandler);
} else {
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(streamHandler).catch(errorHandler);
}

function exportArray() {
  const blob = new Blob(data, {type: "text/csv;charset=utf-8"});
  window.saveAs(blob, `data-${ new Date() }.csv`);
}


function setup() {
    // initializations
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    var context = new AudioContext()
    var source = null
    var startButton = null
    var stopButton = null

    // canvas setup
    createCanvas(1500, 200)
    background(255)

    // get microphone
    navigator.getUserMedia({audio:true, video:false},function(stream){
        // get audio stream data
        source = context.createMediaStreamSource(stream)

        // analyser setup
        meydaAnalyzer = Meyda.createMeydaAnalyzer({
            'audioContext':context,
            'source':source,
            'bufferSize':512,// Buffer Size tells Meyda how often to check the audio feature, and is
  // measured in Audio Samples. Usually there are 44100 Audio Samples in 1
  // second, which means in this case Meyda will calculate the level about 86
  // (44100/512) times per second.
            'sampleRate':44100,
            'featureExtractors':['rms', 'mfcc','zcr','energy', 'spectralCentroid',
            'spectralSpread','spectralRolloff'], // there is a problem with spectral flux, signal is not defined
             // define feature to extract here
  // Finally, we provide a function which Meyda will call every time it
  // calculates a new level. This function will be called around 86 times per
  // second.
            'callback':show
        })

        // buttons
        startButton = createButton('Start')
        startButton.mousePressed(function(){
            // start audio analyzer
            if(listening == false){
                meydaAnalyzer.start(['rms', 'mfcc','zcr','energy', 'spectralCentroid',
                'spectralSpread','spectralRolloff']) // must point out feature names
                listening = true
                startButton.html('Stop')
                startButton.style('background:#aa0')
            }else{
                meydaAnalyzer.stop()
                listening = false
                startButton.html('Start')
                startButton.style('background:#aaf')
            }
        })

    },function(error){
        console.log(error)
    })
}

function show(features){ // show function was called each time data was updated
    background(255)
    rms = features['rms']
    zcr = features['zcr']
    energy = features['energy']
    spectralCentroid = features['spectralCentroid']
    spectralSpread = features['spectralSpread']
    spectralRolloff = features['spectralRolloff']
    //spectralRolloff = features['spectralRolloff']
    mfcc = features['mfcc']

    data.push(mfcc.join(',') + '\n') // save mfcc
    // print data
    text("rms: " + rms,20,20);
    text("zcr: " + zcr,20,40);
    text("energy :" + energy,20,60);
    text("spectralCentroid: " + spectralCentroid,20,80);
    text("spectralSpread: " + spectralSpread,20,100);
    //text("spectralFlux: " + spectralFlux,20,120);
    text("spectralRolloff: " + spectralRolloff,20,140);
    text("mfcc (length=13) : \n" + mfcc,20,180);
}
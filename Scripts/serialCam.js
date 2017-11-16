var FileSaver = require('file-saver');

var player = videojs("liveVideo", {
    controls: true,
    width: 550,
    height: 600,
    fluid: false,
    plugins: {
        record: {
            audio: false,
            video: true,
            maxLength: 60,
            debug: true
        }
    }
});

// error handling
player.on('deviceError', function() {
    console.log('device error:', player.deviceErrorCode);
});

player.on('error', function(error) {
    console.log('error:', error);
});

// user clicked the record button and started recording
player.on('startRecord', function() {
    console.log('started recording!');
    console.log('player in startRecord', player);

});

// user completed recording and stream is available
player.on('finishRecord', function() {
    console.log('finished recording: ', player.recordedData);
    var video = player.recordedData;
    FileSaver.saveAs(video, "video.webm"); //TODO: change to mp4

});
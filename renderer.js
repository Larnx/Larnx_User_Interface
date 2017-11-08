// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote        = require('electron').remote;
const ipcRenderer   = require('electron').ipcRenderer;
const dialog        = remote.dialog; //require('electron').dialog;
const fs            = require("fs");
const path          = require('path');
const videojs       = require('video.js');

function render_index() {
    ipcRenderer.send('render_index');
}

function fileExplorer(import_request) {
    dialog.showOpenDialog(function (fileNames) {
        if (fileNames === undefined) return;

        var fileName = fileNames[0];
        fs.readFile(fileName, 'base64', function (error, data) {
            if ( path.extname(fileName)  == '.jpg'|| path.extname(fileName)  == '.png' )
            {
                document.getElementById("original").src=fileName;
            }

            if ( path.extname(fileName)  == '.mp4' )
            {
                videoPlayer.reset();
                //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                //document.getElementById("vid_original_header").setAttribute('data-video-path',fileName);
                videoPlayer.src({type: "video/mp4", src: "file:///" + fileName});
            }
    });
    });
}

function execute() {
    const PROC = require('child_process').spawn('Executables/Larnx.exe',[ document.getElementById("vid_original_header").getAttribute('data-video-path') ]);

    PROC.stdout.on('data', function(data)
    {});

    PROC.stderr.on("data", function (data)
    {});

    PROC.on('close', function (data)
    {});

    PROC.on('exit', function (data)
    {});
}










// Deprecated scripts, notes, trash. Please remove in <MASTER> branch

// FROM RENDER.js
// document.getElementById("vid_original").type='video/mp4';
// var videoPlayer = videojs(document.getElementById('vid_original_header'), {}, function(){
//     this.src({type: "video/mp4", src: "file:///" + fileName});
// });

// FROM index.js
//        videojs('vid_original_header').ready(function(){
//            videoPlayer = this;
//            videoPlayer.src();
//        });
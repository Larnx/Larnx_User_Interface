// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const dialog = remote.dialog; //require('electron').dialog;
const fs = require("fs");
const path = require('path');
const videojs = require('video.js');
const Chart = require('chart.js');
const readline = require('readline');

function render_index() {
    ipcRenderer.send('render_index');
}

function setWorkspace() {
    dialog.showOpenDialog({ properties: ['openDirectory'] }, function(dirName) {
        localStorage.WORKSPACE = dirName;
    });
}

function fileExplorer() {
    dialog.showOpenDialog(function(fileNames) {
        if (fileNames === undefined) return;

        var fileName = fileNames[0];
        fs.readFile(fileName, 'base64', function(error, data) {
            if (path.extname(fileName) == '.jpg' || path.extname(fileName) == '.png') {
                document.getElementById("original").src = fileName;
            }

            if (path.extname(fileName) == '.mp4') {
                videoPlayer.reset();
                //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                //document.getElementById("vid_original_header").setAttribute('data-video-path',fileName);
                videoPlayer.src({ type: "video/mp4", src: "file:///" + fileName });
            }
        });
    });
}

// adds data to the chart next to the video, initialized to have no data 
function addData(chart, data) {
    // chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

// creates a readline instance that we can use to read the output of the video
// color segmentation video
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function execute() {
    const PROC = require('child_process').spawn('Executables/Larnx.exe', [document.getElementById("vid_original_header").getAttribute('data-video-path')]);

    PROC.stdout.on('data', function(data) {
        console.log(data);
    });

    PROC.stderr.on("data", function(data) {
        console.log(data);
    });

    PROC.on('close', function(data) {
        console.log(data);
    });

    PROC.on('exit', function(data) {
        console.log(data);
    });
}

function saveFrame() {
    const PROC = require('child_process').spawn('Executables/SaveFrame.exe', [document.getElementById("vid_original_header").getAttribute('data-video-path')]);

    PROC.stdout.on('data', function(data) {});

    PROC.stderr.on("data", function(data) {});

    PROC.on('close', function(data) {});

    PROC.on('exit', function(data) {});
}



// reads each line of the console input & adds the value to the PixelChart
// TODO: move this block of code to where the executable that processes the color segmentation executable is called
rl.question('', (y_data) => {
    addData(myChart, y_data);
    rl.close();
});



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
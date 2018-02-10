// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote        = require('electron').remote;
const ipcRenderer   = require('electron').ipcRenderer;
const dialog        = remote.dialog; //require('electron').dialog;
const fs            = require("fs");
const path          = require('path');
const videojs       = require('video.js');
const Chart         = require('chart.js');
const toastr        = require('toastr');
const vidConverter  = require('handbrake-js');

/* ALL USER INTERFACING CODE BELOW  */



function render_index() {
    ipcRenderer.send('render_index');
}

function go_backwards(){
    ipcRenderer.send('go_home');
}

function beginEndoscope() {
    $('#endoscopeModal').modal('show');
}

function render_modal(method){
    switch(method)
    {
        case 'execute':
            $('#add_button_here').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button> <button type="button" class="btn btn-primary" onclick="execute( document.getElementById(\'execute_fileName\').value )" data-dismiss="modal">Proceed</button>');
            $('#add_forms_here').html('<label for="execute_fileName">Output File Name: </label>\n' +
                '                        <input type="email" class="form-control" id="execute_fileName" aria-describedby="emailHelp" placeholder="default">\n' +
                '                        <small id="emailHelp" class="form-text text-muted">Please enter the name you would like your processed outputs to be called.</small>');
            break;
        case 'saveFrame':
            $('#add_button_here').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button> <button type="button" class="btn btn-primary" onclick="saveFrame( document.getElementById(\'execute_fileName\').value , document.getElementById(\'timeStamp\').value)" data-dismiss="modal">Proceed</button>');
            $('#add_forms_here').html('<label for="execute_fileName">Output File Name: </label>\n' +
                '                        <input type="email" class="form-control" id="execute_fileName" aria-describedby="emailHelp" placeholder="default">\n' +
                '                        <small id="emailHelp" class="form-text text-muted">Please enter the name you would like your processed outputs to be called.</small>\n' +
                '<br>' +
                '                        <label for="timeStamp">Frame Time Location: </label>\n' +
                '                        <input type="email" class="form-control" id="timeStamp" aria-describedby="timeStamp_descriptor" placeholder="default">\n' +
                '                        <small id="timeStamp_descriptor" class="form-text text-muted">Please enter the video time in ms where you would like to save a frame.</small>');
            break;
        case 'trackContour':
            $('#add_button_here').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button> <button type="button" class="btn btn-primary" onclick="mapContour( document.getElementById(\'execute_fileName\').value )" data-dismiss="modal">Proceed</button>');
            $('#add_forms_here').html('<label for="execute_fileName">Output File Name: </label>\n' +
                '                        <input type="email" class="form-control" id="execute_fileName" aria-describedby="emailHelp" placeholder="default">\n' +
                '                        <small id="emailHelp" class="form-text text-muted">Please enter the name you would like your processed outputs to be called.</small>');
            break;
        default:
    }
    $('#executeModal').modal('show');
}

function setWorkspace() {
    dialog.showOpenDialog({properties: ['openDirectory']}, function (dirName) {
        localStorage.WORKSPACE = dirName;
        document.getElementById('WorkSpace').innerHTML = 'Current Workspace: ' + dirName;
    });
}

function fileExplorer(method) {
    dialog.showOpenDialog(function (fileNames) {
        if (fileNames === undefined) return;

        switch(method)
        {
            case 'left_import':
                var fileName = fileNames[0];
                fs.readFile(fileName, 'base64', function(error, data) {
                    if (path.extname(fileName) == '.jpg' || path.extname(fileName) == '.png') {
                        document.getElementById("original").src = fileName;
                    }

                    if (path.extname(fileName) == '.mp4') {
                        videoPlayer_left.reset();
                        //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                        document.getElementById("vid_original_header_left").setAttribute('data-video-path',fileName);
                        videoPlayer_left.src({ type: "video/mp4", src: "file:///" + fileName });
                        document.getElementById('leftStatus').innerHTML = fileName;
                        document.getElementById('video-container-left').setAttribute('active','true');
                        updateCard();
                    }
                    if (path.extname(fileName) == '.avi') {
                        videoPlayer_left.reset();
                        //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                        document.getElementById("vid_original_header_left").setAttribute('data-video-path',fileName);
                        videoPlayer_left.src({ type: "video/avi", src: "file:///" + fileName });
                        document.getElementById('leftStatus').innerHTML = fileName;
                        document.getElementById('video-container-left').setAttribute('active','true');
                        updateCard();
                    }
                });
                break;
            case 'right_import':
                var fileName = fileNames[0];
                fs.readFile(fileName, 'base64', function(error, data) {
                    if (path.extname(fileName) == '.jpg' || path.extname(fileName) == '.png') {
                        document.getElementById("original").src = fileName;
                    }

                    if (path.extname(fileName) == '.mp4') {
                        videoPlayer_right.reset();
                        //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                        document.getElementById("vid_original_header_right").setAttribute('data-video-path',fileName);
                        videoPlayer_right.src({ type: "video/mp4", src: "file:///" + fileName });
                        document.getElementById('rightStatus').innerHTML = fileName;
                        document.getElementById('video-container-right').setAttribute('active','true');
                        updateCard();
                    }
                    if (path.extname(fileName) == '.avi') {
                        videoPlayer_right.reset();
                        //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                        document.getElementById("vid_original_header_right").setAttribute('data-video-path',fileName);
                        videoPlayer_right.src({ type: "video/avi", src: "file:///" + fileName });
                        document.getElementById('rightStatus').innerHTML = fileName;
                        document.getElementById('video-container-right').setAttribute('active','true');
                        updateCard();
                    }
                });
                break;
            default:
                break;
        }

    });
}

//TODO: Add error handlers: Do not allow folks to do ANYTHING without having a workspace selected first. Or auto-give them a workspace

function convertVideo() {
    dialog.showOpenDialog(function (fileNames) {
        if (fileNames === undefined) return;

        var fileName = fileNames[0];
        var newName  = path.basename( fileName , path.extname(fileName) );
        newName      = newName + '.mp4';
        newName = path.join(localStorage.WORKSPACE , newName);

        vidConverter.spawn({ input: fileName, output: newName })
            .on('error', function(err){
                console.log(err);
            })
            .on('start',function(){
                //TODO: Add a modal with completion progress report.
            })
            .on('progress', function(progress){
                console.log(
                    'Percent complete: %s, ETA: %s',
                    progress.percentComplete,
                    progress.eta
                    //TODO: Add a progress bar as implemented in Neptune :)
                );
            })
            .on('complete',function(){
                toastr.success(path.join(localStorage.WORKSPACE),'AVI successful converted to MP4. Output saved to::')
            });

    });


}

function pushDataPoint(y_value) {
    var length = chart.options.data[0].dataPoints.length;
    //chart.options.title.text = "New DataPoint Added at the end";
    var sum = 0;
    for (var i = 0; i  < y_value.length; i++)
    {
        sum = sum + y_value[i];
    }
    chart.options.data[0].dataPoints.push({ y: sum / y_value.length });
    chart.render();
}

/* ALL EXECUTABLE INTERFACING CODE BELOW */

function NanEyeAPI(fileName){

    var cmd = '"NanEye2D_FiberDemoUsb3_csharp.exe" "' + localStorage.WORKSPACE + '" "' + fileName + '"';
    const API = require('child_process').exec(cmd,{cwd:'Executables/NanEyeAPI/'});

    API.stdout.on('data', function(data)
    {
        console.log(data);
    });

    API.stderr.on("data", function (data)
    {
        console.log(data);
    });

    API.on('close', function (data)
    {
        console.log(data);
    });

    API.on('exit', function (data)
    {
        console.log(data);
        toastr.success(localStorage.WORKSPACE,'Endoscopy session complete! Output is written to:')
    });
}

function execute(fileName) {
    const PROC = require('child_process').spawn('Executables/Larnx_Back_End.exe', [ '1' , document.getElementById("vid_original_header").getAttribute('data-video-path') , localStorage.WORKSPACE , fileName ]);
    videoPlayer.play();
    PROC.stdout.on('data', function(data)
    {
        console.log(data);
        pushDataPoint(data);
    });

    PROC.stderr.on("data", function (data)
    {
        console.log(data);
        pushDataPoint(data);
    });

    PROC.on('close', function (data)
    {
        console.log(data);
    });

    PROC.on('exit', function (data)
    {
        console.log(data);
        toastr.success(path.join(localStorage.WORKSPACE,fileName),'Successful processing! Output is written to:')
    });
}

function saveFrame(fileName,timeStamp) {
    const PROC = require('child_process').spawn('Executables/Larnx_Back_End.exe', [ '2' , document.getElementById("vid_original_header").getAttribute('data-video-path') , localStorage.WORKSPACE, timeStamp.toString() , fileName] );

    PROC.stdout.on('data', function(data)
    {
        console.log(data);
    });

    PROC.stderr.on("data", function (data)
    {
        console.log(data);
    });

    PROC.on('close', function (data)
    {
        console.log(data);
    });

    PROC.on('exit', function (data)
    {
        console.log(data);
        toastr.success(path.join(localStorage.WORKSPACE,fileName),'Successful processing! Output is written to:')
    });
}

function mapContour(fileName) {
    const PROC = require('child_process').spawn('Executables/Larnx_Back_End.exe', [ '4' , document.getElementById("vid_original_header").getAttribute('data-video-path') , localStorage.WORKSPACE , fileName ]);
    //videoPlayer.play();
    PROC.stdout.on('data', function(data)
    {
        console.log(data);
        pushDataPoint(data);
    });

    PROC.stderr.on("data", function (data)
    {
        console.log(data);
        pushDataPoint(data);
    });

    PROC.on('close', function (data)
    {
        console.log(data);
    });

    PROC.on('exit', function (data)
    {
        console.log(data);
        toastr.success(path.join(localStorage.WORKSPACE,fileName),'Successful processing! Output is written to:')
    });
}

function updateCard(){
    if( (document.getElementById('video-container-left').getAttribute('active') === 'true') && (document.getElementById('video-container-right').getAttribute('active') === 'true') ) {
        document.getElementById('WorkVideo').innerHTML = 'Stereoscopic Recordings Imported.';
    }
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
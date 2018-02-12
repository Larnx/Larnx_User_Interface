const shell         = require('electron');
const remote        = require('electron').remote;
const ipcRenderer   = require('electron').ipcRenderer;
const dialog        = remote.dialog; //require('electron').dialog;
const fs            = require("fs");
const path          = require('path');
const videojs       = require('video.js');
const Chart         = require('chart.js');
const toastr        = require('toastr');
const vidConverter  = require('handbrake-js');
const open          = require('open');


function openExternal(link){
    console.log('Opening: ',link);
    open(link);
}

function render_index() {
    ipcRenderer.send('render_index');
}

function go_backwards(){
    ipcRenderer.send('go_home');
}

function beginEndoscope() {
    $('#endoscopeModal').html('    <div class="modal-dialog" role="document">\n' +
        '        <div class="modal-content">\n' +
        '            <div class="modal-header" id="endoscopeHeader">\n' +
        '                <h5 class="modal-title" id="endoscopeModalLabel">3D Endoscope Hardware</h5>\n' +
        '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
        '                    <span aria-hidden="true">&times;</span>\n' +
        '                </button>\n' +
        '            </div>\n' +
        '            <div class="modal-body" id="endoscopeBody">\n' +
        '                <p>\n' +
        '                    You are about to being a endoscopy session. <br>\n' +
        '                    Please be sure of the following: <br><br>\n' +
        '                    1) You are using a USB3 FPGA board with a 2-sensor endoscope. <br>\n' +
        '                    2) The USB3 board is powered on, and connected to this computer with a USB and HDMI cable. <br>\n' +
        '                    3) Ensure the USB3 board has its LED indicator blinking green. <br>\n' +
        '                </p>\n' +
        '                <div class="form-group" id="endoscopeForm">\n' +
        '                    <label for="execute_fileName">Endoscope Recording Name: </label>\n' +
        '                    <input type="email" class="form-control" id="endoscopeFilename" aria-describedby="emailHelp" placeholder="default">\n' +
        '                    <small id="endoscopeTip" class="form-text text-muted">Please enter the name you would like to save your endoscope videos as:</small>\n' +
        '                </div>\n' +
        '\n' +
        '            </div>\n' +
        '            <div class="modal-footer" id="endoscopeButtons">\n' +
        '                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>\n' +
        '                <button type="button" class="btn btn-primary" onclick="NanEyeAPI( document.getElementById(\'endoscopeFilename\').value )">Open Endoscope Feed</button>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>');
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
        toastr.success(localStorage.WORKSPACE,'Workspace environment set!')
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

function NanEyeAPI(fileName){
    var cmd     = '"NanEye2D_FiberDemoUsb3_csharp.exe" "' + localStorage.WORKSPACE + '" "' + fileName + '"';
    const API   = require('child_process').exec(cmd,{cwd:'Executables/NanEyeAPI/'});
    var link    = 'https://www.awaiba.com/software';


    $('#endoscopeModalLabel').html('3D Endoscope Hardware - Endoscope Feed Initiated');
    $('#endoscopeBody').html('                <p>\n' +
        '                    Opening Endoscope Hardware <br>\n' +
        '                    Please wait a moment... <br><br>\n' +
        '                    If the endoscope visualizer does not open after a minute, <br>\n' +
        '                    make sure the USB3 led indicator is blinking green. <br>\n' +
        '                    Also make sure the USB3 is recognized by your computers device drivers.<br>\n' +
        '                    If the above is okay, try restarting your PC. Please see NanEye USB3 User Manual<br>\n' +
        '                    for more information.<br>\n' +
        '                </p>\n'+
        '<a href="">NanEye User Manual and Information</a>');
    $('#endoscopeButtons').html('<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>');

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
        toastr.success(localStorage.WORKSPACE,'Endoscopy session complete! Output is written to:');

        $('#endoscopeModalLabel').html('3D Endoscope Hardware - Endoscope Recording Completed');
        $('#endoscopeBody').html('                <p>\n' +
            '                    Endoscope Session Completed \n<br><br>' +
            '                    All recordings have been saved to your workspace: ' + localStorage.WORKSPACE + '<br>\n');
        $('#endoscopeButtons').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n' +
            '                <button type="button" class="btn btn-primary" onclick="NanEyeAPI( document.getElementById(\'endoscopeFilename\').value )">Open Endoscope Feed</button>');
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

function updateCard(video_id){
    if( (document.getElementById('video-container-left').getAttribute('active') === 'true') && (document.getElementById('video-container-right').getAttribute('active') === 'true') ) {
        document.getElementById('WorkVideo').innerHTML = 'Stereoscopic Recordings Imported.';

        $('#playpause_module').css('visibility','visible');
        $('#frameCap_module').css('visibility','visible');
        toastr.success(localStorage.WORKSPACE,'Good to go; both stereoscopic images are uploaded!')
    } else {
        toastr.info(localStorage.WORKSPACE,'You have set one stereoscopic video; make sure to upload both!')
    }
}

function updateProgress(percentComplete){

    if(percentComplete == 0)
    {
        $('#progressBar').html('<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>');
    } else {
        $('#progressBar').html('<div class="progress-bar" role="progressbar" style="width: ' + percentComplete + '%" aria-valuenow="25" aria-valuemin=' + percentComplete + ' aria-valuemax="100"></div>');
    }

}

function simulateProgress(){
    var i;
    for(i = 0; i < 100; i++){
        sleep(100);
        updateProgress(i);
    }
    sleep(2000);
    updateProgress(0);
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

function playVideo(){
    videoPlayer_left.play();
    videoPlayer_right.play();
    //$('#playpause').attr('onclick',stopVideo());
    //$('#playpause').html('Pause Stereoscopic Recording');
}

function pauseVideo(){
    videoPlayer_left.pause();
    videoPlayer_right.pause();
    //$('#playpause').attr('onclick',playVideo());
    //$('#playpause').html('Play Stereoscopic Recording');
}

function stereoFrameCap(){
    // Time is in seconds
    var time_left = videoPlayer_left.currentTime();
    var time_right = videoPlayer_right.currentTime();

}
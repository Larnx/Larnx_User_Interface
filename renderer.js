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
const Ffmpeg        = require('fluent-ffmpeg');


/* Navigation Scripts */

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
function load2D(){
    ipcRenderer.send('load2D')
}

/* Video Control Scripts */

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

function fillDirectory(method){
    dialog.showOpenDialog({properties: ['openDirectory']}, function (fileNames) {
        if (fileNames === undefined) return;
        var fileName = fileNames[0];

        if (method == 'right'){
            document.getElementById('rightDir').value = fileName;
        }
        if (method == 'left'){
            document.getElementById('leftDir').value = fileName;
        }
        if (method == 'center'){
            document.getElementById('centerDir').value = fileName;
        }
    });
}


/* UI Control Scripts */
//TODO: Step 1 - Display checkerboard image. Ask user to measure dimensions of full checkerboard, single checker, and distance between camera and board.
function calibrate(step){
    switch(step){
        case 'step0':
            $('#calibrationModal').html('    <div class="modal-dialog modal-xl" role="document">\n' +
                '        <div class="modal-content">\n' +
                '            <div class="modal-header" id="calibrationHeader">\n' +
                '                <h5 class="modal-title" id="calibrationModalLabelT">Calibrate Stereoscopic Endoscope - Step 0</h5>\n' +
                '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
                '                    <span aria-hidden="true">&times;</span>\n' +
                '                </button>\n' +
                '            </div>\n' +
                '            <div class="modal-body" id="calibrationBody" >\n' +
                '                <div class="container-fluid">\n' +
                '\n' +
                '                    <div class="row" style="margin-bottom: 10px">\n' +
                '                        <div class="col-md-3">\n' +
                '                            <p>\n' +
                '                                <b>Step 0</b><br>\n' +
                '                                To begin, you need a image to calibrate your camera against.<br>\n' +
                '                                One good method is to use a checkerboard image. <br><br>\n' +
                '                                1) Print a simple checkerboard onto a regular sheet of paper. <br>\n' +
                '                                2) Measure the outer-dimensions of the full checkerboard. <br>\n' +
                '                                3) Measure the inner-dimensions of a single checker square. <br>\n' +
                '                                4) Enter the dimensions in the fields below (in mm). <br><br>\n' +
                '\n' +
                '                                Then continue to Step 1.\n' +
                '                            </p>\n' +
                '                        </div>\n' +
                '                        <div class="col-md-9">\n' +
                '                            <img src="../Resources/checkerAnnotated.jpg" >\n' +
                '                        </div>\n' +
                '                    </div>\n' +
                '\n' +
                '                        <label for="outerDim">Outer Dimension Length (mm): </label>\n' +
                '                        <input type="email" class="form-control" id="outerDim" aria-describedby="outDimDiscript" placeholder="default">\n' +
                '                        <small id="outDimDiscript" class="form-text text-muted">Please input the outer checkerboard dimension in mm.</small>\n' +
                '\n' +
                '                        <label for="innerDim">Inner Dimension Length (mm): </label>\n' +
                '                        <input type="email" class="form-control" id="innerDim" aria-describedby="inDimDiscript" placeholder="default">\n' +
                '                        <small id="inDimDiscript" class="form-text text-muted">Please input the inner checkerboard dimension in mm.</small>\n' +
                '                </div>\n' +
                '            </div>\n' +
                '            <div class="modal-footer" id="calibrationButtons">\n' +
                '                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>\n' +
                '                <button type="button" class="btn btn-primary" onclick="calibrate(\'step1\')">Continue</button>\n' +
                '            </div>\n' +
                '        </div>\n' +
                '    </div>');
            $('#calibrationModal').modal('show');
            break;
        case 'step1':
            console.log(document.getElementById('outerDim').value);
            console.log(document.getElementById('innerDim').value);
            $('#calibrationModal').html('<div class="modal-dialog modal-lg" role="document">\n' +
                '    <div class="modal-content">\n' +
                '        <div class="modal-header" id="calibrationHeader">\n' +
                '            <h5 class="modal-title" id="calibrationModalLabelT">Calibrate Stereoscopic Endoscope - Step 1</h5>\n' +
                '            <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
                '                <span aria-hidden="true">&times;</span>\n' +
                '            </button>\n' +
                '        </div>\n' +
                '        <div class="modal-body" id="calibrationBody" >\n' +
                '            <div class="container-fluid">\n' +
                '\n' +
                '                <div class="row" style="margin-bottom: 10px">\n' +
                '\n' +
                '                        <p>\n' +
                '                            <b>Step 1</b><br>\n' +
                '                            Next, you will take a short recording of the checkerboard.<br>\n' +
                '                            Start by opening the endoscope video feed.<br>\n' +
                '                            Try to fix the cameras field-of-view to incorporate the entire checkerboard.<br>\n' +
                '                            It is critical that all 4 corners of the checkerboard are recorded.<br> \n' +
                '                            Record at least 7 seconds of the full checkerboard. <br><br>\n' +
                '                            \n' +
                '                            After you have saved your recording, you\'ll proceed to step 2. \n' +
                '                        </p>\n' +
                '\n' +
                '                </div>\n' +
                '\n' +
                '                <label for="calibFileName">Calibration Recording Name: </label>\n' +
                '                <input type="email" class="form-control" id="calibFileName" aria-describedby="calibFileNameDescript" placeholder="default">\n' +
                '                <small id="calibFileNameDescript" class="form-text text-muted">Please enter the name of the calibration recording. </small>\n' +
                '                \n' +
                '            </div>\n' +
                '        </div>\n' +
                '        <div class="modal-footer" id="calibrationButtons">\n' +
                '            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>\n' +
                '            <button type="button" class="btn btn-warning" onclick="calibrate(\'step0\')">Go Back</button>\n' +
                '            <button type="button" class="btn btn-primary" onclick="calibrate(\'step2\')">Continue - Open Endoscope Feed</button>\n' +
                '        </div>\n' +
                '    </div>\n' +
                '</div>');
            break;
        case 'step2':
            NanEyeAPI( document.getElementById('calibFileName').value , 'calibration');
            $('#calibrationModal').html('<div class="modal-dialog modal-lg" role="document">\n' +
                '    <div class="modal-content">\n' +
                '        <div class="modal-header" id="calibrationHeader">\n' +
                '            <h5 class="modal-title" id="calibrationModalLabelT">Calibrate Stereoscopic Endoscope - Recording...</h5>\n' +
                '            <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
                '                <span aria-hidden="true">&times;</span>\n' +
                '            </button>\n' +
                '        </div>\n' +
                '        <div class="modal-body" id="calibrationBody" >\n' +
                '            <div class="container-fluid">\n' +
                '\n' +
                '                <div class="row" style="margin-bottom: 10px">\n' +
                '                    <p>\n' +
                '                        <b>Recording...</b><br>\n' +
                '                        <br>\n' +
                '                        Recording session in progress<br>\n' +
                '                        Please complete your recording and close the recording window when you finish<br>\n' +
                '                        Then you can proceed to the next step<br>\n' +
                '                    </p>\n' +
                '                </div>\n' +
                '            </div>\n' +
                '        </div>\n' +
                '        <div class="modal-footer" id="calibrationButtons">\n' +
                '            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>\n' +
                '        </div>\n' +
                '    </div>\n' +
                '</div>');
            break;
        default:
            break;
    }
}

function preExecuteModal(method){
    switch(method)
    {
        case 'thresholdHSV':
            $('#add_button_here').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button> <button type="button" class="btn btn-primary" onclick="thresholdHSV( document.getElementById(\'execute_fileName\').value )" data-dismiss="modal">Proceed</button>');
            $('#add_forms_here').html('<label for="execute_fileName">Output File Name: </label>\n' +
                '                        <input type="email" class="form-control" id="execute_fileName" aria-describedby="emailHelp" placeholder="default">\n' +
                '                        <small id="emailHelp" class="form-text text-muted">Please enter the name you would like your processed outputs to be called.</small>');
            break;
        case 'contourMap':
            $('#add_button_here').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button> <button type="button" class="btn btn-primary" onclick="mapContour( document.getElementById(\'execute_fileName\').value )" data-dismiss="modal">Proceed</button>');
            $('#add_forms_here').html('<label for="execute_fileName">Output File Name: </label>\n' +
                '                        <input type="email" class="form-control" id="execute_fileName" aria-describedby="emailHelp" placeholder="default">\n' +
                '                        <small id="emailHelp" class="form-text text-muted">Please enter the name you would like your processed outputs to be called.</small>');
            break;
        case 'depthMap':
            $('#add_button_here').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button> <button type="button" class="btn btn-primary" onclick="depthMap()" data-dismiss="modal">Proceed to Select YAML File</button>');
            $('#add_forms_here').html('<p>To generate a depth map, you will need to load a configuration file. Please select a valid YAML configuration file in the next window.</p>');
            break;



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
                        toastr.info('Please use converter to create MP4','AVI files are not supported for viewing!');
                    }
                    if (path.extname(fileName) == '.m4v') {
                        videoPlayer_left.reset();
                        //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                        document.getElementById("vid_original_header_left").setAttribute('data-video-path',fileName);
                        videoPlayer_left.src({ type: "video/m4v", src: "file:///" + fileName });
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
                        toastr.info('Please use converter to create MP4','AVI files are not supported for viewing!');
                    }
                    if (path.extname(fileName) == '.m4v') {
                        videoPlayer_right.reset();
                        //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                        document.getElementById("vid_original_header_right").setAttribute('data-video-path',fileName);
                        videoPlayer_right.src({ type: "video/m4v", src: "file:///" + fileName });
                        document.getElementById('rightStatus').innerHTML = fileName;
                        document.getElementById('video-container-right').setAttribute('active','true');
                        updateCard();
                    }
                });
                break;
            case 'modal_import':
                var fileName = fileNames[0];
                fs.readFile(fileName, 'base64', function(error, data) {
                    if (path.extname(fileName) == '.jpg' || path.extname(fileName) == '.png') {
                        document.getElementById("original").src = fileName;
                    }

                    if (path.extname(fileName) == '.mp4') {
                        videoPlayer_modal.reset();
                        //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                        document.getElementById("vid_original_header_modal").setAttribute('data-video-path',fileName);
                        videoPlayer_modal.src({ type: "video/mp4", src: "file:///" + fileName });
                        document.getElementById('modalStatus').innerHTML = fileName;
                        document.getElementById('video-container-modal').setAttribute('active','true');
                    }
                    if (path.extname(fileName) == '.avi') {
                        videoPlayer_modal.reset();
                        //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                        document.getElementById("vid_original_header_modal").setAttribute('data-video-path',fileName);
                        videoPlayer_modal.src({ type: "video/avi", src: "file:///" + fileName });
                        document.getElementById('modalStatus').innerHTML = fileName;
                        document.getElementById('video-container-modal').setAttribute('active','true');
                        toastr.info('Please use converter to create MP4','AVI files are not supported for viewing!');
                    }
                    if (path.extname(fileName) == '.m4v') {
                        videoPlayer_modal.reset();
                        //document.getElementById("vid_original_mp4").src="file:///" + fileName;
                        document.getElementById("vid_original_header_modal").setAttribute('data-video-path',fileName);
                        videoPlayer_modal.src({ type: "video/m4v", src: "file:///" + fileName });
                        document.getElementById('modalStatus').innerHTML = fileName;
                        document.getElementById('video-container-modal').setAttribute('active','true');
                    }
                });
                break;
            default:
                break;
        }

    });
}

function convertVideo(method) {
    dialog.showOpenDialog(function (fileNames) {
        if (fileNames === undefined) return;

        var fileName = fileNames[0];
        var newName  = path.basename( fileName , path.extname(fileName) );
        newName      = newName + '.' + method;
        newName = path.join(localStorage.WORKSPACE , newName);
        ffmpeg_converter(method,fileName,newName);
    });
}

function ffmpeg_converter(method, source, target){
    Ffmpeg.setFfmpegPath('Dependencies/ffmpeg/ffmpeg.exe');
    Ffmpeg.setFfprobePath('Dependencies/ffmpeg/ffprobe.exe');

    Ffmpeg(source)
        .toFormat(method)
        .on('error', function (err) {
            console.log('An error occurred: ' + err.message);
        })
        .on('progress', function (progress) {
            // console.log(JSON.stringify(progress));
            console.log('Processing: ' + progress.targetSize + ' KB converted');
        })
        .on('end', function () {
            console.log('Processing finished!');
            toastr.success(path.join(localStorage.WORKSPACE),'Video file successful converted. Output saved to:');
        })
        .save(target);//path where you want to save your file
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

function updateCard(video_id){
    if( (document.getElementById('video-container-left').getAttribute('active') === 'true') && (document.getElementById('video-container-right').getAttribute('active') === 'true') ) {
        document.getElementById('WorkVideo').innerHTML = 'Stereoscopic Recordings Imported.';

        $('#playpause_module').css('visibility','visible');
        $('#frameCap_module').css('visibility','visible');
        toastr.success(localStorage.WORKSPACE,'Good to go! Both stereoscopic images are uploaded!')
    } else {
        toastr.info(localStorage.WORKSPACE,'You have set one stereoscopic video. Make sure to upload both!')
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

/* Pre-Backend Scripts */

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
        '                <button type="button" class="btn btn-primary" onclick="NanEyeAPI( document.getElementById(\'endoscopeFilename\').value , \'normal\' )">Open Endoscope Feed</button>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>');
    $('#endoscopeModal').modal('show');
}

function stereoFrameCap(){
    // Time is in seconds
    var time_left = videoPlayer_left.currentTime();
    var time_right = videoPlayer_right.currentTime();

}


/* Miscellaneous Scripts - No Direct Role in Final Deliverable */

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


/* Backend Interfacing Scripts */

function NanEyeAPI(fileName,callee){
    var cmd     = '"NanEye2D_FiberDemoUsb3_csharp.exe" "' + localStorage.WORKSPACE + '" "' + fileName + '"';
    const API   = require('child_process').exec(cmd,{cwd:'Executables/NanEyeAPI/'});
    var link    = 'https://www.awaiba.com/software';

    if (callee === 'normal'){
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
    }



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

    //TODO: Figure Out why "modal dismiss" breaks --> Theory, Javascript Runtime Error due to undefined variables in inner-outer Dim

    API.on('exit', function (data)
    {
        console.log(data);
        toastr.success(localStorage.WORKSPACE,'Endoscopy session complete! Output is written to:');

        if (callee === 'normal'){
            $('#endoscopeModalLabel').html('3D Endoscope Hardware - Endoscope Recording Completed');
            $('#endoscopeBody').html('                <p>\n' +
                '                    Endoscope Session Completed \n<br><br>' +
                '                    All recordings have been saved to your workspace: ' + localStorage.WORKSPACE + '<br>\n');
            $('#endoscopeButtons').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n' +
                '                <button type="button" class="btn btn-primary" onclick="NanEyeAPI( document.getElementById(\'endoscopeFilename\').value , \'normal\')">Open Endoscope Feed</button>');
        }
        if (callee === 'calibration'){
            $('#calibrationModal').html('<div class="modal-dialog modal-lg" role="document">\n' +
                '    <div class="modal-content">\n' +
                '        <div class="modal-header" id="calibrationHeader">\n' +
                '            <h5 class="modal-title" id="calibrationModalLabelT">Calibrate Stereoscopic Endoscope - Step 2</h5>\n' +
                '            <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
                '                <span aria-hidden="true">&times;</span>\n' +
                '            </button>\n' +
                '        </div>\n' +
                '        <div class="modal-body" id="calibrationBody" >\n' +
                '            <div class="container-fluid">\n' +
                '\n' +
                '                <div class="row" style="margin-bottom: 10px">\n' +
                '                    <p>\n' +
                '                        <b>Step 2: Trim for Quality</b><br>\n' +
                '                        <br>\n' +
                '                        Please finish recording your calibration video.<br>\n' +
                '                        Once you complete the recording, please select your recording from the file explorer.<br>\n' +
                '                        The next step is to trim your calibrated recording to obtain the best image.<br>\n' +
                '                        Use the viewer below to select a position in the recording that contains the full checkerboard.<br>\n' +
                '                        Also make sure that checkerboard is clear, focused, and relatively still.<br><br>\n' +
                '\n' +
                '                        After you select a ideal position in the recording, please press continue.<br>\n' +
                '                        Our software will automatically do the remainder of the calibration.<br>\n' +
                '                        Your calibration results will be saved to a ".yml" file.\n' +
                '                    </p>\n' +
                '                </div>\n' +
                '                <div class="row" style="margin-bottom: 10px">\n' +
                '                    <button type="button" class="btn btn-secondary" onclick="fileExplorer(\'modal_import\')">Upload Calibration Video</button>\n' +
                '                </div>\n' +
                '                <div id="video-container-modal" class="row" style="margin-bottom: 10px" active="false">\n' +
                '                    <video id="vid_original_header_modal" class="video-js vjs-default-skin" controls preload="auto" width="640" height="640" poster="../Resources/g.jpg" data-video-path="">\n' +
                '                        <source id="vid_original_mp4_modal" src="" type=\'video/mp4\'>\n' +
                '                        <source id="vid_original_avi_modal" src="" type="video/avi">\n' +
                '                        <p class="vjs-no-js">\n' +
                '                            <a href="http://videojs.com/html5-video-support/" target="_blank"></a>\n' +
                '                        </p>\n' +
                '                    </video>\n' +
                '                    <div class="card text-center">\n' +
                '                        <div class="card-body">\n' +
                '                            <h5 class="card-subtitle mb-2 text-muted"  id="modalStatus"></h5>\n' +
                '                        </div>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '\n' +
                '                <label for="calibYaml">Calibration File Name: </label>\n' +
                '                <input type="email" class="form-control" id="calibYaml" aria-describedby="calibYamleDescript" placeholder="default">\n' +
                '                <small id="calibYamlDescript" class="form-text text-muted">Please enter the the YAML calibration file output.</small>\n' +
                '\n' +
                '            </div>\n' +
                '        </div>\n' +
                '        <div class="modal-footer" id="calibrationButtons">\n' +
                '            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>\n' +
                '            <button type="button" class="btn btn-warning" onclick="calibrate(\'step0\')">Go Back</button>\n' +
                '            <button type="button" class="btn btn-primary" onclick="calibrate(\'step3\')">Continue - Generate Calibration File</button>\n' +
                '        </div>\n' +
                '    </div>\n' +
                '</div>')
            videoPlayer_modal = videojs(document.getElementById('vid_original_header_modal'), {}, function() {});
        }


    });
}

function thresholdHSV_3D(fileName) {
    const PROC = require('child_process').spawn('Executables/Larnx.exe', [ '1' ,'',  document.getElementById("vid_original_header_left").getAttribute('data-video-path'), document.getElementById("vid_original_header_right").getAttribute('data-video-path') ,'', fileName, localStorage.WORKSPACE, '','','','','' ]);
    videoPlayer.play();
    PROC.stdout.on('data', function(data)
    {
        console.log(data);
        //pushDataPoint(data);
    });

    PROC.stderr.on("data", function (data)
    {
        console.log(data);
        //pushDataPoint(data);
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
    const PROC = require('child_process').spawn('Executables/Larnx.exe', [ '7', '' , document.getElementById("vid_original_header_left").getAttribute('data-video-path'), document.getElementById("vid_original_header_right").getAttribute('data-video-path'),'', fileName, localStorage.WORKSPACE ,'','','','','']);
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

function depthMap(){
    dialog.showOpenDialog(function (fileNames) {
        if (fileNames === undefined) return;
        var yamlName = fileNames[0];

        var numDisparitites  = document.getElementById('disparitiesSelect').value;
        var minDisparitites  = document.getElementById('minDisparitySelect').value;
        var blockSize        = document.getElementById('blockSize').value;
        var sampleRate       = document.getElementById('sampleRateSelect').value;

        const PROC = require('child_process').spawn('Executables/Larnx.exe', [ '10' ,'', document.getElementById("vid_original_header_left").getAttribute('data-video-path'), document.getElementById("vid_original_header_right").getAttribute('data-video-path') , yamlName , "depthOut", localStorage.WORKSPACE, numDisparitites, blockSize, minDisparitites, sampleRate ]);

        PROC.stdout.on('data', function(data)
        {
            console.log(data);
            //pushDataPoint(data);
        });

        PROC.stderr.on("data", function (data)
        {
            console.log(data);
            //pushDataPoint(data);
        });

        PROC.on('close', function (data)
        {
            console.log(data);
        });

        PROC.on('exit', function (data)
        {
            console.log(data);
            toastr.success(localStorage.WORKSPACE,'Successful processing! Output is written to:')
        });

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

function trackObject(){

}

function histogramPlot(){

}

function calibrateExe(fileName,timeStamp) {
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



// /* Method Index: 1 - Process Video */
// function execute(fileName) {
//     const PROC = require('child_process').spawn('Executables/Larnx_Back_End.exe', [ '1' , document.getElementById("vid_original_header").getAttribute('data-video-path') , localStorage.WORKSPACE , fileName ]);
//     videoPlayer.play();
//     PROC.stdout.on('data', function(data)
//     {
//         console.log(data);
//         pushDataPoint(data);
//     });
//
//     PROC.stderr.on("data", function (data)
//     {
//         console.log(data);
//         pushDataPoint(data);
//     });
//
//     PROC.on('close', function (data)
//     {
//         console.log(data);
//     });
//
//     PROC.on('exit', function (data)
//     {
//         console.log(data);
//         toastr.success(path.join(localStorage.WORKSPACE,fileName),'Successful processing! Output is written to:')
//     });
// }

// vidConverter.spawn({ input: fileName, output: newName })
//     .on('error', function(err){
//         console.log(err);
//     })
//     .on('start',function(){
//     })
//     .on('progress', function(progress){
//         console.log(
//             'Percent complete: %s, ETA: %s',
//             progress.percentComplete,
//             progress.eta
//         );
//         updateProgress(progress.percentComplete);
//     })
//     .on('complete',function(){
//         toastr.success(path.join(localStorage.WORKSPACE),'AVI successful converted to MP4. Output saved to::');
//         updateProgress(0);
//     });
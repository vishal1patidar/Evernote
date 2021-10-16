window.addEventListener('load', ()=> {
    window.jsPDF = window.jspdf.jsPDF;


    //Initialize canvas
    document.getElementById('overlay-spinner').remove();
    const canvas = new fabric.Canvas(document.querySelector('canvas'), {
        isDrawingMode: true,
        enableRetinaScaling: true
    });
    let cWidth = window.innerWidth;
    let cHeight = 3000;
    var mode = undefined;
    var visible = false;

    if(window.innerWidth < 1000) {
        cHeight = 1500;
    }


    //Canvas Settings
    canvas.setDimensions({ width: cWidth, height: cHeight });
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = '#303030f1';
    canvas.allowTouchScrolling = 'true';
    mode = 'draw';
    canvas.selection = true;
    // canvas.setBackgroundColor({
    //     source: 'grid.jpg'
    // });


    window.addEventListener('resize', resize);
    function resize() {
        canvas.setDimensions({ width: window.innerWidth, height: cHeight });
    }



    //Apply grid
    const applyGrid = () => {
        canvas.setBackgroundColor({
                source: 'grid.jpg'
            }, canvas.renderAll.bind(canvas));  
        }
    
    //Collapse Tools
    const collpaseBtn = document.querySelector('.collapse-btn');
    const header = document.querySelector('.header');
    collpaseBtn.addEventListener('click', () => {
        togglePallete('hide');
        collpaseBtn.classList.toggle('collapsed');
        header.classList.toggle('header-collapsed');
        console.log("clicked");
    });



    //Save canvas as image
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    const saveAsImg = document.getElementById('save-img');
    const saveAsPdf = document.getElementById('save-pdf');

    saveAsImg.addEventListener('click', () => {
        const modalBg = document.getElementById('modal-bg');
        modalBg.classList.remove('modal-active');
        setDownloadStatus();
        applyGrid();
        setTimeout(downloadAsImage, 1000);
    });

    saveAsPdf.addEventListener('click', () => {
        const modalBg = document.getElementById('modal-bg');
        modalBg.classList.remove('modal-active');
        setDownloadStatus();
        applyGrid();
        setTimeout(downloadAsPdf, 1000);
        
    });
    const setDownloadStatus = () => {
        const downloadStatus = document.getElementById('download-status');
        downloadStatus.classList.add('download-status-active');
    }
    const unsetDownloadStatus = () => {
        const downloadStatus = document.getElementById('download-status');
        downloadStatus.classList.remove('download-status-active');
    }
    const downloadAsImage =  () => {
        const filename = document.getElementById('filename').value;
        const link = document.createElement("a");
        const imgData = canvas.toDataURL({ 
            format: 'jpeg',
            multiplier: 4
        });
        const strDataURI = imgData.substr(22, imgData.length);
        const blob = dataURLtoBlob(imgData);
        const objurl = URL.createObjectURL(blob);
        link.download = `${filename}.jpg`;
        link.href = objurl;
        link.click();
        unsetDownloadStatus();
    } 

    const downloadAsPdf = () => {
        const filename = document.getElementById('filename').value;
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'JPEG', 0, 0, width, height, undefined,'FAST');
        pdf.save(`${filename}.pdf`);
        unsetDownloadStatus();
    }

    //Filename Modal js
    const modalBtn = document.getElementById('save');
    const modalBg = document.getElementById('modal-bg');
    const modalClose = document.getElementById('modal-close');
    modalBtn.addEventListener('click', () => {
        modalBg.classList.add('modal-active');
    });
    modalClose.addEventListener('click', () => {
        modalBg.classList.remove('modal-active');
    });


    //Sets color of pen
    function setColor(event) {
        mode = 'draw';
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = event.target.value;
        togglePallete();
    }
    const penColors = document.querySelectorAll('.color');
    penColors.forEach(color => {
        color.addEventListener('click', (e) => {
            setColor(e);
        });
    });

    //Clear Handler
    function clearCanvas() {
        obj = canvas.getObjects();
        var check = confirm('Do you want to clear the board?');
        if(check) {
            var objClear = canvas.getObjects();
            objClear.forEach((obj) => {
                canvas.remove(obj);
            })
        }
    }
    document.getElementById('title').addEventListener('click', () => {
        var check = confirm('Do you want to clear the board?');
        if(!check) {
            return;
        }
    });

    //Prevent unwanted reload
    window.onbeforeunload = function() {
        return "you can not refresh the page";
    }


    //Shows color pallete
    document.getElementById('draw').addEventListener('click', togglePallete);

    //Clears canvas when "Clear" button is clicked
    document.getElementById('clear').addEventListener('click', clearCanvas);


    //Undo Handler
    document.getElementById('undo').addEventListener('click', () => { 
        canvas.undo();
    });


    //Redo Handler
    document.getElementById('redo').addEventListener('click', () => {    
        canvas.redo();
    }); 

    document.addEventListener('keyup', ({ keyCode, ctrlKey } = event) => {
        // Check Ctrl key is pressed.
        if (!ctrlKey) {
            return;
        }

        // Check pressed button is Z - Ctrl+Z.
        if (keyCode === 90) {
            canvas.undo();
        }

        // Check pressed button is Y - Ctrl+Y.
        if (keyCode === 89) {
            canvas.redo();
        }
    });

    document.getElementById('erase').addEventListener('click', () => {    
        mode = 'erase';
        canvas.hoverCursor = 'pointer';
        canvas.isDrawingMode = false;
    }); 

    document.getElementById('select').addEventListener('click', () => {    
        mode = 'select';
        canvas.isDrawingMode = false;
    }); 

    canvas.on('mouse:up', function(e) {
        if(mode === 'erase') {
            canvas.remove(e.target);
        }
    });

    
    canvas.on('mouse:down', () => {
        if(visible) {
            document.getElementById('colorpallete').classList.remove('show');
            visible = false;
        }
    });

    //Color Pallete Toggle
    function togglePallete(status) {
        if(status) {
            if(status === 'hide') {
                document.getElementById('colorpallete').classList.remove('show');
                return;
            }
        }
        mode = 'draw';
        canvas.isDrawingMode = true;
        visible = true;
        document.getElementById('colorpallete').classList.toggle('show');
    };

});



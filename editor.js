const quill = new Quill('#effect', {
    modules: {
        toolbar: [
            ['bold', 'italic']
        ]
    },
    placeholder: 'Card Effect',
    theme: 'snow',  // or 'bubble'
    formats: ['bold', 'italic']
});

let imgstring;
function readFile() {
    let fileSelector =  document.getElementById("image-select");
    if(fileSelector.files.length == 0) {
        return false;
    }
    let file = fileSelector.files[0];
    if (!file.type.match('image.*')) {
        return;
    }
    let reader = new FileReader();
    reader.onload = function(f) {
        imgstring = f.target.result;
        leeroy = loadImage(imgstring, redraw);
    }
    reader.readAsDataURL(file);
    return true;
}
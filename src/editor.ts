import Quill from 'quill';
import * as _ from 'p5/global';
import { updateCardImage, ctx } from './render'

export const quill = new Quill('#effect', {
    modules: {
        toolbar: [
            ['bold', 'italic']
        ]
    },
    placeholder: 'Card Effect',
    theme: 'snow',  // or 'bubble'
    formats: ['bold', 'italic']
});

export function readFile() {
    let fileSelector = document.getElementById("image-select") as HTMLInputElement;
    if (fileSelector.files.length == 0) {
        return false;
    }
    let file = fileSelector.files[0];
    if (!file.type.match('image.*')) {
        return;
    }
    let reader = new FileReader();
    reader.onload = (f) => {
        let imgstring = f.target.result as string;
        ctx.loadImage(imgstring, updateCardImage);
    }
    reader.readAsDataURL(file);
    return true;
}

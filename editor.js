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
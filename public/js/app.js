(function () {
  var HOST = "https://d13txem1unpe48.cloudfront.net/"

  addEventListener("trix-attachment-add", function (event) {
    if (event.attachment.file) {
      uploadFileAttachment(event.attachment)
    }
  })

  function uploadFileAttachment(attachment) {
    uploadFile(attachment.file, setProgress, setAttributes)

    function setProgress(progress) {
      attachment.setUploadProgress(progress)
    }

    function setAttributes(attributes) {
      attachment.setAttributes(attributes)
    }
  }

  function uploadFile(file, progressCallback, successCallback) {
    var key = createStorageKey(file)
    var formData = createFormData(key, file)
    var request = new XMLHttpRequest()

    request.open("POST", HOST, true)

    request.upload.addEventListener("progress", function (event) {
      var progress = event.loaded / event.total * 100
      progressCallback(progress)
    })

    request.addEventListener("load", function (event) {
      if (request.status == 204) {
        var attributes = {
          url: HOST + key,
          href: HOST + key + "?content-disposition=attachment"
        }
        successCallback(attributes)
      }
    })

    request.send(formData)
  }

  function createStorageKey(file) {
    var date = new Date()
    var day = date.toISOString().slice(0, 10)
    var name = date.getTime() + "-" + file.name
    return ["tmp", day, name].join("/")
  }

  function createFormData(key, file) {
    var data = new FormData()
    data.append("key", key)
    data.append("Content-Type", file.type)
    data.append("file", file)
    return data
  }
})();

// alert user if they have unsaved changes and attempt to close page or navigate away
// appies to /new and /edit pages

let quillEditor

document.addEventListener("DOMContentLoaded", function () {
  const blogForm = document.getElementById('blog-form')
  const bodyInput = document.getElementById('quill-input')
  const viewPostPage = document.getElementById('post-view')

  const toolbarOptions = [
    [{ header: ['1', '2', '3', false] }],
    ['bold', 'italic', 'underline', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['image', 'code-block'],
    ['clean']
  ];

  // Use standard quill editor if user on NEW or EDIT pages
  if (blogForm) {
    // NEW & EDIT: create quill editor
    quillEditor = new Quill('#editor', {
      modules: { toolbar: toolbarOptions },
      theme: 'snow'
    })

    // add image handler to quill editor so I can save images as binary files to a separate folder (or later CDN) and not save them as base 64 to the post.body which can overload db
    quillEditor.getModule('toolbar').addHandler('image', () => {
      selectLocalImage();
    });

    // EDIT: Set contents of quill editor
    if (bodyInput.value) {
      const jsonContents = JSON.parse(bodyInput.value)
      quillEditor.setContents(jsonContents)
    }
    // NEW & EDIT: When user submit's form, save quill content to db
    blogForm.onsubmit = function() {
      bodyInput.value = JSON.stringify(quillEditor.getContents())
      console.log(JSON.stringify(quillEditor.getContents()))
      return true
    }
  }

  // VIEW: load read-only editor, write body "delta" from db into hidden input, then set content of editor
  if (viewPostPage) {
    const quillReadOnlyEditor = new Quill('#editor', {
      modules: { toolbar: false },
      theme: 'snow',
      readOnly: true
    })
    const jsonContents = JSON.parse(bodyInput.value)
    quillReadOnlyEditor.setContents(jsonContents)
  }

  // when user clicks image button in toolbar, create file submit input with js and click it, then when user selects file, call function to send file to server
  function selectLocalImage() {
    const chooseImage = document.createElement('input');
    chooseImage.setAttribute('type', 'file');
    chooseImage.setAttribute('name', 'blog-image');
    chooseImage.setAttribute('accept', 'image/*');
    chooseImage.click();

    chooseImage.onchange = () => {
      const file = chooseImage.files[0]
      // file type is only image.
      if (/^image\//.test(file.type)) {
        sendImage(file)
      } else {
        console.warn('You can only upload images.')
      }
    };
  }

  // send image user selects to the server, get the url back
  function sendImage(file) {
    const formData = new FormData();
    formData.append('blog-image', file);
    const request = new XMLHttpRequest();
    request.open('POST', '/uploads', true);
    request.onload = function() {
      if (request.status === 200) {
        const url = request.responseText
        insertImage(url);
      }
    };
    request.send(formData);
  }
  
  // insert image into editor
  function insertImage(url) {
    const range = quillEditor.getSelection();
    quillEditor.insertEmbed(range.index, 'image', url);
  }

  let hasUnsavedChanges = false;
  window.onbeforeunload = function () {
    if (hasUnsavedChanges) {
      // return string only shown in older browser versions, newer versions show browser default text
      return "You have unsaved changes.";
    }
  };

  if (blogForm) {
    // fires when any text is typed, including in trix editor
    this.body.addEventListener("keyup", () => {
      hasUnsavedChanges = true;
    })
    // fires when inputs other than trix editor are changed, to ensure post status changes are recorded
    blogForm.addEventListener("change", () => {
      hasUnsavedChanges = true;
    })

    const blogCancel = document.querySelector(".blog-cancel")
    blogCancel.addEventListener("click", (e) => {
      switch (e.target.name) {
        case 'cancel-new-post':
          window.onbeforeunload = ''
          window.location.href = '/'
          break;
        case 'cancel-edited-post':
          window.onbeforeunload = ''
          // express passes post slug to pug, which assigns it to the 'pug' html attribute this js references
          window.location.href = `/${e.target.dataset.slug}`
          break;
      }
    })

    blogForm.addEventListener("submit", (e) => {
      // show message if user hasn't entered title
      const blogTitle = document.querySelector('#blog-post-title')
      if (!blogTitle.checkValidity()) {
        e.preventDefault()
        blogTitle.classList.add('is-invalid')
        // add listener that fires when title entered and removes styling
        blogTitle.addEventListener("keyup", () => {
          blogTitle.classList.remove('is-invalid')
        }, { once: true })
      }

      // show invalid messaging if user hasn't entered post content, otherwise save the post
      const blogPostBody = document.querySelector('trix-editor.trix-content')
      const blogInvalidMessage = document.querySelector('#blog-invalid-message')

      if (!blogPostBody.innerHTML) {
        e.preventDefault()
        blogPostBody.classList.add('blog-invalid-input')
        blogInvalidMessage.classList.remove('d-none')
        // add listener that fires when post content is entered and removes the styling
        blogPostBody.addEventListener("DOMSubtreeModified", () => {
          blogPostBody.classList.remove('blog-invalid-input')
          blogInvalidMessage.classList.add('d-none')
        }, { once: true })
      } else {
        window.onbeforeunload = ''
      }
    })
  }
})
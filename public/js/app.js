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
    var xhr = new XMLHttpRequest()

    xhr.open("POST", HOST, true)

    xhr.upload.addEventListener("progress", function (event) {
      var progress = event.loaded / event.total * 100
      progressCallback(progress)
    })

    xhr.addEventListener("load", function (event) {
      if (xhr.status == 204) {
        var attributes = {
          url: HOST + key,
          href: HOST + key + "?content-disposition=attachment"
        }
        successCallback(attributes)
      }
    })

    xhr.send(formData)
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
document.addEventListener("DOMContentLoaded", function () {
  
  // if on settings page, allow user to edit profile values
  if (document.querySelector("div[data-page='settings']")) {
    const settingsContainer = document.querySelector("div[data-page='settings']")
    settingsContainer.addEventListener("click", (e) => {
      const button = e.target
      const buttonField = e.target.dataset.field
      const buttonAction = e.target.dataset.action
      const input = document.querySelector(`input#${buttonField}`)

      // if edit, show appropriate buttons
      if (buttonAction === 'edit') {
        // hide edit button
        button.classList.add('d-none');
        // show save and cancel buttons
        const saveButton = document.querySelector(`button[data-use='save-${buttonField}']`)
        const cancelButton = document.querySelector(`button[data-use='cancel-${buttonField}']`)
        saveButton.classList.remove('d-none')
        cancelButton.classList.remove('d-none')
        // enable input
        input.removeAttribute('disabled')
        input.classList.remove('disabled-input')
        input.classList.add('form-control')
      }
      if (buttonAction === 'cancel') {
        // reload page
        window.location.replace('/settings')
      }
      if (buttonAction === 'save') {
        // save new value
        sendValue(`${buttonField}`, input.value)
      }
    })
    
    function sendValue(field, value) {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/settings`, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = () => { 
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          window.location.replace('/settings');
        }
      }
      const encodedValue = encodeURIComponent(value)
      xhr.send(`${field}=${encodedValue}`);
    }
  }
    
  let hasUnsavedChanges = false;
  window.onbeforeunload = function () {
    if (hasUnsavedChanges) {
      // return string only shown in older browser versions, newer versions show browser default text
      return "You have unsaved changes.";
    }
  };

  const blogForm = document.querySelector("#blog-form")
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
        case 'new':
          window.onbeforeunload = ''
          window.location.href = '/'
          break;
        case 'edit':
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
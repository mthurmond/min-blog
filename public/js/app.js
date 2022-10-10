(function () {
  var HOST = "https://dbn4sin1xpjx7.cloudfront.net/"

  addEventListener("trix-attachment-add", function (event) {
    if (event.attachment.file) {
      uploadFileAttachment(event.attachment)
    }
  })

  function uploadFileAttachment(attachment) {
    uploadFile(attachment.file, setAttributes)

    function setAttributes(attributes) {
      attachment.setAttributes(attributes)
    }
  }

  async function uploadFile(file, successCallback) {
    const key = createStorageKey(file)
    // get signed URL from app server
    const signedUrl = await fetch(`/getsignedurltrix?key=${key}`).then(res => res.json()).then(data => data.url)
    // upload photo to s3 using fetch
    await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: file
    })
    // set image attributes before adding it to the post body
    const attributes = {
      url: HOST + key,
      href: HOST + key + "?content-disposition=attachment"
    }
    successCallback(attributes)
  }

  function createStorageKey(file) {
    const date = new Date()
    const day = date.toISOString().slice(0, 10)
    const name = date.getTime() + "-" + file.name
    return ["blog-pictures", day, name].join("/")
  }

})();

document.addEventListener("DOMContentLoaded", function () {
  // SETTINGS page: allow user to edit profile values
  if (document.querySelector("div[data-page='settings']")) {
    const settingsContainer = document.querySelector("div[data-page='settings']")
    // add click handler to buttons
    settingsContainer.addEventListener("click", (e) => {
      const button = e.target
      const buttonField = e.target.dataset.field
      const buttonAction = e.target.dataset.action
      const input = document.querySelector(`input#${buttonField}`)
      // if edit clicked, show save/cancel buttons and enable input
      if (buttonAction === 'edit' && buttonField !== 'photo') {
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
      // if cancel clicked, reload page
      if (buttonAction === 'cancel' && buttonField !== 'photo') {
        window.location.replace('/settings')
      }
      // if saved clicked, save the value
      if (buttonAction === 'save' && buttonField !== 'photo') {
        // check if input is valid before submitting
        if (input.reportValidity()) {
          sendValue(`${buttonField}`, input.value)
        } else
          input.reportValidity()
      }
      // if edit photo clicked, let user select photo
      if (buttonField === 'photo') {
        selectPhoto()
      }
    })

    // send value to server and reload page
    function sendValue(field, value) {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/settings`, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            window.location.replace('/settings');
          } else {
            const errorStatus = xhr.status
            const errorMessage = xhr.responseText
            const encodedErrorMessage = encodeURIComponent(errorMessage)
            window.location.replace(`/error/${encodedErrorMessage}/${errorStatus}`);
          }
        }
      }
      const encodedValue = encodeURIComponent(value)
      xhr.send(`${field}=${encodedValue}`);
    }

    // let user select a different photo
    function selectPhoto() {
      // create file submit input and click it
      const choosePhoto = document.createElement('input');
      choosePhoto.setAttribute('type', 'file');
      choosePhoto.setAttribute('name', 'profile-photo');
      choosePhoto.setAttribute('accept', 'image/*');
      choosePhoto.click();
      // when user selects photo, call function to send file to server.
      choosePhoto.onchange = () => {
        const file = choosePhoto.files[0]
        // file type is only image.
        if (/^image\//.test(file.type)) {
          sendPhoto(file)
        } else {
          console.warn('You can only upload images.')
        }
      };
    }
  
    // store profile photo in s3 and save link to it in database
    async function sendPhoto(file) {
      const originalFileName = file.name
      const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.')+1, originalFileName.length)

      // get signed URL from BE
      const signedUrlData = await fetch(`/getsignedurl?extension=${fileExtension}`).then(res => res.json())
      const signedUrl = signedUrlData.url
      const newFileName = signedUrlData.filename
      
      // post photo to s3 using fetch
      await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: file
      })

      // store photo name in app db
      sendValue('photo', newFileName)
    }
  }

  // NEW and EDIT pages --> warn user if they attempt to leave page with unsaved changes
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
          window.location.href = `/${e.target.dataset.username}`
          break;
        case 'edit':
          window.onbeforeunload = ''
          // express passes post slug to pug, which assigns it to the 'pug' html attribute this js references
          window.location.href = `/${e.target.dataset.username}/${e.target.dataset.slug}`
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
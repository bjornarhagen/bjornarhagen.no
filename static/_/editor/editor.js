;(function () {
  findEditorWrapper()
    .then((editorWrapper) => {
      console.log('editorWrapper', editorWrapper)
      setupEditorWrapper(editorWrapper)
    })
    .catch((error) => {
      console.error(error)
    })
})()

function findEditorWrapper() {
  return new Promise((resolve, reject) => {
    const editorWrapper = document.querySelector('#editor')

    if (!editorWrapper) {
      reject('You need to create an element with an id of "editor"')
    }

    resolve(editorWrapper)
  })
}

function getTemplatePath(editorWrapper) {
  return new Promise((resolve, reject) => {
    try {
      const templatePath = editorWrapper.dataset.editorTemplate
      resolve(templatePath)
    } catch (error) {
      reject(error)
    }
  })
}

function setupEditorWrapper(editorWrapper) {
  let jsonOutput = {
    content: [],
  }
  let jsonTemplate = {}

  const editorInput = document.createElement('textarea')
  editorInput.name = 'editor-input'
  editorInput.classList.add('editor-input')

  const editorInputPreview = document.createElement('div')
  editorInputPreview.classList.add('editor-input-preview')
  editorInputPreview.classList.add('text-content')

  const editorInputWrapper = document.createElement('div')
  editorInputWrapper.classList.add('editor-input-wrapper')
  editorInputWrapper.appendChild(editorInput)
  editorInputWrapper.appendChild(editorInputPreview)

  const editorArea = document.createElement('div')
  editorArea.classList.add('editor-area')

  const editorOutput = document.createElement('textarea')
  editorOutput.name = 'editor-output'
  editorOutput.classList.add('editor-output')
  editorOutput.style.display = 'none'

  const editorMessageArea = document.createElement('p')
  editorMessageArea.classList.add('editor-message-area')
  editorMessageArea.style.display = 'none'

  const editorSaveButton = document.createElement('button')
  editorSaveButton.type = 'submit'
  editorSaveButton.appendChild(document.createTextNode('Save'))

  const editorInputButton = document.createElement('button')
  editorInputButton.type = 'button'
  editorInputButton.appendChild(document.createTextNode('Input JSON'))
  editorInputButton.classList.add('secondary')

  const editorForm = document.createElement('form')
  editorForm.appendChild(editorArea)
  editorForm.appendChild(editorInputWrapper)
  editorForm.appendChild(editorMessageArea)
  editorForm.appendChild(editorSaveButton)
  editorForm.appendChild(editorInputButton)
  editorForm.appendChild(editorOutput)
  editorWrapper.appendChild(editorForm)

  let oldInputLength = editorInput.value.length
  if (!!marked) {
    setInterval(() => {
      if (!!editorInput.value && editorInput.value.length !== oldInputLength) {
        editorInputPreview.innerHTML = marked(editorInput.value)
        oldInputLength = editorInput.value.length
      }
    }, 500)
  }

  getTemplatePath(editorWrapper).then((templatePath) => {
    console.log(templatePath)

    fetch(templatePath)
      .then((r) => r.json())
      .then((r) => {
        jsonTemplate = r
        setupEditorInputs(editorInput, editorOutput, editorArea, jsonTemplate)
        formInputEventCallback({ target: editorInput })
      })
      .catch((e) => console.error(e))
  })

  editorForm.addEventListener('input', formInputEventCallback)
  editorForm.addEventListener('submit', function (submitEvent) {
    submitEvent.preventDefault()
    jsonOutput['meta'] = jsonTemplate
    formInputEventCallback({ target: editorInput })
    copyToClipboard(editorOutput.value)
    displayEditorMessage(editorMessageArea, editorSaveButton, 'JSON copied to clipboard!')
    jsonOutput['meta'] = null
    formInputEventCallback({ target: editorInput })
  })

  function formInputEventCallback(formInputEvent) {
    const input = formInputEvent.target

    if (input.name === 'editor-input') {
      jsonOutput['content'][0] = { text: input.value }
    } else if (input.name === 'editor-output') {
      jsonOutput = JSON.parse(input.value)
      console.log(jsonOutput)

      for (const key in jsonOutput) {
        if (Object.hasOwnProperty.call(jsonOutput, key)) {
          let updateValue = jsonOutput[key]
          let inputToUpdate = input.form.querySelector('input[name="' + key + '"]')

          if (inputToUpdate) {
            inputToUpdate.value = updateValue
          }
        }
      }

      editorInput.value = jsonOutput['content'][0].text
      editorArea.style.display = ''
      editorInputWrapper.style.display = ''
      editorSaveButton.style.display = ''
      editorOutput.style.display = 'none'
    } else if (input.name) {
      jsonOutput[input.name] = input.value
    }

    editorOutput.value = JSON.stringify(jsonOutput, null, '  ')
  }

  // Show JSON input
  editorInputButton.addEventListener('click', function () {
    const originalEditorInputButtonText = editorInputButton.innerText
    editorInputButton.innerText = 'Paste JSON in the textarea'
    editorInputButton.disabled = true

    editorArea.style.display = 'none'
    editorInputWrapper.style.display = 'none'
    editorSaveButton.style.display = 'none'
    editorOutput.style.display = ''

    setTimeout(() => {
      editorInputButton.innerText = originalEditorInputButtonText
      editorInput.style.display = ''
      editorArea.style.display = ''
      editorSaveButton.style.display = ''
      editorOutput.style.display = 'none'
      editorInputButton.disabled = false
    }, 10000)
  })
}

function setupEditorInputs(editorInput, editorOutput, editorArea, jsonTemplate) {
  jsonTemplate.fields.forEach((field) => {
    const label = document.createElement('label')
    label.appendChild(document.createTextNode(field.name))

    const input = document.createElement('input')
    input.name = field.name
    input.type = field.type
    input.required = field.required
    input.value = field.default

    const wrapper = document.createElement('div')
    wrapper.classList.add('input')
    wrapper.appendChild(label)
    wrapper.appendChild(input)
    editorArea.appendChild(wrapper)
  })
}

function copyToClipboard(text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData('Text', text)
  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    var textarea = document.createElement('textarea')
    textarea.textContent = text
    textarea.style.position = 'fixed' // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea)
    textarea.select()
    try {
      return document.execCommand('copy') // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex)
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

function displayEditorMessage(editorMessageArea, editorSaveButton, message) {
  editorMessageArea.innerText = message
  editorMessageArea.style.display = ''

  editorSaveButton.style.display = 'none'

  setTimeout(() => {
    editorMessageArea.style.display = 'none'
    editorMessageArea.innerText = ''

    editorSaveButton.style.display = ''
  }, 3000)
}

let notes = []
let editingNoteId = null

function loadNotes() {
  const savedNotes = localStorage.getItem('quickNotes')
  return savedNotes ? JSON.parse(savedNotes) : []
}

function saveNote(event) {
  event.preventDefault()

  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();

  if(editingNoteId) {
    // Update existing Note

    const noteIndex = notes.findIndex(note => note.id === editingNoteId)
    notes[noteIndex] = {
      ...notes[noteIndex],
      title: title,
      content: content
    }

  } else {
    // Add New Note
    notes.unshift({
      id: generateId(),
      title: title,
      content: content
    })
  }

  closeNoteDialog()
  saveNotes()
  renderNotes()
}

function generateId() {
  return Date.now().toString()
}

function saveNotes() {
  localStorage.setItem('quickNotes', JSON.stringify(notes))
}

function deleteNote(noteId) {
  notes = notes.filter(note => note.id != noteId)
  saveNotes()
  renderNotes()
}

function renderNotes() {
  const notesContainer = document.getElementById('notesContainer');

  if(notes.length === 0) {
    // show some fall back elements
    notesContainer.innerHTML = `
      <div class="text-center py-16 px-8 text-[var(--secondary-text-color)] col-span-full">
        <h2 class="text-2xl mb-2 font-semibold">No notes yet</h2>
        <p class="text-base mb-8">Create your first note to get started!</p>
        <button class="bg-[var(--brand-color)] text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 ease-in-out hover:bg-[#7a7fff]" onclick="openNoteDialog()">+ Add Your First Note</button>
      </div>
    `
    return
  }

  notesContainer.innerHTML = notes.map(note => `
    <div class="group relative bg-[var(--surface-color)] rounded-xl p-6 border border-[var(--surface-color)] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-[0_2px_15px_rgba(0,0,0,0.05)]">
      
      <div class="absolute top-4 right-4 flex gap-2 opacity-0 invisible transition-all duration-200 ease-in-out group-hover:opacity-100 group-hover:visible">
        <button class="w-8 h-8 rounded-md cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out backdrop-blur-[10px] bg-[var(--base-transparent-90)] text-[var(--text-color)] border border-[var(--surface-color)] hover:bg-[var(--base-transparent-100)] hover:scale-105" onclick="openNoteDialog('${note.id}')" title="Edit Note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="w-8 h-8 rounded-md cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out backdrop-blur-[10px] bg-[var(--base-transparent-90)] text-[var(--text-color)] border border-[var(--surface-color)] hover:bg-[#ff5252] hover:scale-105 hover:text-white" onclick="deleteNote('${note.id}')" title="Delete Note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
          </svg>
        </button>
      </div>

      <h3 class="text-xl font-semibold mb-3 text-[var(--text-color)] break-words">${note.title}</h3>
      <p class="text-[var(--secondary-text-color)] leading-relaxed mb-4 break-words whitespace-pre-wrap">${note.content}</p>

    </div>
    `).join('')
  }
  
function openNoteDialog(noteId = null) {
  const dialog = document.getElementById('noteDialog');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  if(noteId) {
    // Edit Mode
    const noteToEdit = notes.find(note => note.id === noteId)
    editingNoteId = noteId
    document.getElementById('dialogTitle').textContent = 'Edit Note'
    titleInput.value = noteToEdit.title
    contentInput.value = noteToEdit.content
  }
  else {
    // Add Mode
    editingNoteId = null
    document.getElementById('dialogTitle').textContent = 'Add New Note'
    titleInput.value = ''
    contentInput.value = ''
  }

  dialog.showModal()
  titleInput.focus()

}

function closeNoteDialog() {
  document.getElementById('noteDialog').close()
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙'
}

function applyStoredTheme() {
  if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme')
    document.getElementById('themeToggleBtn').textContent = '☀️'
  }
}

document.addEventListener('DOMContentLoaded', function() {
  applyStoredTheme()
  notes = loadNotes()
  renderNotes()

  document.getElementById('noteForm').addEventListener('submit', saveNote)
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme)

  document.getElementById('noteDialog').addEventListener('click', function(event) {
    if(event.target === this) {
      closeNoteDialog()
    }
  })
})

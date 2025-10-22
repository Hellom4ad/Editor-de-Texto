// app.js (Versión con Vue)

// 1. CREAMOS LA APLICACIÓN VUE
const app = Vue.createApp({
  
  // 2. DATA (EL "ESTADO")
  // Reemplaza tus variables globales (let notes = [], let editingNoteId = null)
  data() {
    return {
      notes: [],
      editingNoteId: null,
      
      // Estado para el formulario (reemplaza a document.getElementById('...').value)
      formTitle: '',
      formContent: ''
    }
  },

  // 3. METHODS (LAS "ACCIONES")
  // Reemplaza tus funciones globales (saveNote(), deleteNote(), etc.)
  methods: {
    // --- Lógica de Notas ---
    
    saveNote() {
      // No necesitamos event.preventDefault(), lo haremos en el HTML
      
      if (this.editingNoteId) {
        // --- Actualizar Nota Existente ---
        // Usamos 'this.' para acceder a los datos ('data') de Vue
        const note = this.notes.find(n => n.id === this.editingNoteId);
        note.title = this.formTitle;
        note.content = this.formContent;

      } else {
        // --- Añadir Nueva Nota ---
        this.notes.unshift({
          id: Date.now().toString(),
          title: this.formTitle,
          content: this.formContent
        });
      }
      
      // ¡NO HAY RENDERNOTES()! Vue lo hace automáticamente.
      this.saveNotesToLocalStorage();
      this.closeNoteDialog();
    },

    deleteNote(noteId) {
      // Simplemente modificamos el array. Vue actualizará el HTML.
      this.notes = this.notes.filter(note => note.id != noteId);
      this.saveNotesToLocalStorage();
    },

    // --- Lógica del Diálogo (Modal) ---

    openNoteDialog(noteId = null) {
      const dialog = document.getElementById('noteDialog');
      
      if (noteId) {
        // --- Modo Edición ---
        const noteToEdit = this.notes.find(note => note.id === noteId);
        this.editingNoteId = noteId;
        
        // Sincronizamos el estado del formulario con la nota
        this.formTitle = noteToEdit.title;
        this.formContent = noteToEdit.content;
        
        document.getElementById('dialogTitle').textContent = 'Edit Note';
      } 
      else {
        // --- Modo Añadir ---
        this.editingNoteId = null;
        
        // Limpiamos el estado del formulario
        this.formTitle = '';
        this.formContent = '';
        
        document.getElementById('dialogTitle').textContent = 'Add New Note';
      }

      dialog.showModal();
      document.getElementById('noteTitle').focus();
    },

    closeNoteDialog() {
      // Limpiamos el estado por si acaso
      this.editingNoteId = null;
      this.formTitle = '';
      this.formContent = '';
      
      document.getElementById('noteDialog').close();
    },

    // --- Lógica de Almacenamiento (LocalStorage) ---

    loadNotesFromLocalStorage() {
      const savedNotes = localStorage.getItem('quickNotes');
      // Devolvemos los datos para usarlos en 'mounted'
      return savedNotes ? JSON.parse(savedNotes) : [];
    },

    saveNotesToLocalStorage() {
      localStorage.setItem('quickNotes', JSON.stringify(this.notes));
    },

    // --- Lógica del Tema (Oscuro/Claro) ---

   },

  // 4. LIFECYCLE HOOKS (ENGANCHES DE CICLO DE VIDA)
  // Reemplaza a 'DOMContentLoaded'
  mounted() {
    // Esto se ejecuta cuando la app Vue está lista.
    this.notes = this.loadNotesFromLocalStorage();
    // ¡No se necesita 'renderNotes()'!
    
    // Asignamos los eventos del diálogo que no son de Vue
    const dialog = document.getElementById('noteDialog');
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        this.closeNoteDialog();
      }
    });
  }

});

// 5. MONTAMOS LA APLICACIÓN
// Le decimos a Vue que controle todo dentro del elemento con id="app"
app.mount('#app');

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const appElement = document.getElementById('app'); // El div raíz

  // Función para aplicar el tema (al cargar)
  function applyInitialTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    // Usamos toggle(clase, fuerza) para añadir o quitar la clase
    appElement.classList.toggle('dark', isDark);
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  }

  // Función para cambiar el tema (al hacer clic)
  function toggleThemeVanilla() {
    // Alterna la clase y nos devuelve true si la clase 'dark' fue añadida
    const isDark = appElement.classList.toggle('dark');
    
    // Guarda la preferencia
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Actualiza el emoji
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  }

  // Asignar el evento de clic
  themeToggleBtn.addEventListener('click', toggleThemeVanilla);

  // Aplicar el tema guardado en localStorage
  applyInitialTheme();
});
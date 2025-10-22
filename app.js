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

app.component('theme-toggle', {
  // El 'data' de un componente SIEMPRE debe ser una función
  data() {
    return {
      isDark: false
    }
  },
  // La plantilla HTML que usará este componente
  // Usamos backticks (`) para un string multi-línea
  template: `
    <button 
      @click="toggleTheme"
      class="bg-[var(--surface-color)] text-[var(--text-color)] border border-[var(--surface-color)] py-3 px-6 rounded-lg cursor-pointer font-medium transition-all duration-200 ease-in-out ml-4 hover:bg-[var(--brand-color)] hover:text-white">
      {{ isDark ? '☀️' : '🌙' }}
    </button>
  `,
  methods: {
    toggleTheme() {
      // 1. Cambiamos nuestro estado interno
      this.isDark = !this.isDark;
      
      // 2. Guardamos en localStorage
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      
      // 3. Aplicamos la clase al <div> raíz de la app
      // Usamos document.querySelector('#app') o document.documentElement
      document.getElementById('app').classList.toggle('dark', this.isDark);
    }
  },
  // Esto se ejecuta cuando el componente se "monta"
  mounted() {
    // Leemos la preferencia guardada al cargar
    this.isDark = localStorage.getItem('theme') === 'dark';
    
    // Aplicamos el tema inicial al <div> raíz
    document.getElementById('app').classList.toggle('dark', this.isDark);
  }
});

// 5. MONTAMOS LA APLICACIÓN
// Le decimos a Vue que controle todo dentro del elemento con id="app"
app.mount('#app');


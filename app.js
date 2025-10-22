// app.js (Versión con Vue)

// 1. CREAMOS LA APLICACIÓN VUE
const app = Vue.createApp({
  
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

// 2. REGISTRAR TODOS LOS COMPONENTES
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

// 2. REGISTRAMOS NUESTRO COMPONENTE DE TARJETA DE NOTA
app.component('note-card', {
  
  // A. Las 'props': Cómo "entra" la información
  // Declaramos que este componente espera recibir un 'paquete' de datos
  // al que llamaremos "note".
  props: {
    note: {
      type: Object, // Le decimos a Vue que 'note' será un objeto
      required: true // Es obligatorio que nos lo pasen
    }
  },

  // B. Los 'emits': Cómo "salen" los mensajes
  // Declaramos los "eventos" o "mensajes" que este componente puede enviar
  // a su padre. No llamarán a funciones, solo enviarán una señal.
  emits: ['edit-note', 'delete-note'],

  // C. El 'template': El HTML del componente
  // Este es el HTML que vamos a "Cortar" de tu index.html.
  // Fíjate en los cambios en los @click:
  template: `
    <div class
="group relative bg-[var(--surface-color)] rounded-xl p-6 border border-[var(--surface-color)] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-[0_2px_15px_rgba(0,0,0,0.05)]">
      
      <div class="absolute top-4 right-4 flex gap-2 opacity-0 invisible transition-all duration-200 ease-in-out group-hover:opacity-100 group-hover:visible">
        
        <button 
          @click="$emit('edit-note', note.id)" 
          title="Edit Note"
          class="w-8 h-8 rounded-md cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out backdrop-blur-[10px] bg-[var(--base-transparent-90)] text-[var(--text-color)] border border-[var(--surface-color)] hover:bg-[var(--base-transparent-100)] hover:scale-105">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        
        <button 
          @click="$emit('delete-note', note.id)" 
          title="Delete Note"
          class="w-8 h-8 rounded-md cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out backdrop-blur-[10px] bg-[var(--base-transparent-90)] text-[var(--text-color)] border border-[var(--surface-color)] hover:bg-[#ff5252] hover:scale-105 hover:text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
          </svg>
        </button>
      </div>

      <h3 class="text-xl font-semibold mb-3 text-[var(--text-color)] break-words">{{ note.title }}</h3>
      <p class="text-[var(--secondary-text-color)] leading-relaxed mb-4 break-words whitespace-pre-wrap">{{ note.content }}</p>

    </div>
  `
});

// 5. MONTAMOS LA APLICACIÓN
// Le decimos a Vue que controle todo dentro del elemento con id="app"
app.mount('#app');


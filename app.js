// app.js (Versión con Vue)

// 1. CREAMOS LA APLICACIÓN VUE
const app = Vue.createApp({
  
  // Reemplaza tus variables globales (let notes = [])
  data() {
    return {
      notes: [],
    }
  },

  // Reemplaza tus funciones globales .)
  methods: {
    // --- Lógica de Notas ---
    
    saveNote(noteData) { 
  // 'noteData' es el objeto que recibimos del emit: 
  // { id: '...', title: '...', content: '...' }

  if (noteData.id) {
    // --- Actualizar Nota Existente ---
    const note = this.notes.find(n => n.id === noteData.id);
    note.title = noteData.title;
    note.content = noteData.content;
  } else {
    // --- Añadir Nueva Nota ---
    this.notes.unshift({
      id: Date.now().toString(), // Generamos el ID aquí
      title: noteData.title,
      content: noteData.content
    });
  }

  this.saveNotesToLocalStorage();
  // ¡Ya no llamamos a closeNoteDialog()! El componente se cierra solo.
},

    deleteNote(noteId) {
      // Simplemente modificamos el array. Vue actualizará el HTML.
      this.notes = this.notes.filter(note => note.id != noteId);
      this.saveNotesToLocalStorage();
    },

    // --- Lógica del Diálogo (Modal) ---

  openNoteDialog(noteId = null) {
  if (noteId) {
    // Buscamos la nota para pasarla al componente
    const noteToEdit = this.notes.find(note => note.id === noteId);
    // Usamos $refs para "llamar" al método 'open' del HIJO
    this.$refs.noteDialogComponent.open(noteToEdit);
  } else {
    // Llamamos a 'open' sin argumentos para una nota nueva
    this.$refs.noteDialogComponent.open(null);
  }
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

// 2.3. REGISTRAMOS NUESTRO COMPONENTE DE DIÁLOGO
app.component('note-dialog', {
  
  // A. Emits: ¿Qué mensajes puede enviar al padre?
  // Solo necesita enviar un mensaje: "aquí están los datos para guardar".
  emits: ['save-note'],

  // B. Data: El estado interno del componente
  // Este es el estado que MOVEMOS desde el 'data' de la app raíz.
  data() {
    return {
      formTitle: '',
      formContent: '',
      editingNoteId: null,
      dialogTitle: 'Add New Note',
      dialogElement: null // Para guardar la referencia al <dialog>
    }
  },

  // C. Template: El HTML que MOVEMOS desde index.html
  // ¡Fíjate en los cambios!
  // - Ya no hay 'id="noteDialog"'
  // - Los @click ahora llaman a métodos locales (ej: 'close')
  // - El @submit llama a 'handleSave'
  // - Los v-model usan el 'data' de este componente
  template: `
    <dialog class="m-auto inset-0 border-none rounded-2xl p-0 bg-[var(--surface-color)] text-[var(--text-color)] max-w-[500px] w-[90vw] backdrop:bg-black/10 backdrop:backdrop-blur-sm">
      <div class="p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold">{{ dialogTitle }}</h2>
          <button 
            @click="close"
            class="bg-transparent border-none text-2xl cursor-pointer text-[var(--secondary-text-color)] p-1 rounded transition-colors duration-200 ease-in-out hover:bg-[var(--base-color)]">x</button>
        </div>

        <form @submit.prevent="handleSave">
          <div class="mb-6">
            <label for="noteTitle" class="block mb-2 font-medium text-[var(--text-color)]">Título</label>
            <input 
              type="text" 
              id="noteTitle" 
              v-model="formTitle" 
              class="w-full p-3 border-2 border-[var(--surface-color)] rounded-lg text-base transition-colors duration-200 ease-in-out bg-[var(--base-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--brand-color)]" 
              placeholder="Ingresa el título acá..." required>
          </div>
          
          <div class="mb-6">
            <label for="noteContent" class="block mb-2 font-medium text-[var(--text-color)]">Contenido</label>
            <textarea 
              id="noteContent" 
              v-model="formContent" 
              class="w-full p-3 border-2 border-[var(--surface-color)] rounded-lg text-base transition-colors duration-200 ease-in-out bg-[var(--base-color)] text-[var(--text-color)] focus:outline-none focus:border-[var(--brand-color)] resize-y min-h-[120px]" 
              placeholder="Escribí tu nota acá..." required></textarea>
          </div>

          <div class="flex gap-4 justify-end">
            <button 
              type="button" 
              @click="close"
              class="py-3 px-6 border-none rounded-lg cursor-pointer font-medium transition-all duration-200 ease-in-out bg-[var(--base-color)] text-[var(--text-color)]">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="py-3 px-6 border-none rounded-lg cursor-pointer font-medium transition-all duration-200 ease-in-out bg-[var(--brand-color)] text-white hover:bg-[#7a7fff]">
              Guardar Nota
            </button>
          </div>
        </form>
      </div>
    </dialog>
  `,

  // D. Methods: La lógica que MOVEMOS y adaptamos
  methods: {
    // Esta es la función que el PADRE llamará para abrir el diálogo
    open(noteToEdit = null) {
      if (noteToEdit) {
        // --- Modo Edición ---
        this.editingNoteId = noteToEdit.id;
        this.formTitle = noteToEdit.title;
        this.formContent = noteToEdit.content;
        this.dialogTitle = 'Edit Note';
      } else {
        // --- Modo Añadir ---
        this.editingNoteId = null;
        this.formTitle = '';
        this.formContent = '';
        this.dialogTitle = 'Add New Note';
      }
      
      // Abrimos el diálogo
      this.dialogElement.showModal();
      // Usamos $nextTick para asegurar que el input esté visible antes de hacerle focus
      this.$nextTick(() => {
        document.getElementById('noteTitle').focus();
      });
    },

    // El componente se cierra a sí mismo
    close() {
      this.dialogElement.close();
      // Limpiamos el estado al cerrar
      this.editingNoteId = null;
      this.formTitle = '';
      this.formContent = '';
    },

    // Cuando el formulario se envía
    handleSave() {
      // 1. Preparamos el paquete de datos para el padre
      const noteData = {
        id: this.editingNoteId, // Será 'null' si es una nota nueva
        title: this.formTitle,
        content: this.formContent
      };

      // 2. Emitimos el evento con los datos
      this.$emit('save-note', noteData);

      // 3. Cerramos el diálogo
      this.close();
    }
  },

  // E. Mounted: Para configurar la lógica del DOM
  mounted() {
    // Guardamos el elemento <dialog> en nuestro 'data' para poder usar .showModal() y .close()
    // this.$el se refiere al elemento raíz del 'template' (el <dialog>)
    this.dialogElement = this.$el;
    // Añadimos el listener para cerrar al hacer clic fuera (backdrop)
    this.dialogElement.addEventListener('click', (event) => {
      if (event.target === this.dialogElement) {
        this.close(); // Llama al método 'close' de ESTE componente
      }
      });
  }
});

// 5. MONTAMOS LA APLICACIÓN
// Le decimos a Vue que controle todo dentro del elemento con id="app"
app.mount('#app');


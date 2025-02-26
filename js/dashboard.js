// Use the supabase instance from auth.js since it's already initialized there
let currentUser = null;

// Helper function to format dates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Create a new note
async function createNote(title, content) {
    try {
        const { data, error } = await supabase
            .from('notes')
            .insert([
                {
                    user_id: currentUser.id,
                    title,
                    content,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;

        showToast('Note created successfully');
        closeModal('noteModal');
        fetchNotes();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Fetch all notes for the current user
async function fetchNotes() {
    try {
        const { data: notes, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayNotes(notes);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Update an existing note
async function updateNote(noteId, title, content) {
    try {
        const { data, error } = await supabase
            .from('notes')
            .update({
                title,
                content,
                updated_at: new Date().toISOString()
            })
            .eq('id', noteId);

        if (error) throw error;

        showToast('Note updated successfully');
        closeModal('noteModal');
        fetchNotes();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Delete a note
async function deleteNote(noteId) {
    try {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

        if (error) throw error;

        showToast('Note deleted successfully');
        fetchNotes();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Display notes in the UI
function displayNotes(notes) {
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-500">No notes yet. Create your first note!</p>
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow';
        noteElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-900">${note.title}</h3>
                <div class="flex space-x-2">
                    <button class="edit-note-btn text-indigo-600 hover:text-indigo-800" data-note='${JSON.stringify(note)}'>
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                    <button class="delete-note-btn text-red-600 hover:text-red-800" data-note-id="${note.id}">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="text-gray-600 note-content mb-4">${note.content}</p>
            <div class="text-sm text-gray-500">
                ${formatDate(note.created_at)}
            </div>
        `;
        notesContainer.appendChild(noteElement);

        // Add event listeners for edit and delete buttons
        const editBtn = noteElement.querySelector('.edit-note-btn');
        const deleteBtn = noteElement.querySelector('.delete-note-btn');

        editBtn.addEventListener('click', () => {
            const noteData = JSON.parse(editBtn.dataset.note);
            openEditNoteModal(noteData);
        });

        deleteBtn.addEventListener('click', () => {
            confirmDeleteNote(deleteBtn.dataset.noteId);
        });
    });
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.getElementById('noteForm').reset();
}

function openNewNoteModal() {
    document.getElementById('noteModalTitle').textContent = 'Create New Note';
    document.getElementById('noteForm').setAttribute('data-mode', 'create');
    openModal('noteModal');
}

function openEditNoteModal(note) {
    document.getElementById('noteModalTitle').textContent = 'Edit Note';
    document.getElementById('noteForm').setAttribute('data-mode', 'edit');
    document.getElementById('noteForm').setAttribute('data-note-id', note.id);
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    openModal('noteModal');
}

function confirmDeleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        deleteNote(noteId);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = '/pages/signin.html';
        return;
    }
    currentUser = user;

    // Initialize note form handler
    const noteForm = document.getElementById('noteForm');
    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;
        const mode = noteForm.getAttribute('data-mode');

        if (mode === 'create') {
            await createNote(title, content);
        } else {
            const noteId = noteForm.getAttribute('data-note-id');
            await updateNote(noteId, title, content);
        }
    });

    // Add event listener for new note button
    const newNoteBtn = document.getElementById('new-note-btn');
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', openNewNoteModal);
    }

    // Close modal when clicking outside
    document.getElementById('noteModal').addEventListener('click', (e) => {
        if (e.target.id === 'noteModal') {
            closeModal('noteModal');
        }
    });

    // Initialize notes
    fetchNotes();
});

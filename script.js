document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const notesList = document.getElementById('notes-list');
    const newFolderBtn = document.getElementById('new-folder-btn');
    const newNoteBtn = document.getElementById('new-note-btn');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const encryptBtn = document.getElementById('encrypt-btn');
    const pinBtn = document.getElementById('pin-btn');
    const aiInsightsBtn = document.getElementById('ai-insights-btn');
    const shareBtn = document.getElementById('share-btn');
    const exportBtn = document.getElementById('export-btn');
    const aiInsightsModal = document.getElementById('ai-insights-modal');
    const shareModal = document.getElementById('share-modal');
    const encryptModal = document.getElementById('encrypt-modal');
    const closeButtons = document.querySelectorAll('.close');
    const notesCountElement = document.getElementById('notes-count');
    const shareLinkInput = document.getElementById('share-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const emailLinkBtn = document.getElementById('email-link-btn');

    let currentNote = null;
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    function init() {
        renderNotes();
        setupEventListeners();
        setupToolbar();
        setupAutoGlossary();
        setupGrammarCheck();
        updateNotesCount();
    }

    function renderNotes() {
        notesList.innerHTML = '';
        notes.forEach(item => {
            if (item.type === 'folder') {
                renderFolder(item);
            } else {
                renderNote(item);
            }
        });
    }

    function renderFolder(folder) {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.innerHTML = `
            <span class="folder-name" contenteditable="true">${folder.name}</span>
            <div class="folder-actions">
                <button class="add-note-btn"><i class="fas fa-plus"></i></button>
                <button class="delete-folder-btn"><i class="fas fa-trash"></i></button>
            </div>
            <div class="folder-contents"></div>
        `;
        notesList.appendChild(folderItem);

        folder.notes.forEach(note => renderNote(note, folderItem.querySelector('.folder-contents')));

        folderItem.querySelector('.add-note-btn').addEventListener('click', () => addNoteToFolder(folder));
        folderItem.querySelector('.delete-folder-btn').addEventListener('click', () => deleteFolder(folder));
        folderItem.querySelector('.folder-name').addEventListener('blur', (e) => renameFolder(folder, e.target.textContent));
        folderItem.addEventListener('click', () => folderItem.classList.toggle('open'));
    }

    function renderNote(note, parent = notesList) {
        const noteItem = document.createElement('div');
        noteItem.className = `note-item ${note.pinned ? 'pinned-note' : ''}`;
        noteItem.innerHTML = `
            <span class="note-text">${note.title}</span>
            <div class="note-actions">
                <button class="edit-note-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-note-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        parent.appendChild(noteItem);

        noteItem.querySelector('.edit-note-btn').addEventListener('click', () => editNote(note));
        noteItem.querySelector('.delete-note-btn').addEventListener('click', () => deleteNote(note));
    }

    function setupEventListeners() {
        newFolderBtn.addEventListener('click', addFolder);
        newNoteBtn.addEventListener('click', () => addNote());
        saveNoteBtn.addEventListener('click', saveNote);
        darkModeToggle.addEventListener('click', toggleDarkMode);
        encryptBtn.addEventListener('click', toggleEncryption);
        pinBtn.addEventListener('click', togglePin);
        aiInsightsBtn.addEventListener('click', getAIInsights);
        shareBtn.addEventListener('click', shareNote);
        exportBtn.addEventListener('click', exportToPDF);
        copyLinkBtn.addEventListener('click', copyLink);
        emailLinkBtn.addEventListener('click', shareViaEmail);

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.parentElement.parentElement.style.display = 'none';
            });
        });
    }

    function setupToolbar() {
        const toolbarButtons = document.querySelectorAll('.toolbar-btn');
        toolbarButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.execCommand(button.dataset.command, false, null);
            });
        });

        const fontSizeSelect = document.querySelector('.font-size-select');
        fontSizeSelect.addEventListener('change', () => {
            const size = fontSizeSelect.value;
            document.execCommand('fontSize', false, size);
        });
    }

    function addFolder() {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            const newFolder = {
                id: Date.now(),
                type: 'folder',
                name: folderName,
                notes: []
            };
            notes.push(newFolder);
            saveNotes();
            renderNotes();
            updateNotesCount();
        }
    }

    function addNoteToFolder(folder) {
        const noteTitle = prompt('Enter note title:');
        if (noteTitle) {
            const newNote = {
                id: Date.now(),
                type: 'note',
                title: noteTitle,
                content: '',
                pinned: false,
                encrypted: false
            };
            folder.notes.push(newNote);
            saveNotes();
            renderNotes();
            editNote(newNote);
            updateNotesCount();
        }
    }

    function addNote() {
        const noteTitle = prompt('Enter note title:');
        if (noteTitle) {
            const newNote = {
                id: Date.now(),
                type: 'note',
                title: noteTitle,
                content: '',
                pinned: false,
                encrypted: false
            };
            notes.push(newNote);
            saveNotes();
            renderNotes();
            editNote(newNote);
            updateNotesCount();
        }
    }

    function editNote(note) {
        currentNote = note;
        editor.innerHTML = note.content;
        pinBtn.classList.toggle('active', note.pinned);
        encryptBtn.classList.toggle('active', note.encrypted);
    }

    function deleteNote(note) {
        const confirmDelete = confirm('Are you sure you want to delete this note?');
        if (confirmDelete) {
            notes = notes.filter(item => item.id !== note.id);
            notes.forEach(item => {
                if (item.type === 'folder') {
                    item.notes = item.notes.filter(n => n.id !== note.id);
                }
            });
            saveNotes();
            renderNotes();
            updateNotesCount();
            if (currentNote && currentNote.id === note.id) {
                editor.innerHTML = '';
                currentNote = null;
            }
        }
    }

    function deleteFolder(folder) {
        const confirmDelete = confirm('Are you sure you want to delete this folder and all its notes?');
        if (confirmDelete) {
            notes = notes.filter(item => item.id !== folder.id);
            saveNotes();
            renderNotes();
            updateNotesCount();
        }
    }

    function renameFolder(folder, newName) {
        folder.name = newName;
        saveNotes();
    }

    function saveNote() {
        if (currentNote) {
            currentNote.content = editor.innerHTML;
            saveNotes();
            renderNotes();
            alert('Note saved successfully!');
        } else {
            alert('No note selected to save.');
        }
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    function toggleEncryption() {
        if (currentNote) {
            if (currentNote.encrypted) {
                const password = prompt('Enter password to decrypt:');
                if (password) {
                    try {
                        const bytes = CryptoJS.AES.decrypt(currentNote.content, password);
                        currentNote.content = bytes.toString(CryptoJS.enc.Utf8);
                        currentNote.encrypted = false;
                        saveNotes();
                        editNote(currentNote);
                    } catch (e) {
                        alert('Incorrect password.');
                    }
                }
            } else {
                const password = prompt('Enter password to encrypt:');
                if (password) {
                    currentNote.content = CryptoJS.AES.encrypt(currentNote.content, password).toString();
                    currentNote.encrypted = true;
                    saveNotes();
                    editNote(currentNote);
                }
            }
        } else {
            alert('No note selected to encrypt/decrypt.');
        }
    }

    function togglePin() {
        if (currentNote) {
            currentNote.pinned = !currentNote.pinned;
            pinBtn.classList.toggle('active', currentNote.pinned);
            saveNotes();
            renderNotes();
        } else {
            alert('No note selected to pin/unpin.');
        }
    }

    function getAIInsights() {
        if (currentNote) {
            const insights = generateAIInsights(currentNote.content);
            const insightsHTML = insights.map(insight => `<li>${insight}</li>`).join('');
            document.getElementById('ai-insights-content').innerHTML = `<ul>${insightsHTML}</ul>`;
            aiInsightsModal.style.display = 'block';
        } else {
            alert('No note selected for AI insights.');
        }
    }

    function generateAIInsights(content) {
        const insights = [];
        const wordCount = content.split(/\s+/).length;
        const sentenceCount = content.split(/[.!?]/).length - 1;

        if (wordCount < 50) {
            insights.push('Consider adding more content to your note.');
        }

        if (sentenceCount < 5) {
            insights.push('Consider adding more sentences to your note.');
        }

        if (!content.includes('important')) {
            insights.push('Consider highlighting important points.');
        }

        if (content.match(/very/g)?.length > 5) {
            insights.push('Consider reducing the use of the word "very".');
        }

        return insights;
    }

    function shareNote() {
        if (currentNote) {
            const shareLink = `${window.location.origin}/note/${currentNote.id}`;
            shareLinkInput.value = shareLink;
            shareModal.style.display = 'block';
        } else {
            alert('No note selected to share.');
        }
    }

    function copyLink() {
        shareLinkInput.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    }

    function shareViaEmail() {
        const shareLink = shareLinkInput.value;
        const subject = encodeURIComponent('Check out this note');
        const body = encodeURIComponent(`Here is the link to the note: ${shareLink}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    function exportToPDF() {
        if (currentNote) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(currentNote.content, 10, 10);
            doc.save(`${currentNote.title}.pdf`);
        } else {
            alert('No note selected to export.');
        }
    }

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function setupAutoGlossary() {
        const glossary = {
            'JavaScript': 'A programming language that enables interactive web pages.',
            'HTML': 'HyperText Markup Language, used for structuring web content.',
            'CSS': 'Cascading Style Sheets, used for styling web pages.'
        };

        editor.addEventListener('input', () => {
            const words = editor.innerText.split(/\s+/);
            words.forEach(word => {
                if (glossary[word]) {
                    const tooltip = document.createElement('span');
                    tooltip.className = 'tooltip';
                    tooltip.innerText = glossary[word];
                    editor.innerHTML = editor.innerHTML.replace(word, `<span class="glossary-term">${word}<span class="tooltip-text">${glossary[word]}</span></span>`);
                }
            });
        });
    }

    function setupGrammarCheck() {
        const commonErrors = {
            'their': 'there',
            'your': "you're",
            'its': "it's"
        };

        editor.addEventListener('input', () => {
            const words = editor.innerText.split(/\s+/);
            words.forEach(word => {
                if (commonErrors[word]) {
                    editor.innerHTML = editor.innerHTML.replace(word, `<span class="grammar-error">${word}<span class="error-text">Did you mean "${commonErrors[word]}"?</span></span>`);
                }
            });
        });
    }

    function updateNotesCount() {
        const notesCount = notes.reduce((count, item) => {
            if (item.type === 'note') {
                return count + 1;
            } else if (item.type === 'folder') {
                return count + item.notes.length;
            }
            return count;
        }, 0);
        notesCountElement.innerText = notesCount;
    }

    init();
});
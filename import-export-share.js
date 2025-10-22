/**
 * Import/Export and Sharing Module for Sticky Notes
 * Provides comprehensive import/export functionality with multiple formats
 * and note sharing capabilities
 */

// ============================================
// IMPORT FUNCTIONALITY
// ============================================

function importNotes() {
  showImportDialog();
}

function showImportDialog() {
  const existing = document.querySelector('.import-dialog');
  if (existing) existing.remove();
  
  const dialog = document.createElement('div');
  dialog.className = 'import-dialog';
  const dialogBg = isDarkMode ? '#2d2d2d' : 'white';
  const dialogBorder = isDarkMode ? '#404040' : '#e9ecef';
  dialog.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: ${dialogBg}; border: 1px solid ${dialogBorder}; border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); z-index: 3000; padding: 20px; min-width: 400px;
  `;
  
  const titleEl = document.createElement('h3');
  titleEl.style.cssText = `margin: 0 0 16px 0; font-size: 16px; color: ${isDarkMode ? '#e0e0e0' : '#333'};`;
  titleEl.textContent = 'Import Notes';
  
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json,.md,.txt,.csv';
  fileInput.multiple = true;
  fileInput.style.cssText = `
    width: 100%; padding: 8px 12px; border: 1px solid ${isDarkMode ? '#555555' : '#e9ecef'};
    border-radius: 4px; background: ${isDarkMode ? '#404040' : '#ffffff'};
    color: ${isDarkMode ? '#e0e0e0' : '#333'}; margin-bottom: 16px; font-size: 14px;
  `;
  
  const formatInfo = document.createElement('div');
  formatInfo.style.cssText = `font-size: 12px; color: ${isDarkMode ? '#b0b0b0' : '#666'}; margin-bottom: 16px; line-height: 1.4;`;
  formatInfo.innerHTML = `<strong>Supported formats:</strong><br>• JSON: Full note data with metadata<br>• Markdown: Convert to notes<br>• Text: Plain text files<br>• CSV: Spreadsheet format`;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `display: flex; gap: 8px; justify-content: flex-end;`;
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `padding: 8px 16px; border: 1px solid ${isDarkMode ? '#555555' : '#e9ecef'}; border-radius: 4px; background: transparent; color: ${isDarkMode ? '#e0e0e0' : '#333'}; cursor: pointer;`;
  cancelBtn.onclick = () => dialog.remove();
  
  const importBtn = document.createElement('button');
  importBtn.textContent = 'Import';
  importBtn.style.cssText = `padding: 8px 16px; border: none; border-radius: 4px; background: ${isDarkMode ? '#0066cc' : '#007bff'}; color: white; cursor: pointer;`;
  importBtn.onclick = () => {
    if (fileInput.files.length > 0) {
      processImportFiles(fileInput.files);
      dialog.remove();
    }
  };
  
  buttonContainer.appendChild(cancelBtn);
  buttonContainer.appendChild(importBtn);
  dialog.appendChild(titleEl);
  dialog.appendChild(fileInput);
  dialog.appendChild(formatInfo);
  dialog.appendChild(buttonContainer);
  document.body.appendChild(dialog);
}

function processImportFiles(files) {
  let processedCount = 0;
  let errorCount = 0;
  
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const extension = file.name.split('.').pop().toLowerCase();
        
        switch (extension) {
          case 'json': importJSONNotes(content); break;
          case 'md': importMarkdownNote(content, file.name); break;
          case 'txt': importTextNote(content, file.name); break;
          case 'csv': importCSVNotes(content); break;
          default: errorCount++; return;
        }
        processedCount++;
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        errorCount++;
      } finally {
        if (processedCount + errorCount === files.length) {
          showImportResults(processedCount, errorCount);
        }
      }
    };
    reader.readAsText(file);
  });
}

function importJSONNotes(content) {
  const data = JSON.parse(content);
  if (data.notes && Array.isArray(data.notes)) {
    data.notes.forEach(noteData => createNoteFromData(noteData));
  } else if (data.title || data.content) {
    createNoteFromData(data);
  }
}

function importMarkdownNote(content, filename) {
  let title = filename.replace('.md', '');
  let noteContent = content;
  
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1];
    noteContent = content.replace(/^#\s+.+$/m, '').trim();
  }
  
  createNoteFromData({ title, content: noteContent, category: 'Personal' });
}

function importTextNote(content, filename) {
  const title = filename.replace('.txt', '');
  createNoteFromData({ title, content, category: 'Personal' });
}

function importCSVNotes(content) {
  const lines = content.split('\n');
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      createNoteFromData({
        title: values[0] || 'Imported Note',
        content: values[2] || '',
        category: values[1] || 'Personal',
        createdAt: values[3],
        updatedAt: values[4]
      });
    }
  }
}

function createNoteFromData(noteData) {
  const noteId = 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  notes[noteId] = {
    id: noteId,
    title: noteData.title || null, // Will default to 'Untitled Note' in display
    content: noteData.content || '',
    category: noteData.category || 'Personal',
    createdAt: noteData.createdAt || new Date().toISOString(),
    updatedAt: noteData.updatedAt || new Date().toISOString()
  };
  undoStacks[noteId] = [];
  redoStacks[noteId] = [];
}

function showImportResults(processedCount, errorCount) {
  const message = `Import complete: ${processedCount} files processed${errorCount > 0 ? `, ${errorCount} errors` : ''}`;
  updateTabs();
  saveNotes();
  showNotification(message, errorCount > 0 ? 'warning' : 'success');
}

// ============================================
// ENHANCED EXPORT FUNCTIONALITY
// ============================================

function exportNoteWithFormat() {
  if (!currentNoteId || !notes[currentNoteId]) return;
  showExportFormatDialog();
}

function showExportFormatDialog() {
  const existing = document.querySelector('.export-dialog');
  if (existing) existing.remove();
  
  const dialog = document.createElement('div');
  dialog.className = 'export-dialog';
  dialog.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: ${isDarkMode ? '#2d2d2d' : 'white'}; border: 1px solid ${isDarkMode ? '#404040' : '#e9ecef'};
    border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); z-index: 3000; padding: 20px; min-width: 300px;
  `;
  
  const titleEl = document.createElement('h3');
  titleEl.style.cssText = `margin: 0 0 16px 0; font-size: 16px; color: ${isDarkMode ? '#e0e0e0' : '#333'};`;
  titleEl.textContent = 'Export Note';
  
  const formatSelect = document.createElement('select');
  formatSelect.style.cssText = `
    width: 100%; padding: 8px 12px; border: 1px solid ${isDarkMode ? '#555555' : '#e9ecef'};
    border-radius: 4px; background: ${isDarkMode ? '#404040' : '#ffffff'};
    color: ${isDarkMode ? '#e0e0e0' : '#333'}; margin-bottom: 16px; font-size: 14px;
  `;
  
  const formats = [
    { value: 'json', text: 'JSON (Full data with metadata)' },
    { value: 'markdown', text: 'Markdown (.md)' },
    { value: 'txt', text: 'Plain Text (.txt)' },
    { value: 'html', text: 'HTML (Formatted)' }
  ];
  
  formats.forEach(format => {
    const option = document.createElement('option');
    option.value = format.value;
    option.textContent = format.text;
    formatSelect.appendChild(option);
  });
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `display: flex; gap: 8px; justify-content: flex-end;`;
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `padding: 8px 16px; border: 1px solid ${isDarkMode ? '#555555' : '#e9ecef'}; border-radius: 4px; background: transparent; color: ${isDarkMode ? '#e0e0e0' : '#333'}; cursor: pointer;`;
  cancelBtn.onclick = () => dialog.remove();
  
  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export';
  exportBtn.style.cssText = `padding: 8px 16px; border: none; border-radius: 4px; background: ${isDarkMode ? '#0066cc' : '#007bff'}; color: white; cursor: pointer;`;
  exportBtn.onclick = () => {
    performExport(formatSelect.value);
    dialog.remove();
  };
  
  buttonContainer.appendChild(cancelBtn);
  buttonContainer.appendChild(exportBtn);
  dialog.appendChild(titleEl);
  dialog.appendChild(formatSelect);
  dialog.appendChild(buttonContainer);
  document.body.appendChild(dialog);
}

function performExport(format) {
  const note = notes[currentNoteId];
  const firstLine = note.content.split('\n')[0].trim();
  const noteTitle = firstLine || 'Untitled Note';
  
  let content, mimeType, extension;
  
  switch (format) {
    case 'json':
      content = JSON.stringify({
        title: noteTitle,
        content: note.content,
        category: note.category,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }, null, 2);
      mimeType = 'application/json';
      extension = 'json';
      break;
      
    case 'markdown':
      content = `# ${noteTitle}\n\n**Category:** ${note.category || 'Personal'}\n\n${note.content}`;
      mimeType = 'text/markdown';
      extension = 'md';
      break;
      
    case 'txt':
      content = note.content;
      mimeType = 'text/plain';
      extension = 'txt';
      break;
      
    case 'html':
      content = `<!DOCTYPE html><html><head><title>${noteTitle}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;}</style></head><body><h1>${noteTitle}</h1><p><strong>Category:</strong> ${note.category}</p><pre>${note.content}</pre></body></html>`;
      mimeType = 'text/html';
      extension = 'html';
      break;
  }
  
  downloadFile(content, `${noteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`, mimeType);
  showNotification(`Note exported as ${format.toUpperCase()}`, 'success');
}


function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// NOTE SHARING FUNCTIONALITY
// ============================================

function shareNote() {
  if (!currentNoteId || !notes[currentNoteId]) return;
  showShareDialog();
}

function showShareDialog() {
  const note = notes[currentNoteId];
  const title = note.content.split('\n')[0].trim() || 'Untitled Note';
  
  const existing = document.querySelector('.share-dialog');
  if (existing) existing.remove();
  
  const dialog = document.createElement('div');
  dialog.className = 'share-dialog';
  dialog.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: ${isDarkMode ? '#2d2d2d' : 'white'}; border: 1px solid ${isDarkMode ? '#404040' : '#e9ecef'};
    border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); z-index: 3000; padding: 20px; min-width: 400px;
  `;
  
  const titleEl = document.createElement('h3');
  titleEl.style.cssText = `margin: 0 0 16px 0; font-size: 16px; color: ${isDarkMode ? '#e0e0e0' : '#333'};`;
  titleEl.textContent = 'Share Note';
  
  const noteInfo = document.createElement('div');
  noteInfo.style.cssText = `
    font-size: 12px; color: ${isDarkMode ? '#b0b0b0' : '#666'}; margin-bottom: 16px; padding: 8px;
    background: ${isDarkMode ? '#404040' : '#f8f9fa'}; border-radius: 4px;
  `;
  noteInfo.innerHTML = `<strong>Note:</strong> ${title}<br><strong>Category:</strong> ${note.category || 'Personal'}`;
  
  const shareOptions = document.createElement('div');
  shareOptions.style.cssText = `margin-bottom: 16px;`;
  
  const shareMethods = [
    { id: 'copy', label: 'Copy to Clipboard', icon: '📋' },
    { id: 'link', label: 'Generate Shareable Link', icon: '🔗' },
    { id: 'email', label: 'Email Note', icon: '📧' },
    { id: 'export', label: 'Export & Share File', icon: '📁' }
  ];
  
  shareMethods.forEach(method => {
    const option = document.createElement('div');
    option.style.cssText = `
      display: flex; align-items: center; padding: 12px; margin-bottom: 8px;
      border: 1px solid ${isDarkMode ? '#404040' : '#e9ecef'}; border-radius: 4px; cursor: pointer;
      transition: all 0.2s;
    `;
    
    option.innerHTML = `
      <span style="margin-right: 12px; font-size: 20px;">${method.icon}</span>
      <span style="color: ${isDarkMode ? '#e0e0e0' : '#333'}; font-size: 14px;">${method.label}</span>
    `;
    
    option.onclick = () => {
      handleShareMethod(method.id, note);
      dialog.remove();
    };
    
    option.onmouseenter = () => option.style.background = isDarkMode ? '#404040' : '#f8f9fa';
    option.onmouseleave = () => option.style.background = 'transparent';
    
    shareOptions.appendChild(option);
  });
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `padding: 8px 16px; border: 1px solid ${isDarkMode ? '#555555' : '#e9ecef'}; border-radius: 4px; background: transparent; color: ${isDarkMode ? '#e0e0e0' : '#333'}; cursor: pointer; width: 100%;`;
  cancelBtn.onclick = () => dialog.remove();
  
  dialog.appendChild(titleEl);
  dialog.appendChild(noteInfo);
  dialog.appendChild(shareOptions);
  dialog.appendChild(cancelBtn);
  document.body.appendChild(dialog);
}

function handleShareMethod(method, note) {
  switch (method) {
    case 'copy': copyNoteToClipboard(note); break;
    case 'link': generateShareableLink(note); break;
    case 'email': openEmailClient(note); break;
    case 'export': exportAndShare(note); break;
  }
}

function copyNoteToClipboard(note) {
  const title = note.content.split('\n')[0].trim() || 'Untitled Note';
  const shareText = `# ${title}\n\n${note.content}\n\n---\n*Shared from Sticky Note Extension*`;
  
  navigator.clipboard.writeText(shareText).then(() => {
    showNotification('Note copied to clipboard!', 'success');
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification('Note copied to clipboard!', 'success');
  });
}

function generateShareableLink(note) {
  const shareData = {
    title: note.content.split('\n')[0].trim() || 'Untitled Note',
    content: note.content,
    category: note.category,
    timestamp: Date.now()
  };
  
  const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(shareData, null, 2))}`;
  
  navigator.clipboard.writeText(dataUrl).then(() => {
    showNotification('Shareable data link copied!', 'success');
  }).catch(() => {
    showNotification('Could not generate link', 'warning');
  });
}

function openEmailClient(note) {
  const title = note.content.split('\n')[0].trim() || 'Untitled Note';
  const subject = encodeURIComponent(`Shared Note: ${title}`);
  const body = encodeURIComponent(`# ${title}\n\n${note.content}\n\n---\nShared from Sticky Note Extension`);
  window.open(`mailto:?subject=${subject}&body=${body}`);
  showNotification('Email client opened', 'success');
}

function exportAndShare(note) {
  const title = note.content.split('\n')[0].trim() || 'Untitled Note';
  const shareData = {
    title,
    content: note.content,
    category: note.category,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    sharedAt: new Date().toISOString()
  };
  
  downloadFile(JSON.stringify(shareData, null, 2), `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_shared.json`, 'application/json');
  showNotification('Note exported for sharing!', 'success');
}

// ============================================
// NOTIFICATION HELPER
// ============================================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8';
  const textColor = type === 'warning' ? '#000' : '#fff';
  
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: ${textColor};
    padding: 12px 20px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 4000; font-size: 14px; max-width: 300px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}


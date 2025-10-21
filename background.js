/**
 * Background Service Worker
 * Simple, reliable implementation
 */

console.log('Sticky Note Background Script loaded');

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  if (command === 'toggle-sticky-note') {
    console.log('Keyboard shortcut triggered');
    toggleStickyNote();
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked');
  toggleStickyNote();
});

/**
 * Toggle sticky note visibility
 */
async function toggleStickyNote() {
  try {
    console.log('Toggling sticky note...');
    
    // Get current visibility state
    const result = await chrome.storage.sync.get(['noteVisible']);
    const currentVisibility = result.noteVisible ?? true;
    const newVisibility = !currentVisibility;
    
    console.log(`Current: ${currentVisibility}, New: ${newVisibility}`);
    
    // Update visibility state
    await chrome.storage.sync.set({ noteVisible: newVisibility });
    console.log('Visibility state updated');
    
    // Send message to all tabs
    const tabs = await chrome.tabs.query({});
    console.log(`Sending message to ${tabs.length} tabs`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_VISIBILITY',
          visible: newVisibility
        });
        successCount++;
        console.log(`✅ Message sent to tab ${tab.id}`);
      } catch (error) {
        errorCount++;
        console.log(`❌ Could not send to tab ${tab.id}: ${error.message}`);
      }
    }
    
    console.log(`Message sending complete: ${successCount} successful, ${errorCount} failed`);
    
  } catch (error) {
    console.error('Error toggling sticky note:', error);
  }
}

// Handle real-time updates from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REALTIME_UPDATE') {
    console.log('Real-time update received:', message.updateType);
    
    // Forward real-time update to all tabs except sender
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id !== sender.tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'REALTIME_UPDATE',
            updateType: message.updateType,
            data: message.data,
            timestamp: message.timestamp
          }).catch((error) => {
            console.log(`Could not send real-time update to tab ${tab.id}:`, error.message);
          });
        }
      });
    });
  }
});

// Handle storage changes for cross-tab sync
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', { changes, namespace });
  
  if (namespace === 'sync') {
    // Forward storage changes to all tabs
    chrome.tabs.query({}, (tabs) => {
      console.log(`Forwarding storage changes to ${tabs.length} tabs`);
      
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'STORAGE_CHANGED',
          changes: changes,
          timestamp: Date.now()
        }).catch((error) => {
          console.log(`Could not forward to tab ${tab.id}:`, error.message);
        });
      });
    });
  }
});

// Set default values on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details);
  
  chrome.storage.sync.set({
    noteVisible: false,
    noteContent: '',
    notePosition: { x: 100, y: 100 },
    notes: {},
    currentNoteId: null,
    isFullScreen: false,
    isDarkMode: false,
    categories: ['Trading', 'Development', 'Meeting', 'Research', 'Personal']
  }).then(() => {
    console.log('Default values set');
  }).catch((error) => {
    console.error('Error setting defaults:', error);
  });
});

console.log('Background script ready');
# Sticky Note Chrome Extension

A simple, reliable sticky note extension for Chrome that works across all tabs.

## Features

- ✅ **Simple sticky note** with textarea
- ✅ **Auto-save** as you type
- ✅ **Draggable** by the header
- ✅ **Cross-tab sync** for content
- ✅ **Keyboard shortcut** (Ctrl+Shift+N / Cmd+Shift+N)
- ✅ **Icon click** to toggle
- ✅ **Position saving** across sessions

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The sticky note icon should appear in your toolbar

## Usage

- **Open sticky note**: Press `Ctrl+Shift+N` (or `Cmd+Shift+N` on Mac) or click the extension icon
- **Type your note**: Content auto-saves as you type
- **Move the note**: Drag it by the header
- **Close the note**: Click the X button
- **Cross-tab sync**: Your note content syncs across all open tabs

## File Structure

```
sticky-note/
├── content.js          # Main content script
├── background.js       # Background service worker
├── manifest.json       # Extension manifest
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Development

This extension uses a simple, clean architecture:

- **content.js**: Handles the sticky note UI and functionality
- **background.js**: Manages keyboard shortcuts and cross-tab communication
- **manifest.json**: Defines permissions and extension metadata

No external dependencies or complex build processes required.

## Permissions

- `storage`: To save note content and position
- `activeTab`: To inject content script into web pages
- `<all_urls>`: To work on all websites

## Browser Compatibility

- Chrome (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

## License

MIT License
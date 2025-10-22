/**
 * Advanced Sticky Note Extension
 * Multiple notes with rich text formatting and trading templates
 */

console.log('Advanced Sticky Note Extension loaded');

// Global variables
let stickyNoteApp = null;
let isVisible = true;
let isFullScreen = false;
let isDarkMode = false;
let currentNoteId = null;
let notes = {};
let undoStacks = {};
let redoStacks = {};
let isUndoRedo = false;
let searchResults = [];
let categories = ['Trading', 'Development', 'Meeting', 'Research', 'Personal'];
let searchView = null;
let searchMatches = [];
let selectedMatchIndex = 0;

// WPM calculation variables
let typingStartTime = null;
let lastTypingTime = null;
let totalTypingTime = 0;
let totalWordsTyped = 0;
let currentWPM = 0;

// Advanced metrics variables
let sessionStartTime = null;
let lastSaveTime = null;

// Global drag and drop variables
let isTabDragging = false;
let dragOverTab = null;
let dragOverPosition = null;
let draggedTab = null;
let dragTooltip = null;
let dragImageEl = null;

// Note templates for trading and development
const NOTE_TEMPLATES = {
  'trading-setup': {
    name: 'Trading Setup',
    content: `# Trading Setup - {symbol}

## Market Analysis
- **Trend**: 
- **Support**: 
- **Resistance**: 
- **Volume**: 

## Entry Strategy
- **Entry Price**: 
- **Stop Loss**: 
- **Take Profit**: 
- **Position Size**: 

## Risk Management
- **Risk per Trade**: 
- **Max Drawdown**: 
- **Risk/Reward**: 

## Notes
- 
- 
- 

## Results
- **Entry Time**: 
- **Exit Time**: 
- **P&L**: 
- **Notes**: `
  },
  'code-review': {
    name: 'Code Review',
    content: `# Code Review - {feature}

## Overview
- **File**: 
- **Function**: 
- **Purpose**: 

## Issues Found
- [ ] **Critical**: 
- [ ] **High**: 
- [ ] **Medium**: 
- [ ] **Low**: 

## Suggestions
- **Performance**: 
- **Security**: 
- **Maintainability**: 
- **Best Practices**: 

## Action Items
- [ ] 
- [ ] 
- [ ] 

## Reviewer Notes
- 
- 
- `
  },
  'algorithm-notes': {
    name: 'Algorithm Notes',
    content: `# Algorithm - {name}

## Strategy Overview
- **Type**: 
- **Timeframe**: 
- **Assets**: 
- **Risk Level**: 

## Parameters
- **Entry Conditions**: 
- **Exit Conditions**: 
- **Position Sizing**: 
- **Risk Management**: 

## Backtesting Results
- **Period**: 
- **Total Return**: 
- **Sharpe Ratio**: 
- **Max Drawdown**: 
- **Win Rate**: 

## Live Performance
- **Start Date**: 
- **Current P&L**: 
- **Trades**: 
- **Issues**: 

## Notes
- 
- 
- `
  },
  'meeting-notes': {
    name: 'Meeting Notes',
    content: `# Meeting - {topic}

## Attendees
- 
- 
- 

## Agenda
1. 
2. 
3. 

## Discussion Points
- 
- 
- 

## Decisions Made
- 
- 
- 

## Action Items
- [ ] **Assigned to**: 
- [ ] **Assigned to**: 
- [ ] **Assigned to**: 

## Next Steps
- 
- 
- `
  },
  'platform-discovery': {
    name: 'Platform Discovery',
    content: `# Platform Discovery - {platform_name}

## Overview
- **Platform**: 
- **Company**: 
- **Purpose**: 
- **Integration Type**: 
- **Documentation URL**: 

## API Analysis
### Authentication
- **Method**: 
- **Credentials**: 
- **Token Type**: 
- **Expiration**: 

### Endpoints
- **Base URL**: 
- **Key Endpoints**:
  - \`GET /api/v1/...\` - 
  - \`POST /api/v1/...\` - 
  - \`PUT /api/v1/...\` - 
  - \`DELETE /api/v1/...\` - 

### Rate Limits
- **Requests per minute**: 
- **Requests per hour**: 
- **Burst limits**: 

## Webhook Events
### Event Types
- **Event 1**: 
  - **Trigger**: 
  - **Payload**: 
  - **Use Case**: 
- **Event 2**: 
  - **Trigger**: 
  - **Payload**: 
  - **Use Case**: 
- **Event 3**: 
  - **Trigger**: 
  - **Payload**: 
  - **Use Case**: 

### Webhook Configuration
- **Endpoint URL**: 
- **Authentication**: 
- **Retry Policy**: 
- **Timeout**: 

## Product Use Cases
### Primary Use Cases
1. **Use Case 1**:
   - **Description**: 
   - **Business Value**: 
   - **Technical Requirements**: 
2. **Use Case 2**:
   - **Description**: 
   - **Business Value**: 
   - **Technical Requirements**: 
3. **Use Case 3**:
   - **Description**: 
   - **Business Value**: 
   - **Technical Requirements**: 

### Integration Points
- **Data Flow**: 
- **Dependencies**: 
- **External Services**: 

## Technical Requirements
### Data Models
- **User Model**: 
- **Product Model**: 
- **Order Model**: 
- **Event Model**: 

### Security Considerations
- **Data Encryption**: 
- **Access Control**: 
- **Audit Logging**: 
- **Compliance**: 

### Performance Requirements
- **Response Time**: 
- **Throughput**: 
- **Availability**: 
- **Scalability**: 

## Implementation Plan
### Phase 1 - Research
- [ ] Review documentation
- [ ] Test API endpoints
- [ ] Understand webhook flow
- [ ] Identify integration points

### Phase 2 - Development
- [ ] Set up authentication
- [ ] Implement API client
- [ ] Configure webhooks
- [ ] Create data models

### Phase 3 - Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Webhook testing
- [ ] End-to-end testing

### Phase 4 - Deployment
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation

## Questions & Notes
### Open Questions
- 
- 
- 

### Key Insights
- 
- 
- 

### Risks & Concerns
- 
- 
- 

## Resources
- **Documentation**: 
- **Support Contact**: 
- **Community Forum**: 
- **GitHub/Source**: 

## Next Steps
- [ ] 
- [ ] 
- [ ] 
`
  }
};

// Advanced specialized templates
Object.assign(NOTE_TEMPLATES, {
  'bug-report': {
    name: 'Bug Report',
    content: `# Bug Report - {title}

## Summary
- **Impact**: 
- **Severity**: 
- **Frequency**: 

## Environment
- **App/Service**: 
- **Version/Commit**: 
- **OS/Browser**: 

## Steps to Reproduce
1. 
2. 
3. 

## Expected Result
- 

## Actual Result
- 

## Logs / Screenshots
- 

## Workaround
- 

## Owner
- **Assignee**: 
- **Due**: `
  },
  'design-doc': {
    name: 'Design Doc',
    content: `# Design Doc - {feature}

## Context
- 

## Goals
- 

## Non-Goals
- 

## Requirements
- Functional: 
- Non-Functional: 

## Architecture
- High-level: 
- Components: 
- Data Flow: 

## API
- Endpoints: 
- Schemas: 

## Risks
- 

## Alternatives Considered
- 

## Rollout Plan
- 

## Appendix
- `
  },
  'incident-postmortem': {
    name: 'Incident Postmortem',
    content: `# Incident Postmortem - {incident_id}

## Summary
- **Start**: 
- **End**: 
- **Duration**: 
- **Severity**: 
- **Customer Impact**: 

## Timeline
- T0: Detection - 
- T1: Triage - 
- T2: Mitigation - 
- T3: Resolution - 

## Root Cause
- 

## Contributing Factors
- 

## What Went Well
- 

## What Went Poorly
- 

## Action Items
- [ ] Owner:  Due:  Impact: 
- [ ] Owner:  Due:  Impact: 
`
  },
  'prd': {
    name: 'Product Requirements (PRD)',
    content: `# PRD - {feature}

## Overview
- Problem: 
- Users: 
- Success Metrics: 

## User Stories
- As a , I want , so that .
- As a , I want , so that .

## Requirements
- Must: 
- Should: 
- Could: 

## UX
- Flows: 
- States: 

## Analytics
- Events: 
- KPIs: 

## Launch Criteria
- 
`
  },
  'daily-standup': {
    name: 'Daily Standup',
    content: `# Daily Standup - {date}

## Yesterday
- 

## Today
- 

## Blockers
- 
`
  },
  'user-story': {
    name: 'User Story',
    content: `# User Story - {title}

## Story
As a , I want , so that .

## Acceptance Criteria
- [ ] 
- [ ] 
- [ ] 

## Notes
- 
`
  },
  'test-case': {
    name: 'Test Case',
    content: `# Test Case - {id}

## Objective
- 

## Preconditions
- 

## Steps
1. 
2. 
3. 

## Expected
- 

## Actual
- 

## Status
- Pass/Fail: 
`
  },
  'rfc': {
    name: 'RFC',
    content: `# RFC - {title}

## Summary
- 

## Motivation
- 

## Detailed Design
- 

## Drawbacks
- 

## Alternatives
- 

## Adoption Strategy
- 

## Unresolved Questions
- 
`
  },
  'research-summary': {
    name: 'Research Summary',
    content: `# Research Summary - {topic}

## Objective
- 

## Methodology
- 

## Findings
- 

## Insights
- 

## Next Steps
- 
`
  },
  'sql-analysis': {
    name: 'SQL Analysis',
    content: `# SQL Analysis - {question}

## Context
- 

## Query
SELECT 
  
FROM 
  
WHERE 
  ;

## Results Summary
- Rows: 
- Key Metrics: 

## Interpretation
- 
`
  },
  'ds-experiment': {
    name: 'Data Science Experiment',
    content: `# DS Experiment - {name}

## Hypothesis
- 

## Dataset
- Source: 
- Size: 
- Features: 

## Method
- Model: 
- Params: 
- Validation: 

## Results
- Metrics: 
- Plots: 

## Conclusions
- 
`
  },
  'sre-runbook': {
    name: 'SRE Runbook',
    content: `# Runbook - {service}

## Symptoms
- 

## Diagnosis
1. Check dashboards: 
2. Check logs: 
3. Check alerts: 

## Mitigation
- 

## Escalation
- Contact: 
- Pager: 

## Verification
- 
`
  },
  'retrospective': {
    name: 'Retro',
    content: `# Retrospective - {sprint}

## What went well
- 

## What could be improved
- 

## Action items
- [ ] Owner:  Due: 
- [ ] Owner:  Due: 
`
  },
  'interview-notes': {
    name: 'Interview Notes',
    content: `# Interview - {candidate}

## Role
- 

## Areas Evaluated
- 

## Highlights
- 

## Concerns
- 

## Recommendation
- 
`
  }
});

// Create the main sticky note application
function createStickyNoteApp() {
  // Remove existing app
  const existing = document.getElementById('sticky-note-extension');
  if (existing) {
    existing.remove();
  }

  // Create main container
  const container = document.createElement('div');
  container.id = 'sticky-note-extension';
  container.style.cssText = isFullScreen ? `
        position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #ffffff;
    border: none;
    border-radius: 0;
    box-shadow: none;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: ${isVisible ? 'flex' : 'none'};
    flex-direction: column;
    resize: none;
        overflow: hidden;
  ` : `
        position: fixed;
    top: 100px;
    right: 20px;
    width: 500px;
    height: 400px;
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: ${isVisible ? 'flex' : 'none'};
    flex-direction: column;
    resize: both;
        overflow: hidden;
  `;

  // Create header with tabs
  const header = document.createElement('div');
  header.style.cssText = `
    background: #f8f9fa;
    color: #333;
    padding: 8px 12px;
    border-bottom: 1px solid #e9ecef;
        cursor: default;
        display: flex;
        justify-content: space-between;
        align-items: center;
    font-weight: 500;
        font-size: 13px;
    user-select: none;
    flex-shrink: 0;
  `;
      
  // Create drag handle
  const dragHandle = document.createElement('div');
  dragHandle.id = 'drag-handle';
  dragHandle.style.cssText = `
    width: 20px;
    height: 20px;
    background: #e9ecef;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    cursor: ${isFullScreen ? 'default' : 'move'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    flex-shrink: 0;
    transition: all 0.2s;
    user-select: none;
  `;
  
  // Add grip dots to the drag handle
  dragHandle.innerHTML = `
    <div style="
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2px;
      width: 8px;
      height: 8px;
    ">
      <div style="width: 2px; height: 2px; background: #666; border-radius: 50%;"></div>
      <div style="width: 2px; height: 2px; background: #666; border-radius: 50%;"></div>
      <div style="width: 2px; height: 2px; background: #666; border-radius: 50%;"></div>
      <div style="width: 2px; height: 2px; background: #666; border-radius: 50%;"></div>
    </div>
  `;
  
  // Add hover effects to drag handle
  dragHandle.addEventListener('mouseenter', () => {
    if (!isFullScreen) {
      if (isDarkMode) {
        dragHandle.style.background = '#555555';
        dragHandle.style.borderColor = '#666666';
      } else {
        dragHandle.style.background = '#dee2e6';
        dragHandle.style.borderColor = '#adb5bd';
      }
    }
  });
  
  dragHandle.addEventListener('mouseleave', () => {
    if (!isFullScreen) {
      if (isDarkMode) {
        dragHandle.style.background = '#404040';
        dragHandle.style.borderColor = '#555555';
      } else {
        dragHandle.style.background = '#e9ecef';
        dragHandle.style.borderColor = '#dee2e6';
      }
    }
  });
      
  // Create tab container
  const tabContainer = document.createElement('div');
  tabContainer.id = 'note-tabs';
  tabContainer.style.cssText = `
        display: flex;
    gap: 4px;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    min-width: 0;
    align-items: stretch;
  `;
  tabContainer.style.scrollbarWidth = 'none';
  tabContainer.style.webkitScrollbar = { display: 'none' };

  // Create controls
  const controls = document.createElement('div');
  controls.style.cssText = `
        margin-left: 8px;
        display: flex;
    gap: 4px;
        align-items: center;
  `;

  // Add new note button
  const newNoteBtn = document.createElement('button');
  newNoteBtn.innerHTML = '+';
  newNoteBtn.style.cssText = `
    background: transparent;
    border: 1px solid #e9ecef;
    color: #666;
    padding: 2px 6px;
        cursor: pointer;
        font-size: 12px;
    border-radius: 2px;
    transition: all 0.2s;
  `;
  newNoteBtn.title = 'New Note';
  newNoteBtn.addEventListener('click', () => createNewNote());

  // Template dropdown
  const templateBtn = document.createElement('button');
  templateBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>';
  templateBtn.style.cssText = `
    background: transparent;
    border: 1px solid #e9ecef;
    color: #666;
    padding: 2px 6px;
    cursor: pointer;
    font-size: 12px;
    border-radius: 2px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  templateBtn.title = 'Templates';
  templateBtn.addEventListener('click', () => showTemplateMenu(templateBtn));

  // Search button
  const searchBtn = document.createElement('button');
  searchBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
  searchBtn.style.cssText = `
    background: transparent;
    border: 1px solid #e9ecef;
    color: #666;
    padding: 2px 6px;
    cursor: pointer;
    font-size: 12px;
    border-radius: 2px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  searchBtn.title = 'Search notes';
  searchBtn.addEventListener('click', () => openSearchView());

  // Dark mode toggle
  const darkModeBtn = document.createElement('button');
  darkModeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  darkModeBtn.style.cssText = `
    background: transparent;
    border: 1px solid #e9ecef;
    color: #666;
    padding: 2px 6px;
    cursor: pointer;
    font-size: 12px;
    border-radius: 2px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  darkModeBtn.title = 'Dark mode';
  darkModeBtn.addEventListener('click', () => toggleDarkMode());

  // Full-screen toggle
  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
  fullscreenBtn.style.cssText = `
    background: transparent;
    border: 1px solid #e9ecef;
    color: #666;
    padding: 2px 6px;
    cursor: pointer;
    font-size: 12px;
    border-radius: 2px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  fullscreenBtn.title = 'Full-screen';
  fullscreenBtn.addEventListener('click', () => toggleFullScreen());

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    background: transparent;
    border: 1px solid #e9ecef;
    color: #666;
    padding: 2px 6px;
        cursor: pointer;
        font-size: 12px;
    border-radius: 2px;
    transition: all 0.2s;
  `;
  closeBtn.title = 'Close';
  closeBtn.addEventListener('click', () => toggleVisibility(false));

  // Assemble header
  controls.appendChild(newNoteBtn);
  controls.appendChild(templateBtn);
  controls.appendChild(searchBtn);
  controls.appendChild(darkModeBtn);
  controls.appendChild(fullscreenBtn);
  controls.appendChild(closeBtn);
  header.appendChild(dragHandle);
  header.appendChild(tabContainer);
  header.appendChild(controls);

  // Create content area
  const content = document.createElement('div');
  content.style.cssText = `
    flex: 1;
        display: flex;
    flex-direction: column;
    background: #ffffff;
        overflow: hidden;
  `;

  // Create toolbar
  const toolbar = document.createElement('div');
  toolbar.id = 'note-toolbar';
  toolbar.style.cssText = `
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
    flex-shrink: 0;
  `;

  // Remove the old search bar - we'll add a search button instead

  // Formatting buttons
  const boldBtn = createToolbarButton('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>', 'Bold', () => formatText('bold'));
  const italicBtn = createToolbarButton('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>', 'Italic', () => formatText('italic'));
  const codeBtn = createToolbarButton('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>', 'Code', () => formatText('code'));
  
  // Category selector
  const categoryContainer = document.createElement('div');
  categoryContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 8px;
  `;

  const categoryLabel = document.createElement('span');
  categoryLabel.textContent = 'Category:';
  categoryLabel.style.cssText = `
    font-size: 11px;
    color: #666;
  `;

  const categorySelect = document.createElement('select');
  categorySelect.id = 'note-category';
  categorySelect.style.cssText = `
    padding: 2px 6px;
    border: 1px solid #e9ecef;
    border-radius: 2px;
    font-size: 11px;
    background: white;
    outline: none;
  `;

  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  categoryContainer.appendChild(categoryLabel);
  categoryContainer.appendChild(categorySelect);

  // Export button
  const exportBtn = createToolbarButton('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>', 'Export', () => exportNote());
  
  // Bulk export button
  const bulkExportBtn = createToolbarButton('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>', 'Export All', () => exportAllNotes());
  
  // Clear button
  const clearBtn = createToolbarButton('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>', 'Clear', () => clearCurrentNote());

  toolbar.appendChild(categoryContainer);
  toolbar.appendChild(boldBtn);
  toolbar.appendChild(italicBtn);
  toolbar.appendChild(codeBtn);
  toolbar.appendChild(document.createElement('div')).style.width = '8px';
  toolbar.appendChild(exportBtn);
  toolbar.appendChild(bulkExportBtn);
  toolbar.appendChild(clearBtn);

  // Create editor area
  const editorArea = document.createElement('div');
  editorArea.style.cssText = `
    flex: 1;
        display: flex;
    flex-direction: column;
        overflow: hidden;
  `;

  // Create textarea
  const textarea = document.createElement('textarea');
  textarea.id = 'note-editor';
  textarea.placeholder = 'Start typing your note...';
  textarea.style.cssText = `
        flex: 1;
        border: none;
        outline: none;
    padding: 12px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
    line-height: 1.5;
        resize: none;
        background: transparent;
    color: #333;
  `;

  // Create status bar
  const statusBar = document.createElement('div');
  statusBar.id = 'status-bar';
  const statusBg = isDarkMode ? '#2d2d2d' : '#fafafa';
  const statusBorder = isDarkMode ? '#404040' : '#f0f0f0';
  const statusColor = isDarkMode ? '#b0b0b0' : '#666';
  statusBar.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 12px;
    border-top: 1px solid ${statusBorder};
    font-size: 11px;
    color: ${statusColor};
    background: ${statusBg};
    flex-shrink: 0;
  `;

  const wordCount = document.createElement('span');
  wordCount.id = 'word-count';
  wordCount.textContent = '0 words, 0 chars';

  const cursorInfo = document.createElement('span');
  cursorInfo.id = 'cursor-info';
  cursorInfo.textContent = 'Ln 1, Col 1';

  const wpmInfo = document.createElement('span');
  wpmInfo.id = 'wpm-info';
  wpmInfo.textContent = '0 WPM';

  const readingTime = document.createElement('span');
  readingTime.id = 'reading-time';
  readingTime.textContent = '~0 min read';

  const sessionTime = document.createElement('span');
  sessionTime.id = 'session-time';
  sessionTime.textContent = '0m';

  const lastModified = document.createElement('span');
  lastModified.id = 'last-modified';
  lastModified.textContent = 'now';

  statusBar.appendChild(wordCount);
  statusBar.appendChild(cursorInfo);
  statusBar.appendChild(wpmInfo);
  statusBar.appendChild(readingTime);
  statusBar.appendChild(sessionTime);
  statusBar.appendChild(lastModified);

  // Assemble components
  editorArea.appendChild(textarea);
  content.appendChild(toolbar);
  content.appendChild(editorArea);
  content.appendChild(statusBar);
  container.appendChild(header);
  container.appendChild(content);
  document.body.appendChild(container);

  // Add event listeners
  setupEventListeners(container, textarea);
  makeDraggable(container, dragHandle);

  // Restore saved placement (position and size) if available
  chrome.storage.sync.get(['notePosition', 'noteSize'], (result) => {
    if (!isFullScreen) {
      const pos = result.notePosition;
      const size = result.noteSize;
      if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
        container.style.left = pos.x + 'px';
        container.style.top = pos.y + 'px';
        // Ensure we don't conflict with right positioning
        container.style.right = 'auto';
        container.style.position = 'fixed';
      }
      if (size && typeof size.width === 'number' && typeof size.height === 'number') {
        container.style.width = size.width + 'px';
        container.style.height = size.height + 'px';
      }
    }
  });

  // Observe size changes to persist dimensions (avoid when in full screen)
  if (window.ResizeObserver) {
    let resizeSaveTimeout = null;
    const ro = new ResizeObserver(() => {
      if (isFullScreen) return;
      if (resizeSaveTimeout) {
        clearTimeout(resizeSaveTimeout);
      }
      resizeSaveTimeout = setTimeout(() => {
        const rect = container.getBoundingClientRect();
        const size = { width: Math.round(rect.width), height: Math.round(rect.height) };
        chrome.storage.sync.set({ noteSize: size });
        // Broadcast real-time update to other tabs
        sendRealtimeUpdate('UI_STATE_CHANGED', { size });
      }, 150);
    });
    ro.observe(container);
  }

  return container;
}

// Create toolbar button
function createToolbarButton(text, title, onClick) {
  const btn = document.createElement('button');
  btn.innerHTML = text;
  btn.title = title;
  btn.style.cssText = `
    background: transparent;
    border: 1px solid #e9ecef;
    color: #666;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 11px;
    border-radius: 2px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  btn.addEventListener('click', onClick);
  btn.addEventListener('mouseenter', () => {
    if (isDarkMode) {
      btn.style.borderColor = '#e0e0e0';
      btn.style.color = '#ffffff';
      btn.style.background = '#555555';
    } else {
      btn.style.borderColor = '#333';
      btn.style.color = '#333';
    }
  });
  btn.addEventListener('mouseleave', () => {
    if (isDarkMode) {
      btn.style.borderColor = '#555555';
      btn.style.color = '#e0e0e0';
      btn.style.background = '#404040';
    } else {
      btn.style.borderColor = '#e9ecef';
      btn.style.color = '#666';
      btn.style.background = 'transparent';
    }
  });
  
  return btn;
}

// Create new note
function createNewNote(templateKey = null) {
  const noteId = 'note_' + Date.now();
  const template = templateKey ? NOTE_TEMPLATES[templateKey] : null;
  
  notes[noteId] = {
    id: noteId,
    content: template ? template.content : '',
    category: 'Personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  undoStacks[noteId] = [];
  redoStacks[noteId] = [];
  
  currentNoteId = noteId;
  updateTabs();
  updateEditor();
  updateCategorySelector();
  
  // Ensure the new tab is visible
  setTimeout(() => {
    const tabContainer = document.querySelector('#note-tabs');
    const activeTab = tabContainer?.querySelector(`[data-note-id="${noteId}"]`);
    if (activeTab && tabContainer) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, 100);
  
  // Focus editor
  const textarea = document.querySelector('#note-editor');
  if (textarea) {
    textarea.focus();
  }
  
  console.log('Created new note:', noteId);
}

// Update tabs display
function updateTabs() {
  const tabContainer = document.querySelector('#note-tabs');
  if (!tabContainer) return;
  
  tabContainer.innerHTML = '';
  const noteCount = Object.keys(notes).length;
  
  Object.values(notes).forEach(note => {
    const tab = document.createElement('div');
    tab.className = 'note-tab';
    tab.dataset.noteId = note.id;
    const isActive = note.id === currentNoteId;
    const activeBg = isDarkMode ? '#0066cc' : '#007bff';
    const activeColor = '#ffffff';
    const inactiveBg = 'transparent';
    const inactiveColor = isDarkMode ? '#b0b0b0' : '#666666';
    
    tab.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: ${isActive ? activeBg : inactiveBg};
      color: ${isActive ? activeColor : inactiveColor};
      border: ${isActive ? 'none' : `1px solid ${isDarkMode ? '#404040' : '#e9ecef'}`};
      border-radius: 2px;
      cursor: pointer;
      font-size: 11px;
      white-space: nowrap;
      transition: all 0.2s;
      position: relative;
      max-width: 200px;
      min-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    
    // Add CSS for drag states (only once)
    if (!document.getElementById('sticky-note-drag-styles')) {
      const style = document.createElement('style');
      style.id = 'sticky-note-drag-styles';
      style.textContent = `
        .note-tab.tab-drag-over-right::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 3px;
          height: 100%;
          background: #007bff;
          pointer-events: none;
        }
        
        .note-tab.tab-drag-over-left::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: #007bff;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Add hover effect directly to the tab element
    tab.addEventListener('mouseenter', () => {
      if (note.id !== currentNoteId) {
        if (isDarkMode) {
          tab.style.background = '#404040';
        } else {
          tab.style.background = '#f0f0f0';
        }
      }
    });
    
    tab.addEventListener('mouseleave', () => {
      if (note.id !== currentNoteId) {
        tab.style.background = 'transparent';
      }
    });
    
    // Show close button only if there's more than one note
    const closeButtonHtml = noteCount > 1 ? `
      <button class="close-tab" style="
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        padding: 2px 4px;
        margin-left: 4px;
        border-radius: 2px;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      " title="Close tab">×</button>
    ` : '';
    
    // Get title from first line of content and trim if too long
    const firstLine = note.content.split('\n')[0].trim();
    const rawTitle = firstLine || 'Untitled Note';
    const maxTitleLength = 30; // Industry standard for tab names
    const displayTitle = rawTitle.length > maxTitleLength 
      ? rawTitle.substring(0, maxTitleLength) + '...' 
      : rawTitle;
    
    tab.innerHTML = `
      <span class="note-title" data-note-id="${note.id}" style="
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      ">${displayTitle}</span>
      ${closeButtonHtml}
    `;
    
    // Add hover preview (only for non-active notes)
    let previewTimeout;
    tab.addEventListener('mouseenter', () => {
      // Don't show preview for the currently active note
      if (note.id !== currentNoteId) {
        // Clear any existing timeout first
        if (previewTimeout) {
          clearTimeout(previewTimeout);
        }
        previewTimeout = setTimeout(() => {
          // Double-check that this is still not the active note
          if (note.id !== currentNoteId) {
            showNotePreview(note.id, tab);
          }
        }, 500); // 500ms delay before showing preview
      }
    });
    
    tab.addEventListener('mouseleave', () => {
      if (previewTimeout) {
        clearTimeout(previewTimeout);
        previewTimeout = null;
      }
      hideNotePreview();
    });


    // Simple click handler for tab switching
    tab.addEventListener('click', (e) => {
      // Clear any pending preview timeout when clicking
      if (previewTimeout) {
        clearTimeout(previewTimeout);
        previewTimeout = null;
      }
      // Hide any existing preview
      hideNotePreview();
      
      if (e.target.classList.contains('close-tab')) {
        e.stopPropagation();
        closeNote(note.id);
      } else {
        // Only switch if it's not the current note
        if (note.id !== currentNoteId) {
          console.log('Switching to note:', note.id);
          switchToNote(note.id);
        }
      }
    });
    
    // Enhanced drag and drop functionality for tab reordering
    // Using global drag variables defined at the top of the file
    
    
    
    
    
    
    
    // Helper functions moved to global scope
    
    // HTML5 drag and drop - make tab draggable
    tab.draggable = true;
    
    // Drag start handler
    tab.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('close-tab')) {
        e.preventDefault();
        return;
      }
      
      draggedTab = tab;
      isTabDragging = true;
      
      // Set drag data
      e.dataTransfer.setData('text/plain', note.id);
      e.dataTransfer.effectAllowed = 'move';
      
      // Create a custom drag image cloned from the tab to match its UI
      const computed = window.getComputedStyle(tab);
      dragImageEl = tab.cloneNode(true);
      // Ensure the drag image visually matches the tab and is rendered offscreen
      dragImageEl.classList.remove('tab-drag-over-left', 'tab-drag-over-right');
      dragImageEl.style.position = 'fixed';
      dragImageEl.style.top = '0px';
      dragImageEl.style.left = '-10000px'; // keep offscreen but rendered
      dragImageEl.style.zIndex = '9999';
      dragImageEl.style.pointerEvents = 'none';
      dragImageEl.style.opacity = '1';
      // Fix size to avoid reflow differences
      dragImageEl.style.width = computed.width;
      dragImageEl.style.height = computed.height;
      // Make sure long titles behave like the tab
      dragImageEl.style.whiteSpace = 'nowrap';
      dragImageEl.style.textOverflow = 'ellipsis';
      dragImageEl.style.overflow = 'hidden';
      // Simple border for visibility, no animation
      dragImageEl.style.boxShadow = 'none';
      document.body.appendChild(dragImageEl);
      
      // Offset so the drag image sits directly below the cursor (top edge under pointer)
      const offsetX = 10; // slight right shift so cursor doesn't cover text
      const offsetY = 0;  // top edge of image aligned to cursor
      try {
        e.dataTransfer.setDragImage(dragImageEl, offsetX, offsetY);
      } catch (_) {
        // Some environments may restrict setDragImage; ignore gracefully
      }
      
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    });
    
    // Drag end handler
    tab.addEventListener('dragend', (e) => {
      isTabDragging = false;
      
      // Clean up custom drag image
      if (dragImageEl) {
        dragImageEl.remove();
        dragImageEl = null;
      }
      
      // Reset visual state (no animations)
      tab.style.opacity = '1';
      tab.style.cursor = 'pointer';
      tab.style.userSelect = 'auto';
      tab.style.transform = '';
      
      // Ensure any legacy tooltip is removed
      removeDragTooltip();
      
      // Reset body styles
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
      
      // Clean up hover effects
      if (dragOverTab) {
        dragOverTab.classList.remove('tab-drag-over-right', 'tab-drag-over-left');
        dragOverTab = null;
        dragOverPosition = null;
      }
      
      draggedTab = null;
    });
    
    // Drop zone handlers for each tab
    tab.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (tab !== draggedTab) {
        const position = getDropPosition(tab, e.clientX);
        
        // Update indicator if we're on a different tab OR if position changed on same tab
        if (dragOverTab !== tab || dragOverPosition !== position) {
          // Clean up previous tab
          if (dragOverTab && dragOverTab !== tab) {
            dragOverTab.classList.remove('tab-drag-over-right', 'tab-drag-over-left');
          }
          
          // Clean up current tab if position changed
          if (dragOverTab === tab) {
            tab.classList.remove('tab-drag-over-right', 'tab-drag-over-left');
          }
          
          dragOverTab = tab;
          dragOverPosition = position;
          
          if (position === 'before') {
            tab.classList.add('tab-drag-over-left');
          } else {
            tab.classList.add('tab-drag-over-right');
          }
        }
      }
    });
    
    tab.addEventListener('dragleave', (e) => {
      // Only remove classes if we're actually leaving the tab
      if (!tab.contains(e.relatedTarget)) {
        tab.classList.remove('tab-drag-over-right', 'tab-drag-over-left');
        if (dragOverTab === tab) {
          dragOverTab = null;
          dragOverPosition = null;
        }
      }
    });
    
    tab.addEventListener('drop', (e) => {
      e.preventDefault();
      
      const draggedNoteId = e.dataTransfer.getData('text/plain');
      const targetNoteId = tab.dataset.noteId;
      const position = getDropPosition(tab, e.clientX);
      
      console.log('Drop event:', { draggedNoteId, targetNoteId, position });
      
      if (targetNoteId && draggedNoteId && targetNoteId !== draggedNoteId) {
        console.log('Reordering tabs:', { draggedNoteId, targetNoteId, position });
        reorderTabs(draggedNoteId, targetNoteId, position);
      }
      
      // Clean up visual feedback
      tab.classList.remove('tab-drag-over-right', 'tab-drag-over-left');
      if (dragOverTab === tab) {
        dragOverTab = null;
        dragOverPosition = null;
      }
    });
    
    
    tabContainer.appendChild(tab);
  });
  
  // Ensure active tab is visible
  setTimeout(() => {
    const activeTab = tabContainer.querySelector(`[data-note-id="${currentNoteId}"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, 0);
  
  // Global event handlers are set up in initializeDragAndDrop() function
}

// Simple tab reordering - move one note to a new position
function reorderTabs(draggedNoteId, targetNoteId, position = 'before') {
  console.log('reorderTabs called:', { draggedNoteId, targetNoteId, position });
  
  if (!notes[draggedNoteId] || !notes[targetNoteId]) {
    console.log('Missing notes:', { draggedNoteId: !!notes[draggedNoteId], targetNoteId: !!notes[targetNoteId] });
    return;
  }
  
  // Get all notes as array
  const noteArray = Object.values(notes);
  const draggedIndex = noteArray.findIndex(note => note.id === draggedNoteId);
  const targetIndex = noteArray.findIndex(note => note.id === targetNoteId);
  
  console.log('Indices:', { draggedIndex, targetIndex });
  
  if (draggedIndex === -1 || targetIndex === -1) {
    console.log('Invalid indices');
    return;
  }
  
  // If dragging to the same position, do nothing
  if (draggedIndex === targetIndex) {
    console.log('Same position, no change needed');
    return;
  }
  
  // Remove dragged note
  const [draggedNote] = noteArray.splice(draggedIndex, 1);
  
  // Calculate new position after removal
  let newIndex = targetIndex;
  
  // Adjust target index if the dragged item was before the target
  if (draggedIndex < targetIndex) {
    newIndex = targetIndex - 1;
  }
  
  // Apply position offset
  if (position === 'after') {
    newIndex += 1;
  }
  
  console.log('Calculated newIndex:', newIndex);
  
  // Insert at new position
  noteArray.splice(newIndex, 0, draggedNote);
  
  console.log('New order:', noteArray.map(note => note.id));
  
  // Update notes object
  notes = {};
  noteArray.forEach(note => notes[note.id] = note);
  
  updateTabs();
  saveNotes();
}

// Move current tab left (keyboard shortcut)
function moveCurrentTabLeft() {
  if (!currentNoteId) return;
  
  const noteArray = Object.values(notes);
  const currentIndex = noteArray.findIndex(note => note.id === currentNoteId);
  
  if (currentIndex > 0) {
    const targetNote = noteArray[currentIndex - 1];
    reorderTabs(currentNoteId, targetNote.id, 'before');
    console.log('Moved current tab left');
  }
}

// Move current tab right (keyboard shortcut)
function moveCurrentTabRight() {
  if (!currentNoteId) return;
  
  const noteArray = Object.values(notes);
  const currentIndex = noteArray.findIndex(note => note.id === currentNoteId);
  
  if (currentIndex < noteArray.length - 1) {
    const targetNote = noteArray[currentIndex + 1];
    reorderTabs(currentNoteId, targetNote.id, 'after');
    console.log('Moved current tab right');
  }
}

// Switch to note
function switchToNote(noteId) {
  if (notes[noteId]) {
    // Clean up any ongoing drag operation
    cleanupDragState();
    
    // Clean up all previews when switching notes
    cleanupAllPreviews();
    
    // Save current content before switching
    const textarea = document.querySelector('#note-editor');
    if (textarea && currentNoteId && notes[currentNoteId]) {
      notes[currentNoteId].content = textarea.value;
      notes[currentNoteId].updatedAt = new Date().toISOString();
      
    }
    
    // Reset WPM calculation for new note
    typingStartTime = null;
    lastTypingTime = null;
    totalTypingTime = 0;
    totalWordsTyped = 0;
    currentWPM = 0;
    
    // Initialize session time
    sessionStartTime = Date.now();
    
    currentNoteId = noteId;
    updateTabs();
    updateEditor();
    
    // Ensure the active tab is visible
    setTimeout(() => {
      const tabContainer = document.querySelector('#note-tabs');
      const activeTab = tabContainer?.querySelector(`[data-note-id="${noteId}"]`);
      if (activeTab && tabContainer) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
    
    // Send real-time update to all tabs
    sendRealtimeUpdate('NOTE_SWITCHED', {
      noteId: noteId
    });
    
    console.log('Switched to note:', noteId);
  }
}


// Close note
function closeNote(noteId) {
  const noteCount = Object.keys(notes).length;
  
  // Don't close if there's only one note
  if (noteCount <= 1) {
    console.log('Cannot close the last note');
    return;
  }
  
  delete notes[noteId];
  delete undoStacks[noteId];
  delete redoStacks[noteId];
  
  if (currentNoteId === noteId) {
    // Switch to first available note
    const remainingNotes = Object.keys(notes);
    currentNoteId = remainingNotes[0];
  }
  
  updateTabs();
  updateEditor();
  saveNotes();
  console.log('Closed note:', noteId);
}

// Update editor content
function updateEditor() {
  const textarea = document.querySelector('#note-editor');
  if (!textarea || !currentNoteId || !notes[currentNoteId]) return;
  
  // Save current cursor position
  const currentCursor = textarea.selectionStart;
  const currentSelectionEnd = textarea.selectionEnd;
  
  // Set the new content
  textarea.value = notes[currentNoteId].content;
  
  // Restore cursor position if it's within the new content length
  if (currentCursor <= textarea.value.length) {
    textarea.setSelectionRange(currentCursor, currentSelectionEnd);
  } else {
    // If cursor was beyond content, place it at the end
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }
  
  updateWordCount();
  updateCategorySelector();
}

// Update category selector
function updateCategorySelector() {
  const categorySelect = document.querySelector('#note-category');
  if (!categorySelect || !currentNoteId || !notes[currentNoteId]) return;
  
  categorySelect.value = notes[currentNoteId].category || 'Personal';
  
  // Add change listener if not already added
  if (!categorySelect.hasAttribute('data-listener-added')) {
    categorySelect.addEventListener('change', (e) => {
      if (currentNoteId && notes[currentNoteId]) {
        notes[currentNoteId].category = e.target.value;
        notes[currentNoteId].updatedAt = new Date().toISOString();
        saveNotes();
        updateTabs(); // Update tabs to show category
        console.log('Updated category for note:', currentNoteId, 'to:', e.target.value);
      }
    });
    categorySelect.setAttribute('data-listener-added', 'true');
  }
}

// Format text
function formatText(type) {
  const textarea = document.querySelector('#note-editor');
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  
  let formattedText = '';
  switch (type) {
    case 'bold':
      formattedText = `**${selectedText}**`;
          break;
    case 'italic':
      formattedText = `*${selectedText}*`;
          break;
    case 'code':
      formattedText = `\`${selectedText}\``;
          break;
      }
  
  const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
  textarea.value = newValue;
  
  // Update note content
  if (currentNoteId && notes[currentNoteId]) {
    notes[currentNoteId].content = newValue;
    notes[currentNoteId].updatedAt = new Date().toISOString();
    saveNotes();
  }
  
  // Restore selection
  textarea.setSelectionRange(start + 2, end + 2);
  textarea.focus();
}

// Export note
function exportNote() {
  if (!currentNoteId || !notes[currentNoteId]) return;
  
  const note = notes[currentNoteId];
  const firstLine = note.content.split('\n')[0].trim();
  const title = firstLine || 'Untitled Note';
  
  const data = {
    title: title,
    content: note.content,
    category: note.category,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('Exported note:', note.title);
}

// Export all notes
function exportAllNotes() {
  const allNotes = Object.values(notes);
  if (allNotes.length === 0) {
    console.log('No notes to export');
    return;
  }
  
  const exportData = {
    exportDate: new Date().toISOString(),
    totalNotes: allNotes.length,
    notes: allNotes.map(note => {
      const firstLine = note.content.split('\n')[0].trim();
      const title = firstLine || 'Untitled Note';
      return {
        id: note.id,
        title: title,
        content: note.content,
        category: note.category,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      };
    })
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sticky-notes-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log(`Exported ${allNotes.length} notes`);
}

// Clear current note
function clearCurrentNote() {
  if (!currentNoteId || !notes[currentNoteId]) return;
  
  if (confirm('Are you sure you want to clear this note?')) {
    notes[currentNoteId].content = '';
    notes[currentNoteId].updatedAt = new Date().toISOString();
    updateEditor();
    saveNotes();
  }
}

// Show template menu
function showTemplateMenu(button) {
  // Remove existing menu
  const existing = document.querySelector('.template-menu');
  if (existing) {
    existing.remove();
  }
  
  const menu = document.createElement('div');
  menu.className = 'template-menu';
  const menuBg = isDarkMode ? '#2d2d2d' : 'white';
  const menuBorder = isDarkMode ? '#404040' : '#e9ecef';
  menu.style.cssText = `
    position: absolute;
    top: 30px;
    right: 0;
    background: ${menuBg};
    border: 1px solid ${menuBorder};
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 1000;
    min-width: 200px;
    max-height: 300px;
    overflow-y: auto;
  `;
  
  Object.entries(NOTE_TEMPLATES).forEach(([key, template]) => {
    const item = document.createElement('div');
    const itemBorder = isDarkMode ? '#404040' : '#f0f0f0';
    const itemColor = isDarkMode ? '#e0e0e0' : '#333';
    const itemBg = isDarkMode ? '#2d2d2d' : 'white';
    const itemHoverBg = isDarkMode ? '#404040' : '#f8f9fa';
    
    item.style.cssText = `
      padding: 8px 12px;
      cursor: pointer;
      border-bottom: 1px solid ${itemBorder};
      font-size: 12px;
      transition: background 0.2s;
      color: ${itemColor};
      background: ${itemBg};
    `;
    item.textContent = template.name;
    item.addEventListener('click', () => {
      createNewNote(key);
      menu.remove();
    });
    item.addEventListener('mouseenter', () => {
      item.style.background = itemHoverBg;
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = itemBg;
    });
    menu.appendChild(item);
  });
  
  button.parentNode.appendChild(menu);
  
  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', () => {
      menu.remove();
    }, { once: true });
  }, 100);
}

// Setup event listeners
function setupEventListeners(container, textarea) {
  // Real-time save on input
  textarea.addEventListener('input', () => {
    if (currentNoteId && notes[currentNoteId]) {
      // Calculate WPM
      const now = Date.now();
      if (!typingStartTime) {
        typingStartTime = now;
        lastTypingTime = now;
      }
      
      const timeSinceLastTyping = now - lastTypingTime;
      lastTypingTime = now;
      
      // Only count if typing within 2 seconds (not copy/paste)
      if (timeSinceLastTyping < 2000) {
        totalTypingTime += timeSinceLastTyping;
        const currentWords = textarea.value.trim().split(/\s+/).length;
        if (currentWords > totalWordsTyped) {
          totalWordsTyped = currentWords;
        }
        
        // Calculate WPM (words per minute) - more accurate calculation
        if (totalTypingTime > 0) {
          // Use a rolling average for more stable WPM
          const instantWPM = (totalWordsTyped / totalTypingTime) * 60000;
          currentWPM = currentWPM === 0 ? instantWPM : (currentWPM * 0.7) + (instantWPM * 0.3);
        }
      } else {
        // Reset WPM if not typing for too long
        if (timeSinceLastTyping > 10000) {
          currentWPM = 0;
        }
      }
      
      notes[currentNoteId].content = textarea.value;
      notes[currentNoteId].updatedAt = new Date().toISOString();
      
      updateWordCount();
      
      // Save immediately
      saveNotes();
      lastSaveTime = Date.now();
      
      // Update tab title when content changes
      updateTabs();
      
      // Send real-time update to all tabs immediately
      sendRealtimeUpdate('CONTENT_CHANGED', {
        noteId: currentNoteId,
        content: textarea.value,
        cursorPosition: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd
      });
    }
  });

  // Keyboard shortcuts
  textarea.addEventListener('keydown', (e) => {
    // Save state for undo
    if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
      saveStateForUndo();
    }
    
    // Undo (Ctrl+Z)
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    
    // Redo (Ctrl+Y)
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      redo();
    }
    
    // Save (Ctrl+S)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveNotes();
    }
    
    // New note (Ctrl+N)
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      createNewNote();
    }
    
    // Full-screen (F11)
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullScreen();
    }
    
    // Tab reordering with keyboard shortcuts
    if (e.ctrlKey && e.shiftKey) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveCurrentTabLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveCurrentTabRight();
      }
    }
  });

  // Update cursor position on selection change
  textarea.addEventListener('selectionchange', () => {
    updateWordCount();
  });
}

// Save notes to storage
function saveNotes() {
  chrome.storage.sync.set({ 
    notes: notes,
    currentNoteId: currentNoteId,
    noteVisible: isVisible,
    isFullScreen: isFullScreen
  });
}

// Load notes from storage
function loadNotes() {
  chrome.storage.sync.get(['notes', 'currentNoteId', 'noteVisible', 'isFullScreen', 'isDarkMode'], (result) => {
    if (result.notes) {
      notes = result.notes;
    }
    
    if (result.currentNoteId && notes[result.currentNoteId]) {
      currentNoteId = result.currentNoteId;
    } else if (Object.keys(notes).length > 0) {
      currentNoteId = Object.keys(notes)[0];
    } else {
      // Set visibility state first, then create new note
      isVisible = result.noteVisible === true;
      isFullScreen = result.isFullScreen || false;
      isDarkMode = result.isDarkMode || false;
      
      // Create the app with correct visibility state
      if (!stickyNoteApp) {
        stickyNoteApp = createStickyNoteApp();
      }
      
      createNewNote();
      return;
    }
    
    isVisible = result.noteVisible === true;
    isFullScreen = result.isFullScreen || false;
    isDarkMode = result.isDarkMode || false;
    
    // Initialize undo/redo stacks
    Object.keys(notes).forEach(noteId => {
      if (!undoStacks[noteId]) undoStacks[noteId] = [];
      if (!redoStacks[noteId]) redoStacks[noteId] = [];
    });
    
    // Create the app only after loading the visibility state
    if (!stickyNoteApp) {
      stickyNoteApp = createStickyNoteApp();
    }
    
    updateTabs();
    updateEditor();
    
    if (isFullScreen) {
      // Ensure fullscreen applied immediately after app creation
      applyFullScreen();
    } else {
      // Ensure drag handle cursor is set correctly even when not in full screen
      const container = document.getElementById('sticky-note-extension');
      if (container) {
        const dragHandle = container.querySelector('#drag-handle');
        if (dragHandle) {
          dragHandle.style.cursor = 'move';
        }
      }
    }
    
    if (isDarkMode) {
      applyDarkMode();
    }
    
    console.log('Loaded notes:', Object.keys(notes).length);
  });
}

// Update word count and all metrics
function updateWordCount() {
  const textarea = document.querySelector('#note-editor');
  const wordCountElement = document.querySelector('#word-count');
  const cursorInfoElement = document.querySelector('#cursor-info');
  const wpmInfoElement = document.querySelector('#wpm-info');
  const readingTimeElement = document.querySelector('#reading-time');
  const sessionTimeElement = document.querySelector('#session-time');
  const lastModifiedElement = document.querySelector('#last-modified');
  
  if (!textarea || !wordCountElement) return;
  
  const content = textarea.value;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characters = content.length;
  
  // Update word count
  wordCountElement.textContent = `${words} words, ${characters} chars`;
  
  // Update cursor position
  if (cursorInfoElement) {
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    const currentColumn = lines[lines.length - 1].length + 1;
    
    cursorInfoElement.textContent = `Ln ${currentLine}, Col ${currentColumn}`;
  }
  
  // Update WPM
  if (wpmInfoElement) {
    wpmInfoElement.textContent = `${Math.round(currentWPM)} WPM`;
  }
  
  // Update reading time (average 200 words per minute)
  if (readingTimeElement) {
    const readingMinutes = Math.ceil(words / 200);
    readingTimeElement.textContent = `~${readingMinutes} min read`;
  }
  
  // Update session time
  if (sessionTimeElement && sessionStartTime) {
    const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
    sessionTimeElement.textContent = `${sessionMinutes}m`;
  }
  
  // Update last modified
  if (lastModifiedElement && lastSaveTime) {
    const timeSinceSave = Math.floor((Date.now() - lastSaveTime) / 1000);
    if (timeSinceSave < 60) {
      lastModifiedElement.textContent = `${timeSinceSave}s ago`;
    } else if (timeSinceSave < 3600) {
      lastModifiedElement.textContent = `${Math.floor(timeSinceSave / 60)}m ago`;
    } else {
      lastModifiedElement.textContent = `${Math.floor(timeSinceSave / 3600)}h ago`;
    }
  }
}


// Undo functionality
function undo() {
  if (currentNoteId && undoStacks[currentNoteId] && undoStacks[currentNoteId].length > 0) {
    const textarea = document.querySelector('#note-editor');
    if (textarea) {
      const currentState = textarea.value;
      redoStacks[currentNoteId].push(currentState);
      
      const previousState = undoStacks[currentNoteId].pop();
      isUndoRedo = true;
      textarea.value = previousState;
      isUndoRedo = false;
      
      if (notes[currentNoteId]) {
        notes[currentNoteId].content = previousState;
        notes[currentNoteId].updatedAt = new Date().toISOString();
      }
      
      updateWordCount();
    }
  }
}

// Redo functionality
function redo() {
  if (currentNoteId && redoStacks[currentNoteId] && redoStacks[currentNoteId].length > 0) {
    const textarea = document.querySelector('#note-editor');
    if (textarea) {
      const currentState = textarea.value;
      undoStacks[currentNoteId].push(currentState);
      
      const nextState = redoStacks[currentNoteId].pop();
      isUndoRedo = true;
      textarea.value = nextState;
      isUndoRedo = false;
      
      if (notes[currentNoteId]) {
        notes[currentNoteId].content = nextState;
        notes[currentNoteId].updatedAt = new Date().toISOString();
      }
      
      updateWordCount();
    }
  }
}

// Save state for undo
function saveStateForUndo() {
  if (!isUndoRedo && currentNoteId) {
    const textarea = document.querySelector('#note-editor');
    if (textarea) {
      const currentValue = textarea.value;
      undoStacks[currentNoteId].push(currentValue);
      
      if (undoStacks[currentNoteId].length > 50) {
        undoStacks[currentNoteId].shift();
      }
      
      redoStacks[currentNoteId] = [];
    }
  }
}

// Toggle visibility
function toggleVisibility(visible) {
  isVisible = visible;
  const container = document.getElementById('sticky-note-extension');
  if (container) {
    container.style.display = visible ? 'flex' : 'none';
  }
  
  // Clean up drag state and previews when hiding
  if (!visible) {
    cleanupDragState();
    cleanupAllPreviews();
  }
  
  chrome.storage.sync.set({ noteVisible: visible });
}

// Toggle full-screen mode
function toggleFullScreen() {
  isFullScreen = !isFullScreen;
  
  // Clean up drag state and previews when entering full screen
  if (isFullScreen) {
    cleanupDragState();
    cleanupAllPreviews();
  }
  
  applyFullScreen();
  
  // Send real-time update to all tabs
  sendRealtimeUpdate('UI_STATE_CHANGED', {
    fullScreen: isFullScreen
  });
  
  chrome.storage.sync.set({ isFullScreen: isFullScreen });
}

// Apply full-screen mode (separated for real-time sync)
function applyFullScreen() {
  const container = document.getElementById('sticky-note-extension');
  if (!container) return;
  
  if (isFullScreen) {
    // When entering full screen, stop any ongoing drag operation
    // by resetting the container position to full screen
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #ffffff;
      border: none;
      border-radius: 0;
      box-shadow: none;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      resize: none;
      overflow: hidden;
    `;
} else {
    // When exiting full screen, restore to normal position
    container.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      width: 500px;
      height: 400px;
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      resize: both;
      overflow: hidden;
    `;

    // Try restoring saved placement after exiting fullscreen
    chrome.storage.sync.get(['notePosition', 'noteSize'], (result) => {
      const pos = result.notePosition;
      const size = result.noteSize;
      if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
        container.style.left = pos.x + 'px';
        container.style.top = pos.y + 'px';
        container.style.right = 'auto';
      }
      if (size && typeof size.width === 'number' && typeof size.height === 'number') {
        container.style.width = size.width + 'px';
        container.style.height = size.height + 'px';
      }
    });
  }
  
  // Update drag handle cursor and visibility based on full screen state
  const dragHandle = container.querySelector('#drag-handle');
  if (dragHandle) {
    dragHandle.style.cursor = isFullScreen ? 'default' : 'move';
    dragHandle.style.display = isFullScreen ? 'none' : 'flex';
  }
}

// Toggle dark mode
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  applyDarkMode();
  
  // Send real-time update to all tabs
  sendRealtimeUpdate('UI_STATE_CHANGED', {
    darkMode: isDarkMode
  });
  
  chrome.storage.sync.set({ isDarkMode: isDarkMode });
  console.log('Dark mode toggled:', isDarkMode);
}

// Apply dark mode (separated for real-time sync)
function applyDarkMode() {
  const container = document.getElementById('sticky-note-extension');
  if (!container) return;
  
  if (isDarkMode) {
    // Dark mode styles with proper contrast
    container.style.background = '#1e1e1e';
    container.style.borderColor = '#404040';
    container.style.color = '#e0e0e0';
    
    // Update header
    const header = container.querySelector('div');
    if (header) {
      header.style.background = '#2d2d2d';
      header.style.borderColor = '#404040';
      header.style.color = '#e0e0e0';
    }
    
    // Update drag handle
    const dragHandle = container.querySelector('#drag-handle');
    if (dragHandle) {
      dragHandle.style.background = '#404040';
      dragHandle.style.borderColor = '#555555';
      dragHandle.style.display = isFullScreen ? 'none' : 'flex';
      // Update grip dots color for better contrast
      const gripDots = dragHandle.querySelector('div');
      if (gripDots) {
        gripDots.style.color = '#e0e0e0';
        const dots = gripDots.querySelectorAll('div');
        dots.forEach(dot => {
          dot.style.background = '#e0e0e0';
        });
      }
    }
    
    // Update toolbar
    const toolbar = container.querySelector('#note-toolbar');
    if (toolbar) {
      toolbar.style.background = '#2d2d2d';
      toolbar.style.borderColor = '#404040';
    }
    
    // Update textarea
    const textarea = container.querySelector('#note-editor');
    if (textarea) {
      textarea.style.background = '#1e1e1e';
      textarea.style.color = '#e0e0e0';
    }
    
    // Update status bar
    const statusBar = container.querySelector('#status-bar');
    if (statusBar) {
      statusBar.style.background = '#2d2d2d';
      statusBar.style.borderColor = '#404040';
      statusBar.style.color = '#b0b0b0';
      
      // Update word count, cursor info, WPM, and save status colors
      const wordCount = statusBar.querySelector('#word-count');
      if (wordCount) {
        wordCount.style.color = '#b0b0b0';
      }
      
      const cursorInfo = statusBar.querySelector('#cursor-info');
      if (cursorInfo) {
        cursorInfo.style.color = '#b0b0b0';
      }
      
      const wpmInfo = statusBar.querySelector('#wpm-info');
      if (wpmInfo) {
        wpmInfo.style.color = '#b0b0b0';
      }
      
      const readingTime = statusBar.querySelector('#reading-time');
      if (readingTime) {
        readingTime.style.color = '#b0b0b0';
      }
      
      const sessionTime = statusBar.querySelector('#session-time');
      if (sessionTime) {
        sessionTime.style.color = '#b0b0b0';
      }
      
      const lastModified = statusBar.querySelector('#last-modified');
      if (lastModified) {
        lastModified.style.color = '#b0b0b0';
      }
      
    }
    
    // Update all buttons for better contrast (exclude tab close buttons to preserve inheritance)
    const buttons = container.querySelectorAll('button:not(.close-tab)');
    buttons.forEach(button => {
      button.style.background = '#404040';
      button.style.borderColor = '#555555';
      button.style.color = '#e0e0e0';
    });
    
    // Update select elements
    const selects = container.querySelectorAll('select');
    selects.forEach(select => {
      select.style.background = '#404040';
      select.style.borderColor = '#555555';
      select.style.color = '#e0e0e0';
    });
    
    // Update tabs
    const tabs = container.querySelectorAll('.note-tab');
    tabs.forEach(tab => {
      if (tab.dataset.noteId === currentNoteId) {
        tab.style.background = '#0066cc';
        tab.style.color = '#ffffff';
        tab.style.border = 'none';
      } else {
        tab.style.background = 'transparent';
        tab.style.color = '#b0b0b0';
        tab.style.border = '1px solid #404040';
      }

      // Ensure close button inherits tab color
      const closeBtn = tab.querySelector('.close-tab');
      if (closeBtn) {
        closeBtn.style.color = 'inherit';
      }
    });
    
    // Update category label
    const categoryLabel = container.querySelector('span');
    if (categoryLabel && categoryLabel.textContent === 'Category:') {
      categoryLabel.style.color = '#b0b0b0';
    }
    
  } else {
    // Light mode styles
    container.style.background = '#ffffff';
    container.style.borderColor = '#e9ecef';
    container.style.color = '#333333';
    
    // Update header
    const header = container.querySelector('div');
    if (header) {
      header.style.background = '#f8f9fa';
      header.style.borderColor = '#e9ecef';
      header.style.color = '#333333';
    }
    
    // Update drag handle
    const dragHandle = container.querySelector('#drag-handle');
    if (dragHandle) {
      dragHandle.style.background = '#e9ecef';
      dragHandle.style.borderColor = '#dee2e6';
      dragHandle.style.display = isFullScreen ? 'none' : 'flex';
      // Reset grip dots color
      const gripDots = dragHandle.querySelector('div');
      if (gripDots) {
        const dots = gripDots.querySelectorAll('div');
        dots.forEach(dot => {
          dot.style.background = '#666666';
        });
      }
    }
    
    // Update toolbar
    const toolbar = container.querySelector('#note-toolbar');
    if (toolbar) {
      toolbar.style.background = '#fafafa';
      toolbar.style.borderColor = '#f0f0f0';
    }
    
    // Update textarea
    const textarea = container.querySelector('#note-editor');
    if (textarea) {
      textarea.style.background = '#ffffff';
      textarea.style.color = '#333333';
    }
    
    // Update status bar
    const statusBar = container.querySelector('#status-bar');
    if (statusBar) {
      statusBar.style.background = '#fafafa';
      statusBar.style.borderColor = '#f0f0f0';
      statusBar.style.color = '#666666';
      
      // Update word count, cursor info, WPM, and save status colors
      const wordCount = statusBar.querySelector('#word-count');
      if (wordCount) {
        wordCount.style.color = '#666666';
      }
      
      const cursorInfo = statusBar.querySelector('#cursor-info');
      if (cursorInfo) {
        cursorInfo.style.color = '#666666';
      }
      
      const wpmInfo = statusBar.querySelector('#wpm-info');
      if (wpmInfo) {
        wpmInfo.style.color = '#666666';
      }
      
      const readingTime = statusBar.querySelector('#reading-time');
      if (readingTime) {
        readingTime.style.color = '#666666';
      }
      
      const sessionTime = statusBar.querySelector('#session-time');
      if (sessionTime) {
        sessionTime.style.color = '#666666';
      }
      
      const lastModified = statusBar.querySelector('#last-modified');
      if (lastModified) {
        lastModified.style.color = '#666666';
      }
      
    }
    
    // Reset all buttons (exclude tab close buttons to preserve inheritance)
    const buttons = container.querySelectorAll('button:not(.close-tab)');
    buttons.forEach(button => {
      button.style.background = 'transparent';
      button.style.borderColor = '#e9ecef';
      button.style.color = '#666666';
    });
    
    // Reset select elements
    const selects = container.querySelectorAll('select');
    selects.forEach(select => {
      select.style.background = '#ffffff';
      select.style.borderColor = '#e9ecef';
      select.style.color = '#333333';
    });
    
    // Reset tabs
    const tabs = container.querySelectorAll('.note-tab');
    tabs.forEach(tab => {
      if (tab.dataset.noteId === currentNoteId) {
        tab.style.background = '#007bff';
        tab.style.color = '#ffffff';
        tab.style.border = 'none';
      } else {
        tab.style.background = 'transparent';
        tab.style.color = '#666666';
        tab.style.border = '1px solid #e9ecef';
      }

      // Ensure close button inherits tab color
      const closeBtn = tab.querySelector('.close-tab');
      if (closeBtn) {
        closeBtn.style.color = 'inherit';
      }
    });
    
    // Reset category label
    const categoryLabel = container.querySelector('span');
    if (categoryLabel && categoryLabel.textContent === 'Category:') {
      categoryLabel.style.color = '#666666';
    }
  }
}

// Perform search across all notes
function performSearch() {
  const searchInput = document.querySelector('#note-search');
  const query = searchInput.value.trim().toLowerCase();
  
  if (!query) {
    clearSearch();
    return;
  }
  
  searchResults = [];
  
  Object.values(notes).forEach(note => {
    const firstLine = note.content.split('\n')[0].trim();
    const title = firstLine || 'Untitled Note';
    const titleMatch = title.toLowerCase().includes(query);
    const contentMatch = note.content.toLowerCase().includes(query);
    
    if (titleMatch || contentMatch) {
      searchResults.push({
        noteId: note.id,
        title: title,
        matches: {
          title: titleMatch,
          content: contentMatch
        }
      });
    }
  });
  
  if (searchResults.length > 0) {
    // Switch to first result
    switchToNote(searchResults[0].noteId);
    console.log(`Found ${searchResults.length} notes matching "${query}"`);
  } else {
    console.log(`No notes found matching "${query}"`);
  }
}

// Open search view
function openSearchView() {
  // Remove existing search view
  if (searchView) {
    searchView.remove();
  }
  
  // Create search overlay
  searchView = document.createElement('div');
  searchView.id = 'search-view';
  searchView.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 3000;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 100px;
  `;
  
  // Create search container
  const searchContainer = document.createElement('div');
  const containerBg = isDarkMode ? '#2d2d2d' : 'white';
  const containerBorder = isDarkMode ? '#404040' : 'transparent';
  searchContainer.style.cssText = `
    background: ${containerBg};
    border: 1px solid ${containerBorder};
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    width: 600px;
    max-height: 70vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;
  
  // Create search header
  const searchHeader = document.createElement('div');
  const headerBg = isDarkMode ? '#404040' : '#f8f9fa';
  const headerBorder = isDarkMode ? '#555555' : '#e9ecef';
  searchHeader.style.cssText = `
    padding: 16px 20px;
    border-bottom: 1px solid ${headerBorder};
    background: ${headerBg};
  `;
  
  const searchTitle = document.createElement('h3');
  searchTitle.textContent = 'Search Notes';
  const titleColor = isDarkMode ? '#e0e0e0' : '#333';
  searchTitle.style.cssText = `
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: ${titleColor};
  `;
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Type to search notes...';
  searchInput.id = 'fuzzy-search-input';
  const inputBg = isDarkMode ? '#1e1e1e' : '#ffffff';
  const inputBorder = isDarkMode ? '#555555' : '#e9ecef';
  const inputColor = isDarkMode ? '#e0e0e0' : '#333333';
  searchInput.style.cssText = `
    width: 100%;
    padding: 12px 16px;
    border: 2px solid ${inputBorder};
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    background: ${inputBg};
    color: ${inputColor};
  `;
  
  searchHeader.appendChild(searchTitle);
  searchHeader.appendChild(searchInput);
  
  // Create results container
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'search-results';
  resultsContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
  `;
  
  // Create footer
  const searchFooter = document.createElement('div');
  const footerBg = isDarkMode ? '#404040' : '#f8f9fa';
  const footerBorder = isDarkMode ? '#555555' : '#e9ecef';
  const footerColor = isDarkMode ? '#e0e0e0' : '#666';
  searchFooter.style.cssText = `
    padding: 12px 20px;
    border-top: 1px solid ${footerBorder};
    background: ${footerBg};
    font-size: 12px;
    color: ${footerColor};
    text-align: center;
    font-weight: 500;
  `;
  searchFooter.textContent = 'Use ↑↓ to navigate, Enter to select, Esc to close';
  
  // Assemble search view
  searchContainer.appendChild(searchHeader);
  searchContainer.appendChild(resultsContainer);
  searchContainer.appendChild(searchFooter);
  searchView.appendChild(searchContainer);
  document.body.appendChild(searchView);
  
  // Focus search input
  searchInput.focus();
  
  // Add event listeners
  searchInput.addEventListener('input', (e) => {
    performFuzzySearch(e.target.value);
  });
  
  searchInput.addEventListener('keydown', (e) => {
    handleSearchKeydown(e);
  });
  
  // Add focus states for better UX
  searchInput.addEventListener('focus', () => {
    if (isDarkMode) {
      searchInput.style.borderColor = '#0066cc';
      searchInput.style.boxShadow = '0 0 0 2px rgba(0, 102, 204, 0.2)';
    } else {
      searchInput.style.borderColor = '#007bff';
      searchInput.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.2)';
    }
  });
  
  searchInput.addEventListener('blur', () => {
    searchInput.style.boxShadow = 'none';
    if (isDarkMode) {
      searchInput.style.borderColor = '#555555';
    } else {
      searchInput.style.borderColor = '#e9ecef';
    }
  });
  
  // Close on overlay click
  searchView.addEventListener('click', (e) => {
    if (e.target === searchView) {
      closeSearchView();
    }
  });
  
  // Initial search
  performFuzzySearch('');
}

// Close search view
function closeSearchView() {
  if (searchView) {
    searchView.remove();
    searchView = null;
    searchMatches = [];
    selectedMatchIndex = 0;
  }
}

// Perform fuzzy search
function performFuzzySearch(query) {
  console.log('Performing fuzzy search for:', query);
  console.log('Available notes:', Object.keys(notes).length);
  
  if (!query.trim()) {
    searchMatches = [];
    updateSearchResults();
    return;
  }
  
  searchMatches = [];
  const queryLower = query.toLowerCase();
  
  Object.values(notes).forEach(note => {
    // Get title from first line of content
    const firstLine = note.content.split('\n')[0].trim();
    const title = firstLine || 'Untitled Note';
    
    const titleMatches = fuzzyMatch(title, queryLower);
    const contentMatches = fuzzyMatch(note.content, queryLower);
    
    console.log(`Note: ${title}, Title matches: ${titleMatches.length}, Content matches: ${contentMatches.length}`);
    
    if (titleMatches.length > 0 || contentMatches.length > 0) {
      searchMatches.push({
        noteId: note.id,
        title: title,
        category: note.category,
        titleMatches: titleMatches,
        contentMatches: contentMatches,
        score: calculateScore(title, note.content, queryLower)
      });
    }
  });
  
  console.log('Search matches found:', searchMatches.length);
  
  // Sort by score (best matches first)
  searchMatches.sort((a, b) => b.score - a.score);
  
  selectedMatchIndex = 0;
  updateSearchResults();
}

// Fuzzy match function
function fuzzyMatch(text, query) {
  if (!text || !query) return [];
  
  const matches = [];
  let textIndex = 0;
  let queryIndex = 0;
  
  while (textIndex < text.length && queryIndex < query.length) {
    if (text[textIndex].toLowerCase() === query[queryIndex]) {
      matches.push(textIndex);
      queryIndex++;
    }
    textIndex++;
  }
  
  return queryIndex === query.length ? matches : [];
}

// Calculate match score
function calculateScore(title, content, query) {
  const titleScore = title.toLowerCase().includes(query) ? 100 : 0;
  const contentScore = content.toLowerCase().includes(query) ? 50 : 0;
  const titleStartsWith = title.toLowerCase().startsWith(query) ? 50 : 0;
  
  return titleScore + contentScore + titleStartsWith;
}

// Update search results display
function updateSearchResults() {
  const resultsContainer = document.querySelector('#search-results');
  if (!resultsContainer) {
    console.log('Results container not found');
    return;
  }
  
  console.log('Updating search results, matches:', searchMatches.length);
  
  resultsContainer.innerHTML = '';
  
  if (searchMatches.length === 0) {
    const noResults = document.createElement('div');
    const noResultsColor = isDarkMode ? '#b0b0b0' : '#666';
    noResults.style.cssText = `
      padding: 20px;
      text-align: center;
      color: ${noResultsColor};
      font-style: italic;
    `;
    noResults.textContent = 'No notes found';
    resultsContainer.appendChild(noResults);
    return;
  }
  
  searchMatches.forEach((match, index) => {
    const resultItem = document.createElement('div');
    const isSelected = index === selectedMatchIndex;
    const itemBg = isSelected 
      ? (isDarkMode ? '#404040' : '#e3f2fd')
      : (isDarkMode ? '#2d2d2d' : 'white');
    const itemBorder = isDarkMode ? '#404040' : '#f0f0f0';
    
    resultItem.style.cssText = `
      padding: 12px 20px;
      border-bottom: 1px solid ${itemBorder};
      cursor: pointer;
      transition: background-color 0.2s;
      background: ${itemBg};
    `;
    
    const title = document.createElement('div');
    const titleColor = isDarkMode ? '#e0e0e0' : '#333';
    title.style.cssText = `
      font-weight: 600;
      color: ${titleColor};
      margin-bottom: 4px;
    `;
    title.textContent = match.title;
    
    const category = document.createElement('div');
    const categoryColor = isDarkMode ? '#b0b0b0' : '#666';
    category.style.cssText = `
      font-size: 11px;
      color: ${categoryColor};
      margin-bottom: 4px;
    `;
    category.textContent = match.category || 'Personal';
    
    const preview = document.createElement('div');
    const previewColor = isDarkMode ? '#b0b0b0' : '#666';
    preview.style.cssText = `
      font-size: 12px;
      color: ${previewColor};
      max-height: 40px;
      overflow: hidden;
    `;
    preview.textContent = match.contentMatches.length > 0 
      ? getContextAroundMatch(notes[match.noteId].content, match.contentMatches[0])
      : notes[match.noteId].content.substring(0, 100) + '...';
    
    resultItem.appendChild(title);
    resultItem.appendChild(category);
    resultItem.appendChild(preview);
    
    resultItem.addEventListener('click', () => {
      selectSearchResult(match);
    });
    
    resultsContainer.appendChild(resultItem);
  });
}

// Get context around match
function getContextAroundMatch(text, matchIndex) {
  const start = Math.max(0, matchIndex - 30);
  const end = Math.min(text.length, matchIndex + 70);
  const context = text.substring(start, end);
  return (start > 0 ? '...' : '') + context + (end < text.length ? '...' : '');
}

// Handle search keyboard navigation
function handleSearchKeydown(e) {
  switch (e.key) {
    case 'Escape':
      e.preventDefault();
      closeSearchView();
      break;
    case 'ArrowDown':
      e.preventDefault();
      selectedMatchIndex = Math.min(selectedMatchIndex + 1, searchMatches.length - 1);
      updateSearchResults();
      break;
    case 'ArrowUp':
      e.preventDefault();
      selectedMatchIndex = Math.max(selectedMatchIndex - 1, 0);
      updateSearchResults();
      break;
    case 'Enter':
      e.preventDefault();
      if (searchMatches[selectedMatchIndex]) {
        selectSearchResult(searchMatches[selectedMatchIndex]);
      }
      break;
  }
}

// Select search result
function selectSearchResult(match) {
  closeSearchView();
  switchToNote(match.noteId);
  
  // Find and highlight the search term in the editor
  const textarea = document.querySelector('#note-editor');
  if (textarea && match.contentMatches.length > 0) {
    const firstMatchIndex = match.contentMatches[0];
    const lastMatchIndex = match.contentMatches[match.contentMatches.length - 1];
    textarea.focus();
    
    // Select the entire matched text (from first to last character)
    textarea.setSelectionRange(firstMatchIndex, lastMatchIndex + 1);
    
    // Scroll to the match
    textarea.scrollTop = textarea.scrollHeight * (firstMatchIndex / textarea.value.length);
    
    console.log(`Selected text from ${firstMatchIndex} to ${lastMatchIndex + 1}: "${textarea.value.substring(firstMatchIndex, lastMatchIndex + 1)}"`);
  }
  
  console.log('Selected search result:', match.title);
}

// Show note preview on hover
function showNotePreview(noteId, tabElement) {
  // Multiple safety checks
  if (!notes[noteId]) return;
  if (noteId === currentNoteId) return;
  if (!tabElement || !tabElement.isConnected) return;
  
  // Remove existing preview
  hideNotePreview();
  
  // Get the sticky note container to constrain positioning
  const stickyContainer = document.getElementById('sticky-note-extension');
  if (!stickyContainer) return;
  
  const note = notes[noteId];
  const preview = document.createElement('div');
  preview.id = 'note-preview';
  const previewBg = isDarkMode ? '#2d2d2d' : 'white';
  const previewBorder = isDarkMode ? '#404040' : '#e9ecef';
  preview.style.cssText = `
    position: fixed;
    background: ${previewBg};
    border: 1px solid ${previewBorder};
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 12px;
    max-width: 300px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 2000;
    font-size: 12px;
    line-height: 1.4;
    pointer-events: none;
  `;
  
  const firstLine = note.content.split('\n')[0].trim();
  const title = document.createElement('div');
  const titleColor = isDarkMode ? '#e0e0e0' : '#333';
  title.style.cssText = `
    font-weight: bold;
    margin-bottom: 8px;
    color: ${titleColor};
  `;
  title.textContent = firstLine || 'Untitled Note';
  
  const category = document.createElement('div');
  const categoryColor = isDarkMode ? '#b0b0b0' : '#666';
  const categoryBg = isDarkMode ? '#404040' : '#f0f0f0';
  category.style.cssText = `
    font-size: 10px;
    color: ${categoryColor};
    margin-bottom: 8px;
    padding: 2px 6px;
    background: ${categoryBg};
    border-radius: 2px;
    display: inline-block;
  `;
  category.textContent = note.category || 'Personal';
  
  const content = document.createElement('div');
  const contentColor = isDarkMode ? '#b0b0b0' : '#666';
  content.style.cssText = `
    color: ${contentColor};
    max-height: 120px;
    overflow: hidden;
  `;
  content.textContent = note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '');
  
  preview.appendChild(title);
  preview.appendChild(category);
  preview.appendChild(content);
  
  // Position preview strictly below the tab with viewport constraints
  const tabRect = tabElement.getBoundingClientRect();
  const containerRect = stickyContainer.getBoundingClientRect();
  
  // Calculate position below the tab
  let left = tabRect.left + 10;
  let top = tabRect.bottom + 5;
  
  // Constrain to viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const previewWidth = 300; // max-width from CSS
  const previewHeight = 200; // max-height from CSS
  
  // Ensure preview doesn't go off the right edge
  if (left + previewWidth > viewportWidth) {
    left = viewportWidth - previewWidth - 10;
  }
  
  // Ensure preview doesn't go off the left edge
  if (left < 10) {
    left = 10;
  }
  
  // Ensure preview doesn't go off the bottom edge
  if (top + previewHeight > viewportHeight) {
    // Position above the tab instead
    top = tabRect.top - previewHeight - 5;
  }
  
  // Ensure preview doesn't go off the top edge
  if (top < 10) {
    top = 10;
  }
  
  // Final safety check - ensure preview is within sticky note container bounds
  const stickyRect = stickyContainer.getBoundingClientRect();
  if (left < stickyRect.left || left > stickyRect.right || 
      top < stickyRect.top || top > stickyRect.bottom) {
    // If preview would be outside sticky note, position it at the bottom of the sticky note
    left = stickyRect.left + 10;
    top = stickyRect.bottom - previewHeight - 10;
  }
  
  preview.style.left = left + 'px';
  preview.style.top = top + 'px';
  
  document.body.appendChild(preview);
}

// Hide note preview
function hideNotePreview() {
  const preview = document.getElementById('note-preview');
  if (preview) {
    preview.remove();
  }
}

// Global preview cleanup - call this whenever app state changes
function cleanupAllPreviews() {
  hideNotePreview();
  
  // Clear all preview timeouts by finding all tabs and clearing their timeouts
  const tabs = document.querySelectorAll('.note-tab');
  tabs.forEach(tab => {
    // This is a bit of a hack since we can't directly access the timeout
    // But it ensures any pending previews are cancelled
    tab.dispatchEvent(new Event('mouseleave'));
  });
}

// Constrain position to viewport boundaries
function constrainToViewport(element, x, y) {
  const elementRect = element.getBoundingClientRect();
  const elementWidth = elementRect.width;
  const elementHeight = elementRect.height;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const constrainedX = Math.max(0, Math.min(x, viewportWidth - elementWidth));
  const constrainedY = Math.max(0, Math.min(y, viewportHeight - elementHeight));
  
  return { x: constrainedX, y: constrainedY };
}

// Make element draggable
function makeDraggable(element, handle) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  handle.addEventListener('mousedown', (e) => {
    // Disable dragging when in full screen mode
    if (isFullScreen) {
      e.preventDefault();
      return;
    }
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = element.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    element.style.position = 'fixed';
    element.style.left = startLeft + 'px';
    element.style.top = startTop + 'px';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && !isFullScreen) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Calculate new position
      const newLeft = startLeft + deltaX;
      const newTop = startTop + deltaY;
      
      // Constrain to viewport boundaries
      const constrained = constrainToViewport(element, newLeft, newTop);
      
      // Apply constrained position
      element.style.left = constrained.x + 'px';
      element.style.top = constrained.y + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging && !isFullScreen) {
      isDragging = false;
      const rect = element.getBoundingClientRect();
      chrome.storage.sync.set({
        notePosition: { x: rect.left, y: rect.top }
      });
      // Broadcast new position to other tabs
      sendRealtimeUpdate('UI_STATE_CHANGED', {
        position: { x: Math.round(rect.left), y: Math.round(rect.top) }
      });
    }
  });
}

// Send real-time update to all tabs
function sendRealtimeUpdate(type, data) {
  chrome.runtime.sendMessage({
    type: 'REALTIME_UPDATE',
    updateType: type,
    data: data,
    timestamp: Date.now()
  });
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE_VISIBILITY':
      toggleVisibility(message.visible);
      break;
    case 'STORAGE_CHANGED':
      if (message.changes.notes) {
        notes = message.changes.notes.newValue || {};
        updateTabs();
        updateEditor();
      }
      break;
    case 'REALTIME_UPDATE':
      handleRealtimeUpdate(message.updateType, message.data, message.timestamp);
      break;
  }
});

// Handle real-time updates from other tabs
function handleRealtimeUpdate(updateType, data, timestamp) {
  // Ignore updates from the same tab (prevent echo)
  if (timestamp && Math.abs(Date.now() - timestamp) < 100) {
    return;
  }
  
  switch (updateType) {
    case 'CONTENT_CHANGED':
      if (data.noteId && notes[data.noteId]) {
        // Update content without triggering input event
        const textarea = document.querySelector('#note-editor');
        if (textarea && currentNoteId === data.noteId) {
          const currentCursor = textarea.selectionStart;
          const currentSelectionEnd = textarea.selectionEnd;
          
          notes[data.noteId].content = data.content;
          notes[data.noteId].updatedAt = new Date().toISOString();
          
          // Only update if content is different to avoid cursor jumping
          if (textarea.value !== data.content) {
            textarea.value = data.content;
            updateWordCount();
            updateTabs();
            
            // Restore cursor position if it hasn't moved much
            if (Math.abs(textarea.selectionStart - currentCursor) < 10) {
              textarea.setSelectionRange(currentCursor, currentSelectionEnd);
            }
          }
        } else {
          // Update the note content in memory
          notes[data.noteId].content = data.content;
          notes[data.noteId].updatedAt = new Date().toISOString();
          updateTabs();
        }
      }
      break;
    case 'NOTE_SWITCHED':
      if (data.noteId && notes[data.noteId] && data.noteId !== currentNoteId) {
        // Only switch if it's a different note to avoid infinite loops
        switchToNote(data.noteId);
      }
      break;
    case 'UI_STATE_CHANGED':
      if (data.darkMode !== undefined && data.darkMode !== isDarkMode) {
        isDarkMode = data.darkMode;
        applyDarkMode();
      }
      if (data.fullScreen !== undefined && data.fullScreen !== isFullScreen) {
        isFullScreen = data.fullScreen;
        applyFullScreen();
      }
      // Apply remote placement updates (position/size)
      if (!isFullScreen) {
        const container = document.getElementById('sticky-note-extension');
        if (container) {
          if (data.position && typeof data.position.x === 'number' && typeof data.position.y === 'number') {
            container.style.left = data.position.x + 'px';
            container.style.top = data.position.y + 'px';
            container.style.right = 'auto';
          }
          if (data.size && typeof data.size.width === 'number' && typeof data.size.height === 'number') {
            container.style.width = data.size.width + 'px';
            container.style.height = data.size.height + 'px';
          }
        }
      }
      break;
  }
}


function getDropPosition(targetTab, x) {
  const rect = targetTab.getBoundingClientRect();
  const centerX = rect.left + (rect.width / 2);
  return x < centerX ? 'before' : 'after';
}



function createDragTooltip(noteName) {
  if (dragTooltip) return dragTooltip;
  
  dragTooltip = document.createElement('div');
  dragTooltip.id = 'drag-tooltip';
  dragTooltip.textContent = noteName;
  dragTooltip.style.cssText = `
    position: fixed !important;
    pointer-events: none;
    z-index: 5000 !important;
    background: rgba(0, 123, 255, 0.9);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(8px);
    transform: translate(-50%, -100%);
    margin-top: -8px;
    transition: all 0.1s ease;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
  document.body.appendChild(dragTooltip);
  return dragTooltip;
}

function removeDragTooltip() {
  if (dragTooltip) {
    dragTooltip.remove();
    dragTooltip = null;
  }
}


// Clean up drag state to prevent UI breaking
function cleanupDragState() {
  // Reset all drag variables
  isTabDragging = false;
  draggedTab = null;
  dragOverTab = null;
  dragOverPosition = null;
  
  // Remove any existing tooltips
  removeDragTooltip();
  
  // Reset body styles
  document.body.style.userSelect = 'auto';
  document.body.style.cursor = 'auto';
  
  // Remove container classes
  const tabContainer = document.querySelector('#note-tabs');
  if (tabContainer) {
    tabContainer.classList.remove('tab-container-dragging');
  }
  
  // Clean up any tab hover effects
  const tabs = document.querySelectorAll('.note-tab');
  tabs.forEach(tab => {
    tab.classList.remove('tab-drag-over-right', 'tab-drag-over-left');
    tab.style.opacity = '';
    tab.style.cursor = '';
    tab.style.userSelect = '';
    tab.style.transform = '';
  });
}

// HTML5 drag and drop initialization
function initializeDragAndDrop() {
  if (document.documentElement.hasAttribute('data-drag-handler-added')) return;
  
  cleanupDragState();
  
  // Add drop zone to the tab container
  const tabContainer = document.querySelector('#note-tabs');
  if (tabContainer) {
    tabContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    
    tabContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      // Handle drop on empty space if needed
    });
  }
  
  document.documentElement.setAttribute('data-drag-handler-added', 'true');
  console.log('HTML5 drag and drop functionality initialized');
}

// Initialize the sticky note app
function initializeStickyNoteApp() {
  console.log('Initializing advanced sticky note app...');
  
  // Initialize drag and drop functionality
  initializeDragAndDrop();
  
  // Load notes first to get the correct visibility state
  loadNotes();
  
  console.log('Advanced sticky note app initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStickyNoteApp);
} else {
  initializeStickyNoteApp();
}
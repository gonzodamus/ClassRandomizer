// WoW Classes Data (embedded)
const WOW_CLASSES_DATA = {
  "classes": {
    "Death Knight": {
      "specs": {
        "Blood": { "role": "tank" },
        "Frost": { "role": "dps" },
        "Unholy": { "role": "dps" }
      }
    },
    "Demon Hunter": {
      "specs": {
        "Havoc": { "role": "dps" },
        "Vengeance": { "role": "tank" }
      }
    },
    "Druid": {
      "specs": {
        "Balance": { "role": "dps" },
        "Feral": { "role": "dps" },
        "Guardian": { "role": "tank" },
        "Restoration": { "role": "healer" }
      }
    },
    "Evoker": {
      "specs": {
        "Augmentation": { "role": "dps" },
        "Devastation": { "role": "dps" },
        "Preservation": { "role": "healer" }
      }
    },
    "Hunter": {
      "specs": {
        "Beast Mastery": { "role": "dps" },
        "Marksmanship": { "role": "dps" },
        "Survival": { "role": "dps" }
      }
    },
    "Mage": {
      "specs": {
        "Arcane": { "role": "dps" },
        "Fire": { "role": "dps" },
        "Frost": { "role": "dps" }
      }
    },
    "Monk": {
      "specs": {
        "Brewmaster": { "role": "tank" },
        "Mistweaver": { "role": "healer" },
        "Windwalker": { "role": "dps" }
      }
    },
    "Paladin": {
      "specs": {
        "Holy": { "role": "healer" },
        "Protection": { "role": "tank" },
        "Retribution": { "role": "dps" }
      }
    },
    "Priest": {
      "specs": {
        "Discipline": { "role": "healer" },
        "Holy": { "role": "healer" },
        "Shadow": { "role": "dps" }
      }
    },
    "Rogue": {
      "specs": {
        "Assassination": { "role": "dps" },
        "Outlaw": { "role": "dps" },
        "Subtlety": { "role": "dps" }
      }
    },
    "Shaman": {
      "specs": {
        "Elemental": { "role": "dps" },
        "Enhancement": { "role": "dps" },
        "Restoration": { "role": "healer" }
      }
    },
    "Warlock": {
      "specs": {
        "Affliction": { "role": "dps" },
        "Demonology": { "role": "dps" },
        "Destruction": { "role": "dps" }
      }
    },
    "Warrior": {
      "specs": {
        "Arms": { "role": "dps" },
        "Fury": { "role": "dps" },
        "Protection": { "role": "tank" }
      }
    }
  }
};

// Global state
let state = {
    players: [],
    assignments: {},
    remaining: [],
    usedHealerSpecs: new Set(),
    classCount: {},
    raidSize: 0,
    wowClasses: WOW_CLASSES_DATA
};

// DOM elements
const elements = {
    playerNames: document.getElementById('playerNames'),
    submitPlayers: document.getElementById('submitPlayers'),
    selectionSection: document.getElementById('selectionSection'),
    playerList: document.getElementById('playerList'),
    assignSelected: document.getElementById('assignSelected'),
    randomizeAll: document.getElementById('randomizeAll'),
    resultsSection: document.getElementById('resultsSection'),
    tankAssignments: document.getElementById('tankAssignments'),
    healerAssignments: document.getElementById('healerAssignments'),
    dpsAssignments: document.getElementById('dpsAssignments'),
    healerCount: document.getElementById('healerCount'),
    dpsCount: document.getElementById('dpsCount'),
    classSummary: document.getElementById('classSummary'),
    generateLink: document.getElementById('generateLink'),
    shareLink: document.getElementById('shareLink'),
    errorMessage: document.getElementById('errorMessage')
};

// Initialize the application
function init() {
    try {
        // Load state from localStorage
        loadState();
        
        // Check for URL parameters
        checkUrlParams();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update UI
        updateUI();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Application initialization failed. Please refresh the page.');
    }
}

// Set up event listeners
function setupEventListeners() {
    elements.submitPlayers.addEventListener('click', handleSubmitPlayers);
    elements.assignSelected.addEventListener('click', handleAssignSelected);
    elements.randomizeAll.addEventListener('click', handleRandomizeAll);
    elements.generateLink.addEventListener('click', handleGenerateLink);
}

// Handle player submission
function handleSubmitPlayers() {
    const names = elements.playerNames.value.trim();
    
    if (!names) {
        showError('Please enter player names.');
        return;
    }
    
    // Split by multiple separators: commas, spaces, and newlines
    const playerList = names
        .split(/[,\s\n\r]+/)  // Split by commas, spaces, newlines, or carriage returns
        .map(name => name.trim())
        .filter(name => name);
    
    if (playerList.length < 15 || playerList.length > 30) {
        showError('Please enter between 15 and 30 player names.');
        return;
    }
    
    // Initialize state
    state.players = playerList;
    state.remaining = [...playerList];
    state.assignments = {};
    state.usedHealerSpecs.clear();
    state.classCount = {};
    state.raidSize = playerList.length;
    
    // Save state
    saveState();
    
    // Update UI
    updateUI();
    
    // Show selection section
    elements.selectionSection.style.display = 'block';
    elements.resultsSection.style.display = 'none';
    
    hideError();
}

// Handle individual assignment
function handleAssignSelected() {
    const selectedPlayer = document.querySelector('input[name="player"]:checked');
    
    if (!selectedPlayer) {
        showError('Please select a player to assign.');
        return;
    }
    
    const playerName = selectedPlayer.value;
    const assignment = assignPlayer(playerName);
    
    if (assignment) {
        state.assignments[playerName] = assignment;
        state.remaining = state.remaining.filter(p => p !== playerName);
        
        // Update class count
        const className = assignment.class;
        state.classCount[className] = (state.classCount[className] || 0) + 1;
        
        // Update healer specs if applicable
        if (assignment.role === 'healer') {
            state.usedHealerSpecs.add(assignment.spec);
        }
        
        saveState();
        updateUI();
        
        // Check if all players are assigned
        if (state.remaining.length === 0) {
            elements.selectionSection.style.display = 'none';
            elements.resultsSection.style.display = 'block';
        }
    }
}

// Handle randomize all
function handleRandomizeAll() {
    if (state.remaining.length === 0) {
        showError('No players remaining to assign.');
        return;
    }
    
    // Randomize all remaining players
    const remainingPlayers = [...state.remaining];
    remainingPlayers.forEach(playerName => {
        const assignment = assignPlayer(playerName);
        if (assignment) {
            state.assignments[playerName] = assignment;
            
            // Update class count
            const className = assignment.class;
            state.classCount[className] = (state.classCount[className] || 0) + 1;
            
            // Update healer specs if applicable
            if (assignment.role === 'healer') {
                state.usedHealerSpecs.add(assignment.spec);
            }
        }
    });
    
    state.remaining = [];
    saveState();
    updateUI();
    
    // Show results
    elements.selectionSection.style.display = 'none';
    elements.resultsSection.style.display = 'block';
}

// Assignment algorithm
function assignPlayer(playerName) {
    const tankCount = Object.values(state.assignments).filter(a => a.role === 'tank').length;
    const healerCount = Object.values(state.assignments).filter(a => a.role === 'healer').length;
    const dpsCount = Object.values(state.assignments).filter(a => a.role === 'dps').length;
    
    // Determine required healers based on raid size
    const requiredHealers = getRequiredHealers(state.raidSize);
    
    // Assign tanks first
    if (tankCount < 2) {
        return assignTank();
    }
    
    // Assign healers
    if (healerCount < requiredHealers) {
        return assignHealer();
    }
    
    // Assign DPS
    return assignDPS();
}

// Assign tank
function assignTank() {
    const tankSpecs = [];
    const usedTankClasses = new Set();
    
    // Get all tank specs and their classes
    Object.entries(state.wowClasses.classes).forEach(([className, classData]) => {
        Object.entries(classData.specs).forEach(([specName, specData]) => {
            if (specData.role === 'tank') {
                tankSpecs.push({
                    class: className,
                    spec: specName,
                    role: 'tank'
                });
            }
        });
    });
    
    // Filter out already used tank classes
    const availableTankSpecs = tankSpecs.filter(spec => {
        const usedClasses = Object.values(state.assignments)
            .filter(a => a.role === 'tank')
            .map(a => a.class);
        return !usedClasses.includes(spec.class);
    });
    
    if (availableTankSpecs.length === 0) {
        // If no unique tank classes available, allow any tank
        return tankSpecs[Math.floor(Math.random() * tankSpecs.length)];
    }
    
    return availableTankSpecs[Math.floor(Math.random() * availableTankSpecs.length)];
}

// Assign healer
function assignHealer() {
    const healerSpecs = [];
    
    // Get all healer specs
    Object.entries(state.wowClasses.classes).forEach(([className, classData]) => {
        Object.entries(classData.specs).forEach(([specName, specData]) => {
            if (specData.role === 'healer' && !state.usedHealerSpecs.has(specName)) {
                healerSpecs.push({
                    class: className,
                    spec: specName,
                    role: 'healer'
                });
            }
        });
    });
    
    if (healerSpecs.length === 0) {
        showError('No more unique healer specs available.');
        return null;
    }
    
    return healerSpecs[Math.floor(Math.random() * healerSpecs.length)];
}

// Assign DPS
function assignDPS() {
    const dpsSpecs = [];
    const missingClasses = getMissingClasses();
    
    // If we have missing classes, prioritize them
    if (missingClasses.length > 0) {
        missingClasses.forEach(className => {
            const classData = state.wowClasses.classes[className];
            Object.entries(classData.specs).forEach(([specName, specData]) => {
                if (specData.role === 'dps') {
                    dpsSpecs.push({
                        class: className,
                        spec: specName,
                        role: 'dps'
                    });
                }
            });
        });
        
        return dpsSpecs[Math.floor(Math.random() * dpsSpecs.length)];
    }
    
    // Otherwise, random DPS assignment
    Object.entries(state.wowClasses.classes).forEach(([className, classData]) => {
        Object.entries(classData.specs).forEach(([specName, specData]) => {
            if (specData.role === 'dps') {
                dpsSpecs.push({
                    class: className,
                    spec: specName,
                    role: 'dps'
                });
            }
        });
    });
    
    return dpsSpecs[Math.floor(Math.random() * dpsSpecs.length)];
}

// Get required healers based on raid size
function getRequiredHealers(raidSize) {
    if (raidSize >= 15 && raidSize <= 19) return 3;
    if (raidSize >= 20 && raidSize <= 24) return 4;
    if (raidSize >= 25 && raidSize <= 30) return 5;
    return 3; // Default
}

// Get missing classes
function getMissingClasses() {
    const allClasses = Object.keys(state.wowClasses.classes);
    const usedClasses = Object.keys(state.classCount);
    return allClasses.filter(className => !usedClasses.includes(className));
}

// Update UI
function updateUI() {
    updatePlayerList();
    updateResults();
    updateClassSummary();
}

// Update player list
function updatePlayerList() {
    elements.playerList.innerHTML = '';
    
    state.remaining.forEach(playerName => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.innerHTML = `
            <input type="radio" name="player" value="${playerName}" id="player_${playerName}">
            <label for="player_${playerName}">${playerName}</label>
        `;
        elements.playerList.appendChild(playerItem);
    });
}

// Update results
function updateResults() {
    const tankAssignments = Object.entries(state.assignments).filter(([_, assignment]) => assignment.role === 'tank');
    const healerAssignments = Object.entries(state.assignments).filter(([_, assignment]) => assignment.role === 'healer');
    const dpsAssignments = Object.entries(state.assignments).filter(([_, assignment]) => assignment.role === 'dps');
    
    // Update tank assignments
    elements.tankAssignments.innerHTML = '';
    tankAssignments.forEach(([playerName, assignment]) => {
        const item = createAssignmentItem(playerName, assignment);
        elements.tankAssignments.appendChild(item);
    });
    
    // Update healer assignments
    elements.healerAssignments.innerHTML = '';
    healerAssignments.forEach(([playerName, assignment]) => {
        const item = createAssignmentItem(playerName, assignment);
        elements.healerAssignments.appendChild(item);
    });
    
    // Update DPS assignments
    elements.dpsAssignments.innerHTML = '';
    dpsAssignments.forEach(([playerName, assignment]) => {
        const item = createAssignmentItem(playerName, assignment);
        elements.dpsAssignments.appendChild(item);
    });
    
    // Update counts
    elements.healerCount.textContent = healerAssignments.length;
    elements.dpsCount.textContent = dpsAssignments.length;
}

// Create assignment item
function createAssignmentItem(playerName, assignment) {
    const item = document.createElement('div');
    item.className = 'assignment-item';
    item.innerHTML = `
        <span class="player-name">${playerName}</span>
        <span class="class-spec">${assignment.class} - ${assignment.spec}</span>
    `;
    return item;
}

// Update class summary
function updateClassSummary() {
    elements.classSummary.innerHTML = '';
    
    Object.entries(state.classCount).forEach(([className, count]) => {
        const classItem = document.createElement('div');
        classItem.className = 'class-count';
        classItem.innerHTML = `
            <div class="class-name">${className}</div>
            <div class="count">${count}</div>
        `;
        elements.classSummary.appendChild(classItem);
    });
}

// Handle generate link
function handleGenerateLink() {
    const url = generateShareUrl();
    elements.shareLink.innerHTML = `
        <strong>Share Link:</strong><br>
        <a href="${url}" target="_blank">${url}</a>
    `;
    elements.shareLink.style.display = 'block';
}

// Generate share URL
function generateShareUrl() {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    // Add players
    params.set('players', state.players.join(','));
    
    // Add assignments
    const assignments = Object.entries(state.assignments).map(([player, assignment]) => 
        `${player}:${assignment.class}:${assignment.spec}:${assignment.role}`
    );
    if (assignments.length > 0) {
        params.set('assignments', assignments.join('|'));
    }
    
    return `${baseUrl}?${params.toString()}`;
}

// Check URL parameters
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const players = urlParams.get('players');
    const assignments = urlParams.get('assignments');
    
    if (players) {
        elements.playerNames.value = players;
        handleSubmitPlayers();
        
        if (assignments) {
            // Parse assignments
            const assignmentList = assignments.split('|');
            assignmentList.forEach(assignmentStr => {
                const [playerName, className, specName, role] = assignmentStr.split(':');
                state.assignments[playerName] = { class: className, spec: specName, role: role };
                state.remaining = state.remaining.filter(p => p !== playerName);
                
                // Update class count
                state.classCount[className] = (state.classCount[className] || 0) + 1;
                
                // Update healer specs
                if (role === 'healer') {
                    state.usedHealerSpecs.add(specName);
                }
            });
            
            saveState();
            updateUI();
            
            if (state.remaining.length === 0) {
                elements.selectionSection.style.display = 'none';
                elements.resultsSection.style.display = 'block';
            }
        }
    }
}

// Save state to localStorage
function saveState() {
    const stateToSave = {
        ...state,
        usedHealerSpecs: Array.from(state.usedHealerSpecs)
    };
    localStorage.setItem('wowRandomizer', JSON.stringify(stateToSave));
}

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('wowRandomizer');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        state = {
            ...parsedState,
            usedHealerSpecs: new Set(parsedState.usedHealerSpecs || [])
        };
        
        // Restore UI
        if (state.players.length > 0) {
            elements.playerNames.value = state.players.join(', ');
            elements.selectionSection.style.display = 'block';
            if (state.remaining.length === 0) {
                elements.resultsSection.style.display = 'block';
            }
        }
    }
}

// Show error message
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
}

// Hide error message
function hideError() {
    elements.errorMessage.style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 
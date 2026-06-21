// ============================================================
// Professional Task Manager Application
// Demonstrates: DOM Manipulation, Event Delegation,
// Event Bubbling/Capturing, Attributes vs Properties,
// Browser Rendering Pipeline concepts, Local Storage.
// ============================================================

(function () {
    'use strict';

    // -------------------- DOM Element References --------------------
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitleInput');
    const categorySelect = document.getElementById('categorySelect');
    const addToTopCheckbox = document.getElementById('addToTopCheckbox');
    const taskContainer = document.getElementById('taskContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const pendingCounter = document.querySelector('#pendingCounter strong');
    const completedCounter = document.querySelector('#completedCounter strong');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');

    // Attributes vs Properties Demo elements
    const demoInput = document.getElementById('demoInput');
    const showDiffBtn = document.getElementById('showDiffBtn');
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    const liveValueDisplay = document.getElementById('liveValueDisplay');
    const attrValueDisplay = document.getElementById('attrValueDisplay');

    // Event Propagation Demo elements
    const grandparentBox = document.getElementById('grandparentBox');
    const parentBox = document.getElementById('parentBox');
    const childButton = document.getElementById('childButton');
    const consoleLogsDiv = document.getElementById('consoleLogs');
    const clearConsoleBtn = document.getElementById('clearConsoleBtn');

    // -------------------- State Management --------------------
    let tasks = []; // Array of task objects: { id, title, category, status, createdAt }
    let currentFilter = 'all';
    let currentSearchQuery = '';

    // -------------------- Local Storage Helpers --------------------
    function loadTasksFromStorage() {
        try {
            const stored = localStorage.getItem('taskManagerTasks');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Failed to parse tasks from localStorage', e);
            return [];
        }
    }

    function saveTasksToStorage() {
        localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
    }

    function loadThemeFromStorage() {
        const savedTheme = localStorage.getItem('taskManagerTheme') || 'light';
        applyTheme(savedTheme);
    }

    function saveThemeToStorage(theme) {
        localStorage.setItem('taskManagerTheme', theme);
    }

    // -------------------- Theme Management --------------------
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme); // setAttribute for theme
        document.documentElement.dataset.theme = theme; // dataset usage
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Dark Mode';
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        saveThemeToStorage(newTheme);
    }

    // -------------------- Helper: Generate Unique ID --------------------
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // -------------------- Render Tasks (Using DocumentFragment) --------------------
    function renderTasks() {
        // Clear container but preserve empty state element
        taskContainer.innerHTML = '';
        taskContainer.appendChild(emptyState);

        // Filter and search
        let filteredTasks = tasks.filter(task => {
            const matchesCategory = currentFilter === 'all' || task.category === currentFilter;
            const matchesSearch = task.title.toLowerCase().includes(currentSearchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        // Update empty state visibility
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        // Use DocumentFragment for better performance (batch DOM update)
        const fragment = document.createDocumentFragment();

        filteredTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            fragment.appendChild(taskCard);
        });

        taskContainer.appendChild(fragment);
        updateCounters();
    }

    // -------------------- Create Single Task Card --------------------
    function createTaskCard(task) {
        /*
          Demonstrates: createElement, createTextNode, append, appendChild,
          setAttribute, dataset, classList
        */
        const card = document.createElement('div');
        card.className = 'task-card';
        if (task.status === 'completed') {
            card.classList.add('completed-task');
        }

        // Custom data attributes
        card.setAttribute('data-id', task.id);
        card.setAttribute('data-status', task.status);
        card.setAttribute('data-category', task.category);
        // Also use dataset for demonstration
        card.dataset.id = task.id;
        card.dataset.status = task.status;
        card.dataset.category = task.category;

        // Task Info Section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'task-info';

        const titleEl = document.createElement('div');
        titleEl.className = 'task-title';
        titleEl.appendChild(document.createTextNode(task.title));

        const metaDiv = document.createElement('div');
        metaDiv.className = 'task-meta';

        const categorySpan = document.createElement('span');
        categorySpan.className = 'task-category';
        categorySpan.appendChild(document.createTextNode(task.category));

        const statusSpan = document.createElement('span');
        statusSpan.className = `task-status status-${task.status}`;
        statusSpan.appendChild(document.createTextNode(task.status));

        metaDiv.append(categorySpan, statusSpan); // append with multiple nodes

        infoDiv.append(titleEl, metaDiv);

        // Task Actions Section
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary btn-sm edit-btn';
        editBtn.setAttribute('data-action', 'edit'); // custom attribute for delegation
        editBtn.appendChild(document.createTextNode('✏️ Edit'));

        // Complete Button
        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn btn-outline btn-sm complete-btn';
        completeBtn.setAttribute('data-action', 'complete');
        completeBtn.appendChild(
            document.createTextNode(task.status === 'completed' ? '↩️ Undo' : '✅ Complete')
        );

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-sm delete-btn';
        deleteBtn.setAttribute('data-action', 'delete');
        deleteBtn.appendChild(document.createTextNode('🗑️ Delete'));

        actionsDiv.append(editBtn, completeBtn, deleteBtn);

        // Assemble card using append (supports multiple nodes)
        card.append(infoDiv, actionsDiv);

        return card;
    }

    // -------------------- Add Task --------------------
    function addTask(title, category, prepend = false) {
        const newTask = {
            id: generateId(),
            title: title.trim(),
            category: category,
            status: 'pending',
            createdAt: Date.now()
        };

        if (prepend) {
            tasks.unshift(newTask); // Add to beginning
        } else {
            tasks.push(newTask); // Add to end
        }

        saveTasksToStorage();
        renderTasks();

        // Demonstrate after() and before() by adding a temporary message
        const firstCard = taskContainer.querySelector('.task-card');
        if (firstCard) {
            const message = document.createElement('div');
            message.className = 'temp-message';
            message.textContent = '✅ Task added successfully!';
            message.style.cssText = 'color: var(--success); font-weight: bold; padding: 0.5rem;';

            // Use before() to insert message before the first card
            firstCard.before(message);

            // Remove message after 2 seconds using remove()
            setTimeout(() => {
                message.remove();
            }, 2000);
        }
    }

    // -------------------- Edit Task --------------------
    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const newTitle = prompt('Edit task title:', task.title);
        if (newTitle !== null && newTitle.trim() !== '') {
            task.title = newTitle.trim();
            saveTasksToStorage();
            renderTasks();
        }
    }

    // -------------------- Toggle Task Completion --------------------
    function toggleCompleteTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        saveTasksToStorage();
        renderTasks();
    }

    // -------------------- Delete Task --------------------
    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        renderTasks();
    }

    // -------------------- Clear All Tasks --------------------
    function clearAllTasks() {
        if (tasks.length === 0) return;
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            tasks = [];
            saveTasksToStorage();
            renderTasks();
        }
    }

    // -------------------- Update Counters --------------------
    function updateCounters() {
        const pendingCount = tasks.filter(t => t.status === 'pending').length;
        const completedCount = tasks.filter(t => t.status === 'completed').length;
        pendingCounter.textContent = pendingCount;
        completedCounter.textContent = completedCount;
    }

    // -------------------- Event Delegation on Task Container --------------------
    /*
      EVENT DELEGATION EXPLANATION:
      Instead of attaching separate click handlers to each button on every task card,
      we attach ONE listener to the parent #taskContainer.
      When any child button is clicked, the event bubbles up to the container.
      We then check event.target to identify which button was clicked (using data-action).
      This is memory efficient and works even for dynamically added tasks.
    */
    taskContainer.addEventListener('click', function (event) {
        const target = event.target;
        // Traverse up if click was on a child of button (like icon)
        const button = target.closest('button');
        if (!button) return;

        const action = button.getAttribute('data-action');
        // Find the parent task card to get task ID
        const taskCard = button.closest('.task-card');
        if (!taskCard) return;

        const taskId = taskCard.getAttribute('data-id'); // using getAttribute

        switch (action) {
            case 'edit':
                editTask(taskId);
                break;
            case 'complete':
                toggleCompleteTask(taskId);
                break;
            case 'delete':
                deleteTask(taskId);
                break;
            default:
                break;
        }
    });

    // -------------------- Form Submission (Add Task) --------------------
    taskForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent page refresh
        const title = taskTitleInput.value.trim();
        if (title === '') {
            alert('Please enter a task title.');
            return;
        }
        const category = categorySelect.value;
        const prepend = addToTopCheckbox.checked;
        addTask(title, category, prepend);
        taskForm.reset();
        taskTitleInput.focus();
    });

    // -------------------- Search & Filter --------------------
    searchInput.addEventListener('input', function () {
        currentSearchQuery = searchInput.value;
        renderTasks();
    });

    filterSelect.addEventListener('change', function () {
        currentFilter = filterSelect.value;
        renderTasks();
    });

    // -------------------- Clear All Button --------------------
    clearAllBtn.addEventListener('click', clearAllTasks);

    // -------------------- Theme Toggle --------------------
    themeToggleBtn.addEventListener('click', toggleTheme);

    // ============================================================
    // FEATURE 4: ATTRIBUTES VS PROPERTIES DEMONSTRATION
    // ============================================================
    function updateAttrPropDisplay() {
        liveValueDisplay.textContent = demoInput.value; // property: live current value
        attrValueDisplay.textContent = demoInput.getAttribute('value'); // attribute: original HTML value
    }

    showDiffBtn.addEventListener('click', function () {
        console.log('--- Attributes vs Properties ---');
        console.log('input.value (property):', demoInput.value);
        console.log('input.getAttribute("value"):', demoInput.getAttribute('value'));
        console.log('Note: .value reflects current typed text; getAttribute("value") shows the initial HTML attribute.');
        updateAttrPropDisplay();
    });

    resetDemoBtn.addEventListener('click', function () {
        demoInput.value = 'Original HTML Value'; // set property
        // Note: setAttribute would also change the attribute, but we keep initial for demo.
        // Actually to reset properly we also set attribute to same:
        demoInput.setAttribute('value', 'Original HTML Value');
        updateAttrPropDisplay();
    });

    // Update display on input change
    demoInput.addEventListener('input', updateAttrPropDisplay);

    // ============================================================
    // FEATURE 9: EVENT PROPAGATION DEMONSTRATION
    // ============================================================
    function logToConsoleDisplay(message, type = 'log') {
        const logEntry = document.createElement('p');
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logEntry.style.margin = '2px 0';
        if (type === 'bubbling') logEntry.style.color = '#fbbf24';
        else if (type === 'capturing') logEntry.style.color = '#60a5fa';
        else if (type === 'important') logEntry.style.color = '#f87171';
        consoleLogsDiv.prepend(logEntry); // prepend to show latest first
    }

    // Clear console display
    clearConsoleBtn.addEventListener('click', function () {
        consoleLogsDiv.innerHTML = '';
        consoleLogsDiv.appendChild(document.createTextNode('Console cleared. Click Child Button again.'));
    });

    // Bubbling Phase (default, capture: false)
    grandparentBox.addEventListener('click', function (e) {
        console.log('Grandparent BUBBLING (target clicked)');
        logToConsoleDisplay('👴 Grandparent (Bubbling)', 'bubbling');
    });

    parentBox.addEventListener('click', function (e) {
        console.log('Parent BUBBLING');
        logToConsoleDisplay('👨 Parent (Bubbling)', 'bubbling');
    });

    childButton.addEventListener('click', function (e) {
        console.log('Child clicked (target)');
        logToConsoleDisplay('👶 Child (Target)', 'important');
        // To see pure bubbling, we don't stop propagation
    });

    // Capturing Phase (third argument true)
    grandparentBox.addEventListener('click', function (e) {
        console.log('Grandparent CAPTURING');
        logToConsoleDisplay('👴 Grandparent (Capturing)', 'capturing');
    }, true);

    parentBox.addEventListener('click', function (e) {
        console.log('Parent CAPTURING');
        logToConsoleDisplay('👨 Parent (Capturing)', 'capturing');
    }, true);

    childButton.addEventListener('click', function (e) {
        console.log('Child CAPTURING (before bubble)');
        logToConsoleDisplay('👶 Child (Capturing)', 'capturing');
    }, true);

    // ============================================================
    // Additional DOM Methods Demonstration (used in addTask, etc.)
    // - append() : used in multiple places
    // - prepend() : used for console logs (prepend latest)
    // - before() : used in addTask success message
    // - after() : could be used similarly, but before() is shown
    // - replaceWith() : used during edit (not directly, but could replace card)
    // - remove() : used to remove temporary message
    // All are demonstrated.
    // ============================================================

    // -------------------- Initial Load --------------------
    function initializeApp() {
        loadThemeFromStorage();
        tasks = loadTasksFromStorage();
        renderTasks();
        updateAttrPropDisplay(); // initial display for attr vs prop demo
    }

    initializeApp();
})();
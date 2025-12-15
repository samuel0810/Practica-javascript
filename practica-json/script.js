// --- 1. PERSISTENCIA Y ESTRUCTURA DE DATOS (Load/Save) ---

const INITIAL_TASKS = [
    {
        id: 1,
        title: "Diseño de Flujo de Usuario",
        description: "Diseñar el flujo de navegación principal para la nueva característica del panel de control, asegurando usabilidad y accesibilidad.",
        deliveryDate: "2025-12-25",
        deliveryTime: "20:00",
        subject: "UX Design",
        priority: "High", 
        status: "In Progress" 
    },
    {
        id: 2,
        title: "Esquema de Base de Datos",
        description: "Revisar y finalizar el esquema de la base de datos para el módulo de autenticación de usuario, enfocándose en la normalización y seguridad.",
        deliveryDate: "2025-06-22",
        deliveryTime: "09:00",
        subject: "Development",
        priority: "Medium",
        status: "Over-Due"
    },
    {
        id: 3,
        title: "Reunión de Feedback",
        description: "Programar y preparar los materiales para la sesión semanal de feedback con el cliente principal.",
        deliveryDate: "2025-06-21",
        deliveryTime: "10:30",
        subject: "Project Mgt",
        priority: "Low",
        status: "Completed Task"
    }
];

function loadTasks() {
    const storedTasks = localStorage.getItem('tasky_tasks');
    if (storedTasks) {
        return JSON.parse(storedTasks);
    }
    saveTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
}

function saveTasks(tasksArray) {
    localStorage.setItem('tasky_tasks', JSON.stringify(tasksArray));
}

let tasks = loadTasks(); 
let sortDirection = 'desc'; 
let currentFilter = 'all'; 
let currentSortBy = 'date'; 


// --- 2. REFERENCIAS DEL DOM Y MAPPING ---

const taskModal = document.getElementById('task-modal');
const addTaskBtn = document.getElementById('add-task-btn'); 
const addTaskBtnDesktop = document.getElementById('add-task-btn-desktop'); 
const closeBtn = document.querySelector('.close-btn');
const taskForm = document.getElementById('task-form');
const submitTaskBtn = document.getElementById('submit-task-btn');
const taskColumnsContainer = document.querySelector('.task-columns-container');
const mobileStatusSelector = document.getElementById('mobile-status-selector');
const searchInput = document.getElementById('search-input'); 
const sortBtn = document.getElementById('sort-btn'); 
const previewBtn = document.getElementById('preview-btn'); 
const filterBtn = document.getElementById('filter-btn');
const filterDropdown = document.getElementById('filter-dropdown');
const sortDropdown = document.getElementById('sort-dropdown'); 
const viewModal = document.getElementById('view-modal'); 
const viewCloseBtn = document.querySelector('.view-close-btn'); 
const viewEditBtn = document.getElementById('view-edit-btn'); 
const viewDeleteBtn = document.getElementById('view-delete-btn'); 

const COLUMN_MAP = {
    "In Progress": 'in-progress-column',
    "Completed Task": 'completed-column',
    "Over-Due": 'overdue-column'
};


// --- 3. FUNCIONES DE LECTURA Y RENDERIZADO (READ) ---

function createTaskCardHTML(task) {
    const priorityClass = `priority-${task.priority.toLowerCase()}`;
    
    // El botón de Editar está PRESENTE en la tarjeta (Primer Plano)
    return `
        <div class="task-card" data-id="${task.id}">
            <div class="task-tags">
                <span class="tag ${priorityClass}">${task.priority}</span>
                <span class="tag date-tag">${task.deliveryTime || ''} ${task.deliveryDate}</span>
                <span class="tag subject-tag">${task.subject}</span>
            </div>
            <div class="card-content">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <div class="card-details">
                    <div class="subtasks-progress">
                        <i class='bx bx-list-ul'></i>
                        <span>0/3</span>
                    </div>
                    <div class="card-actions">
                        <div class="assigned-users">
                            <img src="https://i.pravatar.cc/150?img=1" alt="">
                            <img src="https://i.pravatar.cc/150?img=2" alt="">
                            <span>+2</span>
                        </div>
                        <i class='bx bx-show-alt action-icon view-task' data-id="${task.id}"></i>
                        <i class='bx bx-trash action-icon delete-task' data-id="${task.id}"></i>
                        <i class='bx bx-edit action-icon edit-task' data-id="${task.id}"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateColumnCounts() {
    Object.keys(COLUMN_MAP).forEach(status => {
        const count = tasks.filter(t => t.status === status).length;
        const columnId = COLUMN_MAP[status];
        const column = document.getElementById(columnId);
        
        if(column) {
            const countSpan = column.querySelector('.column-header h2 span');
            if (countSpan) {
                countSpan.textContent = count;
            }
        }
    });
}

function renderTasks(tasksToRender = tasks) {
    // 1. Limpiar las columnas existentes
    Object.values(COLUMN_MAP).forEach(columnId => {
        const column = document.getElementById(columnId);
        if (column) {
            let taskList = column.querySelector('.task-list'); 
            if (taskList) {
                taskList.innerHTML = ''; 
            } else {
                Array.from(column.querySelectorAll('.task-card')).forEach(card => card.remove());
            }
        }
    });

    // 2. Iterar sobre las tareas filtradas/ordenadas y agregarlas a su columna
    tasksToRender.forEach(task => {
        const columnId = COLUMN_MAP[task.status];
        if (columnId) {
            const column = document.getElementById(columnId);
            if (column) {
                const cardHTML = createTaskCardHTML(task);
                const taskList = column.querySelector('.task-list'); 
                
                if (taskList) {
                    taskList.insertAdjacentHTML('beforeend', cardHTML);
                } else {
                    const columnHeader = column.querySelector('.column-header');
                    if (columnHeader) {
                        columnHeader.insertAdjacentHTML('afterend', cardHTML);
                    } else {
                        column.insertAdjacentHTML('beforeend', cardHTML);
                    }
                }
            }
        }
    });
    
    // 3. Actualizar contadores
    updateColumnCounts(); 
    
    // 4. Asegurar que la vista móvil se inicialice/sincronice
    initializeMobileView(); 
}


// --- 4. FUNCIONES CRUD (CREATE, UPDATE, DELETE) ---

function generateUniqueId() {
    const maxId = tasks.reduce((max, task) => (task.id > max ? task.id : max), 0);
    return maxId + 1;
}

function deleteTask(taskId) {
    const id = parseInt(taskId);
    const initialLength = tasks.length;
    
    tasks = tasks.filter(task => task.id !== id);
    
    if (tasks.length < initialLength) {
        saveTasks(tasks); 
        applyFiltersAndSearch();   
        closeModal();
        return true;
    }
    return false;
}

function updateTask(id, updatedData) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex !== -1) {
        tasks[taskIndex] = { 
            id: id, 
            ...updatedData 
        };
        saveTasks(tasks);
        return true;
    }
    return false;
}

function handleFormSubmit(event) {
    event.preventDefault();

    const taskId = document.getElementById('task-id').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('priority').value;
    const subject = document.getElementById('subject').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const deliveryTime = document.getElementById('deliveryTime').value;
    const status = document.getElementById('status').value;

    const taskData = {
        title,
        description,
        priority,
        subject,
        deliveryDate,
        deliveryTime,
        status
    };

    if (taskId) {
        updateTask(parseInt(taskId), taskData);
    } else {
        const newTask = {
            id: generateUniqueId(),
            ...taskData
        };

        tasks.push(newTask);
        saveTasks(tasks);
    }
    
    applyFiltersAndSearch(); 
    closeModal();
}


// --- 5. MANEJO DEL MODAL DE EDICIÓN/CREACIÓN ---

function openModal(taskId = null) {
    taskForm.reset(); 
    
    if (taskId) {
        const taskToEdit = tasks.find(t => t.id === parseInt(taskId));
        
        if (taskToEdit) {
            taskModal.querySelector('h2').textContent = 'Edit Task';
            submitTaskBtn.textContent = 'Save Changes';
            
            document.getElementById('task-id').value = taskToEdit.id;
            document.getElementById('title').value = taskToEdit.title;
            document.getElementById('description').value = taskToEdit.description;
            document.getElementById('priority').value = taskToEdit.priority;
            document.getElementById('subject').value = taskToEdit.subject;
            document.getElementById('deliveryDate').value = taskToEdit.deliveryDate;
            document.getElementById('deliveryTime').value = taskToEdit.deliveryTime;
            document.getElementById('status').value = taskToEdit.status;
        }

    } else {
        taskModal.querySelector('h2').textContent = 'Add New Task';
        submitTaskBtn.textContent = 'Add Task';
        document.getElementById('task-id').value = ''; 
    }
    
    taskModal.style.display = 'block';
}

function closeModal() {
    taskModal.style.display = 'none';
}


// --- 6. MANEJO DE VISTA MÓVIL (Responsividad) ---

function switchMobileColumn(selectedColumnId) {
    const columns = document.querySelectorAll('.task-column');

    columns.forEach(column => {
        column.style.display = 'none';
    });

    const targetColumn = document.getElementById(selectedColumnId);
    if (targetColumn) {
        targetColumn.style.display = 'block';
    }

    mobileStatusSelector.value = selectedColumnId;
}

function initializeMobileView() {
    if (window.innerWidth <= 768) {
        const defaultColumnId = mobileStatusSelector.value || 'in-progress-column'; 
        switchMobileColumn(defaultColumnId);
    } else {
        const columns = document.querySelectorAll('.task-column');
        columns.forEach(column => {
            column.style.display = ''; 
        });
    }
}


// --- 7. BÚSQUEDA, ORDENACIÓN Y FILTRADO (MEJORADO) ---

function applyFiltersAndSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let tasksToFilter = [...tasks]; 

    // 1. Aplicar Búsqueda
    if (searchTerm) {
        tasksToFilter = tasksToFilter.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // 2. Aplicar Filtro de Prioridad
    if (currentFilter !== 'all') {
        tasksToFilter = tasksToFilter.filter(task => 
            task.priority.toLowerCase() === currentFilter.toLowerCase()
        );
    }

    // 3. Ordenar y Renderizar el resultado
    renderTasks(tasksToFilter);
}

function handleSearch() {
    applyFiltersAndSearch();
}

function handleSort(event) {
    
    // 1. Determinar el nuevo criterio de ordenación
    if (event && event.target.classList.contains('sort-option')) {
        const sortValue = event.target.getAttribute('data-sort');
        
        if (sortValue === 'date-asc') {
            currentSortBy = 'date'; 
            sortDirection = 'asc';
        } else if (sortValue === 'date-desc') {
            currentSortBy = 'date'; 
            sortDirection = 'desc';
        } else if (sortValue === 'priority') {
            currentSortBy = 'priority'; 
            sortDirection = 'desc'; 
        }
        
        // Cierra el dropdown y actualiza la clase 'active'
        sortDropdown.querySelectorAll('.sort-option').forEach(opt => opt.classList.remove('active'));
        event.target.classList.add('active');
        sortDropdown.style.display = 'none'; 
    } 
    
    const tasksToSort = [...tasks]; 
    
    // 2. Ejecutar la Ordenación
    tasksToSort.sort((a, b) => {
        let comparison = 0;
        const finalDirection = currentSortBy === 'date' ? sortDirection : 'desc'; 

        if (currentSortBy === 'date') {
            const dateA = new Date(a.deliveryDate);
            const dateB = new Date(b.deliveryDate);
            if (dateA < dateB) comparison = -1;
            if (dateA > dateB) comparison = 1;
            return finalDirection === 'asc' ? comparison : comparison * -1;
        } else if (currentSortBy === 'priority') {
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority]; 
        }
        return 0;
    });

    tasks = tasksToSort; 
    
    // 3. Renderizar y actualizar el texto del botón
    applyFiltersAndSearch();
    
    let sortText;
    if (currentSortBy === 'date') {
        sortText = `DATE - ${sortDirection.toUpperCase()}`;
    } else {
        sortText = `PRIORITY`;
    }
    sortBtn.textContent = `Sort (${sortText})`;
}

function toggleFilterDropdown() {
    filterDropdown.style.display = filterDropdown.style.display === 'block' ? 'none' : 'block';
    sortDropdown.style.display = 'none'; 
}

function toggleSortDropdown() {
    sortDropdown.style.display = sortDropdown.style.display === 'block' ? 'none' : 'block';
    filterDropdown.style.display = 'none'; 
}


function handleFilterClick(event) {
    const target = event.target;
    
    if (target.classList.contains('filter-option')) {
        const filterValue = target.getAttribute('data-filter');
        currentFilter = filterValue;
        
        filterDropdown.querySelectorAll('.filter-option').forEach(opt => {
            opt.classList.remove('active');
        });
        target.classList.add('active');
        
        filterDropdown.style.display = 'none';
        applyFiltersAndSearch(); 
        
        // ACTUALIZACIÓN DEL TEXTO DEL BOTÓN FILTER
        let filterText = 'Filter';
        
        if (currentFilter !== 'all') {
            const displayFilter = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
            filterText = `Filter (${displayFilter})`;
        }

        filterBtn.textContent = filterText;
    }
}


// --- 8. MANEJO DE VISTA DETALLADA (Leer Más) ---

let currentViewTaskId = null; 

function openViewModal(taskId) {
    const id = parseInt(taskId);
    const task = tasks.find(t => t.id === id);
    
    if (!task) return;

    currentViewTaskId = id;
    
    // Rellenar el modal de vista
    document.getElementById('view-title').textContent = task.title;
    document.getElementById('view-description').textContent = task.description;
    document.getElementById('view-status').textContent = task.status;
    document.getElementById('view-deliveryDate').textContent = task.deliveryDate;
    document.getElementById('view-deliveryTime').textContent = task.deliveryTime || 'N/A';
    
    const prioritySpan = document.getElementById('view-priority');
    prioritySpan.textContent = task.priority;
    prioritySpan.className = `tag priority-${task.priority.toLowerCase()}`;
    
    const subjectSpan = document.getElementById('view-subject');
    subjectSpan.textContent = task.subject;
    subjectSpan.className = 'tag subject-tag';
    
    // ********* CORRECCIÓN CLAVE: OCULTAR BOTONES DE ACCIÓN EN EL MODAL DE VISTA *********
    // Oculta el botón de Editar
    if (viewEditBtn) {
        viewEditBtn.style.display = 'none';
    }
    // Oculta el botón de Eliminar
    if (viewDeleteBtn) {
        viewDeleteBtn.style.display = 'none';
    }
    // ********* FIN CORRECCIÓN CLAVE *********
    
    viewModal.style.display = 'block';
}

function closeViewModal() {
    viewModal.style.display = 'none';
    
    // Restaurar la visibilidad de los botones al cerrar el modal 
    // (es importante si se reutilizan o si se quiere ver el modal con otro propósito)
    if (viewEditBtn) {
        viewEditBtn.style.display = '';
    }
    if (viewDeleteBtn) {
        viewDeleteBtn.style.display = '';
    }
}


// --- 9. ASIGNACIÓN DE EVENTOS INICIALES (FINAL) ---

document.addEventListener('DOMContentLoaded', () => {
    
    handleSort(); 

    // Eventos del Modal de Edición/Creación
    addTaskBtn.addEventListener('click', () => openModal()); 
    if (addTaskBtnDesktop) {
        addTaskBtnDesktop.addEventListener('click', () => openModal()); 
    }
    
    closeBtn.addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleFormSubmit);

    // Eventos del Modal de Vista Detallada
    viewCloseBtn.addEventListener('click', closeViewModal);
    
    // NOTA: El viewEditBtn no tiene un listener aquí, garantizando que el view-modal sea solo de lectura.
    
    
    // Evento para el selector de columna móvil
    mobileStatusSelector.addEventListener('change', (event) => {
        switchMobileColumn(event.target.value);
    });
    
    window.addEventListener('resize', initializeMobileView);


    // Eventos de Búsqueda, Ordenación y Filtro
    searchInput.addEventListener('input', handleSearch);
    sortBtn.addEventListener('click', toggleSortDropdown);
    
    if (sortDropdown) {
        sortDropdown.addEventListener('click', handleSort);
    }
    
    previewBtn.addEventListener('click', () => {
        currentSortBy = currentSortBy === 'date' ? 'priority' : 'date'; 
        handleSort(); 
    });
    
    filterBtn.addEventListener('click', toggleFilterDropdown);
    filterDropdown.addEventListener('click', handleFilterClick);
    
    // Inicializar el estado visual del filtro y su texto
    const allFilterOption = filterDropdown.querySelector('[data-filter="all"]');
    if(allFilterOption) {
        allFilterOption.classList.add('active');
        filterBtn.textContent = 'Filter';
    }

    // Inicializar el estado visual del sort
    const defaultSortOption = sortDropdown.querySelector(`[data-sort="date-${sortDirection}"]`);
    if(defaultSortOption) {
        defaultSortOption.classList.add('active');
    }

    // Cerrar modales y dropdowns al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            closeModal();
        }
        if (event.target == viewModal) {
            closeViewModal();
        }
        
        // Cierre de Dropdowns
        const filterContainer = filterBtn.closest('.filter-container');
        if (filterContainer && !filterContainer.contains(event.target) && filterDropdown.style.display === 'block') {
            filterDropdown.style.display = 'none';
        }

        const sortContainer = sortBtn.closest('.filter-container');
        if (sortContainer && !sortContainer.contains(event.target) && sortDropdown.style.display === 'block') {
            sortDropdown.style.display = 'none';
        }
    });


    // Delegación de Eventos para botones de la Tarjeta (Editar/Eliminar/Ver)
    taskColumnsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const taskId = target.getAttribute('data-id'); 

        if (!taskId) return; 

        if (target.classList.contains('delete-task')) {
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                deleteTask(taskId);
            }
        }
        
        if (target.classList.contains('edit-task')) {
             openModal(taskId); // El botón de Editar en la tarjeta abre el modal de edición
        }
        
        if (target.classList.contains('view-task')) {
            openViewModal(taskId); // El botón de Ver abre el modal de solo lectura
        }
    });
});
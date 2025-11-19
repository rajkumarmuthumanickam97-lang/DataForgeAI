// Global state
let currentFields = [];
let currentTab = 'upload';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeUpload();
    initializeAI();
    initializeSchema();
    initializePreview();
    initializeExport();
    initializeTemplates();
});

// Tabs
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            currentTab = tabName;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// File Upload
function initializeUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--primary)';
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'var(--border)';
    });

    uploadZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--border)';
        const file = e.dataTransfer.files[0];
        if (file) await handleFileUpload(file);
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) await handleFileUpload(file);
    });
}

async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        showToast('Uploading file...', 'info');
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        const data = await response.json();
        currentFields = data.fields;
        renderSchema();
        showToast('File uploaded successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// AI Schema Generation
function initializeAI() {
    const generateBtn = document.getElementById('generateSchemaBtn');
    const promptInput = document.getElementById('aiPrompt');

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showToast('Please enter a description', 'error');
            return;
        }

        try {
            generateBtn.classList.add('loading');
            showToast('Generating schema with AI...', 'info');

            const response = await fetch('/api/generate-schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Generation failed');
            }

            const data = await response.json();
            currentFields = data.fields;
            renderSchema();
            showToast('Schema generated successfully!', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            generateBtn.classList.remove('loading');
        }
    });
}

// Schema Builder
function initializeSchema() {
    const addFieldBtn = document.getElementById('addFieldBtn');
    addFieldBtn.addEventListener('click', addField);
}

function renderSchema() {
    const container = document.getElementById('schemaFields');
    const section = document.getElementById('schemaSection');

    if (currentFields.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = '';

    currentFields.forEach((field, index) => {
        const row = document.createElement('div');
        row.className = 'field-row';
        row.innerHTML = `
            <input 
                type="text" 
                class="input" 
                value="${field.name}" 
                placeholder="Field name"
                data-index="${index}"
                data-prop="name"
            >
            <select class="select" data-index="${index}" data-prop="type">
                ${getDataTypeOptions(field.type)}
            </select>
            <button class="remove-btn" data-index="${index}">×</button>
        `;
        container.appendChild(row);
    });

    // Add event listeners
    container.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const prop = e.target.dataset.prop;
            currentFields[index][prop] = e.target.value;
        });
    });

    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            currentFields.splice(index, 1);
            renderSchema();
        });
    });

    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('exportSection').style.display = 'block';
}

function addField() {
    const newField = {
        id: `field-${Date.now()}`,
        name: `field_${currentFields.length + 1}`,
        type: 'string',
        order: currentFields.length
    };
    currentFields.push(newField);
    renderSchema();
}

function getDataTypeOptions(selectedType) {
    const types = ['string', 'number', 'date', 'boolean', 'email', 'phone', 'address', 'url', 'uuid', 'currency'];
    return types.map(type => 
        `<option value="${type}" ${type === selectedType ? 'selected' : ''}>${type}</option>`
    ).join('');
}

// Data Preview
function initializePreview() {
    const generateBtn = document.getElementById('generatePreviewBtn');
    generateBtn.addEventListener('click', generatePreview);
}

async function generatePreview() {
    const rowCount = parseInt(document.getElementById('previewRows').value);

    if (currentFields.length === 0) {
        showToast('Please add fields first', 'error');
        return;
    }

    try {
        showToast('Generating preview...', 'info');

        const response = await fetch('/api/generate-preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: currentFields, rowCount })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Preview generation failed');
        }

        const result = await response.json();
        renderPreviewTable(result.data);
        showToast('Preview generated!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function renderPreviewTable(data) {
    const thead = document.getElementById('previewTableHead');
    const tbody = document.getElementById('previewTableBody');

    if (data.length === 0) return;

    // Render headers
    const headers = Object.keys(data[0]);
    thead.innerHTML = `
        <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
    `;

    // Render rows
    tbody.innerHTML = data.map(row => `
        <tr>
            ${headers.map(h => `<td>${row[h]}</td>`).join('')}
        </tr>
    `).join('');
}

// Export
function initializeExport() {
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', exportData);
}

async function exportData() {
    const format = document.getElementById('exportFormat').value;
    const rowCount = parseInt(document.getElementById('exportRows').value);

    if (currentFields.length === 0) {
        showToast('Please add fields first', 'error');
        return;
    }

    try {
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.classList.add('loading');
        showToast(`Exporting ${rowCount} rows...`, 'info');

        const response = await fetch('/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: currentFields, rowCount, format })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-export-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Export completed!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        document.getElementById('exportBtn').classList.remove('loading');
    }
}

// Templates
function initializeTemplates() {
    document.getElementById('saveTemplateBtn').addEventListener('click', () => openTemplateModal('save'));
    document.getElementById('loadTemplateBtn').addEventListener('click', () => openTemplateModal('load'));
    document.getElementById('closeModal').addEventListener('click', closeTemplateModal);
    document.getElementById('modalCancel').addEventListener('click', closeTemplateModal);
    document.getElementById('modalConfirm').addEventListener('click', handleTemplateConfirm);
}

function openTemplateModal(action) {
    const modal = document.getElementById('templateModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modal.style.display = 'flex';
    modalTitle.textContent = action === 'save' ? 'Save Template' : 'Load Template';

    if (action === 'save') {
        modalBody.innerHTML = `
            <input type="text" id="templateName" class="input" placeholder="Template name">
        `;
    } else {
        loadTemplatesList();
    }

    modal.dataset.action = action;
}

function closeTemplateModal() {
    document.getElementById('templateModal').style.display = 'none';
}

async function loadTemplatesList() {
    try {
        const response = await fetch('/api/templates');
        const templates = await response.json();

        const listHTML = templates.length === 0 
            ? '<p style="color: var(--text-secondary);">No templates saved yet</p>'
            : templates.map(t => `
                <div class="template-item" data-template-id="${t.id}">
                    <strong>${t.name}</strong>
                    <p style="font-size: 0.875rem; color: var(--text-secondary);">${t.fields.length} fields</p>
                </div>
            `).join('');

        document.getElementById('modalBody').innerHTML = `
            <div id="templateList">${listHTML}</div>
        `;

        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.template-item').forEach(i => i.style.backgroundColor = '');
                item.style.backgroundColor = 'var(--background)';
            });
        });
    } catch (error) {
        showToast('Failed to load templates', 'error');
    }
}

async function handleTemplateConfirm() {
    const modal = document.getElementById('templateModal');
    const action = modal.dataset.action;

    if (action === 'save') {
        const name = document.getElementById('templateName').value.trim();
        if (!name) {
            showToast('Please enter a template name', 'error');
            return;
        }

        try {
            const fieldsWithoutIds = currentFields.map(f => ({
                name: f.name,
                type: f.type,
                order: f.order
            }));

            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, fields: fieldsWithoutIds })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to save template');
            }

            showToast('Template saved successfully!', 'success');
            closeTemplateModal();
        } catch (error) {
            showToast(error.message || 'Failed to save template', 'error');
        }
    } else {
        const selected = document.querySelector('.template-item[style*="background"]');
        if (!selected) {
            showToast('Please select a template', 'error');
            return;
        }

        const templateId = selected.dataset.templateId;
        try {
            const response = await fetch('/api/templates');
            const templates = await response.json();
            const template = templates.find(t => t.id === templateId);

            if (template) {
                currentFields = template.fields;
                renderSchema();
                showToast('Template loaded successfully!', 'success');
                closeTemplateModal();
            }
        } catch (error) {
            showToast('Failed to load template', 'error');
        }
    }
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

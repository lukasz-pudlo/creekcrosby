// Header scroll effect
window.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu functionality
function toggleMobileMenu() {
    const nav = document.getElementById('nav');
    const toggle = document.querySelector('.mobile-menu-toggle');

    nav.classList.toggle('mobile-open');

    const isOpen = nav.classList.contains('mobile-open');
    toggle.setAttribute('aria-expanded', isOpen);

    // Add class to toggle for hamburger animation
    toggle.classList.toggle('mobile-open');
}

function closeMobileMenu() {
    const nav = document.getElementById('nav');
    const toggle = document.querySelector('.mobile-menu-toggle');

    nav.classList.remove('mobile-open');
    toggle.classList.remove('mobile-open');
    toggle.setAttribute('aria-expanded', 'false');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function (event) {
    const nav = document.getElementById('nav');
    const toggle = document.querySelector('.mobile-menu-toggle');

    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        closeMobileMenu();
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', function (event) {
    if (event.target.matches('a[href^="#"]')) {
        event.preventDefault();

        const targetId = event.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// HTMX event handlers
document.addEventListener('htmx:beforeRequest', function (event) {
    // Add loading indicator
    const target = event.target;
    if (target.classList.contains('search-input')) {
        target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }
});

document.addEventListener('htmx:afterRequest', function (event) {
    const target = event.target;
    console.log('HTMX after request:', event.detail);

    // Remove loading indicator
    if (target.classList.contains('search-input')) {
        target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }
});

// Form submission feedback
document.addEventListener('htmx:responseError', function (event) {
    console.error('HTMX Error:', event.detail);
    // Could show user-friendly error message here
});

// Initialize any necessary components when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Set initial header state
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }

    // Add any other initialization code here
    console.log('Creek Crosby website loaded');
});

// Inline editing functionality - ENHANCED VERSION with Rich Text Support
function makeEditable(element, inputType = 'text') {
    // Prevent double-editing
    if (element.classList.contains('editing')) {
        return;
    }

    // Prevent default HTMX behavior
    event.preventDefault();
    event.stopPropagation();

    const field = element.getAttribute('data-field');
    const currentValue = element.getAttribute('data-value') || element.textContent.trim();
    const editUrl = element.getAttribute('data-edit-url');

    // Store original content
    const originalContent = element.innerHTML;

    // Create edit form
    let inputElement;
    const isRichText = field === 'content' || field === 'bio';

    if (isRichText) {
        inputElement = document.createElement('textarea');
        inputElement.rows = 6;
        inputElement.placeholder = 'Use **bold**, *italic*, and line breaks for formatting';
    } else {
        inputElement = document.createElement('input');
        inputElement.type = inputType;
    }

    inputElement.value = currentValue;
    inputElement.className = 'edit-input';

    // Create formatting toolbar for rich text fields
    let toolbar = null;
    if (isRichText) {
        toolbar = createFormattingToolbar(inputElement);
    }

    // Create buttons
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'save-btn';
    saveBtn.type = 'button';
    saveBtn.setAttribute('data-no-htmx', 'true');

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.type = 'button';
    cancelBtn.setAttribute('data-no-htmx', 'true');

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'edit-buttons';
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);

    const formContainer = document.createElement('div');
    formContainer.className = 'edit-form';

    if (toolbar) {
        formContainer.appendChild(toolbar);
    }
    formContainer.appendChild(inputElement);
    formContainer.appendChild(buttonContainer);

    // Replace content with form
    element.innerHTML = '';
    element.appendChild(formContainer);
    element.classList.add('editing');

    // Focus input
    inputElement.focus();
    if (inputType === 'text') {
        inputElement.select();
    }

    // Save function
    function saveEdit() {
        const newValue = inputElement.value.trim();

        // Show saving indicator
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        // Create form data
        const formData = new FormData();
        formData.append('field', field);
        formData.append('value', newValue);
        formData.append('csrfmiddlewaretoken', getCSRFToken());

        // Send HTMX request
        fetch(editUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'HX-Request': 'true'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                // Find the parent container that needs to be updated
                const eventContainer = element.closest('[data-event-id]');
                const sectionContainer = element.closest('[data-section-id], [data-member-id]');
                const contactContainer = element.closest('.contact-content');

                if (eventContainer) {
                    // For events, check if we need to refresh the entire events grid or just the event card
                    if (field === 'date' || field === 'time') {
                        // Date/time changes affect ordering, so refresh the entire events grid
                        const eventsGrid = document.querySelector('#events-results');
                        if (eventsGrid) {
                            eventsGrid.innerHTML = html;
                        } else {
                            eventContainer.outerHTML = html;
                        }
                    } else {
                        // Other field changes just update the event card
                        eventContainer.outerHTML = html;
                    }
                } else if (sectionContainer) {
                    sectionContainer.outerHTML = html;
                } else if (contactContainer) {
                    contactContainer.outerHTML = html;
                } else {
                    // Fallback: just update the element content
                    element.innerHTML = newValue;
                    element.setAttribute('data-value', newValue);
                    element.classList.remove('editing');
                }
            })
            .catch(error => {
                console.error('Error saving edit:', error);
                alert('Error saving changes: ' + error.message);
                cancelEdit();
            });
    }

    // Cancel function
    function cancelEdit() {
        console.log('Cancel edit called for field:', field);

        // Check if element still exists and is in editing mode
        if (!element || !element.classList.contains('editing')) {
            console.log('Element not in editing mode or does not exist');
            return;
        }

        try {
            element.innerHTML = originalContent;
            element.classList.remove('editing');
            console.log('Cancel edit completed successfully');
        } catch (error) {
            console.error('Error during cancel edit:', error);
        }
    }

    // Event listeners
    saveBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        saveEdit();
    });

    cancelBtn.addEventListener('click', function (e) {
        console.log('Cancel button clicked');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        cancelEdit();
    });

    // Save on Enter (for input fields, not textarea)
    if (inputElement.tagName === 'INPUT') {
        inputElement.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    } else {
        // For textarea, save on Ctrl+Enter
        inputElement.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }
}

// Create formatting toolbar for rich text editing
function createFormattingToolbar(textarea) {
    const toolbar = document.createElement('div');
    toolbar.className = 'formatting-toolbar';

    const buttons = [
        { text: 'B', title: 'Bold', action: () => wrapSelection(textarea, '**', '**') },
        { text: 'I', title: 'Italic', action: () => wrapSelection(textarea, '*', '*') },
        { text: '¶', title: 'New Paragraph', action: () => insertText(textarea, '\n\n') },
        { text: '•', title: 'Bullet Point', action: () => insertText(textarea, '\n• ') },
        { text: 'Link', title: 'Insert Link', action: () => insertLink(textarea) }
    ];

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.title = btn.title;
        button.className = 'format-btn';
        button.type = 'button';
        button.addEventListener('click', (e) => {
            e.preventDefault();
            btn.action();
            textarea.focus();
        });
        toolbar.appendChild(button);
    });

    // Add formatting help
    const help = document.createElement('div');
    help.className = 'formatting-help';
    help.innerHTML = `
        <small>
            <strong>Formatting:</strong> 
            **bold**, *italic*, line breaks supported
        </small>
    `;
    toolbar.appendChild(help);

    return toolbar;
}

// Helper function to wrap selected text
function wrapSelection(textarea, before, after) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = before + selectedText + after;

    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    // Set cursor position
    const newPos = start + before.length + selectedText.length + after.length;
    textarea.setSelectionRange(newPos, newPos);
}

// Helper function to insert text at cursor
function insertText(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);

    // Set cursor position after inserted text
    const newPos = start + text.length;
    textarea.setSelectionRange(newPos, newPos);
}

// Helper function to insert a link
function insertLink(textarea) {
    const url = prompt('Enter URL:');
    if (url) {
        const text = prompt('Enter link text (optional):') || url;
        const linkMarkdown = `[${text}](${url})`;
        insertText(textarea, linkMarkdown);
    }
}

// Get CSRF token
function getCSRFToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

    if (cookieValue) {
        return cookieValue;
    }

    // Fallback: try to get from meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
        return metaTag.getAttribute('content');
    }

    return '';
}

// Enhanced image upload handling
document.addEventListener('change', function (event) {
    const input = event.target;

    // Check if it's a file input for image uploads
    if (input.type === 'file' && input.accept && input.accept.includes('image')) {
        const file = input.files[0];
        const form = input.closest('form');

        if (!file) {
            console.log('No file selected');
            return;
        }

        // Validate file size (20MB limit)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            alert('File size must be under 20MB');
            input.value = '';
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            input.value = '';
            return;
        }

        // Show preview if possible
        console.log('Image selected:', file.name, 'Size:', Math.round(file.size / 1024) + 'KB', 'Type:', file.type);

        // Find the label and show uploading state
        const label = input.nextElementSibling || input.previousElementSibling;
        if (label && label.tagName === 'LABEL') {
            const originalText = label.textContent;
            label.textContent = '📤 Uploading...';
            label.style.pointerEvents = 'none';
            label.style.opacity = '0.6';

            // Store original text for restoration if needed
            label.setAttribute('data-original-text', originalText);
        }

        // Add loading class to container
        const container = form.closest('.event-image-container');
        if (container) {
            container.classList.add('uploading');
        }

        // Submit form using HTMX
        htmx.trigger(form, 'submit');
    }
});

// Handle successful uploads
document.addEventListener('htmx:afterSwap', function (event) {
    console.log('HTMX after swap:', event.detail);

    // Reset any upload states after successful swap
    const uploadingElements = document.querySelectorAll('[data-original-text]');
    uploadingElements.forEach(element => {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
            element.style.pointerEvents = '';
            element.style.opacity = '';
            element.removeAttribute('data-original-text');
        }
    });

    // Remove uploading class from containers
    const uploadingContainers = document.querySelectorAll('.uploading');
    uploadingContainers.forEach(container => {
        container.classList.remove('uploading');
    });
});

// Handle upload errors
document.addEventListener('htmx:responseError', function (event) {
    console.log('HTMX response error:', event.detail);

    // Reset upload states on error
    const uploadingElements = document.querySelectorAll('[data-original-text]');
    uploadingElements.forEach(element => {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
            element.style.pointerEvents = '';
            element.style.opacity = '';
            element.removeAttribute('data-original-text');
        }
    });

    // Remove uploading class from containers
    const uploadingContainers = document.querySelectorAll('.uploading');
    uploadingContainers.forEach(container => {
        container.classList.remove('uploading');
    });

    // Show error message for file uploads
    if (event.detail.target && event.detail.target.matches('form[hx-encoding="multipart/form-data"]')) {
        let errorMessage = 'Upload failed. Please try again.';
        try {
            const response = JSON.parse(event.detail.xhr.responseText);
            if (response.error) {
                errorMessage = response.error;
            }
        } catch (e) {
            console.error('Error parsing error response:', e);
        }
        alert(errorMessage);
    }
});

// Handle image upload progress
document.addEventListener('htmx:xhr:progress', function (event) {
    if (!event.detail.loaded || !event.detail.total) return;

    const progress = (event.detail.loaded / event.detail.total) * 100;
    console.log('Upload progress:', Math.round(progress) + '%');

    // Find any progress indicators and update them
    const progressBars = document.querySelectorAll('.upload-progress');
    progressBars.forEach(bar => {
        bar.style.width = progress + '%';
    });

    // Update any upload labels with progress
    const uploadingLabels = document.querySelectorAll('[data-original-text]');
    uploadingLabels.forEach(label => {
        if (progress < 100) {
            label.textContent = `📤 Uploading... ${Math.round(progress)}%`;
        }
    });
});

// Enhanced HTMX request handlers
document.addEventListener('htmx:beforeRequest', function (event) {
    const target = event.target;
    console.log('HTMX before request:', event.detail);

    // Handle image upload forms
    if (target.matches('form[hx-encoding="multipart/form-data"]')) {
        const label = target.querySelector('label');
        if (label && !label.hasAttribute('data-original-text')) {
            const originalText = label.textContent;
            label.setAttribute('data-original-text', originalText);
            label.textContent = '📤 Preparing upload...';
            label.style.pointerEvents = 'none';
            label.style.opacity = '0.6';
        }

        // Add uploading class to container
        const container = target.closest('.event-image-container');
        if (container) {
            container.classList.add('uploading');
        }
    }
});

document.addEventListener('htmx:afterRequest', function (event) {
    const target = event.target;
    console.log('HTMX after request:', event.detail);

    // Handle image upload completion
    if (target.matches('form[hx-encoding="multipart/form-data"]')) {
        // Remove uploading state
        const container = target.closest('.event-image-container');
        if (container) {
            container.classList.remove('uploading');
        }

        // Check if upload was successful
        if (event.detail.xhr.status >= 200 && event.detail.xhr.status < 300) {
            console.log('Image uploaded successfully');
        } else {
            console.error('Image upload failed:', event.detail.xhr.status);
            // Reset label state on error
            const label = target.querySelector('[data-original-text]');
            if (label) {
                const originalText = label.getAttribute('data-original-text');
                label.textContent = originalText;
                label.style.pointerEvents = '';
                label.style.opacity = '';
                label.removeAttribute('data-original-text');
            }
        }
    }
});

// Debug: Log all form submissions
document.addEventListener('submit', function (event) {
    console.log('Form submitted:', event.target);
    console.log('Form action:', event.target.action);
    console.log('Form method:', event.target.method);
    console.log('Form enctype:', event.target.enctype);
    console.log('Has hx-post?', event.target.hasAttribute('hx-post'));
    console.log('Has hx-encoding?', event.target.hasAttribute('hx-encoding'));
});

// Debug: Log all file input changes
document.addEventListener('change', function (event) {
    if (event.target.type === 'file') {
        console.log('File input changed:', event.target);
        console.log('File selected:', event.target.files[0]);
        console.log('Parent form:', event.target.closest('form'));

        const form = event.target.closest('form');
        if (form) {
            console.log('Form has hx-post:', form.hasAttribute('hx-post'));
            console.log('Form hx-post value:', form.getAttribute('hx-post'));
            console.log('Form has hx-encoding:', form.hasAttribute('hx-encoding'));
        }
    }
});

// Debug: Check if HTMX is working
document.addEventListener('htmx:configRequest', function (event) {
    console.log('HTMX request configured:', event.detail);
});

document.addEventListener('htmx:beforeRequest', function (event) {
    console.log('HTMX before request:', event.target);
});

document.addEventListener('htmx:afterRequest', function (event) {
    console.log('HTMX after request:', event.detail);
});

// Debug: Check for HTMX errors
document.addEventListener('htmx:responseError', function (event) {
    console.error('HTMX Response Error:', event.detail);
});

document.addEventListener('htmx:sendError', function (event) {
    console.error('HTMX Send Error:', event.detail);
});

// Band Member Drag and Drop Functionality
let draggedElement = null;
let draggedIndex = null;

function initializeBandSorting() {
    const bandGrid = document.querySelector('.band-grid.sortable');
    console.log('Initializing band sorting, found grid:', bandGrid);

    if (!bandGrid) {
        console.log('No sortable band grid found');
        return;
    }

    const bandMembers = bandGrid.querySelectorAll('.band-member.draggable');
    console.log('Found draggable band members:', bandMembers.length);

    bandMembers.forEach((member, index) => {
        console.log(`Setting up member ${index}:`, member.getAttribute('data-member-id'));

        // Only make draggable when drag handle is used
        const dragHandle = member.querySelector('.drag-handle');
        if (dragHandle) {
            // Add drag event listeners to the drag handle
            dragHandle.addEventListener('mousedown', function (e) {
                member.draggable = true;
            });

            // Add drag event listeners to the member
            member.addEventListener('dragstart', handleDragStart);
            member.addEventListener('dragend', handleDragEnd);
            member.addEventListener('dragover', handleDragOver);
            member.addEventListener('drop', handleDrop);
            member.addEventListener('dragenter', handleDragEnter);
            member.addEventListener('dragleave', handleDragLeave);

            // Disable dragging when not using drag handle
            member.addEventListener('mousedown', function (e) {
                if (!e.target.closest('.drag-handle')) {
                    member.draggable = false;
                }
            });
        }

        member.setAttribute('data-index', index);
    });

    // Add drop zone to the grid itself for dropping at the end
    bandGrid.addEventListener('dragover', handleGridDragOver);
    bandGrid.addEventListener('drop', handleGridDrop);

    console.log('Band sorting initialized successfully');
}

function handleDragStart(e) {
    draggedElement = this;
    draggedIndex = parseInt(this.getAttribute('data-index'));

    this.classList.add('dragging');

    // Add visual feedback to all potential drop zones
    const allMembers = document.querySelectorAll('.band-member.draggable');
    allMembers.forEach(member => {
        if (member !== this) {
            member.classList.add('drop-zone');
        }
    });

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);

    console.log('Drag started for member:', this.getAttribute('data-member-id'));
}

function handleDragEnd(e) {
    this.classList.remove('dragging');

    // Remove all visual feedback
    const allMembers = document.querySelectorAll('.band-member');
    allMembers.forEach(member => {
        member.classList.remove('drag-over', 'drop-zone');
    });

    // Remove drag-over from grid
    const bandGrid = document.querySelector('.band-grid.sortable');
    if (bandGrid) {
        bandGrid.classList.remove('drag-over');
    }

    draggedElement = null;
    draggedIndex = null;

    console.log('Drag ended');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    // Only allow drop if this is not the dragged element
    if (this !== draggedElement) {
        e.dataTransfer.dropEffect = 'move';

        // Add visual feedback
        this.classList.add('drag-over');

        return false;
    }

    return true;
}

function handleGridDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    // Only handle if we're dragging over empty space in the grid
    if (e.target === this || e.target.classList.contains('band-grid')) {
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');
        return false;
    }

    return true;
}

function handleGridDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    // Only handle if we're dropping on the grid itself (empty space)
    if ((e.target === this || e.target.classList.contains('band-grid')) && draggedElement) {
        console.log('Dropping on grid (end position)');

        const bandGrid = document.querySelector('.band-grid.sortable');
        const allMembers = Array.from(bandGrid.querySelectorAll('.band-member.draggable'));

        // Get current order of member IDs
        const currentOrder = allMembers.map(member => member.getAttribute('data-member-id'));

        const draggedMemberId = draggedElement.getAttribute('data-member-id');

        // Remove dragged element from its current position
        const draggedIdx = currentOrder.indexOf(draggedMemberId);
        currentOrder.splice(draggedIdx, 1);

        // Add to the end
        currentOrder.push(draggedMemberId);

        console.log('New order (moved to end):', currentOrder);

        // Send reorder request
        sendReorderRequest(currentOrder);
    }

    this.classList.remove('drag-over');
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
        console.log('Drag enter on member:', this.getAttribute('data-member-id'));
    }
}

function handleDragLeave(e) {
    // More reliable drag leave detection using relatedTarget
    const relatedTarget = e.relatedTarget;

    // If we're moving to a child element, don't remove drag-over
    if (relatedTarget && this.contains(relatedTarget)) {
        return;
    }

    // If we're moving to the dragged element, don't remove drag-over
    if (relatedTarget === draggedElement || (draggedElement && draggedElement.contains(relatedTarget))) {
        return;
    }

    this.classList.remove('drag-over');
    console.log('Drag leave from member:', this.getAttribute('data-member-id'));
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement && draggedElement !== this) {
        console.log('Dropping on member:', this.getAttribute('data-member-id'));

        const bandGrid = document.querySelector('.band-grid.sortable');
        const allMembers = Array.from(bandGrid.querySelectorAll('.band-member.draggable'));

        const draggedMemberId = draggedElement.getAttribute('data-member-id');
        const targetMemberId = this.getAttribute('data-member-id');

        // Get current order of member IDs
        const currentOrder = allMembers.map(member => member.getAttribute('data-member-id'));

        // Remove dragged element from its current position
        const draggedIdx = currentOrder.indexOf(draggedMemberId);
        currentOrder.splice(draggedIdx, 1);

        // Find target position and insert
        const targetIdx = currentOrder.indexOf(targetMemberId);

        // Determine if we should insert before or after the target based on mouse position
        const rect = this.getBoundingClientRect();
        const isGrid = bandGrid.classList.contains('band-grid');

        let insertAfter = false;
        if (isGrid) {
            // For grid layout, use horizontal position
            const midPoint = rect.left + rect.width / 2;
            insertAfter = e.clientX > midPoint;
        } else {
            // For vertical layout, use vertical position
            const midPoint = rect.top + rect.height / 2;
            insertAfter = e.clientY > midPoint;
        }

        if (insertAfter) {
            currentOrder.splice(targetIdx + 1, 0, draggedMemberId);
        } else {
            currentOrder.splice(targetIdx, 0, draggedMemberId);
        }

        console.log('New order (inserted):', currentOrder);

        // Send reorder request
        sendReorderRequest(currentOrder);
    }

    this.classList.remove('drag-over');
    return false;
}

function sendReorderRequest(memberIds) {
    const formData = new FormData();
    formData.append('member_ids', JSON.stringify(memberIds));
    formData.append('csrfmiddlewaretoken', getCSRFToken());

    // Show loading state
    const bandGrid = document.querySelector('.band-grid.sortable');
    if (bandGrid) {
        bandGrid.style.opacity = '0.6';
        bandGrid.style.pointerEvents = 'none';
    }

    fetch('/edit/band/reorder/', {
        method: 'POST',
        body: formData,
        headers: {
            'HX-Request': 'true'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Update the band content
            const bandContent = document.querySelector('.band-content');
            if (bandContent) {
                bandContent.innerHTML = html;
                // Reinitialize drag and drop
                setTimeout(initializeBandSorting, 100);
            }
        })
        .catch(error => {
            console.error('Error reordering band members:', error);
            alert('Error reordering band members. Please try again.');
        })
        .finally(() => {
            // Remove loading state
            if (bandGrid) {
                bandGrid.style.opacity = '';
                bandGrid.style.pointerEvents = '';
            }
        });
}

// Initialize drag and drop when page loads
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing band sorting...');
    initializeBandSorting();
});

// Reinitialize drag and drop after HTMX swaps
document.addEventListener('htmx:afterSwap', function (event) {
    console.log('HTMX after swap:', event.detail);

    // Check if the swapped content contains band members
    if (event.detail.target.querySelector &&
        (event.detail.target.querySelector('.band-grid') ||
            event.detail.target.classList.contains('band-grid'))) {
        console.log('Band content swapped, reinitializing sorting...');
        setTimeout(initializeBandSorting, 100);
    }
});

// Debug: Log all HTMX requests for band operations
document.addEventListener('htmx:beforeRequest', function (event) {
    const url = event.detail.requestConfig.url;
    if (url && url.includes('/edit/band/')) {
        console.log('Band operation request:', url, event.detail);
        console.log('Request body:', event.detail.requestConfig.body);
        console.log('Request headers:', event.detail.requestConfig.headers);
    }
});

document.addEventListener('htmx:afterRequest', function (event) {
    const url = event.detail.requestConfig.url;
    if (url && url.includes('/edit/band/')) {
        console.log('Band operation response:', url, event.detail.xhr.status);
        console.log('Response text:', event.detail.xhr.responseText);
        if (event.detail.xhr.status !== 200) {
            console.error('Band operation failed:', event.detail.xhr.responseText);
        }
    }
});

// Debug: Log form submissions specifically
document.addEventListener('htmx:beforeRequest', function (event) {
    if (event.target.tagName === 'FORM') {
        console.log('Form submission:', event.target);
        console.log('Form action:', event.target.getAttribute('hx-post'));
        console.log('Form target:', event.target.getAttribute('hx-target'));
        console.log('Form data:', new FormData(event.target));

        // Log form data entries
        const formData = new FormData(event.target);
        for (let [key, value] of formData.entries()) {
            console.log(`Form field ${key}:`, value);
        }
    }
});

// Touch support for mobile devices
let touchStartY = 0;
let touchStartX = 0;
let isTouchDragging = false;

document.addEventListener('touchstart', function (e) {
    const target = e.target.closest('.band-member.draggable');
    if (target && target.querySelector('.drag-handle').contains(e.target)) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isTouchDragging = true;
        target.classList.add('touch-dragging');
    }
}, { passive: false });

document.addEventListener('touchmove', function (e) {
    if (isTouchDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaY = touch.clientY - touchStartY;
        const deltaX = touch.clientX - touchStartX;

        // Simple threshold to determine if this is a drag gesture
        if (Math.abs(deltaY) > 10 || Math.abs(deltaX) > 10) {
            // Handle touch drag logic here if needed
        }
    }
}, { passive: false });

document.addEventListener('touchend', function (e) {
    if (isTouchDragging) {
        isTouchDragging = false;
        const draggingElements = document.querySelectorAll('.touch-dragging');
        draggingElements.forEach(el => el.classList.remove('touch-dragging'));
    }
});

// Lightbox functionality for media images
function openLightbox(imgElement) {
    const modal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.querySelector('.lightbox-title');

    if (!modal || !lightboxImage) {
        console.error('Lightbox elements not found');
        return;
    }

    // Get image source and title
    const imageSrc = imgElement.getAttribute('data-lightbox-src') || imgElement.src;
    const imageTitle = imgElement.getAttribute('data-lightbox-title') || imgElement.alt;

    // Set image source and title
    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageTitle;
    if (lightboxTitle) {
        lightboxTitle.textContent = imageTitle;
    }

    // Show modal
    modal.classList.add('show');
    document.body.classList.add('lightbox-open');

    // Focus on modal for keyboard accessibility
    modal.focus();
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('lightbox-open');
    }
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', function (event) {
    const modal = document.getElementById('lightbox-modal');
    if (modal && modal.classList.contains('show')) {
        switch (event.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                // Could implement previous image navigation here
                break;
            case 'ArrowRight':
                // Could implement next image navigation here
                break;
        }
    }
});

// Prevent lightbox from closing when clicking on the image
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('lightbox-image')) {
        event.stopPropagation();
    }
});

// Enhanced image loading with error handling
function handleLightboxImageLoad(imgElement) {
    imgElement.addEventListener('load', function () {
        // Image loaded successfully
        this.style.opacity = '1';
    });

    imgElement.addEventListener('error', function () {
        // Image failed to load
        console.error('Failed to load lightbox image:', this.src);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'lightbox-error';
        errorDiv.innerHTML = `
            <div style="text-align: center; color: white; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🖼️</div>
                <h3>Image Not Available</h3>
                <p>Sorry, this image could not be loaded.</p>
            </div>
        `;
        this.parentNode.replaceChild(errorDiv, this);
    });
}

// Initialize lightbox functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Add lightbox functionality to any existing images
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    lightboxTriggers.forEach(function (trigger) {
        // Add click event if not already added via onclick
        if (!trigger.hasAttribute('onclick')) {
            trigger.addEventListener('click', function () {
                openLightbox(this);
            });
        }
    });

    // Handle image loading
    const lightboxImage = document.getElementById('lightbox-image');
    if (lightboxImage) {
        handleLightboxImageLoad(lightboxImage);
    }
});

// Re-initialize lightbox after HTMX swaps
document.addEventListener('htmx:afterSwap', function (event) {
    // Check if the swapped content contains lightbox triggers
    const newTriggers = event.detail.target.querySelectorAll('.lightbox-trigger');
    newTriggers.forEach(function (trigger) {
        // Add click event if not already added via onclick
        if (!trigger.hasAttribute('onclick')) {
            trigger.addEventListener('click', function () {
                openLightbox(this);
            });
        }
    });
});

// // Alternative: Simple function to open image in new tab
// function openImageInNewTab(imgElement) {
//     const imageSrc = imgElement.src;
//     window.open(imageSrc, '_blank', 'noopener,noreferrer');
// }

// Utility function to download image
function downloadImage(imgElement) {
    const imageSrc = imgElement.src;
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imgElement.alt || 'creek-crosby-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Optimize HTMX loading with better indicators
document.addEventListener('htmx:beforeRequest', function (event) {
    // Hide generic loading messages and show fast loading indicators
    const target = event.target;

    // Replace slow loading messages with faster ones
    const loadingElements = target.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        if (element.textContent.includes('Loading')) {
            element.innerHTML = '<div class="fast-loading">⚡ Loading...</div>';
        }
    });
});

// Preload critical images
document.addEventListener('DOMContentLoaded', function () {
    // Preload hero image if not already loaded
    const heroImage = new Image();
    heroImage.src = '/static/images/JM DSC_2067 BW.jpg';

    // Preload first few media images
    setTimeout(() => {
        const mediaImages = document.querySelectorAll('.media-image');
        mediaImages.forEach((img, index) => {
            if (index < 3) { // Only preload first 3 images
                const tempImg = new Image();
                tempImg.src = img.src;
            }
        });
    }, 1000);
});

// Optimize image loading with better error handling
function optimizeImageLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    images.forEach(img => {
        // Add loading class
        img.closest('.progressive-image, .lazy-image, .media-image-container')?.classList.add('loading');

        img.addEventListener('load', function () {
            // Remove loading state
            const container = this.closest('.progressive-image, .lazy-image, .media-image-container');
            if (container) {
                container.classList.remove('loading');
                container.classList.add('loaded');
            }
            this.classList.add('loaded');
        });

        img.addEventListener('error', function () {
            // Handle broken images gracefully
            const container = this.closest('.progressive-image, .lazy-image, .media-image-container');
            if (container) {
                container.classList.remove('loading');
                container.innerHTML = `
                    <div class="image-error" style="
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        height: 200px; 
                        background: #f0f0f0; 
                        color: #999; 
                        border-radius: 8px;
                        flex-direction: column;
                        gap: 0.5rem;
                    ">
                        <div style="font-size: 2rem;">🖼️</div>
                        <div>Image unavailable</div>
                    </div>
                `;
            }
        });
    });
}

// Enhanced lazy loading with Intersection Observer
function initializeLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        optimizeImageLoading();
        return;
    }

    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const dataSrc = img.getAttribute('data-src');

                if (dataSrc) {
                    img.src = dataSrc;
                    img.removeAttribute('data-src');
                }

                img.classList.remove('lazy');
                lazyImageObserver.unobserve(img);
            }
        });
    }, {
        // Load images 100px before they come into view
        rootMargin: '100px 0px',
        threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src], img.lazy').forEach(img => {
        lazyImageObserver.observe(img);
    });
}

// Optimize video loading
function optimizeVideoLoading() {
    // Pause videos that are not in view to save bandwidth
    const videos = document.querySelectorAll('video');

    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(e => console.log('Video play prevented:', e));
                } else {
                    video.pause();
                }
            });
        }, {
            threshold: 0.5 // Play when 50% visible
        });

        videos.forEach(video => {
            videoObserver.observe(video);
        });
    }
}

// Fast content replacement for HTMX
document.addEventListener('htmx:beforeSwap', function (event) {
    // Prepare the new content for faster rendering
    const newContent = event.detail.serverResponse;

    // If the new content contains images, prepare them
    if (newContent.includes('<img')) {
        // Pre-process images in the response
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newContent;

        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            // Add loading class to new images
            if (img.hasAttribute('loading')) {
                img.classList.add('lazy-load-image');
            }
        });

        event.detail.serverResponse = tempDiv.innerHTML;
    }
});

// Re-initialize optimizations after HTMX swaps
document.addEventListener('htmx:afterSwap', function (event) {
    // Re-initialize lazy loading for new content
    initializeLazyLoading();
    optimizeImageLoading();
    optimizeVideoLoading();

    // Initialize any new lightbox triggers
    const newTriggers = event.detail.target.querySelectorAll('.lightbox-trigger');
    newTriggers.forEach(trigger => {
        if (!trigger.hasAttribute('onclick')) {
            trigger.addEventListener('click', function () {
                openLightbox(this);
            });
        }
    });
});

// Performance monitoring (optional - remove in production)
function logPerformanceMetrics() {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');

        console.log('🚀 Performance Metrics:');
        console.log(`   DOM Content Loaded: ${Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart)}ms`);
        console.log(`   Page Load Complete: ${Math.round(navigation.loadEventEnd - navigation.navigationStart)}ms`);
        console.log(`   Resources Loaded: ${resources.length}`);

        // Log slow resources
        const slowResources = resources.filter(r => r.duration > 1000);
        if (slowResources.length > 0) {
            console.log('⚠️ Slow Resources (>1s):');
            slowResources.forEach(r => {
                console.log(`   ${r.name}: ${Math.round(r.duration)}ms`);
            });
        }
    }
}

// Initialize optimizations
document.addEventListener('DOMContentLoaded', function () {
    initializeLazyLoading();
    optimizeImageLoading();
    optimizeVideoLoading();

    // Log performance metrics after a delay
    setTimeout(logPerformanceMetrics, 2000);
});

// Optimize scroll performance
let scrollTimeout;
document.addEventListener('scroll', function () {
    // Debounce scroll events
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Handle scroll-based optimizations here

        // Hide videos that are far from view to save resources
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            const rect = video.getBoundingClientRect();
            const isNearView = rect.top < window.innerHeight + 500 && rect.bottom > -500;

            if (!isNearView && !video.paused) {
                video.pause();
            }
        });
    }, 100);
});

// Optimize form submissions
document.addEventListener('htmx:configRequest', function (event) {
    // Add loading states to form submissions
    if (event.detail.verb === 'POST') {
        const submitter = event.detail.elt;
        if (submitter.tagName === 'FORM' || submitter.closest('form')) {
            const loadingElement = document.createElement('div');
            loadingElement.className = 'fast-loading';
            loadingElement.textContent = '⚡ Submitting...';
            loadingElement.style.position = 'fixed';
            loadingElement.style.top = '20px';
            loadingElement.style.right = '20px';
            loadingElement.style.zIndex = '9999';
            loadingElement.id = 'form-loading-indicator';

            document.body.appendChild(loadingElement);
        }
    }
});

document.addEventListener('htmx:afterRequest', function (event) {
    // Remove loading indicators
    const loadingIndicator = document.getElementById('form-loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
});

// Memory management - Clean up observers when leaving page
window.addEventListener('beforeunload', function () {
    // Clean up observers to prevent memory leaks
    if (window.lazyImageObserver) {
        window.lazyImageObserver.disconnect();
    }
    if (window.videoObserver) {
        window.videoObserver.disconnect();
    }
});
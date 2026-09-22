// Header scroll effect. rAF-throttled -- this used to run on every scroll frame.
let headerTicking = false;
function syncHeaderState() {
    const header = document.getElementById('header');
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 50);
}
window.addEventListener('scroll', function () {
    if (headerTicking) return;
    headerTicking = true;
    requestAnimationFrame(function () {
        syncHeaderState();
        headerTicking = false;
    });
}, { passive: true });

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
    syncHeaderState();
    initializeMediaFunctionality();
    initializeBandSorting();
});

// CONSOLIDATED MEDIA FUNCTIONALITY
function initializeMediaFunctionality() {
    // Initialize lightbox functionality
    initializeLightbox();

    // Initialize video loading functionality
    initializeVideoLoading();

    // Initialize image optimization
    initializeImageOptimization();
}

function initializeLightbox() {
    // Create lightbox modal if it doesn't exist
    if (!document.getElementById('lightbox-modal')) {
        const lightboxHTML = `
            <div id="lightbox-modal" class="lightbox-modal" style="display: none;"
                 tabindex="-1" role="dialog" aria-modal="true" aria-label="Image viewer">
                <div class="lightbox-content" onclick="event.stopPropagation()">
                    <button class="lightbox-close" onclick="closeLightbox()" aria-label="Close">&times;</button>
                    <img id="lightbox-image" src="" alt="" class="lightbox-image">
                    <div class="lightbox-title"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }

}

// Registered once at module scope. initializeLightbox() runs again after every
// HTMX media swap, so registering these inside it stacked duplicate listeners.
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('lightbox-trigger')) {
        event.preventDefault();
        event.stopPropagation();
        openLightbox(event.target);
    }
});

document.addEventListener('click', function (event) {
    if (event.target.id === 'lightbox-modal') {
        closeLightbox();
    }
});

// Global lightbox functions (fixed)
window.openLightbox = function (imgElement) {
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
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('lightbox-open');

    // Remember where focus came from so it can be restored on close, and move
    // focus to the one focusable control inside. modal.focus() used to be a
    // silent no-op -- the div had no tabindex.
    lightboxReturnFocus = document.activeElement;
    const closeBtn = modal.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.focus();
};

let lightboxReturnFocus = null;

window.closeLightbox = function () {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('lightbox-open');
    }
    if (lightboxReturnFocus && document.contains(lightboxReturnFocus)) {
        lightboxReturnFocus.focus();
    }
    lightboxReturnFocus = null;
};

// The lightbox holds exactly one focusable control, so trapping Tab is just
// keeping focus on it while the dialog is open.
document.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    const modal = document.getElementById('lightbox-modal');
    if (!modal || !modal.classList.contains('show')) return;
    event.preventDefault();
    const closeBtn = modal.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.focus();
});

// VIDEO LOADING FUNCTIONALITY (CONSOLIDATED)
function initializeVideoLoading() {
    // These functions are made available globally for media.html
    window.loadAndPlayVideo = function (thumbnail) {
        const container = thumbnail.parentElement;
        const videoUrl = thumbnail.getAttribute('data-video-url');

        if (!videoUrl) {
            console.error('No video URL found');
            return;
        }

        // Show loading state
        thumbnail.innerHTML = '<div class="video-frame-status"><div class="fast-loading">Loading video&hellip;</div></div>';

        // Create video element; src set directly so any container format
        // the browser supports (mp4, webm, mov) plays
        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.src = videoUrl;

        // Handle successful loading
        video.addEventListener('canplay', function () {
            container.replaceChild(video, thumbnail);

            // Auto-play if possible
            video.play().catch(e => {
            });
        });

        // Handle errors
        video.addEventListener('error', function (e) {
            console.error('Video loading error:', e);
            thumbnail.innerHTML = `
                <div class="video-frame-status video-frame-status--error">
                    <div>
                        <div>Video unavailable</div>
                        <div class="video-frame-status-hint">Please try again later</div>
                    </div>
                </div>
            `;
        });

        // Start loading the video
        video.load();
    };

    window.loadAndPlayEmbed = function (thumbnail) {
        const container = thumbnail.parentElement;
        const embedUrl = thumbnail.getAttribute('data-embed-url');

        if (!embedUrl) {
            console.error('No embed URL found');
            return;
        }

        // Show loading state
        thumbnail.innerHTML = '<div class="video-frame-status"><div class="fast-loading">Loading video&hellip;</div></div>';

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';

        // Replace thumbnail with iframe
        setTimeout(() => {
            container.replaceChild(iframe, thumbnail);
        }, 300);
    };
}

// IMAGE OPTIMIZATION FUNCTIONALITY
function initializeImageOptimization() {
    const images = document.querySelectorAll('.media-image, img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Don't set opacity to 0 initially, let image show immediately
                    img.addEventListener('load', function () {
                        this.classList.add('loaded');
                    });

                    img.addEventListener('error', function () {
                        this.alt = 'Image unavailable';
                    });

                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        images.forEach(img => {
            // Remove the opacity = 0 that was hiding images
            if (!img.classList.contains('loaded')) {
                imageObserver.observe(img);
            }
        });
    }
}

// HTMX INTEGRATION - Reinitialize after content swaps
document.addEventListener('htmx:afterSwap', function (event) {

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

    // Reinitialize media functionality for new content
    if (event.detail.target.querySelector &&
        (event.detail.target.querySelector('.media-subsection') ||
            event.detail.target.classList.contains('media-subsection') ||
            event.detail.target.querySelector('.no-media'))) {
        setTimeout(() => {
            initializeMediaFunctionality();
        }, 100);
    }

    // Reinitialize band sorting if needed
    if (event.detail.target.querySelector &&
        (event.detail.target.querySelector('.band-grid') ||
            event.detail.target.classList.contains('band-grid'))) {
        setTimeout(initializeBandSorting, 100);
    }

    // Initialize any new content
    if (event.detail.target.querySelector) {
        // Initialize lazy loading for new images
        const newImages = event.detail.target.querySelectorAll('img[loading="lazy"]');
        newImages.forEach(img => {
            img.style.opacity = '0';
            img.addEventListener('load', function () {
                this.style.transition = 'opacity 0.3s ease';
                this.style.opacity = '1';
            });
        });
    }

    // Remove loading indicators gradually
    setTimeout(() => {
        const loadingElements = event.detail.target.querySelectorAll('.fast-loading, .loading');
        loadingElements.forEach(el => {
            if (el.textContent.includes('Loading')) {
                el.style.transition = 'opacity 0.3s ease';
                el.style.opacity = '0';
                setTimeout(() => {
                    if (el.parentNode) {
                        el.remove();
                    }
                }, 300);
            }
        });
    }, 200);
});

// One-at-a-time playback: starting any audio/video pauses the others.
// Capturing listener because media 'play' events don't bubble.
document.addEventListener('play', function (event) {
    if (event.target.matches('audio, video')) {
        document.querySelectorAll('audio, video').forEach(function (el) {
            if (el !== event.target) el.pause();
        });
    }
}, true);

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

function makeEditable(element, inputType = 'text', evt = window.event) {
    // Prevent double-editing
    if (element.classList.contains('editing')) {
        return;
    }

    // Was calling preventDefault() on the bare global `event`, which only
    // exists in Chromium. The default parameter keeps every inline
    // onclick="makeEditable(this)" call site working untouched.
    if (evt) {
        evt.preventDefault();
        evt.stopPropagation();
    }

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

        // Check if element still exists and is in editing mode
        if (!element || !element.classList.contains('editing')) {
            return;
        }

        try {
            element.innerHTML = originalContent;
            element.classList.remove('editing');
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
        { text: 'List', title: 'Bullet Point', action: () => insertText(textarea, '\n- ') },
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

        // Find the label and show uploading state
        const label = input.nextElementSibling || input.previousElementSibling;
        if (label && label.tagName === 'LABEL') {
            const originalText = label.textContent;
            label.textContent = 'Uploading…';
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

// Handle upload errors
document.addEventListener('htmx:responseError', function (event) {

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

    // Find any progress indicators and update them
    const progressBars = document.querySelectorAll('.upload-progress');
    progressBars.forEach(bar => {
        bar.style.width = progress + '%';
    });

    // Update any upload labels with progress
    const uploadingLabels = document.querySelectorAll('[data-original-text]');
    uploadingLabels.forEach(label => {
        if (progress < 100) {
            label.textContent = `Uploading… ${Math.round(progress)}%`;
        }
    });
});

// Enhanced HTMX request handlers
document.addEventListener('htmx:beforeRequest', function (event) {
    const target = event.target;

    // Handle image upload forms
    if (target.matches('form[hx-encoding="multipart/form-data"]')) {
        const label = target.querySelector('label');
        if (label && !label.hasAttribute('data-original-text')) {
            const originalText = label.textContent;
            label.setAttribute('data-original-text', originalText);
            label.textContent = 'Preparing upload…';
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

// Band Member Drag and Drop Functionality
let draggedElement = null;
let draggedIndex = null;

function initializeBandSorting() {
    const bandGrid = document.querySelector('.band-grid.sortable');

    if (!bandGrid) {
        return;
    }

    const bandMembers = bandGrid.querySelectorAll('.band-member.draggable');

    bandMembers.forEach((member, index) => {

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

        // Send reorder request
        sendReorderRequest(currentOrder);
    }

    this.classList.remove('drag-over');
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
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
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement && draggedElement !== this) {

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

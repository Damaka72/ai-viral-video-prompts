// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Find the video card that has the matching modal ID set in its onclick attribute
    let cardElement = document.querySelector(`.video-card[onclick*="${modalId}"]`);

    // If the card wasn't found (e.g., if the button was clicked), try finding the card via the button's parent
    if (!cardElement) {
        const button = document.querySelector(`button[onclick*="${modalId}"]`);
        if (button) {
            cardElement = button.closest('.video-card');
        }
    }

    const videoId = cardElement ? cardElement.getAttribute('data-video-id') : null;

    if (videoId) {
        // Inject the YouTube iframe with autoplay into the modal's video container
        const videoContainer = modal.querySelector(`#${modalId}-video`);
        if (videoContainer) {
            videoContainer.innerHTML = `
                <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                    title="Video Example"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            `;
        }
    }

    // Display the modal
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    // Focus trap: focus the close button
    const closeButton = modal.querySelector('.close');
    if (closeButton) {
        closeButton.focus();
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Stop video playback by clearing the container content
    const videoContainer = modal.querySelector(`#${modalId}-video`);
    if (videoContainer) {
        videoContainer.innerHTML = ''; // This unloads the iframe and stops the video
    }

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus to the element that opened the modal
    const triggerElement = document.querySelector(`.video-card[onclick*="${modalId}"]`);
    if (triggerElement) {
        triggerElement.focus();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
}

// Close modal on ESC key for accessibility
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                closeModal(modal.id);
            }
        });
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add loading animation to buttons
    document.querySelectorAll('.product-button.live').forEach(button => {
        button.addEventListener('click', function() {
            // Only animate if it's an external link (not a modal trigger)
            if (this.tagName === 'A') {
                const originalText = this.innerHTML;
                this.innerHTML = '⏳ Opening Store...';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            }
        });
    });

    // Make video cards keyboard accessible
    document.querySelectorAll('.video-card').forEach(card => {
        // Make cards focusable
        card.setAttribute('tabindex', '0');

        // Add keyboard support
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Extract modal ID from onclick attribute
                const onclickAttr = this.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/openModal\('([^']+)'\)/);
                    if (match && match[1]) {
                        openModal(match[1]);
                    }
                }
            }
        });
    });
});

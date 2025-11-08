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

    // Initialize Lead Magnet Popup
    initLeadMagnetPopup();
});

// ============================================
// LEAD MAGNET POPUP FUNCTIONS
// ============================================

// Cookie helper functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Open lead popup
function openLeadPopup() {
    const popup = document.getElementById('leadMagnetPopup');
    if (popup) {
        popup.classList.add('active');
        popup.style.display = 'block';
        popup.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Set cookie to prevent showing again for 7 days
        setCookie('leadPopupShown', 'true', 7);
    }
}

// Close lead popup
function closeLeadPopup() {
    const popup = document.getElementById('leadMagnetPopup');
    if (popup) {
        popup.classList.remove('active');
        popup.style.display = 'none';
        popup.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// Initialize popup triggers
function initLeadMagnetPopup() {
    // Check if popup was already shown
    if (getCookie('leadPopupShown') || getCookie('leadPopupSubmitted')) {
        console.log('Lead popup already shown - skipping');
        return; // Don't show popup if already shown or submitted
    }

    console.log('Lead popup initialized - will show in 15 seconds or on scroll/exit');
    let popupTriggered = false;

    // Trigger 1: Exit Intent (when mouse moves toward top of browser)
    document.addEventListener('mouseleave', function(e) {
        if (!popupTriggered && e.clientY < 10) {
            console.log('Exit intent detected - showing popup');
            openLeadPopup();
            popupTriggered = true;
        }
    });

    // Trigger 2: Time delay (15 seconds after page load)
    setTimeout(function() {
        if (!popupTriggered && !getCookie('leadPopupShown')) {
            console.log('Time trigger - showing popup after 15 seconds');
            openLeadPopup();
            popupTriggered = true;
        }
    }, 15000); // 15 seconds

    // Trigger 3: Scroll depth (70% down the page)
    let scrollTriggered = false;
    window.addEventListener('scroll', function() {
        if (!popupTriggered && !scrollTriggered) {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 70) {
                console.log('Scroll depth 70% reached - showing popup');
                openLeadPopup();
                popupTriggered = true;
                scrollTriggered = true;
            }
        }
    });

    // Close popup when clicking overlay
    const overlay = document.querySelector('.lead-popup-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeLeadPopup);
    }

    // Close popup on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            const popup = document.getElementById('leadMagnetPopup');
            if (popup && popup.classList.contains('active')) {
                closeLeadPopup();
            }
        }
    });
}

// Handle form submission - CONSTANT CONTACT INTEGRATION
function handleLeadSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('leadEmail').value;
    const firstName = document.getElementById('leadFirstName').value;
    const lastName = document.getElementById('leadLastName').value;

    // Validate inputs
    if (!email || !firstName || !lastName) {
        alert('Please fill in all fields.');
        return false;
    }

    // Show loading state on button
    const submitButton = document.querySelector('.lead-popup-button');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '⏳ SUBMITTING...';
    submitButton.disabled = true;

    // ============================================
    // CONSTANT CONTACT INTEGRATION
    // ============================================
    // Fill in the hidden Constant Contact form programmatically

    console.log('Starting submission process...');
    console.log('Email:', email);
    console.log('First Name:', firstName);
    console.log('Last Name:', lastName);

    // Wait for Constant Contact form to be fully loaded
    setTimeout(function() {
        try {
            // Find the Constant Contact form
            const hiddenFormContainer = document.querySelector('#ctct-hidden-form');
            console.log('Hidden form container found:', hiddenFormContainer ? 'YES' : 'NO');

            if (!hiddenFormContainer) {
                alert('Error: Constant Contact form not loaded. Please refresh and try again.');
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                return;
            }

            const ccForm = hiddenFormContainer.querySelector('form');
            console.log('CC Form found:', ccForm ? 'YES' : 'NO');

            if (!ccForm) {
                alert('Note: Email may not have been submitted to Constant Contact. Please contact support.');
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                return;
            }

            // Find all input fields and log them for debugging
            const allInputs = ccForm.querySelectorAll('input');
            console.log('Total input fields found:', allInputs.length);
            allInputs.forEach(function(input, index) {
                console.log('Input ' + index + ':', input.type, input.name, input.placeholder);
            });

            // Find fields by various selectors (case-insensitive)
            let ccEmailField, ccFirstNameField, ccLastNameField;

            allInputs.forEach(function(input) {
                const name = (input.name || '').toLowerCase();
                const placeholder = (input.placeholder || '').toLowerCase();
                const type = (input.type || '').toLowerCase();

                // Email field
                if (type === 'email' || name.includes('email') || placeholder.includes('email')) {
                    ccEmailField = input;
                }
                // First name field
                if (name.includes('first') || placeholder.includes('first')) {
                    ccFirstNameField = input;
                }
                // Last name field
                if (name.includes('last') || placeholder.includes('last')) {
                    ccLastNameField = input;
                }
            });

            console.log('Email field found:', ccEmailField ? 'YES' : 'NO');
            console.log('First name field found:', ccFirstNameField ? 'YES' : 'NO');
            console.log('Last name field found:', ccLastNameField ? 'YES' : 'NO');

            // Fill in the fields
            if (ccEmailField) {
                ccEmailField.value = email;
                ccEmailField.dispatchEvent(new Event('input', { bubbles: true }));
                ccEmailField.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (ccFirstNameField) {
                ccFirstNameField.value = firstName;
                ccFirstNameField.dispatchEvent(new Event('input', { bubbles: true }));
                ccFirstNameField.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (ccLastNameField) {
                ccLastNameField.value = lastName;
                ccLastNameField.dispatchEvent(new Event('input', { bubbles: true }));
                ccLastNameField.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Find and click the submit button
            const submitBtn = ccForm.querySelector('button[type="submit"], input[type="submit"], button');
            console.log('Submit button found:', submitBtn ? 'YES' : 'NO');

            if (submitBtn) {
                console.log('Clicking Constant Contact submit button...');
                submitBtn.click();

                // Show success after brief delay
                setTimeout(function() {
                    handleSuccessfulSubmission();
                }, 2000);
            } else {
                // Try form.submit() as fallback
                console.log('No submit button, trying form.submit()...');
                ccForm.submit();

                setTimeout(function() {
                    handleSuccessfulSubmission();
                }, 2000);
            }

        } catch (error) {
            console.error('Error submitting to Constant Contact:', error);
            alert('An error occurred: ' + error.message);
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    }, 3000); // Wait 3 seconds for CC widget to fully load

    return false;
}

function handleSuccessfulSubmission() {
    // Set cookie to never show popup again after submission
    setCookie('leadPopupSubmitted', 'true', 365);

    // Show success message
    const popupContent = document.querySelector('.lead-popup-content');
    if (popupContent) {
        popupContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="color: #4ecdc4; font-size: 2rem; margin-bottom: 1rem;">Success!</h2>
                <p style="font-size: 1.2rem; color: #e0e0e0; margin-bottom: 2rem;">
                    Check your email for your <strong>50 FREE AI Video Prompts!</strong>
                </p>
                <p style="color: #999; font-size: 0.9rem;">
                    (Don't forget to check your spam folder)
                </p>
                <button onclick="closeLeadPopup()" class="lead-popup-button" style="margin-top: 2rem;">
                    CLOSE
                </button>
            </div>
        `;
    }

    // Close popup after 5 seconds
    setTimeout(closeLeadPopup, 5000);
}

// ============================================
// TESTING FUNCTIONS (for manual testing)
// ============================================

// Clear popup cookies to test again
window.testResetPopup = function() {
    document.cookie = 'leadPopupShown=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'leadPopupSubmitted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('✅ Popup cookies cleared! Reload the page to test again.');
};

// Manually trigger the popup (ignores cookies)
window.testShowPopup = function() {
    console.log('🎯 Manually triggering popup...');
    openLeadPopup();
};

// Check popup status
window.testPopupStatus = function() {
    const shown = getCookie('leadPopupShown');
    const submitted = getCookie('leadPopupSubmitted');
    console.log('📊 Popup Status:');
    console.log('- Already shown:', shown ? 'YES' : 'NO');
    console.log('- Already submitted:', submitted ? 'YES' : 'NO');
    console.log('\nTo reset and test again, run: testResetPopup()');
    console.log('To show popup immediately, run: testShowPopup()');
};

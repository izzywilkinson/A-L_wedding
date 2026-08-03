// Menu toggling script
// This file is included on multiple pages. Some pages do not include the
// mobile menu elements, so guard against missing nodes to avoid runtime
// errors (e.g. calling addEventListener on null).

document.addEventListener('DOMContentLoaded', () => {
    // Get menu elements (may be null on pages without the mobile menu)
    const button = document.getElementById('menuButton');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');

    // If any of the required elements is missing, stop safely.
    if (!button || !menu || !overlay) return;

    // Initialize ARIA states for accessibility
    button.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');

    // Open the menu: add classes that trigger CSS transitions/styles
    function openMenu() {
        menu.classList.add('open');
        button.classList.add('open');
        overlay.classList.add('show');
        // Update ARIA attributes so assistive tech knows the menu state
        button.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        // Move keyboard focus into the menu for keyboard users
        const firstLink = menu.querySelector('a');
        if (firstLink) firstLink.focus();
    }

    // Close the menu: remove the classes
    function closeMenu() {
        menu.classList.remove('open');
        button.classList.remove('open');
        overlay.classList.remove('show');
        // Update ARIA attributes back to closed state
        button.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        // Return focus to the menu button so keyboard users aren't lost
        button.focus();
    }

    // Toggle the menu when the button is clicked
    button.addEventListener('click', () => {
        if (menu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Clicking the overlay closes the menu
    overlay.addEventListener('click', closeMenu);

    // Close the menu when any menu link is clicked (use menu-scoped query)
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Mark the current page link with aria-current="page" for assistive tech
    // Compare by filename only so this works when using file:// or relative paths.
    const currentFile = window.location.pathname.split('/').pop();
    menu.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentFile || (href === 'index.html' && !currentFile)) {
            link.setAttribute('aria-current', 'page');
        }
    });
});
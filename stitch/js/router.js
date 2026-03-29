// router.js - Handles page navigation
const router = {
    navigateTo(path) {
        // Base path for stitch folder
        const base = window.location.pathname.includes('/stitch/') ? 
            window.location.pathname.substring(0, window.location.pathname.indexOf('/stitch/') + 8) : '/';
        window.location.href = base + path;
    },

    highlightActiveMenu() {
        const path = window.location.pathname;
        const menuLinks = document.querySelectorAll('nav a, aside a');
        
        menuLinks.forEach(link => {
            if (path.includes(link.getAttribute('href'))) {
                link.classList.add('bg-primary-container', 'text-primary');
            } else {
                link.classList.remove('bg-primary-container', 'text-primary');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    router.highlightActiveMenu();
});
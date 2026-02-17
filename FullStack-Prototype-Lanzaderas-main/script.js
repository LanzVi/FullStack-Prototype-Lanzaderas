// Phase 1 
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('getStartedBtn'); //something dli pwede tagaan ug alteration

    startBtn.addEventListener('click', () => {
        // Simple simulation of initializing the app state
        const initialState = {
            isLoggedIn: false,
            role: 'guest',
            employees: []
        };

        if (!localStorage.getItem('app_data')) {
            localStorage.setItem('app_data', JSON.stringify(initialState));
            console.log('App data initialized in localStorage.');
        }

        alert('Prototype sequence initiated! Check your console.');
    });
});

// Phase 2:
function handleRouting() {
    // 1. Get the current "cue" from the URL (e.g., "#/login")
    const hash = window.location.hash || '#/';

    // 2. Hide all sets (turn off all lights)
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 3. spotlight the correct set 
    if (hash === '#/' || hash === '') {
        document.getElementById('home-page').classList.add('active');
    } else if (hash === '#/login') {
        document.getElementById('login-page').classList.add('active');
    } else if (hash === '#/profile') {
        // Protected route logic: Redirect if not logged in 
        if (!localStorage.getItem('auth_token')) {
            window.location.hash = '#/login';
            return;
        }
        document.getElementById('profile-page').classList.add('active');
    }
}

// Listen for the "cue" change (whenever the URL hash changes) 
window.addEventListener('hashchange', handleRouting);

// Run once when the page first loads 
window.addEventListener('load', handleRouting);
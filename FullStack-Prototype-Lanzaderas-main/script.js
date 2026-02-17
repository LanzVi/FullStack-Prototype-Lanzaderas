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

//Routing?
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

let currentUser = null; // This holds the "Member" currently in the club 

//Authentication
function setAuthState(isAuth, user = null) {
    currentUser = user;
    const body = document.body;

    if (isAuth && user) {
        // User is logged in (Wearing the wristband)
        body.classList.add('authenticated');
        body.classList.remove('not-authenticated');
        
        // If the user is an Admin, give them the "VIP" badge 
        if (user.role === 'Admin') {
            body.classList.add('is-admin');
        } else {
            body.classList.remove('is-admin');
        }
    } else {
        // User is logged out (Wristband removed)

        body.classList.remove('authenticated', 'is-admin');
        body.classList.add('not-authenticated');
        localStorage.removeItem('auth_token'); // Throw away the wristband 
    }
}

//Registration
function handleRegistration(userData) {
    // 1. Check if email already exists in our 'database' 
    const existingUser = window.db.accounts.find(u => u.email === userData.email);
    
    if (existingUser) {
        alert("Email already registered!");
        return;
    }

    // 2. Save new account as 'unverified'
    const newUser = { ...userData, verified: false, role: 'User' };
    window.db.accounts.push(newUser);
    
    // 3. Store in localStorage so we don't forget them
    saveToStorage();
    localStorage.setItem('unverified_email', userData.email);

    // 4. Send them to the verification "Set"
    window.location.hash = '#/verify-email';
}
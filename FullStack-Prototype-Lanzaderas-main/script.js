window.addEventListener('load', () => {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('current_user_email');
    
    if (token && email) {
        const user = window.db.accounts.find(u => u.email === email);
        if (user) setAuthState(true, user);
    }
    
    handleRouting(); // Then check where the user should be
});

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
    //Get the current "cue" from the URL (e.g., "#/login")
    const hash = window.location.hash || '#/';

    //Hide all sets (turn off all lights)
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    if (hash === '#/profile') {
        renderProfile(); // <--- CALL THE POPULATOR HERE
        document.getElementById('profile-page').classList.add('active');
    }

    //spotlight the correct set 
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
    
    // 3. Store in localStorage so we don't forget thems
    saveToStorage();
    localStorage.setItem('unverified_email', userData.email);

    // 4. Send them to the verification "Set"
    window.location.hash = '#/verify-email';
}

//Email Verification (Simulated)
function simulateVerification() {
    //Finds email we stored during registration
    const unverifiedEmail = localStorage.getItem('unverified_email');

    if (!unverifiedEmail) {
        alert("No pending verification found.");
        window.location.hash = '#/register';
        return;
    }

    //Finds that specific account in our 'database'
    const account = window.db.accounts.find(u => u.email === unverifiedEmail);

    if (account) {
        //Sets the 'Verified' stamp to true
        account.verified = true;
        
        //Saves the updated database back to storage
        saveToStorage();
        
        //Cleans up the temporary email storage
        localStorage.removeItem('unverified_email');

        alert("Email verified successfully! You can now log in.");
        
        //Sends them to the Login page
        window.location.hash = '#/login';
    }
}

//Login Logic
function handleLogin(email, password) {
    //Finds the user in our local "Database"
    const user = window.db.accounts.find(u => u.email === email && u.password === password);

    if (!user) {
        alert("Invalid email or password.");
        return;
    }

    //Checks if they finished the verification step
    if (!user.verified) {
        alert("Please verify your email first!");
        window.location.hash = '#/verify-email';
        return;
    }

    // 3. Create a "Fake" JWT Token (The Wristband)
    const fakeToken = btoa(user.email + ":" + Date.now()); // Simple base64 string
    localStorage.setItem('auth_token', fakeToken);
    localStorage.setItem('current_user_email', user.email);

    //Updates the App State
    setAuthState(true, user);

    alert(`Welcome back, ${user.firstName}!`);
    
    //Sends them to their Profile
    window.location.hash = '#/profile';
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Stop the page from refreshing!
    
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    
    handleLogin(email, pass);
});

//Profile Management
function renderProfile() {
    //Safety check: If no one is logged in, send them away
    if (!currentUser) {
        window.location.hash = '#/login';
        return;
    }

    //Select the HTML elements
    const nameDisplay = document.getElementById('profileName');
    const emailDisplay = document.getElementById('profileEmail');
    const roleDisplay = document.getElementById('profileRole');

    //Inject the data from our currentUser object
    nameDisplay.innerText = `${currentUser.firstName} ${currentUser.lastName}`;
    emailDisplay.innerText = currentUser.email;
    roleDisplay.innerText = currentUser.role;
}
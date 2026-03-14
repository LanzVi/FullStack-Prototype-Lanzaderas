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
    const startBtn = document.getElementById('getStartedBtn');

    startBtn.addEventListener('click', () => {
        // Move the user to the register page
        window.location.hash = '#/register';
    });
});

//Logout Logic  
document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the link from jumping
    
    //Clear the Auth State (The "Bouncer" removes the wristband)
    setAuthState(false);
    
    //Remove items from the "Locker" (localStorage)
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user_email');
    
    //Kick them back to the Home or Login page
    alert("You have been logged out.");
    window.location.hash = '#/login';
});

const STORAGE_KEY = 'ipt_demo_v1';
window.db = { accounts: [], employees: [], departments: [], requests: [] };

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        window.db = JSON.parse(data);
    } else {
        // Seed initial admin data
        window.db.accounts.push({
            firstName: 'Admin', lastName: 'User',
            email: 'admin@example.com', password: 'Password123!',
            role: 'Admin', verified: true
        });
        saveToStorage();
    }
}
loadFromStorage();

//Routing?
// Update your existing handleRouting function:
function handleRouting() {
    const hash = window.location.hash || '#/';
    
    // 1. CLEAR THE STAGE: Hide every section first
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // 2. CHECK THE "CUE" (The Route)
    if (hash === '#/' || hash === '') {
        document.getElementById('home-page').classList.add('active');
    } 
    
    else if (hash === '#/login') {
        document.getElementById('login-page').classList.add('active');
    }

    // 3. THE SECURITY CHECK (The "Bouncer" Logic)
    else if (hash === '#/accounts') {
        // This is where the code sits. It acts as a gatekeeper.
        if (currentUser && currentUser.role === 'Admin') {
            renderAccounts(); // Success: Let them in and show the data
            document.getElementById('accounts-page').classList.add('active');
        } else {
            // Failure: Kick them out to a safe page
            alert("Access Denied: Admins Only!");
            window.location.hash = '#/profile'; 
        }
    }

    else if (hash === '#/profile') {
        renderProfile();
        document.getElementById('profile-page').classList.add('active');
    } 
    else if (hash === '#/employees') {
        if (currentUser && currentUser.role === 'Admin') {
            renderEmployees();
            document.getElementById('employees-page').classList.add('active');
        } else {
            window.location.hash = '#/profile';
        }
    }
    else if (hash === '#/requests') {
        renderRequests(); // You still need to write this function!
        document.getElementById('requests-page').classList.add('active');
    }
}

//Register Form Listener
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevents the page from refreshing

    const userData = {
        firstName: document.getElementById('regFirst').value,
        lastName: document.getElementById('regLast').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPass').value
    };

    // Pass the data to your existing registration logic
    handleRegistration(userData);
});

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
    const existingUser = window.db.accounts.find(u => u.email === userData.email);
    
    if (existingUser) {
        alert("Email already registered!");
        return;
    }

    const newUser = { ...userData, verified: false, role: 'User' };
    window.db.accounts.push(newUser);
    
    saveToStorage();
    localStorage.setItem('unverified_email', userData.email);

    // NEW: Update the UI text before switching pages
    document.getElementById('displayVerifyEmail').innerText = userData.email;

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

//Admin Account Management
function renderAccounts() {
    const tbody = document.getElementById('accountsTableBody');
    const userCount = document.getElementById('userCount');
    
    //Clear the table first (empty the ledger)
    tbody.innerHTML = '';
    userCount.innerText = window.db.accounts.length;

    //Loop through the "Database"
    window.db.accounts.forEach((user, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'}">${user.role}</span></td>
            <td>
                ${user.verified ? 
                    '<span class="text-success">✔ Verified</span>' : 
                    '<span class="text-warning">⌛ Pending</span>'}
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAccount(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to delete a user
function deleteAccount(index) {
    if (confirm("Are you sure you want to delete this account?")) {
        window.db.accounts.splice(index, 1); // Remove from array
        saveToStorage(); // Save to localStorage
        renderAccounts(); // Refresh the table
    }
}

//Employee Management
function renderEmployees() {
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';

    window.db.employees.forEach((emp, index) => {
        const row = `
            <tr>
                <td>${emp.firstName} ${emp.lastName}</td>
                <td>${emp.department}</td>
                <td>${emp.email}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${index})">Delete</button>
                </td>
            </tr>`;
        tbody.innerHTML += row;
    });
}

// Logic to handle the Form Submission
document.getElementById('employeeForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const newEmp = {
        firstName: document.getElementById('empFirstName').value,
        lastName: document.getElementById('empLastName').value,
        email: document.getElementById('empEmail').value,
        department: document.getElementById('empDept').value
    };

    window.db.employees.push(newEmp);
    saveToStorage();
    renderEmployees();

    // Close the modal using Bootstrap's built-in command
    bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
    e.target.reset(); // Clear the form
});

//Dynamic Item Management
function addItemRow() {
    const container = document.getElementById('requestItemsContainer');
    const rowId = Date.now(); // Unique ID for this specific row

    const rowHtml = `
        <div class="row g-2 mb-2 align-items-center" id="row-${rowId}">
            <div class="col-8">
                <input type="text" class="form-control item-name" placeholder="Item name" required>
            </div>
            <div class="col-3">
                <input type="number" class="form-control item-qty" value="1" min="1" required>
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeRow(${rowId})">×</button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHtml);
}

function removeRow(id) {
    document.getElementById(`row-${id}`).remove();
}

//Saving the "Array of Objects"
document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();

    //Collect all the dynamic rows
    const itemElements = document.querySelectorAll('#requestItemsContainer .row');
    const items = [];

    itemElements.forEach(row => {
        items.push({
            name: row.querySelector('.item-name').value,
            qty: row.querySelector('.item-qty').value
        });
    });

    if (items.length === 0) {
        alert("Please add at least one item!");
        return;
    }

    //Build the final Request object
    const newRequest = {
        id: Date.now(),
        userEmail: currentUser.email,
        type: document.getElementById('reqType').value,
        items: items,
        status: 'Pending',
        date: new Date().toLocaleDateString()
    };

    //Save to our simulated database
    window.db.requests.push(newRequest);
    saveToStorage();
    
    //Update UI
    alert("Request submitted successfully!");
    bootstrap.Modal.getInstance(document.getElementById('requestModal')).hide();
    document.getElementById('requestItemsContainer').innerHTML = ''; // Reset rows
    e.target.reset();
});

function showToast(message) {
    // Logic to create a temporary div and remove it after 3 seconds
    console.log("Toast shown: " + message); 
}

function renderRequests() {
    const tbody = document.getElementById('requestsTableBody');
    tbody.innerHTML = '';

    // Filter requests so users only see their own
    const myRequests = window.db.requests.filter(r => r.userEmail === currentUser.email);

    myRequests.forEach(req => {
        const itemSummary = req.items.map(i => `${i.qty}x ${i.name}`).join(', ');
        const row = `
            <tr>
                <td>${req.date}</td>
                <td>${req.type}</td>
                <td>${itemSummary}</td>
                <td><span class="badge status-${req.status.toLowerCase()}">${req.status}</span></td>
            </tr>`;
        tbody.innerHTML += row;
    });
}

function deleteEmployee(index) {
    if (confirm("Delete this employee?")) {
        window.db.employees.splice(index, 1);
        saveToStorage();
        renderEmployees();
    }
}
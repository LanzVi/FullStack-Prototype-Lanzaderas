document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('getStartedBtn');

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
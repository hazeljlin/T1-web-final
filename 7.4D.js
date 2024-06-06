// Toggle Search Input Field
document.getElementById('toggleSearchButton').addEventListener('click', function() {
    const searchQuery = document.getElementById('searchQuery');
    const searchButton = document.getElementById('searchButton');
    if (searchQuery.classList.contains('d-none')) {
        searchQuery.classList.remove('d-none');
        searchButton.classList.remove('d-none');
    } else {
        searchQuery.classList.add('d-none');
        searchButton.classList.add('d-none');
    }
});

// Search Form Submission
document.getElementById('searchButton').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent default form submission behavior
    const query = document.getElementById('searchQuery').value.trim();
    if (query) {
        fetch(`/search?query=${encodeURIComponent(query)}`)
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                response.json().then(results => {
                    const newWindow = window.open('', '_blank', 'width=800,height=600');
                    newWindow.document.write('<html><head><title>Search Results</title></head><body>');
                    newWindow.document.write('<h3>Search Results</h3>');
                    if (results.length === 0) {
                        newWindow.document.write('<p>No results found</p>');
                    }
                    newWindow.document.write('</body></html>');
                    newWindow.document.close();
                });
            }
        })
        .catch(error => console.error('Error:', error));
    }
});


// Login Form Submission
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.text())
        .then(result => {
            document.getElementById('loginResult').textContent = result;
            if (result === 'Login successful') {
                document.getElementById('loginResult').classList.remove('text-danger');
                document.getElementById('loginResult').classList.add('text-success');
            } else {
                document.getElementById('loginResult').classList.remove('text-success');
                document.getElementById('loginResult').classList.add('text-danger');
            }
        });
});

// Feedback Form Submission
document.getElementById('feedbackForm').addEventListener('submit', function (event) {
    event.preventDefault();
    let isValid = true;

    // Clear previous error messages
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('messageError').textContent = '';

    // Validate name
    const name = document.getElementById('feedbackName').value.trim();
    if (name === '') {
        document.getElementById('nameError').textContent = 'You did not enter your name';
        isValid = false;
    }

    // Validate email
    const email = document.getElementById('feedbackEmail').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        isValid = false;
    }

    // Validate phone (optional, but must be digits if provided)
    const phone = document.getElementById('feedbackPhone').value.trim();
    if (phone !== '' && !/^\d+$/.test(phone)) {
        document.getElementById('phoneError').textContent = 'Phone number must be digits';
        isValid = false;
    }

    // Validate message
    const message = document.getElementById('feedbackMessage').value.trim();
    if (message === '') {
        document.getElementById('messageError').textContent = 'You did not enter a message';
        isValid = false;
    }

    // If form is valid, submit it
    if (isValid) {
        fetch('/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, message })
        })
            .then(response => response.text())
            .then(result => {
                document.getElementById('feedbackResult').textContent = result;
            });
    }
});

// Course Registration Form Submission
document.getElementById('registrationForm').addEventListener('submit', function (event) {
    event.preventDefault();
    let isValid = true;

    // Clear previous error messages
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';

    // Validate name
    const name = document.getElementById('name').value.trim();
    if (name === '') {
        document.getElementById('nameError').textContent = 'You did not enter your name';
        isValid = false;
    }

    // Validate email
    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        isValid = false;
    }

    // If form is valid, submit it
    if (isValid) {
        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        })
            .then(response => response.text())
            .then(result => {
                document.getElementById('registrationResult').textContent = result;
            });
    }
});






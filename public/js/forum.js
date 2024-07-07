document.addEventListener('DOMContentLoaded', () => {
    const discussionList = document.getElementById('discussionList');
    const discussionForm = document.getElementById('discussionForm');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authModal = document.getElementById('auth-modal');
    const modalTitle = document.getElementById('modal-title');
    const authForm = document.getElementById('auth-form');
    const authMessage = document.getElementById('auth-message');
    const newDiscussionForm = document.getElementById('new-discussion-form');

    let currentUser = null;

    function renderDiscussions(discussions) {
        discussionList.innerHTML = '';
        discussions.forEach(discussion => {
            const li = document.createElement('li');


            li.className = 'discussion-item';
            li.innerHTML = `
                <h3 class="discussion-title">${discussion.title}</h3>
                <div class="discussion-meta">Posted by ${discussion.author} on ${new Date(discussion.createdAt.toDate()).toLocaleString()}</div>
                <p class="discussion-preview">${discussion.content.substring(0, 100)}...</p>
                <a href="/views/discussion.html?id=${discussion.id}" class="button">Join Discussion</a>
            `;
            discussionList.appendChild(li);
        });
    }

    function fetchDiscussions() {
        db.collection('discussions').orderBy('createdAt', 'desc').get()
            .then(querySnapshot => {
                const discussions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                renderDiscussions(discussions);
            })
            .catch(error => console.error("Error fetching discussions: ", error));
    }

    function showAuthModal(title) {
        modalTitle.textContent = title;
        authModal.style.display = 'block';
    }

    function hideAuthModal() {
        authModal.style.display = 'none';
        authForm.reset();
        authMessage.textContent = '';
    }

    function updateUIForUser(user) {
        if (user) {
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            newDiscussionForm.style.display = 'block';
        } else {
            loginBtn.style.display = 'inline-block';
            signupBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            newDiscussionForm.style.display = 'none';
        }
    }

    loginBtn.addEventListener('click', () => showAuthModal('Login'));
    signupBtn.addEventListener('click', () => showAuthModal('Sign Up'));

    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            currentUser = null;
            updateUIForUser(null);
        }).catch((error) => {
            console.error('Logout error:', error);
        });
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (modalTitle.textContent === 'Login') {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    currentUser = userCredential.user;
                    hideAuthModal();
                    updateUIForUser(currentUser);
                })
                .catch((error) => {
                    authMessage.textContent = `Login error: ${error.message}`;
                });
        } else {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    currentUser = userCredential.user;
                    hideAuthModal();
                    updateUIForUser(currentUser);
                })
                .catch((error) => {
                    authMessage.textContent = `Sign up error: ${error.message}`;
                });
        }
    });

    discussionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please login to create a discussion.');
            return;
        }
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const author = document.getElementById('author').value;
        db.collection('discussions').add({
            title,
            content,
            author,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
            .then(() => {
                discussionForm.reset();
                fetchDiscussions();
            })
            .catch(error => console.error("Error adding discussion: ", error));

        // Existing discussion creation code
    });

    firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        updateUIForUser(user);
        fetchDiscussions();
    });
});
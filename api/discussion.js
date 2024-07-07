document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const discussionId = urlParams.get('id');
    const discussionTitle = document.getElementById('discussion-title');
    const discussionContent = document.getElementById('discussion-content');
    const discussionMeta = document.getElementById('discussion-meta');
    const discussionTags = document.getElementById('discussion-tags');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const newCommentForm = document.getElementById('new-comment-form');
    const voteButton = document.getElementById('vote-button');
    const voteCount = document.getElementById('vote-count');
    const resolveButton = document.getElementById('resolve-button');

    let currentUser = null;
    let currentDiscussion = null;

    firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            loginButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            newCommentForm.style.display = 'block';
            if (currentDiscussion && currentDiscussion.authorId === user.uid) {
                resolveButton.style.display = 'inline-block';
            }
        } else {
            loginButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            newCommentForm.style.display = 'none';
            resolveButton.style.display = 'none';
        }
    });

    loginButton.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
    });

    logoutButton.addEventListener('click', () => {
        firebase.auth().signOut();
    });

    function loadDiscussion() {
        db.collection('discussions').doc(discussionId).onSnapshot((doc) => {
            if (doc.exists) {
                currentDiscussion = doc.data();
                discussionTitle.textContent = currentDiscussion.title;
                discussionContent.textContent = currentDiscussion.content;
                discussionMeta.textContent = `posted by ${currentDiscussion.authorName} on ${currentDiscussion.createdAt.toDate().toLocaleString()}`;
                discussionTags.innerHTML = currentDiscussion.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                voteCount.textContent = currentDiscussion.votes;

                if (currentDiscussion.resolved) {
                    resolveButton.textContent = 'Resolved';
                    resolveButton.disabled = true;
                }

                if (currentUser && currentDiscussion.authorId === currentUser.uid) {
                    resolveButton.style.display = 'inline-block';
                }
            } else {
                console.log("No such discussion!");
            }
        }, (error) => {
            console.log("Error getting discussion:", error);
        });
    }

    function loadComments() {
        db.collection('discussions').doc(discussionId).collection('comments')
            .orderBy('createdAt')
            .onSnapshot((snapshot) => {
                commentsList.innerHTML = '';
                snapshot.forEach((doc) => {
                    const comment = doc.data();
                    const li = document.createElement('li');
                    li.className = 'comment-item';
                    li.innerHTML = `
                        <div class="comment-meta">posted by ${comment.authorName} on ${comment.createdAt.toDate().toLocaleString()}</div>
                        <div class="comment-content">${comment.content}</div>
                        <button class="vote-button" data-id="${doc.id}" data-votes="${comment.votes || 0}">
                            <i class="fas fa-arrow-up"></i> ${comment.votes || 0}
                        </button>
                    `;
                    commentsList.appendChild(li);

                    const voteButton = li.querySelector('.vote-button');
                    voteButton.addEventListener('click', () => voteComment(doc.id, comment.votes || 0));
                });
            }, (error) => {
                console.error("Error loading comments:", error);
            });
    }

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const content = document.getElementById('comment-content').value;

        db.collection('discussions').doc(discussionId).collection('comments').add({
            content: content,
            authorId: currentUser.uid,
            authorName: currentUser.displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            votes: 0
        }).then(() => {
            commentForm.reset();
        }).catch(error => console.error('Error adding comment:', error));
    });

    voteButton.addEventListener('click', () => {
        if (!currentUser) return;

        db.collection('discussions').doc(discussionId).update({
            votes: firebase.firestore.FieldValue.increment(1)
        }).catch(error => console.error('Error updating votes:', error));
    });

    function voteComment(commentId, currentVotes) {
        if (!currentUser) return;

        db.collection('discussions').doc(discussionId).collection('comments').doc(commentId).update({
            votes: currentVotes + 1
        }).catch(error => console.error('Error updating comment votes:', error));
    }

    resolveButton.addEventListener('click', () => {
        if (!currentUser || currentDiscussion.authorId !== currentUser.uid) return;

        db.collection('discussions').doc(discussionId).update({
            resolved: true
        }).then(() => {
            resolveButton.textContent = 'Resolved';
            resolveButton.disabled = true;
        }).catch(error => console.error('Error marking discussion as resolved:', error));
    });

    loadDiscussion();
    loadComments();
});
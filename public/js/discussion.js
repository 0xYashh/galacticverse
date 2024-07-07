document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const discussionId = urlParams.get('id');
    const discussionTitle = document.getElementById('discussion-title');
    const discussionContent = document.getElementById('discussion-content');
    const discussionMeta = document.getElementById('discussion-meta');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const editDiscussionBtn = document.getElementById('edit-discussion');
    const deleteDiscussionBtn = document.getElementById('delete-discussion');
    const upvoteBtn = document.getElementById('upvote');
    const downvoteBtn = document.getElementById('downvote');
    const voteCount = document.getElementById('vote-count');

    let currentDiscussion = null;

    function loadDiscussion() {
        db.collection('discussions').doc(discussionId).get().then((doc) => {
            if (doc.exists) {
                currentDiscussion = doc.data();
                discussionTitle.textContent = currentDiscussion.title;
                discussionContent.textContent = currentDiscussion.content;
                discussionMeta.textContent = `Posted on ${currentDiscussion.createdAt.toDate().toLocaleString()}`;
                voteCount.textContent = currentDiscussion.votes || 0;
            } else {
                console.log("No such discussion!");
            }
        }).catch((error) => {
            console.log("Error getting discussion:", error);
        });
    }

    function loadComments() {
        db.collection('discussions').doc(discussionId).collection('comments')
            .orderBy('createdAt')
            .get()
            .then((snapshot) => {
                commentsList.innerHTML = '';
                snapshot.forEach((doc) => {
                    const comment = doc.data();
                    const li = document.createElement('li');
                    li.className = 'comment-item';
                    li.innerHTML = `
                        <div class="comment-meta">Posted on ${comment.createdAt.toDate().toLocaleString()}</div>
                        <div class="comment-content">${comment.content}</div>
                        <button class="edit-comment button" data-id="${doc.id}">Edit</button>
                        <button class="delete-comment button" data-id="${doc.id}">Delete</button>
                    `;
                    commentsList.appendChild(li);
                });
            })
            .catch((error) => {
                console.error("Error loading comments:", error);
            });
    }

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = document.getElementById('comment-content').value;

        db.collection('discussions').doc(discussionId).collection('comments').add({
            content: content,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            commentForm.reset();
            loadComments();
        }).catch(error => console.error('Error adding comment:', error));
    });

    editDiscussionBtn.addEventListener('click', () => {
        const newTitle = prompt("Enter new title:", currentDiscussion.title);
        const newContent = prompt("Enter new content:", currentDiscussion.content);

        if (newTitle && newContent) {
            db.collection('discussions').doc(discussionId).update({
                title: newTitle,
                content: newContent
            }).then(() => {
                loadDiscussion();
            }).catch(error => console.error('Error updating discussion:', error));
        }
    });

    deleteDiscussionBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete this discussion?")) {
            db.collection('discussions').doc(discussionId).delete().then(() => {
                window.location.href = "forum.html";
            }).catch(error => console.error('Error deleting discussion:', error));
        }
    });

    upvoteBtn.addEventListener('click', () => updateVote(1));
    downvoteBtn.addEventListener('click', () => updateVote(-1));

    function updateVote(value) {
        db.collection('discussions').doc(discussionId).update({
            votes: firebase.firestore.FieldValue.increment(value)
        }).then(() => {
            loadDiscussion();
        }).catch(error => console.error('Error updating vote:', error));
    }

    commentsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-comment')) {
            const commentId = e.target.getAttribute('data-id');
            const commentContent = e.target.parentElement.querySelector('.comment-content').textContent;
            const newContent = prompt("Enter new comment:", commentContent);

            if (newContent) {
                db.collection('discussions').doc(discussionId).collection('comments').doc(commentId).update({
                    content: newContent
                }).then(() => {
                    loadComments();
                }).catch(error => console.error('Error updating comment:', error));
            }
        } else if (e.target.classList.contains('delete-comment')) {
            const commentId = e.target.getAttribute('data-id');
            if (confirm("Are you sure you want to delete this comment?")) {
                db.collection('discussions').doc(discussionId).collection('comments').doc(commentId).delete()
                    .then(() => {
                        loadComments();
                    }).catch(error => console.error('Error deleting comment:', error));
            }
        }
    });

    function initializeSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'comment-search';
        searchInput.placeholder = 'Search comments...';

        const searchButton = document.createElement('button');
        searchButton.textContent = 'Search';
        searchButton.classList.add('button');

        const searchContainer = document.createElement('div');
        searchContainer.id = 'comment-search-container';
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchButton);

        commentsList.parentNode.insertBefore(searchContainer, commentsList);

        searchButton.addEventListener('click', () => {
            const query = searchInput.value.toLowerCase();
            filterComments(query);
        });
    }

    function filterComments(query) {
        const commentItems = commentsList.querySelectorAll('.comment-item');
        commentItems.forEach(item => {
            const content = item.querySelector('.comment-content').textContent.toLowerCase();
            if (content.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    loadDiscussion();
    loadComments();
    initializeSearch();
});
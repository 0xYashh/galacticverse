document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const discussionId = urlParams.get('id');

    const discussionTitle = document.getElementById('discussionTitle');
    const discussionContent = document.getElementById('discussionContent');
    const discussionMeta = document.getElementById('discussionMeta');
    const commentsList = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');

    function renderDiscussion(discussion) {
        discussionTitle.textContent = discussion.title;
        discussionContent.textContent = discussion.content;
        discussionMeta.textContent = `Posted by ${discussion.author} on ${new Date(discussion.createdAt.toDate()).toLocaleString()}`;
    }

    function renderComments(comments) {
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = 'comment';
            div.innerHTML = `
                <div class="comment-meta">Comment by ${comment.author} on ${new Date(comment.createdAt.toDate()).toLocaleString()}</div>
                <p>${comment.content}</p>
            `;
            commentsList.appendChild(div);
        });
    }

    function fetchDiscussionAndComments() {
        db.collection('discussions').doc(discussionId).get()
            .then(doc => {
                if (doc.exists) {
                    renderDiscussion(doc.data());
                } else {
                    console.log("No such discussion!");
                }
            })
            .catch(error => console.error("Error getting discussion: ", error));

        db.collection('discussions').doc(discussionId).collection('comments')
            .orderBy('createdAt')
            .onSnapshot(snapshot => {
                const comments = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                renderComments(comments);
            });
    }

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = document.getElementById('commentContent').value;
        const author = document.getElementById('commentAuthor').value;

        db.collection('discussions').doc(discussionId).collection('comments').add({
            content,
            author,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            commentForm.reset();
        })
        .catch(error => console.error("Error adding comment: ", error));
    });

    fetchDiscussionAndComments();
});
document.addEventListener('DOMContentLoaded', function() {
    const discussionForm = document.getElementById('discussion-form');
    const discussionList = document.getElementById('discussion-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    function loadDiscussions(query = '') {
        db.collection('discussions')
            .orderBy('createdAt', 'desc')
            .get()
            .then((snapshot) => {
                discussionList.innerHTML = '';
                snapshot.forEach((doc) => {
                    const discussion = doc.data();
                    if (query && !discussion.title.toLowerCase().includes(query.toLowerCase())) {
                        return;
                    }
                    const li = document.createElement('li');
                    li.className = 'discussion-item';
                    li.innerHTML = `
                        <h3 class="discussion-title">${discussion.title}</h3>
                        <div class="discussion-meta">posted on ${discussion.createdAt.toDate().toLocaleString()}</div>
                        <p>${discussion.content.substring(0, 100)}...</p>
                        <a href="discussion.html?id=${doc.id}" class="button">join discussion</a>
                        <div>Votes: ${discussion.votes || 0}</div>
                    `;
                    discussionList.appendChild(li);
                });
            })
            .catch((error) => {
                console.error("Error loading discussions:", error);
            });
    }

    discussionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('discussion-title').value;
        const content = document.getElementById('discussion-content').value;
        const tags = document.getElementById('discussion-tags').value.split(',').map(tag => tag.trim());

        db.collection('discussions').add({
            title: title,
            content: content,
            tags: tags,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            votes: 0
        }).then(() => {
            discussionForm.reset();
            loadDiscussions();
        }).catch(error => console.error('Error adding discussion:', error));
    });

    searchButton.addEventListener('click', () => {
        const query = searchInput.value;
        loadDiscussions(query);
    });

    loadDiscussions();
});
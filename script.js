// --- STATE MANAGEMENT ---
let posts = JSON.parse(localStorage.getItem('posts')) || [];

let profile = JSON.parse(localStorage.getItem('profile')) || {
    username: "Muhammad Radhwa Bagas Widyasa",
    bio: "Undergraduate student at CCIT FTUI | Cybersecurity & Web Development",
    avatar: "https://ui-avatars.com/api/?name=MRBW&background=0D8ABC&color=fff&size=150"
};

// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    navigate('home');
    loadProfileData();
    document.querySelectorAll('.animate-on-load').forEach(el => {
        el.style.opacity = 0;
        el.style.transform = "translateY(20px)";
        setTimeout(() => {
            el.style.transition = "transform 0.4s ease, opacity 0.4s ease";
            el.style.transform = "translateY(0)";
            el.style.opacity = 1;
        }, 100);
    });
});

// --- NAVIGASI ---
function navigate(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${pageId}-page`).classList.add('active');

    if (pageId === 'home') renderHome();
    if (pageId === 'library') renderLibrary();

    updateNavLinks(pageId);
}

function updateNavLinks(pageId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.innerText.toLowerCase() === pageId) link.classList.add('active');
    });
}

// --- FITUR HOME ---
function renderHome() {
    const container = document.getElementById('home-posts');
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<p class="meta-text fade-in-up">Belum ada artikel yang dipublikasikan.</p>';
        return;
    }

    const sortedPosts = [...posts].reverse();

    sortedPosts.forEach((post, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.onclick = () => viewArticle(post.id);
        
        // Membersihkan tag HTML dari konten untuk preview di halaman Home
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.content;
        const plainText = tempDiv.innerText || tempDiv.textContent;
        const preview = plainText.length > 130 ? plainText.substring(0, 130) + '...' : plainText;

        card.innerHTML = `
            <h2 class="card-title">${post.title}</h2>
            <div class="article-meta meta-text">
                Oleh: ${profile.username} &bull; ${post.date}
            </div>
            <p>${preview}</p>
        `;
        container.appendChild(card);
    });
}

// --- FITUR BACA ARTIKEL ---
function viewArticle(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    document.getElementById('view-title').innerText = post.title;
    document.getElementById('view-date').innerText = `Diterbitkan pada ${post.date}`;
    document.getElementById('view-author').innerText = `oleh ${profile.username}`;
    
    // Menggunakan innerHTML agar tag <b> dan <img> bisa di-render
    document.getElementById('view-content').innerHTML = post.content;

    navigate('view');
}

// --- FITUR LIBRARY (Manajemen) ---
function renderLibrary() {
    const container = document.getElementById('library-posts');
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<p class="meta-text fade-in-up">Library kosong. Mulai tulis artikel pertama Anda.</p>';
        return;
    }

    posts.forEach((post, index) => {
        const item = document.createElement('div');
        item.className = 'library-item fade-in-up';
        item.style.animationDelay = `${index * 0.05}s`;
        item.innerHTML = `
            <div>
                <h3 style="font-size: 18px; margin-bottom: 6px;">${post.title}</h3>
                <span class="meta-text">${post.date}</span>
            </div>
            <div class="library-actions">
                <button class="btn btn-outline" onclick="editArticle(${post.id})">Edit</button>
                <button class="btn btn-outline" style="color: red; border-color: red;" onclick="deleteArticle(${post.id})">Hapus</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// --- FITUR EDITOR & RICH TEXT ---

// Fungsi memformat teks (Bold)
function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('post-content-input').focus();
}

// Fungsi menyisipkan gambar ke dalam editor
function insertImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            // Fokus kembali ke editor lalu sisipkan tag <img>
            document.getElementById('post-content-input').focus();
            document.execCommand('insertImage', false, base64Image);
        };
        reader.readAsDataURL(file);
    }
}

function openEditor(id = null) {
    const titleInput = document.getElementById('post-title-input');
    const contentEditor = document.getElementById('post-content-input');
    const idInput = document.getElementById('edit-id');
    const headerTitle = document.getElementById('editor-title');

    if (id) {
        const post = posts.find(p => p.id === id);
        titleInput.value = post.title;
        contentEditor.innerHTML = post.content; // Render HTML di editor
        idInput.value = post.id;
        headerTitle.innerText = "Edit Artikel";
    } else {
        titleInput.value = '';
        contentEditor.innerHTML = '';
        idInput.value = '';
        headerTitle.innerText = "Tulis Artikel Baru";
    }

    navigate('editor');
    document.querySelectorAll('.animate-input').forEach(input => input.classList.add('fade-in-up'));
}

function saveArticle(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('post-title-input').value;
    // Mengambil seluruh HTML (termasuk tag bold dan img) dari div
    const content = document.getElementById('post-content-input').innerHTML; 
    
    // Validasi kosong (karena div contenteditable bisa saja hanya berisi spasi/tag kosong)
    if (!content.trim() || content === '<br>') {
        alert("Konten artikel tidak boleh kosong!");
        return;
    }

    const date = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    if (id) {
        const index = posts.findIndex(p => p.id == id);
        posts[index].title = title;
        posts[index].content = content;
    } else {
        posts.push({
            id: Date.now(),
            title: title,
            content: content,
            date: date
        });
    }

    try {
        localStorage.setItem('posts', JSON.stringify(posts));
        navigate('library');
    } catch (e) {
        // Peringatan jika Local Storage penuh (karena gambar base64 bisa memakan ukuran yang lumayan)
        alert("Gagal menyimpan artikel. Gambar mungkin terlalu besar untuk Local Storage browser.");
    }
}

function editArticle(id) { openEditor(id); }

function deleteArticle(id) {
    if(confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem('posts', JSON.stringify(posts));
        renderLibrary();
    }
}

// --- FITUR PROFILE ---
function loadProfileData() {
    document.getElementById('profile-username').value = profile.username;
    document.getElementById('profile-bio').value = profile.bio;
    document.getElementById('profile-avatar').src = profile.avatar;
}

function saveProfile(e) {
    e.preventDefault();
    profile.username = document.getElementById('profile-username').value;
    profile.bio = document.getElementById('profile-bio').value;
    localStorage.setItem('profile', JSON.stringify(profile));
    alert('Profil berhasil disimpan!');
    renderHome();
}

function uploadAvatar(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64String = event.target.result;
            profile.avatar = base64String;
            document.getElementById('profile-avatar').src = base64String;
            localStorage.setItem('profile', JSON.stringify(profile));
            renderHome();
        };
        reader.readAsDataURL(file);
    }
}
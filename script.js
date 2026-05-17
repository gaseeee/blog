// --- STATE MANAGEMENT ---
// Mengambil data dari localStorage, atau menggunakan default
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
    // Tambahkan animasi saat load
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
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    const selectedPage = document.getElementById(`${pageId}-page`);
    selectedPage.classList.add('active');

    // Render data sesuai halaman
    if (pageId === 'home') renderHome();
    if (pageId === 'library') renderLibrary();

    // Perbarui status link navigasi
    updateNavLinks(pageId);
}

// Perbarui link navigasi aktif
function updateNavLinks(pageId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.innerText.toLowerCase() === pageId) {
            link.classList.add('active');
        }
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

    // Urutkan dari yang terbaru
    const sortedPosts = [...posts].reverse();

    sortedPosts.forEach((post, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.1}s`; // Delay animasi agar muncul bergantian
        card.onclick = () => viewArticle(post.id);
        
        // Memotong konten agar menjadi preview singkat
        const preview = post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content;

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
    document.getElementById('view-content').innerText = post.content;

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
        item.style.animationDelay = `${index * 0.05}s`; // Delay animasi lebih singkat
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

// --- FITUR EDITOR (Buat/Edit) ---
function openEditor(id = null) {
    const titleInput = document.getElementById('post-title-input');
    const contentInput = document.getElementById('post-content-input');
    const idInput = document.getElementById('edit-id');
    const headerTitle = document.getElementById('editor-title');

    if (id) {
        // Mode Edit
        const post = posts.find(p => p.id === id);
        titleInput.value = post.title;
        contentInput.value = post.content;
        idInput.value = post.id;
        headerTitle.innerText = "Edit Artikel";
    } else {
        // Mode Buat Baru
        titleInput.value = '';
        contentInput.value = '';
        idInput.value = '';
        headerTitle.innerText = "Tulis Artikel Baru";
    }

    navigate('editor');
    // Tambahkan animasi pada input
    document.querySelectorAll('.animate-input').forEach(input => {
        input.classList.add('fade-in-up');
    });
}

function saveArticle(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('post-title-input').value;
    const content = document.getElementById('post-content-input').value;
    const date = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    if (id) {
        // Update artikel lama
        const index = posts.findIndex(p => p.id == id);
        posts[index].title = title;
        posts[index].content = content;
    } else {
        // Buat artikel baru
        posts.push({
            id: Date.now(), // Unique ID
            title: title,
            content: content,
            date: date
        });
    }

    localStorage.setItem('posts', JSON.stringify(posts));
    navigate('library');
}

function editArticle(id) {
    openEditor(id);
}

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
    // Render ulang home untuk memperbarui nama penulis
    renderHome();
}

function uploadAvatar(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            // Menyimpan gambar sebagai string Base64
            const base64String = event.target.result;
            profile.avatar = base64String;
            document.getElementById('profile-avatar').src = base64String;
            
            // Auto save
            localStorage.setItem('profile', JSON.stringify(profile));
            // Render ulang home untuk memperbarui nama penulis
            renderHome();
        };
        reader.readAsDataURL(file);
    }
}
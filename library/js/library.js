// library.js — Library index + post renderer

// -----------------------------
// UTILITIES
// -----------------------------
async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error('Failed to fetch ' + path);
    }
    return res.json();
}

function qs(selector) {
    return document.querySelector(selector);
}

// -----------------------------
// DARK MODE
// -----------------------------
function initDarkMode() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const saved = localStorage.getItem('theme');

    // Initial state
    if (saved === 'dark') {
        document.body.classList.add('dark');
        toggle.textContent = '☀️';
        toggle.dataset.tooltip = 'Switch to Light Mode';
    } else {
        toggle.textContent = '🌙';
        toggle.dataset.tooltip = 'Switch to Dark Mode';
    }

    toggle.onclick = () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');

        toggle.textContent = isDark ? '☀️' : '🌙';
        toggle.dataset.tooltip = isDark
            ? 'Switch to Light Mode'
            : 'Switch to Dark Mode';

        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
}


// -----------------------------
// RENDER LIBRARY INDEX
// -----------------------------
async function renderIndex() {
    try {
        let activeCategory = 'All';

        const data = await fetchJSON('data/posts.json');
        const container = qs('#posts-list');
        const search = qs('#search');

        if (!container) return;

        // -----------------------------
        // RENDER POSTS (CATEGORY + SEARCH)
        // -----------------------------
        function renderFilteredPosts(searchQuery = '') {
            container.innerHTML = '';

            data
                .filter(post =>
                    (activeCategory === 'All' || post.category === activeCategory) &&
                    (post.title + post.summary + post.tags.join(' '))
                        .toLowerCase()
                        .includes(searchQuery)
                )
                .forEach(post => {
                    const div = document.createElement('div');
                    div.className = 'post-item';

                    div.innerHTML = `
                        <h3>
                            <a href="post.html?post=${post.slug}">
                                ${post.title}
                            </a>
                        </h3>
                        <div class="post-meta">
                            ${post.date} · ${post.category} · ${post.tags.join(', ')}
                        </div>
                        <p>${post.summary}</p>
                    `;

                    container.appendChild(div);
                });
        }

        // Initial render
        renderFilteredPosts();

        // -----------------------------
        // CATEGORY FILTERS
        // -----------------------------
        document.querySelectorAll('.category-filters button').forEach(btn => {
            btn.addEventListener('click', () => {
                document
                    .querySelectorAll('.category-filters button')
                    .forEach(b => b.classList.remove('active'));

                btn.classList.add('active');
                activeCategory = btn.dataset.category;

                renderFilteredPosts(search?.value.toLowerCase() || '');
            });
        });

        // -----------------------------
        // SEARCH
        // -----------------------------
        if (search) {
            search.addEventListener('input', () => {
                renderFilteredPosts(search.value.toLowerCase());
            });
        }

    } catch (err) {
        console.error(err);
    }
}

// -----------------------------
// RENDER SINGLE POST
// -----------------------------
async function renderPost() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('post');
    if (!slug) return;

    try {
        const res = await fetch(`posts/${slug}.md`);
        const text = await res.text();

        const postContent = qs('#post-content');

        // -----------------------------
        // PREPROCESS SERVICE NOW CALLOUTS (MARKDOWN LEVEL)
        // -----------------------------
        let processedText = text
            .replace(
                /:::note\s*([\s\S]*?)\s*:::/g,
                `<div class="callout callout-note">
            <div class="callout-title">📝 Note</div>
            <div>$1</div>
        </div>`
            )
            .replace(
                /:::warning\s*([\s\S]*?)\s*:::/g,
                `<div class="callout callout-warning">
            <div class="callout-title">⚠️ Warning</div>
            <div>$1</div>
        </div>`
            )
            .replace(
                /:::tip\s*([\s\S]*?)\s*:::/g,
                `<div class="callout callout-tip">
            <div class="callout-title">💡 Tip</div>
            <div>$1</div>
        </div>`
            )
            .replace(
                /:::info\s*([\s\S]*?)\s*:::/g,
                `<div class="callout callout-info">
        <div class="callout-title">ℹ️ Info</div>
        <div>$1</div>
    </div>`
            )
            .replace(
                /:::important\s*([\s\S]*?)\s*:::/g,
                `<div class="callout callout-important">
        <div class="callout-title">❗ Important</div>
        <div>$1</div>
    </div>`
            );

        // Render markdown AFTER preprocessing
        postContent.innerHTML = marked.parse(processedText);
        // Apply syntax highlighting AFTER markdown render
postContent.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
});






        // -----------------------------
        // BUILD TABLE OF CONTENTS
        // -----------------------------
        const tocList = qs('#toc-list');
        if (tocList) {
            tocList.innerHTML = '';

            const headings = document.querySelectorAll(
                '#post-content h2, #post-content h3'
            );

            headings.forEach(h => {
                const id = h.textContent
                    .toLowerCase()
                    .replace(/[^\w]+/g, '-');

                h.id = id;

                const li = document.createElement('li');
                li.innerHTML = `<a href="#${id}">${h.textContent}</a>`;
                tocList.appendChild(li);
            });
        }

        // -----------------------------
        // COPY BUTTONS FOR CODE BLOCKS
        // -----------------------------
        document.querySelectorAll('#post-content pre').forEach(block => {
            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.textContent = 'Copy';

            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(block.innerText);
                btn.textContent = 'Copied';
                setTimeout(() => (btn.textContent = 'Copy'), 1500);
            });

            block.appendChild(btn);
        });

        // -----------------------------
        // ANCHOR LINKS ON HEADINGS
        // -----------------------------
        document
            .querySelectorAll('#post-content h2, #post-content h3')
            .forEach(h => {
                const anchor = document.createElement('a');
                anchor.href = `#${h.id}`;
                anchor.className = 'anchor-link';
                anchor.innerHTML = '🔗';
                h.appendChild(anchor);
            });

        // -----------------------------
        // IMAGE ZOOM + PAN + DOWNLOAD
        // -----------------------------
        // -----------------------------
        // ADVANCED IMAGE VIEWER
        // -----------------------------
        document.querySelectorAll('#post-content img').forEach(img => {
            img.style.cursor = 'zoom-in';

            img.addEventListener('click', () => {

                let scale = 1;
                let posX = 0;
                let posY = 0;
                let startX = 0;
                let startY = 0;
                let isDragging = false;
                let lastTouchDistance = null;

                const overlay = document.createElement('div');
                overlay.className = 'image-lightbox';

                const zoomedImg = document.createElement('img');
                zoomedImg.src = img.src;
                zoomedImg.alt = img.alt || '';
                zoomedImg.className = 'zoomed-image';

                // -----------------------------
                // TOOLBAR
                // -----------------------------
                const toolbar = document.createElement('div');
                toolbar.className = 'image-toolbar';

                const zoomInBtn = createBtn('+');
                zoomInBtn.dataset.tooltip = 'Zoom In';
                const zoomOutBtn = createBtn('−');
                zoomOutBtn.dataset.tooltip = 'Zoom Out';
                const resetBtn = createBtn('Reset');
                resetBtn.dataset.tooltip = 'Reset Zoom/Pan';
                const downloadBtn = createBtn('⬇');
                downloadBtn.dataset.tooltip = 'Download Image';
                const closeBtn = createBtn('✕');
                closeBtn.dataset.tooltip = 'Close';

                toolbar.append(
                    zoomInBtn,
                    zoomOutBtn,
                    resetBtn,
                    downloadBtn,
                    closeBtn
                );

              // -----------------------------
// -----------------------------
// MINIMAP (CORRECT & STABLE)
// -----------------------------
const minimap = document.createElement('div');
minimap.className = 'image-minimap';

const minimapImg = document.createElement('img');
minimapImg.src = img.src;

const minimapViewport = document.createElement('div');
minimapViewport.className = 'image-minimap-viewport';

minimap.appendChild(minimapImg);
minimap.appendChild(minimapViewport);

overlay.append(toolbar, zoomedImg, minimap);
document.body.appendChild(overlay);

// -----------------------------
// APPLY TRANSFORM (MAIN IMAGE)
// -----------------------------
function applyTransform() {
    zoomedImg.style.transform =
        `translate(${posX}px, ${posY}px) scale(${scale})`;
    updateMinimap();
}

// -----------------------------
// RESET VIEW
// -----------------------------
function resetView() {
    scale = 1;
    posX = 0;
    posY = 0;
    applyTransform();
}

// -----------------------------
// UPDATE MINIMAP VIEWPORT (NORMALIZED)
// -----------------------------
function updateMinimap() {
    const containerW = overlay.clientWidth;
    const containerH = overlay.clientHeight;

    const imgW = zoomedImg.naturalWidth * scale;
    const imgH = zoomedImg.naturalHeight * scale;

    if (!imgW || !imgH) return;

    // Viewport size
    const viewW = containerW / imgW;
    const viewH = containerH / imgH;

    minimapViewport.style.width = `${Math.min(100, viewW * 100)}%`;
    minimapViewport.style.height = `${Math.min(100, viewH * 100)}%`;

    // Viewport position
    const left = -posX / imgW;
    const top = -posY / imgH;

    minimapViewport.style.left = `${left * 100}%`;
    minimapViewport.style.top = `${top * 100}%`;
}

// -----------------------------
// MINIMAP CLICK → CENTER IMAGE
// -----------------------------
minimap.addEventListener('mousedown', e => {
    const rect = minimap.getBoundingClientRect();

    const percentX = (e.clientX - rect.left) / rect.width;
    const percentY = (e.clientY - rect.top) / rect.height;

    const imgW = zoomedImg.naturalWidth * scale;
    const imgH = zoomedImg.naturalHeight * scale;

    posX = -(percentX * imgW) + overlay.clientWidth / 2;
    posY = -(percentY * imgH) + overlay.clientHeight / 2;

    applyTransform();
});


                // -----------------------------
                // BUTTON ACTIONS
                // -----------------------------
                zoomInBtn.onclick = () => {
                    scale = Math.min(scale + 0.2, 6);
                    applyTransform();
                };

                zoomOutBtn.onclick = () => {
                    scale = Math.max(scale - 0.2, 0.2);
                    applyTransform();
                };

                resetBtn.onclick = resetView;

                downloadBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = zoomedImg.src;
                    a.download = zoomedImg.src.split('/').pop();
                    a.click();
                };

                closeBtn.onclick = () => overlay.remove();

                // -----------------------------
                // DOUBLE CLICK RESET
                // -----------------------------
                zoomedImg.addEventListener('dblclick', e => {
                    e.preventDefault();
                    resetView();
                });

                // -----------------------------
                // MOUSE ZOOM
                // -----------------------------
                overlay.addEventListener('wheel', e => {
                    e.preventDefault();
                    scale += e.deltaY * -0.001;
                    scale = Math.min(Math.max(0.2, scale), 6);
                    applyTransform();
                });

                // -----------------------------
                // DRAG PAN (MOUSE)
                // -----------------------------


                zoomedImg.addEventListener('mousedown', e => {
                    e.preventDefault();
                    isDragging = true;
                    startX = e.clientX - posX;
                    startY = e.clientY - posY;
                    zoomedImg.style.cursor = 'grabbing';
                });

                zoomedImg.addEventListener('mousemove', e => {
                    if (!isDragging) return;
                    posX = e.clientX - startX;
                    posY = e.clientY - startY;
                    applyTransform();
                });

                zoomedImg.addEventListener('mouseup', () => {
                    isDragging = false;
                    zoomedImg.style.cursor = 'grab';
                });

                zoomedImg.addEventListener('mouseleave', () => {
                    isDragging = false;
                    zoomedImg.style.cursor = 'grab';
                });

                // -----------------------------
                // TOUCH SUPPORT (PAN + PINCH)
                // -----------------------------
                zoomedImg.addEventListener('touchstart', e => {
                    if (e.touches.length === 1) {
                        startX = e.touches[0].clientX - posX;
                        startY = e.touches[0].clientY - posY;
                    }
                    if (e.touches.length === 2) {
                        lastTouchDistance = getDistance(e.touches);
                    }
                });

                zoomedImg.addEventListener('touchmove', e => {
                    e.preventDefault();

                    if (e.touches.length === 1) {
                        posX = e.touches[0].clientX - startX;
                        posY = e.touches[0].clientY - startY;
                        applyTransform();
                    }

                    if (e.touches.length === 2) {
                        const dist = getDistance(e.touches);
                        if (lastTouchDistance) {
                            scale *= dist / lastTouchDistance;
                            scale = Math.min(Math.max(0.2, scale), 6);
                            applyTransform();
                        }
                        lastTouchDistance = dist;
                    }
                }, { passive: false });

                function getDistance(touches) {
                    const dx = touches[0].clientX - touches[1].clientX;
                    const dy = touches[0].clientY - touches[1].clientY;
                    return Math.sqrt(dx * dx + dy * dy);
                }

             

                function createBtn(text) {
                    const btn = document.createElement('button');
                    btn.textContent = text;
                    return btn;
                }

                resetView();
            });
        });




    } catch (err) {
        console.error(err);
        qs('#post-content').textContent = 'Failed to load document.';
    }
}

// -----------------------------
// INIT
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (qs('#posts-list')) renderIndex();
    if (qs('#post-content')) renderPost();
    initDarkMode();
});



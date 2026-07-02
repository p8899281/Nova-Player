// ===== Nova Player =====
// Loads a plain .txt file containing video/PDF names + links,
// splits them into two searchable lists, plays videos inline,
// and downloads PDFs on click.

(() => {
  const fileInput      = document.getElementById('fileInput');
  const searchInput     = document.getElementById('searchInput');
  const statusStrip     = document.getElementById('statusStrip');
  const itemList        = document.getElementById('itemList');
  const videoCountEl    = document.getElementById('videoCount');
  const pdfCountEl      = document.getElementById('pdfCount');
  const tabs            = document.querySelectorAll('.tab');
  const videoPlayer      = document.getElementById('videoPlayer');
  const playerPlaceholder= document.getElementById('playerPlaceholder');
  const nowPlaying       = document.getElementById('nowPlaying');

  let allItems = [];      // {name, url, type}
  let activeType = 'video';
  let activeUrl = null;
  let hls = null;
  let debounceTimer = null;

  // ---------- Parsing ----------
  // Supports optional [VIDEOS] / [PDFS] section headers, and any
  // separator between name and link (::  |  ,  -  tab ...).
  // If no section header is present, the type is guessed from the
  // file extension in the URL.
  function parseListFile(text) {
    const lines = text.split(/\r?\n/);
    const items = [];
    let mode = null;
    const urlRegex = /(https?:\/\/[^\s]+)/i;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const sectionMatch = line.match(/^\[(videos?|pdfs?)\]$/i);
      if (sectionMatch) {
        mode = sectionMatch[1].toLowerCase().startsWith('video') ? 'video' : 'pdf';
        continue;
      }

      const urlMatch = line.match(urlRegex);
      if (!urlMatch) continue;

      let url = urlMatch[1].replace(/[)\]>,.'"]+$/, '');
      let name = line.slice(0, urlMatch.index).trim();
      name = name.replace(/[:\-|,]+$/, '').trim();

      if (!name) {
        try {
          const u = new URL(url);
          name = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || url);
        } catch (e) {
          name = url;
        }
      }

      let type = mode;
      if (!type) {
        type = /\.pdf(\?|#|$)/i.test(url) ? 'pdf' : 'video';
      }

      items.push({ name, url, type });
    }
    return items;
  }

  // ---------- File loading ----------
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      allItems = parseListFile(String(reader.result));
      const videoTotal = allItems.filter(i => i.type === 'video').length;
      const pdfTotal = allItems.filter(i => i.type === 'pdf').length;

      statusStrip.classList.add('loaded');
      statusStrip.innerHTML = `লোড হয়েছে: <strong>${escapeHtml(file.name)}</strong> — ${videoTotal} video, ${pdfTotal} pdf পাওয়া গেছে।`;

      render();
    };
    reader.onerror = () => {
      statusStrip.classList.remove('loaded');
      statusStrip.textContent = 'ফাইল পড়া যায়নি, আবার চেষ্টা করুন।';
    };
    reader.readAsText(file);
  });

  // ---------- Search ----------
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 120);
  });

  // ---------- Tabs ----------
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeType = tab.dataset.type;
      render();
    });
  });

  // ---------- Render list ----------
  function render() {
    const query = searchInput.value.trim().toLowerCase();

    const videos = allItems.filter(i => i.type === 'video');
    const pdfs   = allItems.filter(i => i.type === 'pdf');
    videoCountEl.textContent = videos.length;
    pdfCountEl.textContent = pdfs.length;

    const source = activeType === 'video' ? videos : pdfs;
    const filtered = query
      ? source.filter(i => i.name.toLowerCase().includes(query))
      : source;

    itemList.innerHTML = '';

    if (allItems.length === 0) {
      itemList.innerHTML = '<li class="empty-row">প্রথমে একটি .txt ফাইল লোড করুন</li>';
      return;
    }
    if (filtered.length === 0) {
      itemList.innerHTML = '<li class="empty-row">কোনো ফলাফল পাওয়া যায়নি</li>';
      return;
    }

    filtered.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item-row';
      if (item.type === 'video' && item.url === activeUrl) li.classList.add('playing');

      li.innerHTML = `
        <span class="item-icon ${item.type}">${item.type === 'video' ? '🎬' : '📄'}</span>
        <span class="item-name">${escapeHtml(item.name)}</span>
      `;

      li.addEventListener('click', () => {
        if (item.type === 'video') {
          playVideo(item);
        } else {
          downloadPdf(item);
        }
      });

      itemList.appendChild(li);
    });
  }

  // ---------- Video playback (supports .m3u8 via hls.js) ----------
  function playVideo(item) {
    activeUrl = item.url;
    playerPlaceholder.style.display = 'none';
    videoPlayer.classList.remove('hidden');
    nowPlaying.textContent = item.name;

    if (hls) { hls.destroy(); hls = null; }

    const isHls = /\.m3u8(\?|#|$)/i.test(item.url);

    if (isHls && window.Hls && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(item.url);
      hls.attachMedia(videoPlayer);
      hls.on(Hls.Events.MANIFEST_PARSED, () => videoPlayer.play().catch(() => {}));
    } else {
      videoPlayer.src = item.url;
      videoPlayer.play().catch(() => {});
    }

    render(); // refresh "playing" highlight
  }

  // ---------- PDF download ----------
  async function downloadPdf(item) {
    try {
      const res = await fetch(item.url, { mode: 'cors' });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = sanitizeFilename(item.name) + '.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Server didn't allow cross-origin fetch — open in a new tab
      // so the user can save it manually (Ctrl/Cmd+S).
      window.open(item.url, '_blank', 'noopener');
    }
  }

  function sanitizeFilename(name) {
    return name.replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120) || 'file';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  render();
})();

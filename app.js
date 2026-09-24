// ==========================================================================
// KAIROGRAM INTERACTIVE ENGINE & REAL-TIME TELEMETRY
// Adapted with Aiby Technologies Design Dynamics (Mesh Canvas, Dual Nav, Telemetry)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================================================
  // 1. DRIFTING CONSTELLATION POLYGON MESH (HERO CANVAS)
  // ==========================================================================
  (function initHeroMesh() {
    const canvas = document.getElementById('mesh');
    const heroWrap = document.getElementById('herowrap');
    if (!canvas || !heroWrap) return;

    const ctx = canvas.getContext('2d');
    let pts = [];
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = null;

    const MESH = {
      speed: 1.2,
      lineOpacity: 0.45,
      points: window.innerWidth < 768 ? 16 : 28,
      reach: 0.28
    };

    function seedPoints() {
      pts = [];
      for (let i = 0; i < MESH.points; i++) {
        const angle = Math.random() * Math.PI * 2;
        pts.push({
          x: Math.random() * width,
          y: Math.random() * height,
          dx: Math.cos(angle),
          dy: Math.sin(angle)
        });
      }
    }

    function resize() {
      const rect = heroWrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedPoints();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const linkDist = Math.max(width, height) * MESH.reach;

      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const p2 = pts[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < linkDist) {
            const alpha = MESH.lineOpacity * (1 - dist / linkDist);
            ctx.strokeStyle = `rgba(246, 244, 241, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Coral & Amber Nodes
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 74, 43, 0.65)' : 'rgba(124, 58, 237, 0.65)';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.dx * MESH.speed;
        p.y += p.dy * MESH.speed;
        if (p.x < -30 || p.x > width + 30) p.dx *= -1;
        if (p.y < -30 || p.y > height + 30) p.dy *= -1;
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    function start() {
      if (!raf && !reduceMotion) raf = requestAnimationFrame(step);
    }

    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }

    resize();
    draw();
    if (!reduceMotion) start();

    window.addEventListener('resize', () => {
      resize();
      draw();
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries[0].isIntersecting ? start() : stop();
      }).observe(heroWrap);
    }
  })();

  // ==========================================================================
  // 2. DUAL-STATE STICKY NAVBAR (TRANSPARENT OVER HERO -> SOLID STUCK)
  // ==========================================================================
  const nav = document.getElementById('nav');
  const heroWrap = document.getElementById('herowrap');

  function updateNavState() {
    if (!nav || !heroWrap) return;
    const threshold = heroWrap.offsetHeight - nav.offsetHeight - 12;
    nav.classList.toggle('stuck', window.scrollY > threshold);
  }

  window.addEventListener('scroll', updateNavState, { passive: true });
  updateNavState();

  // ==========================================================================
  // 3. MOBILE DRAWER NAVIGATION
  // ==========================================================================
  const burger = document.getElementById('burger');
  const btnDrawerClose = document.getElementById('btnDrawerClose');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-actions a');

  function openDrawer() {
    if (!mobileNavDrawer || !burger) return;
    mobileNavDrawer.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    mobileNavDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileNavDrawer || !burger) return;
    mobileNavDrawer.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobileNavDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (burger) {
    burger.addEventListener('click', () => {
      mobileNavDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
  }

  if (btnDrawerClose) btnDrawerClose.addEventListener('click', closeDrawer);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeDrawer);
  mobileLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // ==========================================================================
  // 4. GENUINE REAL-TIME LIVE COUNTER & TELEMETRY
  // ==========================================================================
  const COUNT_API_BASE = 'https://countapi.mileshilliard.com/api/v1';
  const KEY_VISITS = 'kairogram_v1_page_visits';
  const KEY_DOWNLOADS = 'kairogram_v1_apk_downloads';

  const liveDownloadEl = document.getElementById('liveDownloadCount');
  const liveVisitorEl = document.getElementById('liveVisitorCount');

  let currentDownloads = parseInt(localStorage.getItem('kairo_real_downloads') || '0', 10);
  let currentVisits = parseInt(localStorage.getItem('kairo_real_visits') || '0', 10);

  function animateCount(element, start, end, duration = 800) {
    if (!element) return;
    if (start === end) {
      element.textContent = Number(end).toLocaleString();
      return;
    }

    const range = end - start;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (range * ease));
      element.textContent = Number(current).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = Number(end).toLocaleString();
      }
    }

    requestAnimationFrame(step);
  }

  function updateDisplay(downloads, visits, animate = true) {
    if (animate) {
      if (liveDownloadEl) {
        const start = parseInt((liveDownloadEl.textContent || '0').replace(/,/g, ''), 10) || 0;
        animateCount(liveDownloadEl, start, downloads, 700);
      }
      if (liveVisitorEl) {
        const start = parseInt((liveVisitorEl.textContent || '0').replace(/,/g, ''), 10) || 0;
        animateCount(liveVisitorEl, start, visits, 900);
      }
    } else {
      if (liveDownloadEl) liveDownloadEl.textContent = Number(downloads).toLocaleString();
      if (liveVisitorEl) liveVisitorEl.textContent = Number(visits).toLocaleString();
    }
  }

  if (currentDownloads > 0 || currentVisits > 0) {
    updateDisplay(currentDownloads, currentVisits, false);
  }

  async function fetchLiveMetrics() {
    try {
      const sessionTracked = sessionStorage.getItem('kairo_session_recorded');
      const visitEndpoint = sessionTracked ? `${COUNT_API_BASE}/get/${KEY_VISITS}` : `${COUNT_API_BASE}/hit/${KEY_VISITS}`;

      const [visitRes, downloadRes] = await Promise.allSettled([
        fetch(visitEndpoint).then(r => r.json()),
        fetch(`${COUNT_API_BASE}/get/${KEY_DOWNLOADS}`).then(r => r.json())
      ]);

      if (visitRes.status === 'fulfilled' && visitRes.value && typeof visitRes.value.value === 'number') {
        sessionStorage.setItem('kairo_session_recorded', 'true');
        currentVisits = visitRes.value.value;
        localStorage.setItem('kairo_real_visits', currentVisits);
      }

      if (downloadRes.status === 'fulfilled' && downloadRes.value && typeof downloadRes.value.value === 'number') {
        currentDownloads = downloadRes.value.value;
        localStorage.setItem('kairo_real_downloads', currentDownloads);
      }

      updateDisplay(currentDownloads, currentVisits, true);
    } catch (err) {
      console.warn('Live counter telemetry offline:', err);
      updateDisplay(currentDownloads, currentVisits, false);
    }
  }

  async function recordDownload(source = 'general') {
    // 1. Google Analytics 4 Event
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'file_download', {
        file_name: 'KairoGram.apk',
        file_extension: 'apk',
        link_url: 'downloads/KairoGram.apk',
        download_location: source,
        value: 1
      });
    }

    // 2. Optimistic UI bump
    currentDownloads += 1;
    localStorage.setItem('kairo_real_downloads', currentDownloads);
    updateDisplay(currentDownloads, currentVisits, false);

    if (liveDownloadEl) {
      liveDownloadEl.classList.remove('updated');
      void liveDownloadEl.offsetWidth;
      liveDownloadEl.classList.add('updated');
      setTimeout(() => liveDownloadEl.classList.remove('updated'), 600);
    }

    // 3. Atomically hit counter API
    try {
      const res = await fetch(`${COUNT_API_BASE}/hit/${KEY_DOWNLOADS}`);
      const data = await res.json();
      if (data && typeof data.value === 'number') {
        currentDownloads = data.value;
        localStorage.setItem('kairo_real_downloads', currentDownloads);
        updateDisplay(currentDownloads, currentVisits, false);
      }
    } catch (_) {}
  }

  fetchLiveMetrics();

  // Background real-time polling every 12 seconds
  setInterval(async () => {
    try {
      const [visitRes, downloadRes] = await Promise.allSettled([
        fetch(`${COUNT_API_BASE}/get/${KEY_VISITS}`).then(r => r.json()),
        fetch(`${COUNT_API_BASE}/get/${KEY_DOWNLOADS}`).then(r => r.json())
      ]);

      let changed = false;
      if (visitRes.status === 'fulfilled' && visitRes.value && typeof visitRes.value.value === 'number') {
        if (visitRes.value.value !== currentVisits) {
          currentVisits = visitRes.value.value;
          localStorage.setItem('kairo_real_visits', currentVisits);
          changed = true;
        }
      }

      if (downloadRes.status === 'fulfilled' && downloadRes.value && typeof downloadRes.value.value === 'number') {
        if (downloadRes.value.value !== currentDownloads) {
          currentDownloads = downloadRes.value.value;
          localStorage.setItem('kairo_real_downloads', currentDownloads);
          changed = true;
        }
      }

      if (changed) updateDisplay(currentDownloads, currentVisits, true);
    } catch (_) {}
  }, 12000);

  // Attach download listener to all APK links
  document.querySelectorAll('a[href*="KairoGram.apk"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const source = btn.id || btn.className || 'apk_download';
      recordDownload(source);
    });
  });

  // Track Web App launch in GA4
  document.querySelectorAll('a[href*="kariogram-web.onrender.com"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'web_app_launch', {
          destination_url: 'https://kariogram-web.onrender.com'
        });
      }
    });
  });

  // ==========================================================================
  // 5. SERMON VOICE AI DEMONSTRATION SIMULATOR
  // ==========================================================================
  const samples = [
    {
      transcript: '“...and Paul reminds us in Philippians four thirteen that we can do all things through Christ who gives us strength...”',
      ref: 'Philippians 4:13',
      text: '“I can do all things through Christ which strengtheneth me.”',
      confidence: '100% Match • KJV'
    },
    {
      transcript: '“...turn your Bibles with me to John three sixteen, for God so loved the world that He gave His only begotten Son...”',
      ref: 'John 3:16',
      text: '“For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.”',
      confidence: '99% Match • KJV'
    },
    {
      transcript: '“...remember Psalm twenty three verse one, the Lord is my shepherd; I shall not want...”',
      ref: 'Psalm 23:1',
      text: '“The LORD is my shepherd; I shall not want.”',
      confidence: '100% Match • KJV'
    },
    {
      transcript: '“...as declared in Jeremiah twenty nine eleven, for I know the thoughts that I think toward you, saith the Lord...”',
      ref: 'Jeremiah 29:11',
      text: '“For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.”',
      confidence: '98% Match • KJV'
    }
  ];

  let sampleIdx = 0;
  const transcriptBubble = document.getElementById('transcriptBubble');
  const detectedRef = document.getElementById('detectedRef');
  const detectedConfidence = document.getElementById('detectedConfidence');
  const detectedText = document.getElementById('detectedText');

  if (transcriptBubble && detectedRef && detectedText) {
    setInterval(() => {
      sampleIdx = (sampleIdx + 1) % samples.length;
      const s = samples[sampleIdx];

      transcriptBubble.style.opacity = '0.3';
      transcriptBubble.style.transform = 'translateY(2px)';

      setTimeout(() => {
        transcriptBubble.textContent = s.transcript;
        detectedRef.textContent = s.ref;
        detectedText.textContent = s.text;
        if (detectedConfidence) detectedConfidence.textContent = s.confidence;

        transcriptBubble.style.opacity = '1';
        transcriptBubble.style.transform = 'translateY(0)';
      }, 200);
    }, 4500);
  }

  // ==========================================================================
  // 6. COPY LINK TO CLIPBOARD WITH TOAST
  // ==========================================================================
  const btnCopy = document.getElementById('btnCopyDownloadLink');
  const toast = document.getElementById('toastPopup');

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3200);
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const apkUrl = new URL('downloads/KairoGram.apk', window.location.href).href;
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'share', { method: 'clipboard_copy', content_type: 'apk_link' });
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(apkUrl)
          .then(() => showToast('Direct APK link copied to clipboard!'))
          .catch(() => fallbackCopy(apkUrl));
      } else {
        fallbackCopy(apkUrl);
      }
    });
  }

  function fallbackCopy(text) {
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast('Direct APK link copied to clipboard!');
    } catch (_) {
      showToast('Could not copy link automatically.');
    }
    document.body.removeChild(input);
  }
});

// Kairogram Landing Page Interactive Logic & Telemetry
// Google Analytics 4 (G-0QWW59ZJDW) + Real-Time Public Live Counter

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. MOBILE DRAWER NAVIGATION
  // ==========================================
  const btnMobileMenu = document.getElementById('btnMobileMenu');
  const btnDrawerClose = document.getElementById('btnDrawerClose');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .btn-drawer-download, .btn-drawer-web');

  function openMobileMenu() {
    if (mobileNavDrawer && btnMobileMenu) {
      mobileNavDrawer.classList.add('open');
      btnMobileMenu.classList.add('active');
      btnMobileMenu.setAttribute('aria-expanded', 'true');
      mobileNavDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  }

  function closeMobileMenu() {
    if (mobileNavDrawer && btnMobileMenu) {
      mobileNavDrawer.classList.remove('open');
      btnMobileMenu.classList.remove('active');
      btnMobileMenu.setAttribute('aria-expanded', 'false');
      mobileNavDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (btnMobileMenu) {
    btnMobileMenu.addEventListener('click', () => {
      if (mobileNavDrawer.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (btnDrawerClose) {
    btnDrawerClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileMenu);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ==========================================
  // 2. REAL-TIME PUBLIC LIVE COUNTER & TELEMETRY
  // ==========================================
  const COUNT_API_BASE = 'https://countapi.mileshilliard.com/api/v1';
  const KEY_VISITS = 'kairogram_v1_page_visits';
  const KEY_DOWNLOADS = 'kairogram_v1_apk_downloads';

  const liveDownloadEl = document.getElementById('liveDownloadCount');
  const liveVisitorEl = document.getElementById('liveVisitorCount');
  const bannerDownloadEl = document.getElementById('bannerDownloadCount');
  const downloadIncTag = document.getElementById('downloadIncTag');

  // Load real cached values (zero mockup padding)
  let currentDownloads = parseInt(localStorage.getItem('kairo_real_downloads') || '0', 10);
  let currentVisits = parseInt(localStorage.getItem('kairo_real_visits') || '0', 10);

  // Initial immediate render
  if (currentDownloads > 0 || currentVisits > 0) {
    updateCounterDisplay(currentDownloads, currentVisits, false);
  }

  function animateValue(element, start, end, duration = 800) {
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

  function updateCounterDisplay(downloads, visits, animate = true) {
    const formattedDownloads = Number(downloads).toLocaleString();
    const formattedVisits = Number(visits).toLocaleString();

    if (animate) {
      if (liveDownloadEl) {
        const start = parseInt((liveDownloadEl.textContent || '0').replace(/,/g, ''), 10) || 0;
        animateValue(liveDownloadEl, start, downloads, 700);
      }
      if (bannerDownloadEl) {
        const start = parseInt((bannerDownloadEl.textContent || '0').replace(/,/g, ''), 10) || 0;
        animateValue(bannerDownloadEl, start, downloads, 700);
      }
      if (liveVisitorEl) {
        const start = parseInt((liveVisitorEl.textContent || '0').replace(/,/g, ''), 10) || 0;
        animateValue(liveVisitorEl, start, visits, 900);
      }
    } else {
      if (liveDownloadEl) liveDownloadEl.textContent = formattedDownloads;
      if (bannerDownloadEl) bannerDownloadEl.textContent = formattedDownloads;
      if (liveVisitorEl) liveVisitorEl.textContent = formattedVisits;
    }
  }

  // Real-time visit tracking
  async function trackAndFetchMetrics() {
    try {
      // Check session to count genuine visits
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

      updateCounterDisplay(currentDownloads, currentVisits, true);
    } catch (err) {
      console.warn('Real-time telemetry notice:', err);
      updateCounterDisplay(currentDownloads, currentVisits, false);
    }
  }

  // Real-time download tracking
  async function recordDownload(source = 'hero') {
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

    // 2. Instant optimistic UI bump
    currentDownloads += 1;
    localStorage.setItem('kairo_real_downloads', currentDownloads);
    updateCounterDisplay(currentDownloads, currentVisits, false);

    // Visual trigger animations
    if (liveDownloadEl) {
      liveDownloadEl.classList.remove('updated');
      void liveDownloadEl.offsetWidth; // Force reflow
      liveDownloadEl.classList.add('updated');
    }

    if (downloadIncTag) {
      downloadIncTag.classList.remove('animate');
      void downloadIncTag.offsetWidth;
      downloadIncTag.classList.add('animate');
      setTimeout(() => downloadIncTag.classList.remove('animate'), 1500);
    }

    // 3. Atomically increment remote backend counter
    try {
      const res = await fetch(`${COUNT_API_BASE}/hit/${KEY_DOWNLOADS}`);
      const data = await res.json();
      if (data && typeof data.value === 'number') {
        currentDownloads = data.value;
        localStorage.setItem('kairo_real_downloads', currentDownloads);
        updateCounterDisplay(currentDownloads, currentVisits, false);
      }
    } catch (err) {
      console.warn('Download counter network deferred:', err);
    }
  }

  trackAndFetchMetrics();

  // Real-time polling every 12 seconds so updates reflect live without reloading
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

      if (changed) {
        updateCounterDisplay(currentDownloads, currentVisits, true);
      }
    } catch (_) {}
  }, 12000);

  // Attach download tracking to all APK download buttons
  const downloadTriggers = [
    { el: document.getElementById('btnHeroDownload'), source: 'hero_primary' },
    { el: document.querySelector('.btn-nav-download'), source: 'navbar' },
    { el: document.querySelector('.btn-drawer-download'), source: 'mobile_drawer' },
    { el: document.querySelector('.cta-banner-card .btn-primary-cta'), source: 'cta_banner' },
    { el: document.querySelector('footer a[href*="KairoGram.apk"]'), source: 'footer' }
  ];

  downloadTriggers.forEach(({ el, source }) => {
    if (el) {
      el.addEventListener('click', () => {
        recordDownload(source);
      });
    }
  });

  // Track Web App launch in GA4
  document.querySelectorAll('a[href*="kariogram-web.onrender.com"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'web_app_launch', {
          destination_url: 'https://kariogram-web.onrender.com',
          location: link.classList.contains('btn-nav-web') ? 'nav' : 'button'
        });
      }
    });
  });

  // ==========================================
  // 3. SHOWCASE TAB SWITCHER
  // ==========================================
  const showcaseTabs = document.querySelectorAll('.showcase-tab');
  const showcasePanels = document.querySelectorAll('.showcase-tab-panel');

  showcaseTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      showcaseTabs.forEach(t => t.classList.remove('active'));
      showcasePanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(`panel-${target}`);
      if (panel) {
        panel.classList.add('active');
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'showcase_tab_view', {
          tab_name: target
        });
      }
    });
  });

  // ==========================================
  // 4. DYNAMIC SERMON VOICE AI SIMULATOR
  // ==========================================
  const sampleVoiceDetections = [
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

  let currentSampleIdx = 0;
  const transcriptBubble = document.querySelector('.voice-transcript-bubble');
  const detectedRef = document.querySelector('.detected-ref');
  const detectedConfidence = document.querySelector('.detected-confidence');
  const detectedText = document.querySelector('.detected-text');

  if (transcriptBubble && detectedRef && detectedText) {
    setInterval(() => {
      currentSampleIdx = (currentSampleIdx + 1) % sampleVoiceDetections.length;
      const sample = sampleVoiceDetections[currentSampleIdx];

      // Fade out
      transcriptBubble.style.opacity = '0.4';
      transcriptBubble.style.transform = 'translateY(2px)';

      setTimeout(() => {
        transcriptBubble.textContent = sample.transcript;
        detectedRef.textContent = sample.ref;
        detectedText.textContent = sample.text;
        if (detectedConfidence) detectedConfidence.textContent = sample.confidence;

        // Fade in
        transcriptBubble.style.opacity = '1';
        transcriptBubble.style.transform = 'translateY(0)';
      }, 200);
    }, 4200);
  }

  // ==========================================
  // 5. COPY APK DOWNLOAD LINK
  // ==========================================
  const btnCopy = document.getElementById('btnCopyDownloadLink');
  const toast = document.getElementById('toastPopup');

  if (btnCopy && toast) {
    btnCopy.addEventListener('click', () => {
      const apkUrl = new URL('downloads/KairoGram.apk', window.location.href).href;
      
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'share', {
          method: 'clipboard_copy',
          content_type: 'apk_download_link'
        });
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(apkUrl).then(() => {
          showToast('Direct APK link copied to clipboard!');
        }).catch(() => {
          fallbackCopy(apkUrl);
        });
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

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  // ==========================================
  // 6. SMOOTH ANCHOR SCROLLING
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = document.getElementById('siteHeader')?.offsetHeight || 70;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================
  // 7. HEADER ELEVATION ON SCROLL
  // ==========================================
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
        header.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      } else {
        header.style.boxShadow = 'none';
        header.style.borderColor = 'var(--border-subtle)';
      }
    }, { passive: true });
  }
});

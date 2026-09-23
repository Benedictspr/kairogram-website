// Kairogram Landing Page Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // 1. Showcase Tab Switcher
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
    });
  });

  // 2. Dynamic Sermon Voice AI Simulator
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

  // 3. Copy APK Download Link
  const btnCopy = document.getElementById('btnCopyDownloadLink');
  const toast = document.getElementById('toastPopup');

  if (btnCopy && toast) {
    btnCopy.addEventListener('click', () => {
      const apkUrl = new URL('downloads/KairoGram.apk', window.location.href).href;
      
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

  // 4. Smooth Anchor Scrolling with Header Offset
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

  // 5. Header Elevation on Scroll
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

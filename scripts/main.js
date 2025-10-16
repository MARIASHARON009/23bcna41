// Utility: clamp and random helpers
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const rand = (min, max) => Math.random() * (max - min) + min;

// Live neural network background animation
(function liveBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let dpr = window.devicePixelRatio || 1;
  let width = 0, height = 0;

  function resize() {
    width = canvas.clientWidth = window.innerWidth;
    height = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  const nodes = new Array(80).fill(0).map(() => ({
    x: rand(0, width),
    y: rand(0, height),
    vx: rand(-0.4, 0.4),
    vy: rand(-0.4, 0.4),
    r: rand(1, 2.4)
  }));

  const cyan = 'rgba(0,255,255,';
  const neon = 'rgba(57,255,20,';

  function step() {
    ctx.clearRect(0, 0, width, height);

    // subtle grid glow
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, width, height);

    // draw connections
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > width) a.vx *= -1;
      if (a.y < 0 || a.y > height) a.vy *= -1;

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x; const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 140;
        if (dist < maxDist) {
          const t = 1 - dist / maxDist;
          const alpha = clamp(t * 0.8, 0, 0.8);
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, cyan + (alpha * 0.9) + ')');
          grad.addColorStop(1, neon + (alpha * 0.7) + ')');
          ctx.strokeStyle = grad;
          ctx.lineWidth = t * 1.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // draw nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.fillStyle = cyan + '0.9)';
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(0,255,255,0.6)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();

// Navbar toggle
(function navToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
})();

// Smooth scroll for internal links
(function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// Demo logic: simple simulated policy engine
(function demo() {
  const form = document.getElementById('demo-form');
  const results = document.getElementById('demo-results');
  const chartCanvas = document.getElementById('chart');
  const syncBtn = document.getElementById('sync-btn');
  const lastSyncEl = document.getElementById('last-sync');

  if (!form || !results || !chartCanvas) return;

  // fake data and policy versions
  const policyVersions = {
    '2024-01-01': { baseLimit: 1000, multipliers: { Associate: 1, Manager: 1.5, Director: 2 }, approved: ['Laptop', 'Monitor', 'Keyboard'] },
    '2024-07-01': { baseLimit: 1200, multipliers: { Associate: 1.1, Manager: 1.6, Director: 2.2 }, approved: ['Laptop', 'Monitor', 'Keyboard', 'Headset'] }
  };

  function formatCurrency(value) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('demo-email').value.trim();
    const role = document.getElementById('demo-role').value;
    const policy = document.getElementById('demo-policy').value;

    const profileSeed = email.length + (email.includes('manager') ? 5 : 0);
    const policyConf = policyVersions[policy];
    const limit = Math.round(policyConf.baseLimit * (policyConf.multipliers[role] || 1) + (profileSeed % 100));

    const items = policyConf.approved.join(', ');

    results.innerHTML = `
      <div class="result">
        <p><strong>Email:</strong> ${email || '—'}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Policy:</strong> ${policy}</p>
        <p><strong>Eligibility Limit:</strong> ${formatCurrency(limit)}</p>
        <p><strong>Approved Items:</strong> ${items}</p>
        <p class="muted">Computed with AI policy extraction + rule engine demo.</p>
      </div>`;
  });

  // Simple trend chart
  let chart;
  function initChart() {
    const data = Array.from({ length: 7 }, () => Math.round(rand(40, 100)));
    chart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Eligibility Approvals %',
          data,
          borderColor: '#00FFFF',
          backgroundColor: 'rgba(0,255,255,0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 0
        }]
      },
      options: { plugins: { legend: { labels: { color: '#d3d3d3' } } },
        scales: { x: { ticks: { color: '#d3d3d3' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#d3d3d3' }, grid: { color: 'rgba(255,255,255,0.05)' } } },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  initChart();

  // Fake sync
  function setLastSync(date = new Date()) {
    lastSyncEl.textContent = date.toLocaleString();
  }
  setLastSync();

  syncBtn?.addEventListener('click', () => {
    syncBtn.disabled = true;
    syncBtn.textContent = 'Syncing...';
    setTimeout(() => {
      const dataset = chart.data.datasets[0].data;
      dataset.shift();
      dataset.push(Math.round(rand(40, 100)));
      chart.update();
      setLastSync();
      syncBtn.disabled = false;
      syncBtn.textContent = 'Sync Now';
    }, 1000);
  });
})();

// Contact form handlers
(function forms() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const contactForm = document.getElementById('contact-form');
  const contactDemo = document.getElementById('contact-demo');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Thanks! We\'ll reach out shortly.');
    contactForm.reset();
  });
  contactDemo?.addEventListener('click', () => {
    document.getElementById('message').value = 'Requesting a personalized demo for the Employee Lookup Agent.';
  });
})();

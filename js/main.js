// =====================================================
// Mean Green Window Clean — main.js
// Mobile nav, multi-step AI quote tool, and form submissions
// to a Google Sheet via a Google Apps Script web app.
// =====================================================

// Paste your Google Apps Script Web App URL here after deploying
// (see SETUP.md for step-by-step instructions).
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxMttrFjThx9PT-tIUAQ1qRPEDXz7WgTVLovNbxCxD_nNh6q4P1COFWJMlM0J5WFeRo/exec';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFooterYear();
  initQuoteTool();
  initContactForm();
});

/* ---------------------------------------------------
   Mobile menu toggle
--------------------------------------------------- */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!isOpen));
    btn.innerHTML = isOpen
      ? '<i class="fa-solid fa-bars"></i>'
      : '<i class="fa-solid fa-xmark"></i>';
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------
   AI Instant Quote Tool
--------------------------------------------------- */
function initQuoteTool() {
  const form = document.getElementById('quote-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.quote-step'));
  const dots = Array.from(document.querySelectorAll('.quote-step-dot'));
  const nextBtn = document.getElementById('quote-next-btn');
  const backBtn = document.getElementById('quote-back-btn');
  const submitBtn = document.getElementById('quote-submit-btn');
  const windowsRange = document.getElementById('windows-range');
  const windowsLabel = document.getElementById('windows-count-label');
  const resultBox = document.getElementById('quote-result');
  const customResultBox = document.getElementById('quote-custom-result');
  const errorBox = document.getElementById('quote-error');
  const restartBtn = document.getElementById('quote-restart-btn');
  const customRestartBtn = document.getElementById('quote-custom-restart-btn');

  let currentStep = 1;
  const totalSteps = steps.length;

  // Live label for window count slider
  if (windowsRange && windowsLabel) {
    windowsRange.addEventListener('input', () => {
      windowsLabel.textContent = windowsRange.value;
    });
  }

  function showStep(step) {
    steps.forEach(s => {
      s.classList.toggle('hidden', Number(s.dataset.step) !== step);
    });
    dots.forEach(d => {
      const dStep = Number(d.dataset.step);
      d.classList.toggle('active', dStep === step);
      d.classList.toggle('completed', dStep < step);
    });
    backBtn.classList.toggle('hidden', step === 1);
    nextBtn.classList.toggle('hidden', step === totalSteps);
    submitBtn.classList.toggle('hidden', step !== totalSteps);
  }

  function validateStep(step) {
    const activeStepEl = steps.find(s => Number(s.dataset.step) === step);
    const requiredFields = activeStepEl.querySelectorAll('[required]');
    for (const field of requiredFields) {
      if (!field.value || !field.value.trim()) {
        field.focus();
        field.classList.add('ring-2', 'ring-red-400');
        setTimeout(() => field.classList.remove('ring-2', 'ring-red-400'), 1500);
        return false;
      }
    }
    return true;
  }

  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
    }
  });

  backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });

  function resetQuoteTool() {
    form.reset();
    windowsLabel.textContent = '20';
    windowsRange.value = 20;
    currentStep = 1;
    showStep(currentStep);
    resultBox.classList.add('hidden');
    customResultBox.classList.add('hidden');
    form.classList.remove('hidden');
    document.getElementById('quote-progress').classList.remove('hidden');
    errorBox.classList.add('hidden');
    window.scrollTo({ top: document.getElementById('quote-section').offsetTop - 90, behavior: 'smooth' });
  }

  restartBtn && restartBtn.addEventListener('click', resetQuoteTool);
  customRestartBtn && customRestartBtn.addEventListener('click', resetQuoteTool);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const submitButtonEl = submitBtn;
    const originalHTML = submitButtonEl.innerHTML;
    submitButtonEl.disabled = true;
    submitButtonEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating...';
    errorBox.classList.add('hidden');

    try {
      const formData = new FormData(form);
      const rawStories = formData.get('stories');
      const isCustomHeight = rawStories === 'custom';

      const data = {
        property_type: formData.get('property_type') || 'Residential',
        stories: isCustomHeight ? '4+' : (Number(rawStories) || 1),
        service_type: formData.get('service_type') || 'Exterior Only',
        num_windows: Number(formData.get('num_windows')) || 20,
        frequency: formData.get('frequency') || 'One-time',
        extras: formData.getAll('extras'),
        message: formData.get('message') || '',
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        address: formData.get('address') || ''
      };

      // Simulate brief "AI thinking" delay for perceived intelligence
      await new Promise(resolve => setTimeout(resolve, 900));

      const estimate = isCustomHeight ? null : calculateEstimate(data);

      // Persist lead to the Sheet either way — 4+ story jobs still count as a real lead
      const payload = {
        ...data,
        estimated_low: estimate ? estimate.low : '',
        estimated_high: estimate ? estimate.high : '',
        status: 'New',
        source: isCustomHeight ? 'AI Quote Tool - Custom (4+ stories)' : 'AI Quote Tool'
      };

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error('Failed to save your quote request. Please try again.');
      }

      form.classList.add('hidden');
      document.getElementById('quote-progress').classList.add('hidden');

      if (isCustomHeight) {
        customResultBox.classList.remove('hidden');
      } else {
        renderResult(estimate, data);
        resultBox.classList.remove('hidden');
      }

    } catch (err) {
      console.error(err);
      errorBox.textContent = err.message || 'Something went wrong generating your quote. Please try again or call us directly.';
      errorBox.classList.remove('hidden');
    } finally {
      submitButtonEl.disabled = false;
      submitButtonEl.innerHTML = originalHTML;
    }
  });

  showStep(currentStep);
}

/**
 * Client-side "AI-style" pricing engine.
 * Simulates a smart estimate based on weighted factors:
 * window count, stories, service type, frequency discounts, and extras.
 *
 * Rate logic:
 * - Commercial starts cheaper per pane (bulk, often simpler storefront glass)
 *   to match the site's "From $2/pane" pricing card.
 * - Residential starts higher per window but scales more gently with height,
 *   matching "Up to 15 windows, exterior only — From $99."
 * - Commercial scales MUCH more steeply with story count and full interior+
 *   exterior service, since multi-story commercial jobs realistically need
 *   lifts/scaffolding, insurance paperwork, and after-hours scheduling —
 *   costs a simple per-window rate doesn't capture on its own.
 */
function calculateEstimate(data) {
  const isCommercial = data.property_type === 'Commercial';

  const BASE_PER_WINDOW = isCommercial ? 2.0 : 6.6;
  let subtotal = data.num_windows * BASE_PER_WINDOW;

  // Minimum service charge (commercial carries higher admin/insurance overhead)
  const MIN_CHARGE = isCommercial ? 125 : 99;
  subtotal = Math.max(subtotal, MIN_CHARGE);

  // Service type multiplier
  const serviceMultiplier = {
    'Exterior Only': 1,
    'Interior Only': 0.9,
    'Interior & Exterior': 1.6
  }[data.service_type] || 1;
  subtotal *= serviceMultiplier;

  // Story multiplier (commercial needs lifts/scaffolding above ground level,
  // so it climbs much faster than a residential extension pole/ladder job)
  const storyMultiplier = isCommercial
    ? { 1: 1, 2: 1.35, 3: 1.75, 4: 2.25 }[data.stories] || 1.35
    : { 1: 1, 2: 1.15, 3: 1.35, 4: 1.55 }[data.stories] || 1.15;
  subtotal *= storyMultiplier;

  // Extras add-on pricing
  const perWindowExtras = { 'Screens': 1.25, 'Tracks & Sills': 0.70 };
  const flatExtras = isCommercial
    ? { 'Gutter Cleaning': 175, 'Solar Panels': 299 }
    : { 'Gutter Cleaning': 89, 'Solar Panels': 149 };

  let extrasCost = 0;
  (data.extras || []).forEach(extra => {
    if (perWindowExtras[extra]) {
      extrasCost += perWindowExtras[extra] * data.num_windows;
    } else if (flatExtras[extra]) {
      extrasCost += flatExtras[extra];
    }
  });
  subtotal += extrasCost;

  // Frequency discount (recurring plans — matches "Save up to 20%" promise)
  const frequencyDiscount = {
    'One-time': 0,
    'Monthly': 0.20,
    'Quarterly': 0.12,
    'Bi-Annual': 0.08
  }[data.frequency] || 0;
  subtotal *= (1 - frequencyDiscount);

  // Create a competitive range (+/- ~12%) around the calculated estimate
  const low = Math.round((subtotal * 0.9) / 5) * 5;
  const high = Math.round((subtotal * 1.12) / 5) * 5;

  return { low: Math.max(low, 49), high: Math.max(high, low + 20) };
}

function renderResult(estimate, data) {
  document.getElementById('quote-price-low').textContent = `$${estimate.low}`;
  document.getElementById('quote-price-high').textContent = `$${estimate.high}`;

  const freqNote = data.frequency !== 'One-time'
    ? ` with your ${data.frequency.toLowerCase()} plan discount applied`
    : '';
  document.getElementById('quote-summary').textContent =
    `For ${data.num_windows} windows, ${data.stories}-story ${data.property_type.toLowerCase()} property, ${data.service_type.toLowerCase()} service${freqNote}.`;

  const breakdown = document.getElementById('quote-breakdown');
  const extrasList = (data.extras && data.extras.length) ? data.extras.join(', ') : 'None selected';
  breakdown.innerHTML = `
    <p class="flex justify-between py-1"><span>Property Type</span><strong>${data.property_type}</strong></p>
    <p class="flex justify-between py-1"><span>Stories</span><strong>${data.stories}</strong></p>
    <p class="flex justify-between py-1"><span>Service</span><strong>${data.service_type}</strong></p>
    <p class="flex justify-between py-1"><span>Windows/Panes</span><strong>${data.num_windows}</strong></p>
    <p class="flex justify-between py-1"><span>Frequency</span><strong>${data.frequency}</strong></p>
    <p class="flex justify-between py-1"><span>Add-ons</span><strong class="text-right">${extrasList}</strong></p>
  `;
}

/* ---------------------------------------------------
   Contact Form
--------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('contact-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    statusEl.classList.add('hidden');

    try {
      const formData = new FormData(form);
      const payload = {
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        message: formData.get('message') || '',
        status: 'New',
        source: 'Contact Form'
      };

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!result.success) throw new Error('Could not send message. Please try again.');

      statusEl.textContent = "Thanks! Your message has been sent — we'll be in touch soon.";
      statusEl.className = 'text-sm mt-4 text-center text-meangreen-700 font-semibold';
      statusEl.classList.remove('hidden');
      form.reset();
    } catch (err) {
      console.error(err);
      statusEl.textContent = err.message || 'Something went wrong. Please try again.';
      statusEl.className = 'text-sm mt-4 text-center text-red-600 font-semibold';
      statusEl.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  });
}

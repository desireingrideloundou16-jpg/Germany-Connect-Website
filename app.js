/**
 * GERMANY CONNECT INSTITUTE — Interactions
 * Thème clair/sombre, en-tête, menu mobile, onglets d'examens, filtres,
 * simulateur de budget, test de niveau, modales et envoi WhatsApp.
 */
document.addEventListener('DOMContentLoaded', () => {
  const WA_NUMBER = '491749632778';
  const root = document.documentElement;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---------- 1. Thème ----------
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('gci_theme', next);
    });
  });

  // ---------- 2. En-tête & lien actif ----------
  const header = document.getElementById('siteHeader');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = document.querySelectorAll('.nav-link');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 2b. Mot qui change dans le titre ----------
  const rotator = document.getElementById('heroRotator');
  if (rotator && !reduceMotion) {
    const words = Array.from(rotator.querySelectorAll('.rotator-word'));
    let current = 0;
    setInterval(() => {
      const prev = words[current];
      current = (current + 1) % words.length;
      prev.classList.remove('is-current');
      prev.classList.add('is-leaving');
      words[current].classList.remove('is-leaving');
      words[current].classList.add('is-current');
      setTimeout(() => prev.classList.remove('is-leaving'), 700);
    }, 2600);
  }

  // ---------- 2c. Apparition au défilement ----------
  if ('IntersectionObserver' in window && !reduceMotion) {
    const targets = document.querySelectorAll('.section-head, .pole, .compare-row, .step, .tariff-list, .sim-form, .receipt, .quiz-card, .campus-photos, .contact, .footer-cta');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el, i) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // déjà visible : on ne cache rien
      el.classList.add('will-reveal');
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 3) * 90}ms`;
      io.observe(el);
    });
  }

  // ---------- 3. Menu mobile ----------
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const closeBtn = document.getElementById('drawerCloseBtn');

  function openDrawer() {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  menuBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('.drawer-link, .open-enroll-modal').forEach(l => l.addEventListener('click', closeDrawer));

  // ---------- 4. Onglets d'examens ----------
  const tabs = Array.from(document.querySelectorAll('.exam-tab'));
  function selectTab(tab) {
    tabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  // ---------- 5. Filtres des formations ----------
  const filterTabs = document.querySelectorAll('.filter-tab');
  const courses = document.querySelectorAll('.course');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-pressed', String(t === tab)); });
      const f = tab.dataset.filter;
      courses.forEach(c => { c.hidden = !(f === 'all' || c.dataset.category === f); });
    });
  });

  // ---------- 6. Simulateur ----------
  const levelBoxes = document.querySelectorAll('input[name="simLevel"]');
  const driveRadios = document.querySelectorAll('input[name="simDriving"]');
  const visaSelect = document.getElementById('simVisaSelect');
  const out = {
    lang: document.getElementById('sumLangVal'),
    drive: document.getElementById('sumDriveVal'),
    visa: document.getElementById('sumVisaVal'),
    total: document.getElementById('simTotalAmount')
  };
  const sim = { levels: [], driving: 'Non', visa: 'Aucun', total: 0 };
  const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';

  function recalc() {
    let lang = 0;
    sim.levels = [];
    levelBoxes.forEach(cb => {
      if (!cb.checked) return;
      lang += parseInt(cb.value, 10);
      sim.levels.push(cb.closest('.choice').querySelector('.choice-title').textContent.trim());
    });
    let drive = 0;
    driveRadios.forEach(r => { if (r.checked) drive = parseInt(r.value, 10); });
    sim.driving = drive > 0 ? 'Permis B double commande (70 000 FCFA)' : 'Non';
    const visa = parseInt(visaSelect.value, 10);
    sim.visa = visaSelect.options[visaSelect.selectedIndex].text;
    sim.total = lang + drive + visa;

    out.lang.textContent = fmt(lang);
    out.drive.textContent = fmt(drive);
    out.visa.textContent = fmt(visa);
    out.total.textContent = fmt(sim.total);
  }
  levelBoxes.forEach(cb => cb.addEventListener('change', recalc));
  driveRadios.forEach(r => r.addEventListener('change', recalc));
  visaSelect.addEventListener('change', recalc);
  recalc();

  function openWhatsApp(text) {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  document.getElementById('btnSendSimToWhatsApp').addEventListener('click', () => {
    openWhatsApp(
      `*DEVIS — GERMANY CONNECT INSTITUTE*\n` +
      `*Niveaux de langue :* ${sim.levels.join(' + ') || 'Aucun'}\n` +
      `*Auto-École GCONNECT :* ${sim.driving}\n` +
      `*Accompagnement visa :* ${sim.visa}\n` +
      `*Total estimé :* ${fmt(sim.total)}\n\n` +
      `Bonjour, je souhaite réserver ma place pour ce parcours et convenir d'un rendez-vous au campus de Ngousso.`
    );
  });

  // ---------- 7. Test de niveau ----------
  const questions = [
    { q: 'Complétez : « Guten Tag, wie ______ Sie ? »', diff: 'Débutant A1', opts: ['heißt', 'heißen', 'heiße', 'bist'], a: 1 },
    { q: 'Choisissez l\'article : « ______ Tisch ist sehr modern. »', diff: 'Débutant A1', opts: ['Das', 'Die', 'Der', 'Den'], a: 2 },
    { q: 'Quelle phrase est correcte avec « können » au présent ?', diff: 'Élémentaire A2', opts: ['Er kann gut Deutsch sprechen.', 'Er konnt gut Deutsch sprechen.', 'Er kann sprechen gut Deutsch.', 'Er spricht können Deutsch gut.'], a: 0 },
    { q: 'Complétez : « Der Unterricht beginnt ______ 8 Uhr. »', diff: 'Élémentaire A2', opts: ['am', 'im', 'um', 'von'], a: 2 },
    { q: 'Complétez : « Ich lerne Deutsch, ______ ich in Deutschland eine Ausbildung machen will. »', diff: 'Intermédiaire B1', opts: ['denn', 'weil', 'obwohl', 'dass'], a: 1 },
    { q: 'Quelle forme exprime une demande polie ? « ______ Sie mir bitte helfen ? »', diff: 'Avancé B2', opts: ['Könnten', 'Haben', 'Werden', 'Müssten'], a: 0 }
  ];
  const results = [
    { min: 0, course: 'Allemand Niveau A1 (100 000 FCFA)', title: 'Niveau recommandé : Débutant A1', text: 'Vous débutez en allemand. Le programme A1 intensif vous donnera des bases solides en grammaire, prononciation et vocabulaire du quotidien pour lancer votre projet.' },
    { min: 2, course: 'Allemand Niveau A2 (110 000 FCFA)', title: 'Niveau recommandé : Élémentaire A2', text: 'Vous avez déjà des notions. Le niveau A2 vous aidera à structurer vos phrases, enrichir votre vocabulaire et converser avec plus d\'aisance.' },
    { min: 4, course: 'Allemand Niveau B1 (130 000 FCFA)', title: 'Niveau recommandé : Intermédiaire B1', text: 'Très bonnes bases ! Vous êtes prêt(e) pour le B1, le niveau exigé par les certifications Goethe ou TELC pour les visas Ausbildung et les universités.' },
    { min: 6, course: 'Allemand Niveau B2 (140 000 FCFA)', title: 'Niveau recommandé : Avancé B2', text: 'Score parfait ! Le niveau B2 (ou C1) vous ouvre les professions médicales, l\'ingénierie et les études supérieures en Allemagne.' }
  ];

  let step = 0, score = 0;
  const el = {
    label: document.getElementById('quizStepLabel'),
    diff: document.getElementById('quizDiffTag'),
    question: document.getElementById('quizQuestionText'),
    options: document.getElementById('quizOptionsList'),
    bar: document.getElementById('quizProgressIndicator'),
    content: document.getElementById('quizContentArea'),
    result: document.getElementById('quizResultArea'),
    score: document.getElementById('resultScoreNum'),
    rTitle: document.getElementById('resultLevelTitle'),
    rText: document.getElementById('resultLevelDesc'),
    enroll: document.getElementById('btnEnrollWithQuizResult'),
    restart: document.getElementById('btnRestartQuiz')
  };

  function renderQuestion(focus) {
    if (step >= questions.length) return showResult();
    const item = questions[step];
    el.label.textContent = `Question ${step + 1} sur ${questions.length}`;
    el.diff.textContent = item.diff;
    el.question.textContent = item.q;
    el.bar.style.width = `${((step + 1) / questions.length) * 100}%`;
    el.options.innerHTML = '';
    el.options.classList.remove('is-locked');
    item.opts.forEach((text, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz-opt';
      b.innerHTML = `<span class="quiz-opt-key">${'ABCD'[i]}</span><span></span>`;
      b.lastChild.textContent = text;
      b.addEventListener('click', () => answer(i, b));
      el.options.appendChild(b);
    });
    if (focus) el.question.focus({ preventScroll: true });
  }

  function answer(i, btn) {
    const item = questions[step];
    el.options.classList.add('is-locked');
    if (i === item.a) { score++; btn.classList.add('is-correct'); }
    else {
      btn.classList.add('is-wrong');
      el.options.children[item.a].classList.add('is-correct');
    }
    setTimeout(() => { step++; renderQuestion(true); }, 650);
  }

  function showResult() {
    el.content.hidden = true;
    el.result.hidden = false;
    el.bar.style.width = '100%';
    el.label.textContent = 'Résultat';
    el.diff.textContent = '';
    const r = results.filter(x => score >= x.min).pop();
    el.score.textContent = `${score}/${questions.length}`;
    el.rTitle.textContent = r.title;
    el.rText.textContent = r.text;
    el.enroll.dataset.course = r.course;
    el.rTitle.focus({ preventScroll: true });
  }

  el.restart.addEventListener('click', () => {
    step = 0; score = 0;
    el.content.hidden = false;
    el.result.hidden = true;
    renderQuestion(true);
  });
  renderQuestion(false);

  // ---------- 8. Modales ----------
  const programSelect = document.getElementById('enrollProgram');
  let lastFocus = null;

  function openModal(modal) {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = modal.querySelector('input, select, textarea, button');
    setTimeout(() => first && first.focus(), 60);
  }
  function closeModal(modal) {
    if (!modal || !modal.classList.contains('is-active')) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.open-enroll-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const course = btn.dataset.course;
      if (course) {
        const match = Array.from(programSelect.options).find(o => o.value === course);
        programSelect.value = match ? match.value : programSelect.options[0].value;
      }
      openModal(document.getElementById('enrollModal'));
    });
  });
  document.querySelectorAll('.open-brochure-modal').forEach(b => b.addEventListener('click', () => openModal(document.getElementById('brochureModal'))));
  document.querySelectorAll('.open-cgu-modal').forEach(b => b.addEventListener('click', () => openModal(document.getElementById('cguModal'))));
  document.querySelectorAll('.open-privacy-modal').forEach(b => b.addEventListener('click', () => openModal(document.getElementById('privacyModal'))));
  document.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', () => closeModal(b.closest('.modal'))));
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m); }));

  window.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal.is-active').forEach(closeModal);
    closeDrawer();
  });

  // ---------- 9. Formulaires → WhatsApp ----------
  document.getElementById('enrollForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    openWhatsApp(
      `*INSCRIPTION — GERMANY CONNECT INSTITUTE*\n` +
      `*Nom et prénom :* ${v('enrollFullName')}\n` +
      `*Téléphone / WhatsApp :* ${v('enrollPhone')}\n` +
      `*Email :* ${v('enrollEmail') || 'Non renseigné'}\n` +
      `*Programme :* ${v('enrollProgram')}\n` +
      `*Créneau :* ${v('enrollSchedule')}\n` +
      `*Projet :* ${v('enrollMessage') || 'Aucune précision'}\n\n` +
      `Bonjour, je souhaite m'inscrire et être recontacté(e) pour finaliser mon dossier.`
    );
    closeModal(document.getElementById('enrollModal'));
    e.target.reset();
  });

  document.getElementById('brochureForm').addEventListener('submit', e => {
    e.preventDefault();
    openWhatsApp(
      `*DEMANDE DE BROCHURE 2026*\n` +
      `*Nom :* ${document.getElementById('brochureName').value.trim()}\n` +
      `*WhatsApp :* ${document.getElementById('brochureWhatsapp').value.trim()}\n\n` +
      `Bonjour Germany Connect Institute, je souhaite recevoir le catalogue des formations et tarifs 2026 en PDF.`
    );
    closeModal(document.getElementById('brochureModal'));
    e.target.reset();
  });

  // ---------- 10. Vidéo de présentation ----------
  // preload="none" : la vidéo (≈ 9,5 Mo) n'est téléchargée qu'au clic, pour ménager les forfaits mobiles.
  const promoVideo = document.getElementById('promoVideo');
  const promoPlay = document.getElementById('promoPlay');
  if (promoVideo && promoPlay) {
    const figure = promoVideo.closest('.promo-video');
    promoPlay.addEventListener('click', () => {
      figure.classList.add('is-playing');
      const p = promoVideo.play();
      if (p && p.catch) p.catch(() => {});
      promoVideo.focus({preventScroll: true});
    });
    promoVideo.addEventListener('play', () => figure.classList.add('is-playing'));
  }
});

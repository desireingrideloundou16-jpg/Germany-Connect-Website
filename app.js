/**
 * GERMANY CONNECT INSTITUTE — MOTEUR D'INTERACTIONS JAVASCRIPT
 * Gestion du Bithème (Sombre / Clair), Artefacts Diagnostiques, Télémétrie Typewriter,
 * Simulateur de Budget Dynamique, Test de Niveau Interactif, Modales & Intégration WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. GESTION DU BITHÈME (MODE SOMBRE / MODE CLAIR)
  // ==========================================================================
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mobileThemeToggleBtn = document.getElementById('mobileThemeToggleBtn');
  const htmlRoot = document.documentElement;

  function initTheme() {
    const savedTheme = localStorage.getItem('gci_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'dark'); // Dark par défaut (Charte Allemande)
    }
  }

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('gci_theme', theme);
  }

  function toggleTheme() {
    const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);

  initTheme();

  // ==========================================================================
  // 2. NAVIGATION FLOTTANTE & ESPION DE SCROLL (ACTIVE NAV)
  // ==========================================================================
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + 180;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          }
        });
      }
    });
  });

  // ==========================================================================
  // 3. TIROIR DE NAVIGATION MOBILE
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    if (mobileDrawer && drawerBackdrop) {
      mobileDrawer.classList.add('is-open');
      drawerBackdrop.classList.add('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (mobileDrawer && drawerBackdrop) {
      mobileDrawer.classList.remove('is-open');
      drawerBackdrop.classList.remove('is-open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // ==========================================================================
  // 4. COMPTEURS NUMÉRIQUES ANIMÉS
  // ==========================================================================
  const counters = document.querySelectorAll('.counter-val');
  let countersStarted = false;

  function runCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10);
      const duration = 1600;
      const stepTime = 20;
      const totalSteps = duration / stepTime;
      const increment = target / totalSteps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, stepTime);
    });
  }

  if ('IntersectionObserver' in window && counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          runCounters();
        }
      });
    }, { threshold: 0.2 });

    const heroMetricsBar = document.querySelector('.hero-metrics-bar');
    if (heroMetricsBar) counterObserver.observe(heroMetricsBar);
  } else {
    runCounters();
  }

  // ==========================================================================
  // 5. ARTEFACT 1 : MÉLANGEUR DIAGNOSTIQUE D'EXAMENS (STACK ROTATIVE)
  // ==========================================================================
  const examSlides = document.querySelectorAll('.exam-card-slide');
  const examDots = document.querySelectorAll('#examDeckDots .dot-item');
  const btnExamNext = document.getElementById('btnExamNext');
  const btnExamPrev = document.getElementById('btnExamPrev');
  let currentExamIndex = 0;
  let examAutoCycleTimer = null;

  function updateExamDeck(index) {
    const total = examSlides.length;
    currentExamIndex = (index + total) % total;

    examSlides.forEach((slide, i) => {
      slide.classList.remove('is-front', 'is-middle', 'is-back');
      if (i === currentExamIndex) {
        slide.classList.add('is-front');
      } else if (i === (currentExamIndex + 1) % total) {
        slide.classList.add('is-middle');
      } else {
        slide.classList.add('is-back');
      }
    });

    examDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentExamIndex);
    });
  }

  function startExamAutoCycle() {
    stopExamAutoCycle();
    examAutoCycleTimer = setInterval(() => {
      updateExamDeck(currentExamIndex + 1);
    }, 4000);
  }

  function stopExamAutoCycle() {
    if (examAutoCycleTimer) clearInterval(examAutoCycleTimer);
  }

  if (btnExamNext) {
    btnExamNext.addEventListener('click', () => {
      updateExamDeck(currentExamIndex + 1);
      startExamAutoCycle();
    });
  }

  if (btnExamPrev) {
    btnExamPrev.addEventListener('click', () => {
      updateExamDeck(currentExamIndex - 1);
      startExamAutoCycle();
    });
  }

  examDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      updateExamDeck(idx);
      startExamAutoCycle();
    });
  });

  const examDeck = document.getElementById('examDeck');
  if (examDeck) {
    examDeck.addEventListener('mouseenter', stopExamAutoCycle);
    examDeck.addEventListener('mouseleave', startExamAutoCycle);
  }

  startExamAutoCycle();

  // ==========================================================================
  // 6. ARTEFACT 2 : TÉLÉMÉTRIE D'IMMERSION & TYPEWRITER STREAM
  // ==========================================================================
  const telemetryTimestamp = document.getElementById('telemetryTimestamp');
  const typewriterTarget = document.getElementById('typewriterTarget');

  function updateTelemetryClock() {
    if (telemetryTimestamp) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      telemetryTimestamp.textContent = `${hours}:${minutes}:${seconds} UTC+1`;
    }
  }

  setInterval(updateTelemetryClock, 1000);
  updateTelemetryClock();

  const telemetryLogEntries = [
    "> Suivi personnalisé : 25 laptops configurés pour simulations Goethe/TELC...",
    "> Session B1 : Atelier d'expression orale en binômes (score moyen 94%)...",
    "> Auto-École GCONNECT : 8 candidats en circulation double commande ce matin...",
    "> Passerelle Allemagne : 4 dossiers de visa Ausbildung validés cette semaine...",
    "> Laboratoire Audio : Entraînement phonétique et compréhension orale B2..."
  ];

  let logIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeTelemetryText() {
    if (!typewriterTarget) return;

    const currentText = telemetryLogEntries[logIndex];

    if (!isDeleting) {
      typewriterTarget.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(typeTelemetryText, 2500);
        return;
      }
    } else {
      typewriterTarget.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        logIndex = (logIndex + 1) % telemetryLogEntries.length;
      }
    }

    const speed = isDeleting ? 25 : 45;
    setTimeout(typeTelemetryText, speed);
  }

  typeTelemetryText();

  // ==========================================================================
  // 7. FILTRES DU CATALOGUE DES FORMATIONS
  // ==========================================================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const courseCards = document.querySelectorAll('.course-card-item');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      courseCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // ==========================================================================
  // 8. SIMULATEUR DE BUDGET DYNAMIQUE & EXPORT WHATSAPP
  // ==========================================================================
  const levelCheckboxes = document.querySelectorAll('input[name="simLevel"]');
  const drivingRadios = document.querySelectorAll('input[name="simDriving"]');
  const simVisaSelect = document.getElementById('simVisaSelect');

  const sumLangVal = document.getElementById('sumLangVal');
  const sumDriveVal = document.getElementById('sumDriveVal');
  const sumVisaVal = document.getElementById('sumVisaVal');
  const simTotalAmount = document.getElementById('simTotalAmount');
  const btnSendSimToWhatsApp = document.getElementById('btnSendSimToWhatsApp');

  function formatPrice(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }

  function recalculateSimulator() {
    let langTotal = 0;
    const selectedLevels = [];

    levelCheckboxes.forEach(cb => {
      if (cb.checked) {
        langTotal += parseInt(cb.value, 10);
        const label = cb.closest('.sim-check-card').querySelector('.check-title').textContent.trim();
        selectedLevels.push(label);
      }
    });

    let drivingTotal = 0;
    let drivingLabel = 'Non';
    drivingRadios.forEach(rb => {
      if (rb.checked) {
        drivingTotal = parseInt(rb.value, 10);
        if (drivingTotal > 0) drivingLabel = 'Permis B Double Commande (70 000 FCFA)';
      }
    });

    let visaTotal = 0;
    let visaLabel = 'Aucun';
    if (simVisaSelect) {
      visaTotal = parseInt(simVisaSelect.value, 10);
      visaLabel = simVisaSelect.options[simVisaSelect.selectedIndex].text;
    }

    const grandTotal = langTotal + drivingTotal + visaTotal;

    if (sumLangVal) sumLangVal.textContent = formatPrice(langTotal);
    if (sumDriveVal) sumDriveVal.textContent = formatPrice(drivingTotal);
    if (sumVisaVal) sumVisaVal.textContent = formatPrice(visaTotal);
    if (simTotalAmount) simTotalAmount.textContent = formatPrice(grandTotal);

    // Stockage pour le bouton WhatsApp
    if (btnSendSimToWhatsApp) {
      btnSendSimToWhatsApp.dataset.levels = selectedLevels.join(' + ') || 'Aucun';
      btnSendSimToWhatsApp.dataset.driving = drivingLabel;
      btnSendSimToWhatsApp.dataset.visa = visaLabel;
      btnSendSimToWhatsApp.dataset.total = formatPrice(grandTotal);
    }
  }

  levelCheckboxes.forEach(cb => cb.addEventListener('change', recalculateSimulator));
  drivingRadios.forEach(rb => rb.addEventListener('change', recalculateSimulator));
  if (simVisaSelect) simVisaSelect.addEventListener('change', recalculateSimulator);

  recalculateSimulator();

  if (btnSendSimToWhatsApp) {
    btnSendSimToWhatsApp.addEventListener('click', () => {
      const levels = btnSendSimToWhatsApp.dataset.levels || 'Non spécifié';
      const driving = btnSendSimToWhatsApp.dataset.driving || 'Non';
      const visa = btnSendSimToWhatsApp.dataset.visa || 'Non';
      const total = btnSendSimToWhatsApp.dataset.total || '0 FCFA';

      const message = `*DEVIS PROJET GERMANY CONNECT INSTITUTE*\n` +
        `-----------------------------------------\n` +
        `*Niveaux de Langue :* ${levels}\n` +
        `*Auto-École GCONNECT :* ${driving}\n` +
        `*Accompagnement Visa :* ${visa}\n` +
        `*Total Estimé :* ${total}\n` +
        `-----------------------------------------\n` +
        `Bonjour, je souhaite réserver ma place pour ce parcours et convenir d'un rendez-vous au campus de Ngousso.`;

      const encodedUrl = `https://wa.me/491749632778?text=${encodeURIComponent(message)}`;
      window.open(encodedUrl, '_blank');
    });
  }

  // ==========================================================================
  // 9. TEST DE NIVEAU EXPRESS D'ALLEMAND INTERACTIF
  // ==========================================================================
  const quizQuestions = [
    {
      question: '1. Complétez la phrase : "Guten Tag, wie ______ Sie ?"',
      diff: 'Niveau : Débutant A1',
      options: [
        { text: 'A) heißt', correct: false },
        { text: 'B) heißen', correct: true },
        { text: 'C) heiße', correct: false },
        { text: 'D) bist', correct: false }
      ]
    },
    {
      question: '2. Choisissez l\'article défini approprié : "______ Tisch ist sehr modern."',
      diff: 'Niveau : Débutant A1',
      options: [
        { text: 'A) Das', correct: false },
        { text: 'B) Die', correct: false },
        { text: 'C) Der', correct: true },
        { text: 'D) Den', correct: false }
      ]
    },
    {
      question: '3. Quelle est la phrase correcte avec le verbe modal "können" au présent ?',
      diff: 'Niveau : Élémentaire A2',
      options: [
        { text: 'A) Er kann gut Deutsch sprechen.', correct: true },
        { text: 'B) Er konnt gut Deutsch sprechen.', correct: false },
        { text: 'C) Er kann sprechen gut Deutsch.', correct: false },
        { text: 'D) Er spricht können Deutsch gut.', correct: false }
      ]
    },
    {
      question: '4. Complétez avec la préposition temporelle : "Der Unterricht beginnt ______ 8 Uhr."',
      diff: 'Niveau : Élémentaire A2',
      options: [
        { text: 'A) am', correct: false },
        { text: 'B) im', correct: false },
        { text: 'C) um', correct: true },
        { text: 'D) von', correct: false }
      ]
    },
    {
      question: '5. Complétez la subordonnée : "Ich lerne Deutsch, ______ ich in Deutschland eine Ausbildung machen will."',
      diff: 'Niveau : Intermédiaire B1',
      options: [
        { text: 'A) denn', correct: false },
        { text: 'B) weil', correct: true },
        { text: 'C) obwohl', correct: false },
        { text: 'D) dass', correct: false }
      ]
    },
    {
      question: '6. Quelle forme au subjonctif II exprime un souhait poli ? "______ Sie mir bitte helfen ?"',
      diff: 'Niveau : Avancé B2',
      options: [
        { text: 'A) Könnten', correct: true },
        { text: 'B) Haben', correct: false },
        { text: 'C) Werden', correct: false },
        { text: 'D) Müssten', correct: false }
      ]
    }
  ];

  let currentQuizStep = 0;
  let quizScore = 0;

  const quizStepLabel = document.getElementById('quizStepLabel');
  const quizDiffTag = document.getElementById('quizDiffTag');
  const quizQuestionText = document.getElementById('quizQuestionText');
  const quizOptionsList = document.getElementById('quizOptionsList');
  const quizProgressIndicator = document.getElementById('quizProgressIndicator');
  const quizContentArea = document.getElementById('quizContentArea');
  const quizResultArea = document.getElementById('quizResultArea');
  const resultScoreNum = document.getElementById('resultScoreNum');
  const resultLevelTitle = document.getElementById('resultLevelTitle');
  const resultLevelDesc = document.getElementById('resultLevelDesc');
  const btnRestartQuiz = document.getElementById('btnRestartQuiz');
  const btnEnrollWithQuizResult = document.getElementById('btnEnrollWithQuizResult');

  function renderQuizQuestion() {
    if (currentQuizStep >= quizQuestions.length) {
      showQuizResults();
      return;
    }

    const q = quizQuestions[currentQuizStep];
    if (quizStepLabel) quizStepLabel.textContent = `Question ${currentQuizStep + 1} sur ${quizQuestions.length}`;
    if (quizDiffTag) quizDiffTag.textContent = q.diff;
    if (quizQuestionText) quizQuestionText.textContent = q.question;

    const progressPct = ((currentQuizStep + 1) / quizQuestions.length) * 100;
    if (quizProgressIndicator) quizProgressIndicator.style.width = `${progressPct}%`;

    if (quizOptionsList) {
      quizOptionsList.innerHTML = '';
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-opt-btn';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
          if (opt.correct) quizScore++;
          currentQuizStep++;
          renderQuizQuestion();
        });
        quizOptionsList.appendChild(btn);
      });
    }
  }

  function showQuizResults() {
    if (quizContentArea) quizContentArea.style.display = 'none';
    if (quizResultArea) quizResultArea.style.display = 'flex';

    if (resultScoreNum) resultScoreNum.textContent = `${quizScore}/${quizQuestions.length}`;

    let recLevel = 'Allemand Niveau A1 (100 000 FCFA)';
    let title = 'Niveau Recommandé : Débutant A1';
    let desc = 'Vous débutez votre apprentissage de l\'allemand. Notre programme A1 intensif vous apportera des fondations solides en grammaire, phonétique et vocabulaire quotidien pour démarrer votre projet vers l\'Allemagne !';

    if (quizScore >= 2 && quizScore <= 3) {
      recLevel = 'Allemand Niveau A2 (110 000 FCFA)';
      title = 'Niveau Recommandé : Élémentaire A2';
      desc = 'Vous avez déjà des notions élémentaires de la langue allemande. Le niveau A2 vous permettra de structurer vos phrases, d\'enrichir votre lexique et de converser avec plus d\'aisance.';
    } else if (quizScore >= 4 && quizScore <= 5) {
      recLevel = 'Allemand Niveau B1 (130 000 FCFA)';
      title = 'Niveau Recommandé : Intermédiaire B1 Certifiant';
      desc = 'Bravo ! Vous avez d\'excellentes bases linguistiques. Vous êtes prêt(e) pour le niveau B1 afin de viser directement les certifications officielles Goethe ou TELC exigées pour les visas Ausbildung et universités.';
    } else if (quizScore === 6) {
      recLevel = 'Allemand Niveau B2 (140 000 FCFA)';
      title = 'Niveau Recommandé : Avancé B2 Professionnel';
      desc = 'Score parfait ! Votre maîtrise de l\'allemand est remarquable. Le niveau B2 (ou C1 150 000 FCFA) vous ouvrira les opportunités médicales, d\'ingénierie et d\'études supérieures directes en Allemagne.';
    }

    if (resultLevelTitle) resultLevelTitle.textContent = title;
    if (resultLevelDesc) resultLevelDesc.textContent = desc;

    if (btnEnrollWithQuizResult) {
      btnEnrollWithQuizResult.setAttribute('data-course', recLevel);
    }
  }

  function restartQuiz() {
    currentQuizStep = 0;
    quizScore = 0;
    if (quizContentArea) quizContentArea.style.display = 'block';
    if (quizResultArea) quizResultArea.style.display = 'none';
    renderQuizQuestion();
  }

  if (btnRestartQuiz) btnRestartQuiz.addEventListener('click', restartQuiz);

  renderQuizQuestion();

  // ==========================================================================
  // 10. GESTION DES MODALES ACCESSIBLES (INSCRIPTION, BROCHURE, CGU, PRIVACY)
  // ==========================================================================
  const allModals = document.querySelectorAll('.modal-backdrop');
  const enrollModal = document.getElementById('enrollModal');
  const brochureModal = document.getElementById('brochureModal');
  const cguModal = document.getElementById('cguModal');
  const privacyModal = document.getElementById('privacyModal');
  const enrollProgramSelect = document.getElementById('enrollProgram');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    allModals.forEach(modal => closeModal(modal));
  }

  // Déclencheurs Inscription
  document.querySelectorAll('.open-enroll-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseName = btn.getAttribute('data-course');
      if (enrollProgramSelect && courseName) {
        let matched = false;
        Array.from(enrollProgramSelect.options).forEach(opt => {
          if (opt.value.toLowerCase().includes(courseName.toLowerCase()) || courseName.toLowerCase().includes(opt.value.toLowerCase())) {
            enrollProgramSelect.value = opt.value;
            matched = true;
          }
        });
        if (!matched && courseName) {
          // Si pas de correspondance exacte, sélectionner la consultation ou première option
          enrollProgramSelect.selectedIndex = 0;
        }
      }
      openModal(enrollModal);
    });
  });

  // Déclencheurs Brochure
  document.querySelectorAll('.open-brochure-modal').forEach(btn => {
    btn.addEventListener('click', () => openModal(brochureModal));
  });

  // Déclencheurs Juridiques
  document.querySelectorAll('.open-cgu-modal').forEach(btn => {
    btn.addEventListener('click', () => openModal(cguModal));
  });

  document.querySelectorAll('.open-privacy-modal').forEach(btn => {
    btn.addEventListener('click', () => openModal(privacyModal));
  });

  // Boutons de fermeture
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      closeModal(modal);
    });
  });

  // Fermeture par clic backdrop
  allModals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Fermeture par touche Échap
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      closeDrawer();
    }
  });

  // ==========================================================================
  // 11. SOUMISSION DES FORMULAIRES & TRANSMISSION WHATSAPP
  // ==========================================================================
  const enrollForm = document.getElementById('enrollForm');
  if (enrollForm) {
    enrollForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('enrollFullName').value.trim();
      const phone = document.getElementById('enrollPhone').value.trim();
      const email = document.getElementById('enrollEmail').value.trim() || 'Non renseigné';
      const program = document.getElementById('enrollProgram').value;
      const schedule = document.getElementById('enrollSchedule').value;
      const message = document.getElementById('enrollMessage').value.trim() || 'Aucune précision';

      const waText = `*NOUVELLE INSCRIPTION // GERMANY CONNECT INSTITUTE*\n` +
        `-----------------------------------------\n` +
        `*Nom & Prénom :* ${name}\n` +
        `*Téléphone / WhatsApp :* ${phone}\n` +
        `*Email :* ${email}\n` +
        `*Programme :* ${program}\n` +
        `*Créneau :* ${schedule}\n` +
        `*Détails du projet :* ${message}\n` +
        `-----------------------------------------\n` +
        `Bonjour, je confirme mon souhait d'inscription et souhaite être recontacté(e) pour finaliser mon dossier.`;

      closeModal(enrollModal);
      const waUrl = `https://wa.me/491749632778?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
      enrollForm.reset();
    });
  }

  const brochureForm = document.getElementById('brochureForm');
  if (brochureForm) {
    brochureForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const bName = document.getElementById('brochureName').value.trim();
      const bPhone = document.getElementById('brochureWhatsapp').value.trim();

      const waText = `*DEMANDE DE BROCHURE OFFICIELLE 2026*\n` +
        `-----------------------------------------\n` +
        `*Nom :* ${bName}\n` +
        `*WhatsApp :* ${bPhone}\n` +
        `Bonjour Germany Connect Institute, je souhaite recevoir le catalogue complet des formations et tarifs 2026 en PDF.`;

      closeModal(brochureModal);
      const waUrl = `https://wa.me/491749632778?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
      brochureForm.reset();
    });
  }

});

/* ============================================================
     ⚙️  CONFIGURATION
     ============================================================ */

  // --- Contact (valeurs RÉELLES, déjà en place) ---
  const CONFIG = {
    phone:    "+33756909974",     // numéro réel (format international)
    whatsapp: "33756909974",      // WhatsApp (sans + ni 0)
    email:    "novasite101@gmail.com",
    waText:   "Bonjour NovaSite, je souhaite obtenir un devis gratuit pour mon site internet."
  };

  // --- EmailJS : crée un compte gratuit sur emailjs.com puis colle tes 3 identifiants ---
  // Service > Email Services | Template > Email Templates | Public Key > Account
  const EMAILJS = {
    publicKey:  "VOTRE_PUBLIC_KEY",
    serviceId:  "VOTRE_SERVICE_ID",
    templateId: "VOTRE_TEMPLATE_ID"
  };

  // --- Tracking : colle tes identifiants pour activer (laisse tel quel = désactivé, sans erreur) ---
  const TRACKING = {
    ga4:       "G-XXXXXXXXXX",       // Google Analytics 4 (Mesure)
    metaPixel: "XXXXXXXXXXXXXXX"     // Meta Pixel (15-16 chiffres)
  };

  // Détecte si une valeur est encore un placeholder
  function isPlaceholder(v){ return !v || /VOTRE_|XXXX/i.test(v); }
  const EMAIL_READY = !isPlaceholder(EMAILJS.publicKey) && !isPlaceholder(EMAILJS.serviceId) && !isPlaceholder(EMAILJS.templateId);

  /* ---------- Utilitaires sûrs ---------- */
  function loadScript(src){
    return new Promise(function(resolve){
      var s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = function(){ resolve(true); };
      s.onerror = function(){ resolve(false); };
      document.head.appendChild(s);
    });
  }
  function revealAll(){
    document.querySelectorAll('.reveal').forEach(function(el){
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ---------- TRACKING : GA4 + Meta Pixel (activés seulement si configurés) ---------- */
  function initTracking(){
    // Google Analytics 4
    if (!isPlaceholder(TRACKING.ga4)){
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', TRACKING.ga4);
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + TRACKING.ga4);
    }
    // Meta (Facebook) Pixel
    if (!isPlaceholder(TRACKING.metaPixel)){
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', TRACKING.metaPixel);
      fbq('track', 'PageView');
    }
  }

  // Envoie un évènement aux deux plateformes, sans jamais planter si elles sont absentes
  function track(gaEvent, fbEvent, params){
    params = params || {};
    try { if (window.gtag) gtag('event', gaEvent, params); } catch(e){}
    try { if (window.fbq) fbq('track', fbEvent, params); } catch(e){}
    // Toujours visible en debug, même sans plateforme branchée
    if (!window.gtag && !window.fbq) console.debug('[track]', gaEvent, params);
  }

  /* ---------- Détection appareil ---------- */
  function isMobile(){
    if (/Mobi|Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent)) return true;
    return !!(window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  }

  /* ---------- Scroll fluide premium (compense le header sticky) ---------- */
  function smoothScrollTo(target){
    var el = (typeof target === 'string') ? document.querySelector(target) : target;
    if (!el) return;
    var header = document.getElementById('header');
    var offset = (header ? header.offsetHeight : 0) + 16;
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }

  /* ---------- Popup d'appel (desktop uniquement) ---------- */
  function openCallModal(){
    var m = document.getElementById('callModal');
    if (!m) return;
    m.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeCallModal(){
    var m = document.getElementById('callModal');
    if (!m) return;
    m.classList.add('hidden');
    document.body.style.overflow = '';
  }
  function copyNumber(){
    var num = CONFIG.phone; // +33756909974
    var label = document.getElementById('callCopyLabel');
    var done = function(){ if (label){ label.textContent = 'Numéro copié ✓'; setTimeout(function(){ label.textContent = 'Copier le numéro'; }, 2000); } };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(num).then(done).catch(function(){ fallbackCopy(num); done(); });
    } else { fallbackCopy(num); done(); }
  }
  function fallbackCopy(text){
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch(e){}
    document.body.removeChild(ta);
  }
  function initCallModal(){
    var close = document.getElementById('callClose');
    var backdrop = document.getElementById('callBackdrop');
    var copy = document.getElementById('callCopy');
    if (close) close.addEventListener('click', closeCallModal);
    if (backdrop) backdrop.addEventListener('click', closeCallModal);
    if (copy) copy.addEventListener('click', copyNumber);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeCallModal(); });
  }

  /* ---------- 1) CTA : 100% pilotés en JS, jamais de navigation externe ---------- */
  function bindCTAs(){
    var tel = 'tel:' + CONFIG.phone;
    var wa  = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.waText);

    // APPELER : mobile -> appel direct | desktop -> popup élégante
    document.querySelectorAll('[data-call]').forEach(function(el){
      el.setAttribute('href', tel); // conservé pour l'accessibilité + mobile
      el.addEventListener('click', function(e){
        track('phone_click', 'Contact', { method:'phone' });
        if (!isMobile()){
          e.preventDefault();      // évite l'erreur "aucune application" sur ordinateur
          openCallModal();
        }
        // sur mobile : on laisse le lien tel: lancer l'appel
      });
    });

    // WHATSAPP : ouvre wa.me avec message prérempli (nouvel onglet)
    document.querySelectorAll('[data-wa]').forEach(function(el){
      el.setAttribute('href', wa); el.target='_blank'; el.rel='noopener';
      el.addEventListener('click', function(){ track('whatsapp_click', 'Contact', { method:'whatsapp' }); });
    });

    // DEVIS : scroll fluide vers #contact, AUCUNE navigation externe
    document.querySelectorAll('[data-quote]').forEach(function(el){
      el.setAttribute('href', '#contact');
      el.addEventListener('click', function(e){
        e.preventDefault();
        track('quote_click', 'Lead', { method:'devis' });
        smoothScrollTo('#contact');
        setTimeout(function(){ var f = document.getElementById('f-name'); if (f) f.focus({ preventScroll:true }); }, 600);
      });
    });

    // NAV & logo : scroll fluide vers les sections internes
    document.querySelectorAll('a[href^="#"]:not([data-quote]):not([data-wa]):not([data-call])').forEach(function(el){
      el.addEventListener('click', function(e){
        var id = el.getAttribute('href');
        if (id && id.length > 1 && document.querySelector(id)){
          e.preventDefault();
          smoothScrollTo(id);
        }
      });
    });
  }


  /* ---------- 3) Header sticky (JS pur, indépendant des CDN) ---------- */
  function initHeader(){
    var headerInner = document.getElementById('headerInner');
    if (!headerInner) return;
    var cls = ['bg-white/85','backdrop-blur-xl','border-line','shadow-sm'];
    var onScroll = function(){
      if (window.scrollY > 20) headerInner.classList.add.apply(headerInner.classList, cls);
      else headerInner.classList.remove.apply(headerInner.classList, cls);
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

  /* ---------- 4) Compteurs (avec ou sans GSAP) ---------- */
  function setCounter(el, val){ el.innerText = Math.round(val); }
  function animateCounter(el){
    if (el.dataset.done === '1') return;        // évite de relancer
    el.dataset.done = '1';
    var target = +el.dataset.target || 0;
    if (window.gsap){
      var proxy = { n: 0 };                      // ← on anime un OBJET, pas le DOM
      gsap.to(proxy, {
        n: target, duration: 1.6, ease: 'power2.out',
        onUpdate: function(){ setCounter(el, proxy.n); }
      });
    } else { setCounter(el, target); }
  }

  /* ---------- 5) Animations GSAP : garde + failsafe ---------- */
  function initAnimations(){
    // Pas de GSAP ? -> tout est déjà visible (CSS), on s'assure juste des compteurs.
    if (!window.gsap){
      revealAll();
      document.querySelectorAll('.counter').forEach(function(el){ setCounter(el, +el.dataset.target || 0); });
      return;
    }
    try {
      var hasST = !!window.ScrollTrigger;
      if (hasST) gsap.registerPlugin(ScrollTrigger);

      // On masque PUIS on anime — seulement maintenant que GSAP est confirmé.
      gsap.set('.reveal', { opacity:0, y:28 });

      // Hero : entrée immédiate au chargement
      gsap.to('#hero .reveal', { opacity:1, y:0, duration:0.9, ease:'power3.out', stagger:0.12, delay:0.05 });

      if (hasST){
        gsap.utils.toArray('.reveal').forEach(function(el){
          if (el.closest('#hero')) return;
          gsap.to(el, { opacity:1, y:0, duration:0.8, ease:'power3.out',
            scrollTrigger:{ trigger:el, start:'top 88%', once:true } });
        });
        gsap.utils.toArray('.counter').forEach(function(el){
          ScrollTrigger.create({ trigger:el, start:'top 90%', once:true, onEnter:function(){ animateCounter(el); } });
        });
        ScrollTrigger.refresh();
      } else {
        // GSAP sans ScrollTrigger : on révèle tout en douceur, sans scroll-trigger.
        gsap.to('.reveal', { opacity:1, y:0, duration:0.6, ease:'power2.out', stagger:0.02 });
        document.querySelectorAll('.counter').forEach(animateCounter);
      }
    } catch(e){
      console.warn('Animation KO -> affichage forcé du contenu :', e);
      revealAll();
    }

    // FAILSAFE : si un .reveal reste invisible après 2,5s, on le force.
    setTimeout(function(){
      document.querySelectorAll('.reveal').forEach(function(el){
        if (parseFloat(getComputedStyle(el).opacity) < 0.05){ el.style.opacity='1'; el.style.transform='none'; }
      });
    }, 2500);
  }

  /* ---------- 6) Formulaire : validation + Email (EmailJS) + WhatsApp + confirmation ---------- */
  function showFieldError(id, show){
    var input = document.getElementById(id);
    var err = document.querySelector('[data-err="'+id+'"]');
    if (input) input.classList.toggle('border-red-400', !!show);
    if (input) input.classList.toggle('border-line', !show);
    if (err) err.classList.toggle('hidden', !show);
  }

  function bindForm(){
    var btn = document.getElementById('f-submit');
    if (!btn) return;

    btn.addEventListener('click', function(){
      var elName = document.getElementById('f-name');
      var elPhone= document.getElementById('f-phone');
      var elEmail= document.getElementById('f-email');
      var name  = (elName ? elName.value : '').trim();
      var phone = (elPhone ? elPhone.value : '').trim();
      var email = (elEmail ? elEmail.value : '').trim();
      var biz   = (document.getElementById('f-biz')||{}).value || '';
      var msg   = (document.getElementById('f-msg')||{}).value || '';
      biz = biz.trim(); msg = msg.trim();

      // --- Validation / protection champs vides ---
      var ok = true;
      var phoneOk = phone.replace(/[^0-9+]/g,'').length >= 8;        // au moins 8 chiffres
      var emailOk = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // email optionnel mais valide si rempli
      showFieldError('f-name',  !name);            if (!name)    ok = false;
      showFieldError('f-phone', !phoneOk);         if (!phoneOk) ok = false;
      showFieldError('f-email', !emailOk);         if (!emailOk) ok = false;
      if (!ok){
        var first = document.querySelector('.border-red-400');
        if (first) first.focus();
        return;
      }

      // --- Données du lead ---
      var params = {
        from_name: name,
        phone: phone,
        email: email || 'Non renseigné',
        business: biz || 'Non renseigné',
        message: msg || 'Non renseigné',
        to_email: CONFIG.email,
        page: location.href
      };

      // 1) WhatsApp ouvert dans le même clic (préserve le geste utilisateur → pas de blocage popup)
      var waText = 'Nouvelle demande de devis NovaSite%0A%0A' +
                   'Nom : ' + name + '%0A' +
                   'Téléphone : ' + phone + '%0A' +
                   'Email : ' + (email||'-') + '%0A' +
                   'Activité : ' + (biz||'-') + '%0A' +
                   'Projet : ' + (msg||'-');
      window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + waText, '_blank');

      // 2) Email via EmailJS (en arrière-plan, si configuré)
      if (EMAIL_READY){
        ensureEmailJS().then(function(){
          if (window.emailjs){
            emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, params)
              .then(function(){ console.log('Email envoyé'); })
              .catch(function(err){ console.warn('EmailJS erreur (lead déjà parti sur WhatsApp) :', err); });
          }
        });
      } else {
        console.info('EmailJS non configuré : le lead part sur WhatsApp. Ajoute tes clés pour activer l email.');
      }

      // 3) Tracking conversion (GA4 + Meta Pixel)
      track('generate_lead', 'Lead', { method:'form', value:290, currency:'EUR' });

      // 4) Confirmation visible
      var form = document.getElementById('contactForm');
      var success = document.getElementById('contactSuccess');
      var sName = document.getElementById('successName');
      if (sName) sName.textContent = name + ' !';
      if (form) form.classList.add('hidden');
      if (success){ success.classList.remove('hidden'); success.scrollIntoView({ behavior:'smooth', block:'center' }); }
    });
  }

  /* ---------- EmailJS : chargé à la demande (perf mobile) ---------- */
  var _emailjsPromise = null;
  function ensureEmailJS(){
    if (window.emailjs) return Promise.resolve(true);
    if (_emailjsPromise) return _emailjsPromise;
    _emailjsPromise = loadScript('email.min.js').then(function(ok){
      if (ok && window.emailjs && EMAIL_READY){ try { emailjs.init({ publicKey: EMAILJS.publicKey }); } catch(e){} }
      return ok;
    });
    return _emailjsPromise;
  }

  /* ---------- BOOT : ordonné et tolérant aux pannes ---------- */
  async function boot(){
    initTracking();                              // GA4 + Meta Pixel (si configurés)

    bindCTAs();                                  // CTA d'abord : toujours cliquables + trackés
    initCallModal();
    var _form = document.getElementById('contactForm');
    if (_form) _form.addEventListener('focusin', ensureEmailJS, { once:true });
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    initHeader();
    bindForm();

    // Fallback GSAP si le CDN principal a échoué
    if (!window.gsap){ await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'); }
    if (window.gsap && !window.ScrollTrigger){ await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'); }

    initAnimations();
  }

  // Lancement (le DOM est déjà prêt : script en fin de body)
  boot();

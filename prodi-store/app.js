(() => {
  "use strict";

  const CATALOG = window.PRODI_CATALOG || { categories: [], grand_total: 0 };
  const WHATSAPP_NUMBER = "51941682941";

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */
  function buildDiacriticsRegex() {
    // Combining diacritical marks block: U+0300 - U+036F (decimal 768-879).
    // Built from char codes (not a literal in source) to avoid any encoding issues.
    var chars = "";
    for (var i = 768; i <= 879; i++) chars += String.fromCharCode(i);
    return new RegExp("[" + chars + "]", "g");
  }
  const DIACRITICS_RE = buildDiacriticsRegex();

  function normalize(str) {
    return (str || "")
      .normalize("NFKD")
      .replace(DIACRITICS_RE, "")
      .toLowerCase();
  }

  function waLink(text) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function fmt(n) {
    return n.toLocaleString("es-PE");
  }

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  /* ------------------------------------------------------------------ */
  /* Visual identity per categoria: color + icono + descripcion corta    */
  /* Coincidencia por palabra clave (robusta a variaciones de nombre),   */
  /* con fallback determinista para cualquier categoria no listada.      */
  /* ------------------------------------------------------------------ */
  const ICONS = {
    terror: `<circle cx="12" cy="10" r="7"/><path d="M9 21v-3M15 21v-3M9 10h.01M15 10h.01M9.5 14c1 1 4 1 5 0"/>`,
    fantasia: `<path d="M12 3a7 7 0 1 0 7 9 6 6 0 0 1-7-9Z"/><path d="M18 3l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/>`,
    scifi: `<path d="M12 2c3 2 4 6 4 10 0 2-1 4-1 4H9s-1-2-1-4c0-4 1-8 4-10Z"/><circle cx="12" cy="9" r="1.4"/><path d="M9 16l-3 5 4-2M15 16l3 5-4-2"/>`,
    crimen: `<circle cx="10" cy="10" r="6"/><line x1="19" y1="19" x2="14.5" y2="14.5"/>`,
    infantil: `<circle cx="12" cy="10" r="6"/><path d="M12 16v6M9 22h6"/>`,
    negocios: `<rect x="4" y="12" width="3" height="8"/><rect x="10.5" y="7" width="3" height="13"/><rect x="17" y="3" width="3" height="17"/>`,
    espiritu: `<path d="M12 2c2 4-3 5-3 9a3 3 0 0 0 6 0c0-2-1-3-1-3s2 1 2 5a5 5 0 0 1-10 0C6 8 9 6 12 2Z"/>`,
    familia: `<circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M4 21v-2a5 5 0 0 1 5-5h1a5 5 0 0 1 4.2 2.3M14 21v-1.5a4 4 0 0 1 4-4h.3a4 4 0 0 1 3.7 2.5"/>`,
    filosofia: `<path d="M4 21h16M5 21V9M9 21V9M15 21V9M19 21V9M3 9l9-5 9 5"/>`,
    gastronomia: `<path d="M6 2v8a2 2 0 0 0 4 0V2M8 10v12M18 2c-2 0-3 2-3 5s1 4 3 4M18 2v18"/>`,
    historia: `<path d="M7 2h10M7 22h10M7 2c0 6 5 6 5 8s-5 2-5 8M17 2c0 6-5 6-5 8s5 2 5 8"/>`,
    finanzas: `<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1 3 2.2c0 2.8-6 1.3-6 4.2 0 1.3 1.3 2.3 3 2.3s3-1 3-2.3"/>`,
    liderazgo: `<path d="M3 11v2a2 2 0 0 0 2 2h1l3 5 2-1-2-4h2l8 4V6l-8 4H6a2 2 0 0 0-2 2Z"/>`,
    magia: `<path d="M12 2l2.9 6.3L21 9l-5 4.6L17.4 21 12 17.5 6.6 21 8 13.6 3 9l6.1-.7Z"/>`,
    novelas: `<path d="M3 5c3-1.5 6-1.5 9 0v14c-3-1.5-6-1.5-9 0V5ZM21 5c-3-1.5-6-1.5-9 0v14c3-1.5 6-1.5 9 0V5Z"/>`,
    origenes: `<ellipse cx="12" cy="16" rx="4" ry="3"/><ellipse cx="7" cy="8" rx="2" ry="2.6"/><ellipse cx="12" cy="6" rx="2" ry="2.6"/><ellipse cx="17" cy="8" rx="2" ry="2.6"/>`,
    politica: `<path d="M12 3v18M7 21h10M5 7h6M5 7 2 13a3 3 0 0 0 6 0L5 7ZM18 7h1M18 7l-3 6a3 3 0 0 0 6 0l-3-6Z"/>`,
    tecnologia: `<path d="M8 6 2 12l6 6M16 6l6 6-6 6M14 4l-4 16"/>`,
    psicologia: `<path d="M9 3a4 4 0 0 0-4 4 3 3 0 0 0-1 5.7A4 4 0 0 0 8 19h1M15 3a4 4 0 0 1 4 4 3 3 0 0 1 1 5.7A4 4 0 0 1 16 19h-1M9 3v16M15 3v16"/>`,
    salud: `<path d="M3 12h4l2-6 4 12 2-6h6"/>`,
    seduccion: `<path d="M12 20s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 6C19 15.6 12 20 12 20Z"/>`,
    superacion: `<path d="M3 20 9 8l3 5 2-3 7 10Z"/><path d="M14 4v6l3-1.5L14 7"/>`,
    cristiana: `<path d="M12 3v18M6 9h12"/>`,
    ingles: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>`,
    astronomia: `<circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="10" ry="3.4" transform="rotate(-24 12 12)"/><path d="M4 5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/>`,
    default: `<path d="M3 5c3-1.5 6-1.5 9 0v14c-3-1.5-6-1.5-9 0V5ZM21 5c-3-1.5-6-1.5-9 0v14c3-1.5 6-1.5 9 0V5Z"/>`,
  };

  const STYLE_RULES = [
    { test: /astronom|astrofisica/, color: "#3fa9f5", icon: "astronomia",
      blurb: "El universo, la física y la ciencia explicadas simple." },
    { test: /terror/, color: "#ff3131", icon: "terror",
      blurb: "Historias que te van a quitar el sueño." },
    { test: /fantas/, color: "#9b5cff", icon: "fantasia",
      blurb: "Mundos, magia y aventuras sin límites." },
    { test: /ciencia\s*ficcion/, color: "#00e6c3", icon: "scifi",
      blurb: "Futuros posibles, mundos imposibles." },
    { test: /crimen|thriller|triller/, color: "#5865f2", icon: "crimen",
      blurb: "Misterio, tensión y giros que no ves venir." },
    { test: /cuentos|infantil/, color: "#ffb200", icon: "infantil",
      blurb: "Para leer en voz alta con los más pequeños." },
    { test: /emprendimiento|negocios|ventas/, color: "#ffd60a", icon: "negocios",
      blurb: "Estrategia, ventas y mentalidad de negocio." },
    { test: /espiritualidad|mindfulness/, color: "#2ee6a8", icon: "espiritu",
      blurb: "Calma, propósito y conexión interior." },
    { test: /familia|educacion/, color: "#ff6f59", icon: "familia",
      blurb: "Criar, enseñar y crecer en comunidad." },
    { test: /filosofia/, color: "#7c83fd", icon: "filosofia",
      blurb: "Las grandes preguntas, explicadas con calma." },
    { test: /gastronomia/, color: "#ff4d00", icon: "gastronomia",
      blurb: "Recetas y saberes de cocina para explorar." },
    { test: /historia/, color: "#e0a83e", icon: "historia",
      blurb: "El pasado que explica el presente." },
    { test: /inversion|finanzas/, color: "#00e08a", icon: "finanzas",
      blurb: "Dinero, inversión y libertad financiera." },
    { test: /liderazgo|oratoria|productividad/, color: "#ff8200", icon: "liderazgo",
      blurb: "Habla, lidera y organiza mejor tu tiempo." },
    { test: /magia|ocultismo|prohibido/, color: "#e619c9", icon: "magia",
      blurb: "Lo esotérico, lo oculto y lo prohibido." },
    { test: /novelas|literatura/, color: "#f5a623", icon: "novelas",
      blurb: "Grandes historias de la literatura universal." },
    { test: /origenes|dinosaurios|evolucion/, color: "#8bc700", icon: "origenes",
      blurb: "De los dinosaurios a la evolución humana." },
    { test: /politica|economia/, color: "#4a4de0", icon: "politica",
      blurb: "Cómo se mueve el poder y la economía." },
    { test: /programacion|\bia\b|tecnologia/, color: "#00c2ff", icon: "tecnologia",
      blurb: "Código, inteligencia artificial y tecnología." },
    { test: /psicologia|mente/, color: "#7209f7", icon: "psicologia",
      blurb: "La mente humana en sus zonas más oscuras." },
    { test: /salud|bienestar/, color: "#16db65", icon: "salud",
      blurb: "Cuerpo, energía y hábitos saludables." },
    { test: /seduccion|relaciones/, color: "#ff2e83", icon: "seduccion",
      blurb: "Vínculos, atracción y relaciones sanas." },
    { test: /superacion|autoayuda/, color: "#ff7a3d", icon: "superacion",
      blurb: "Mentalidad y hábitos para ir por más." },
    { test: /cristiana|biblia|biblic/, color: "#e8b400", icon: "cristiana",
      blurb: "Estudio bíblico y crecimiento espiritual." },
    { test: /ingles/, color: "#14c4b4", icon: "ingles",
      blurb: "Cursos y material para aprender inglés." },
  ];

  function hashColor(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    return `hsl(${hue} 55% 55%)`;
  }

  function getStyle(name) {
    const n = normalize(name);
    for (const rule of STYLE_RULES) {
      if (rule.test.test(n)) return rule;
    }
    return {
      color: hashColor(n),
      icon: "default",
      blurb: "Una selección curada de los títulos más pedidos.",
    };
  }

  /* ------------------------------------------------------------------ */
  /* Render: stats                                                       */
  /* ------------------------------------------------------------------ */
  const categories = CATALOG.categories || [];
  const grandTotal = CATALOG.grand_total || 0;

  const statTotal = document.getElementById("stat-total");
  if (statTotal) statTotal.textContent = `${fmt(grandTotal)}+`;
  const statCategorias = document.getElementById("stat-categorias");
  if (statCategorias) statCategorias.textContent = categories.length;

  function animateCount(node, target, suffix, duration) {
    if (!node) return;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      node.textContent = `${fmt(Math.round(target * eased))}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  animateCount(document.getElementById("stat-total-2"), grandTotal, "+", 1400);
  animateCount(document.getElementById("stat-categorias-2"), categories.length, "", 1000);

  /* ------------------------------------------------------------------ */
  /* Render: hero shelf (decorativo, clicable)                           */
  /* ------------------------------------------------------------------ */
  const shelf = document.getElementById("hero-shelf");
  if (shelf) {
    categories.forEach((cat, i) => {
      const style = getStyle(cat.name);
      const spine = el("div", "spine");
      const h = 42 + ((i * 37) % 55); // altura pseudo-aleatoria pero estable
      spine.style.height = `${h}%`;
      spine.style.background = style.color;
      spine.style.color = style.color;
      spine.style.animationDelay = `${i * 0.03}s`;
      spine.title = cat.name;
      spine.addEventListener("click", () => openModal(cat));
      shelf.appendChild(spine);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Render: category grid                                               */
  /* ------------------------------------------------------------------ */
  const grid = document.getElementById("category-grid");
  categories.forEach((cat, i) => {
    const style = getStyle(cat.name);
    const card = el("button", "cat-card");
    card.type = "button";
    card.style.setProperty("--cat-color", style.color);
    card.style.transitionDelay = `${(i % 8) * 45}ms`;
    card.innerHTML = `
      <span class="cat-icon"><svg viewBox="0 0 24 24">${ICONS[style.icon]}</svg></span>
      <div class="cat-name">${cat.name}</div>
      <div class="cat-blurb">${style.blurb}</div>
      <div class="cat-meta">
        <span class="cat-count">+${fmt(cat.total)} títulos</span>
        <span class="cat-arrow">→</span>
      </div>
    `;
    card.addEventListener("click", () => openModal(cat));
    grid.appendChild(card);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".cat-card, .reveal").forEach((c) => io.observe(c));

  /* ------------------------------------------------------------------ */
  /* Barra de progreso de scroll                                         */
  /* ------------------------------------------------------------------ */
  const progressBar = document.getElementById("scroll-progress");
  if (progressBar) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      progressBar.style.width = `${max > 0 ? (scrolled / max) * 100 : 0}%`;
    };
    document.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  /* ------------------------------------------------------------------ */
  /* Modal                                                                */
  /* ------------------------------------------------------------------ */
  const modal = document.getElementById("category-modal");
  const backdrop = document.getElementById("modal-backdrop");
  const modalHeader = document.getElementById("modal-header");
  const modalIcon = document.getElementById("modal-icon");
  const modalTitle = document.getElementById("modal-title");
  const modalCount = document.getElementById("modal-count");
  const modalList = document.getElementById("modal-titles");
  const modalSearch = document.getElementById("modal-search");
  const modalWhatsapp = document.getElementById("modal-whatsapp");
  const modalClose = document.getElementById("modal-close");

  let currentCategory = null;

  function renderModalTitles(filterText) {
    const q = normalize(filterText || "");
    const titles = (currentCategory.titles || []).filter((t) => normalize(t).includes(q));
    modalList.innerHTML = "";
    if (!titles.length) {
      modalList.appendChild(el("li", "modal-title-empty", "No hay títulos que coincidan con tu búsqueda."));
      return;
    }
    titles.forEach((title) => {
      const li = el("li", "modal-title-item");
      const span = el("span", null, title);
      const go = el("span", "go", "Preguntar →");
      li.appendChild(span);
      li.appendChild(go);
      li.addEventListener("click", () => {
        window.open(
          waLink(`Hola, quiero información sobre "${title}" (categoría: ${currentCategory.name}) de ProDi.`),
          "_blank"
        );
      });
      modalList.appendChild(li);
    });
  }

  function openModal(cat) {
    currentCategory = cat;
    const style = getStyle(cat.name);
    modalHeader.style.setProperty("--cat-color", `color-mix(in srgb, ${style.color} 55%, transparent)`);
    modalIcon.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[style.icon]}</svg>`;
    modalIcon.style.color = style.color;
    modalTitle.textContent = cat.name;
    modalCount.textContent = `${fmt(cat.total)} títulos en esta categoría`;
    modalWhatsapp.href = waLink(`Hola, quiero información sobre la categoría "${cat.name}" de ProDi.`);
    modalSearch.value = "";
    renderModalTitles("");
    backdrop.classList.add("open");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => modalSearch.focus({ preventScroll: true }), 350);
  }

  function closeModal() {
    backdrop.classList.remove("open");
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  modalClose.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  modalSearch.addEventListener("input", (e) => renderModalTitles(e.target.value));

  /* ------------------------------------------------------------------ */
  /* Global search                                                       */
  /* ------------------------------------------------------------------ */
  const globalSearch = document.getElementById("global-search");
  const searchResults = document.getElementById("search-results");
  const searchHint = document.getElementById("search-hint");
  let searchTimer = null;

  function runGlobalSearch(query) {
    const q = normalize(query.trim());
    if (q.length < 2) {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
      searchHint.textContent = "";
      return;
    }
    const matches = [];
    for (const cat of categories) {
      for (const title of cat.titles) {
        if (normalize(title).includes(q)) {
          matches.push({ title, cat });
          if (matches.length >= 40) break;
        }
      }
      if (matches.length >= 40) break;
    }
    searchHint.textContent = matches.length ? `${matches.length} resultado${matches.length === 1 ? "" : "s"}` : "";
    searchResults.innerHTML = "";
    if (!matches.length) {
      searchResults.appendChild(el("div", "search-empty", "Sin coincidencias en el catálogo mostrado — escríbenos, seguro lo tenemos."));
      searchResults.hidden = false;
      return;
    }
    matches.forEach(({ title, cat }) => {
      const style = getStyle(cat.name);
      const item = el("div", "search-result-item");
      item.innerHTML = `
        <span class="search-result-title">${title}</span>
        <span class="search-result-cat" style="--cat-color:${style.color}">${cat.name}</span>
      `;
      item.addEventListener("click", () => {
        window.open(
          waLink(`Hola, quiero información sobre "${title}" (categoría: ${cat.name}) de ProDi.`),
          "_blank"
        );
      });
      searchResults.appendChild(item);
    });
    searchResults.hidden = false;
  }

  globalSearch.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    const val = e.target.value;
    searchTimer = setTimeout(() => runGlobalSearch(val), 120);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-section")) {
      searchResults.hidden = true;
    }
  });

  /* ------------------------------------------------------------------ */
  /* WhatsApp CTAs genericos                                             */
  /* ------------------------------------------------------------------ */
  const genericMsg = "Hola, quiero información sobre ProDi (Productos Digitales).";
  ["nav-whatsapp", "hero-whatsapp", "band-whatsapp", "footer-whatsapp", "floating-whatsapp"].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.href = waLink(genericMsg);
  });
})();

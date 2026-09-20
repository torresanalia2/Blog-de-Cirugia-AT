/* Lógica del blog. No necesitas editar este archivo: todo el contenido está en contenido.js */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const nav = document.getElementById("nav");

  /* ---------- utilidades ---------- */
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.prototype.slice.call((el || document).querySelectorAll(s));

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: no pasa nada */ } },
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Formato sencillo para textos: párrafos, "## subtítulo", "- viñeta", **negrita**, *cursiva*
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>");
  function fmt(text) {
    return String(text || "").trim().split(/\n\s*\n/).map((bloque) => {
      const lineas = bloque.split("\n").map((l) => l.trim()).filter(Boolean);
      if (!lineas.length) return "";
      if (lineas[0].indexOf("## ") === 0) {
        return "<h3>" + inline(lineas[0].slice(3)) + "</h3>" + (lineas.length > 1 ? fmt(lineas.slice(1).join("\n")) : "");
      }
      if (lineas.every((l) => /^[-•] /.test(l))) {
        return "<ul>" + lineas.map((l) => "<li>" + inline(l.slice(2)) + "</li>").join("") + "</ul>";
      }
      return "<p>" + lineas.map(inline).join(" ") + "</p>";
    }).join("");
  }

  const pl = (n, s, p) => n + " " + (n === 1 ? s : p);
  const pad2 = (n) => (n < 10 ? "0" : "") + n;

  /* ---------- archivos: rutas y detección ---------- */
  // "clase-01.pdf" -> "archivos/clase-01.pdf". Si ya trae carpeta o es un enlace, se deja igual.
  function ruta(p) {
    if (!p) return "";
    p = String(p).trim();
    if (/^(https?:)?\/\//.test(p) || p.indexOf("/") > -1) return encodeURI(p);
    return encodeURI("archivos/" + p);
  }

  const cacheExiste = {};
  function existe(url) {
    // En la vista previa local (archivo abierto directamente) no se puede detectar: solo funcionan los archivos escritos a mano.
    if (location.protocol === "file:") return Promise.resolve(false);
    if (url in cacheExiste) return cacheExiste[url];
    cacheExiste[url] = fetch(url, { method: "HEAD", cache: "no-cache" }).then((r) => r.ok).catch(() => false);
    return cacheExiste[url];
  }

  /* ---------- datos derivados ---------- */
  const total = CLASES.length;
  const semanasTotal = Math.max.apply(null, CLASES.map((c) => c.semana));
  const byId = (id) => CLASES.find((c) => c.id === id);
  const detectados = {};

  const explicito = (id) => {
    const r = RESUMENES[id];
    return !!(r && (r.archivo || r.enlace || String(r.resumen || "").trim()));
  };
  const listo = (id) => explicito(id) || !!detectados[id];
  const listosCount = () => CLASES.filter((c) => listo(c.id)).length;
  const minutos = (txt) => Math.max(1, Math.round(String(txt).trim().split(/\s+/).length / 200));

  function pintarEstados() {
    $$("[data-est]").forEach((el) => {
      const ok = listo(Number(el.getAttribute("data-est")));
      el.className = "st " + (ok ? "ok" : "no");
      el.textContent = ok ? "Resumen listo" : "En preparación";
    });
    const c = $("#cuenta");
    if (c) c.textContent = listosCount() + " de " + total + " resúmenes listos";
  }

  function detectar() {
    return Promise.all(CLASES.map((c) =>
      existe(ruta("clase-" + pad2(c.id) + ".pdf")).then((ok) => { detectados[c.id] = ok; })
    )).then(pintarEstados);
  }

  function profesores() {
    const mapa = {};
    const orden = [];
    const agregar = (nombre, item, clave) => {
      if (!mapa[nombre]) { mapa[nombre] = { nombre: nombre, clases: [], talleres: [] }; orden.push(nombre); }
      mapa[nombre][clave].push(item);
    };
    CLASES.forEach((c) => agregar(c.profe, c, "clases"));
    TALLERES.forEach((t) => agregar(t.profe, t, "talleres"));
    return orden.map((n) => mapa[n]);
  }
  const iniciales = (nombre) => {
    const p = String(nombre).replace(/^(Dr\.|Dra\.)\s*/i, "").split(/\s+/).filter(Boolean);
    return ((p[0] || "?").charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : "")).toUpperCase();
  };

  /* ---------- fotos y galerías ---------- */
  const CAMARA = '<svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><path d="M8 15h8l3-5h10l3 5h8a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V18a3 3 0 0 1 3-3z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><circle cx="24" cy="27" r="7" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>';
  const fotoVacia = (txt) => '<div class="foto-vacia">' + CAMARA + "<span>" + esc(txt || "Aquí va tu foto") + "</span></div>";
  const imgHtml = (archivo, alt, vacio) => archivo
    ? '<img src="' + esc(ruta(archivo)) + '" alt="' + esc(alt || "") + '" loading="lazy" data-fb="' + esc(vacio || "Aquí va tu foto") + '">'
    : fotoVacia(vacio);

  function galeria(fotos, vacias, alt) {
    fotos = (fotos || []).filter(Boolean);
    if (!fotos.length) {
      if (!vacias) return "";
      let s = '<div class="galeria">';
      for (let i = 0; i < vacias; i++) s += '<div class="foto-cel">' + fotoVacia("Aquí va tu foto") + "</div>";
      return s + "</div>";
    }
    return '<div class="galeria">' + fotos.map((f, i) =>
      '<button type="button" class="foto" data-full="' + esc(ruta(f)) + '" data-cap="' + esc(alt || "") + '"><img src="' + esc(ruta(f)) + '" alt="' + esc((alt || "Foto") + " " + (i + 1)) + '" loading="lazy" data-fb="Foto no encontrada"></button>'
    ).join("") + "</div>";
  }

  /* ---------- visor de documentos (PDF, Canva, Drive) ---------- */
  function visorSlot(o) {
    return '<div class="visor" data-a="' + esc(o.archivo || "") + '" data-e="' + esc(o.enlace || "") + '" data-auto="' + esc(o.auto || "") + '" data-t="' + esc(o.titulo || "Documento") + '" data-v="' + esc(o.vacio || "") + '"><p class="visor-carga">Cargando…</p></div>';
  }

  function barraVisor(src, t, etiqueta, descarga) {
    return '<div class="visor-bar"><span class="visor-t">' + esc(t) + '</span><span class="visor-btns"><a class="btn peq" href="' + src + '" target="_blank" rel="noopener">' + etiqueta + "</a>" +
      (descarga ? '<a class="btn peq ghost" href="' + src + '" download>Descargar</a>' : "") + "</span></div>";
  }

  function visorArchivo(src, t) {
    const ext = (src.split("?")[0].split("#")[0].split(".").pop() || "").toLowerCase();
    if (ext === "pdf") {
      return barraVisor(src, t, "Abrir en pestaña nueva", true) +
        '<iframe class="visor-frame" src="' + src + '#view=FitH" title="' + esc(t) + '" loading="lazy"></iframe>' +
        '<p class="visor-nota">Si la vista previa no se ve bien en tu celular, toca «Abrir en pestaña nueva».</p>';
    }
    if (["png", "jpg", "jpeg", "webp", "gif"].indexOf(ext) > -1) {
      return barraVisor(src, t, "Abrir en pestaña nueva", true) + '<img class="visor-img" src="' + src + '" alt="' + esc(t) + '">';
    }
    return barraVisor(src, t, "Abrir archivo", true);
  }

  function visorEnlace(url, t) {
    const cv = /^https?:\/\/(www\.)?canva\.com\/design\/([^\/?#]+)\/([^\/?#]+)/.exec(url);
    const dr = /drive\.google\.com\/file\/d\/([^\/?#]+)/.exec(url);
    let embed = "";
    if (cv) embed = "https://www.canva.com/design/" + cv[2] + "/" + cv[3] + "/view?embed";
    else if (dr) embed = "https://drive.google.com/file/d/" + dr[1] + "/preview";
    const etiqueta = cv ? "Abrir en Canva" : dr ? "Abrir en Drive" : "Abrir enlace";
    return barraVisor(esc(url), t, etiqueta, false) + (embed ? '<iframe class="visor-frame" src="' + esc(embed) + '" title="' + esc(t) + '" loading="lazy" allowfullscreen></iframe>' : "");
  }

  async function montarVisor(el) {
    const a = el.getAttribute("data-a"), e = el.getAttribute("data-e"), auto = el.getAttribute("data-auto");
    const t = el.getAttribute("data-t"), vacio = el.getAttribute("data-v");
    let src = a ? ruta(a) : "";
    if (!src && !e && auto) { const r = ruta(auto); if (await existe(r)) src = r; }
    if (src) el.innerHTML = visorArchivo(src, t);
    else if (e) el.innerHTML = visorEnlace(e, t);
    else if (vacio) el.innerHTML = '<div class="pendiente"><p>' + esc(vacio) + "</p></div>";
    else el.innerHTML = "";
  }

  /* ---------- video ---------- */
  function videoHtml(m) {
    if (m.archivo) return '<video class="mm-video" controls preload="metadata" src="' + esc(ruta(m.archivo)) + '"></video>';
    const u = String(m.enlace || "");
    const yt = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{6,})/.exec(u);
    const vm = /vimeo\.com\/(\d+)/.exec(u);
    if (yt) return '<iframe class="mm-video" src="https://www.youtube-nocookie.com/embed/' + yt[1] + '" title="' + esc(m.titulo || "Video") + '" loading="lazy" allowfullscreen></iframe>';
    if (vm) return '<iframe class="mm-video" src="https://player.vimeo.com/video/' + vm[1] + '" title="' + esc(m.titulo || "Video") + '" loading="lazy" allowfullscreen></iframe>';
    return '<div class="mm-video enlace"><a class="btn" href="' + esc(u) + '" target="_blank" rel="noopener">Ver video</a></div>';
  }

  /* ---------- estado ---------- */
  let rotTab = 0;
  let mmFiltro = "todo";

  /* ---------- ilustración de la portada ---------- */
  const ARTE =
    '<svg viewBox="0 0 560 450" role="img" aria-label="Ilustración: una lista de verificación en pantalla, con un bisturí, unas pinzas y un hilo de sutura">' +
    '<rect x="110" y="130" width="400" height="250" rx="18" fill="#fff" stroke="#d9d9d9" stroke-width="10"/>' +
    '<path d="M60 380h500v10a16 16 0 0 1-16 16H76a16 16 0 0 1-16-16z" fill="#d9d9d9"/>' +
    '<rect x="262" y="380" width="96" height="9" rx="4.5" fill="#bdbdbd"/>' +
    '<g fill="none" stroke="#182527" stroke-width="3.5"><rect x="142" y="168" width="30" height="30" rx="7"/><rect x="142" y="223" width="30" height="30" rx="7"/><rect x="142" y="278" width="30" height="30" rx="7"/></g>' +
    '<g fill="none" stroke="#20a3cd" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"><path d="M149 184l7 7 13-15"/><path d="M149 239l7 7 13-15"/></g>' +
    '<g fill="#d9d9d9"><rect x="188" y="171" width="150" height="10" rx="5"/><rect x="188" y="226" width="130" height="10" rx="5"/><rect x="188" y="281" width="110" height="10" rx="5"/></g>' +
    '<g fill="#ececec"><rect x="188" y="188" width="100" height="8" rx="4"/><rect x="188" y="243" width="80" height="8" rx="4"/><rect x="188" y="298" width="90" height="8" rx="4"/></g>' +
    '<path d="M330 335h30l14-34 22 68 18-54 14 20h50" fill="none" stroke="#20a3cd" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect class="tintas" x="30" y="40" width="170" height="100" fill="#fff" stroke-width="2" stroke-dasharray="6 5"/>' +
    '<g class="tinta"><rect x="25" y="35" width="10" height="10"/><rect x="195" y="35" width="10" height="10"/><rect x="25" y="135" width="10" height="10"/><rect x="195" y="135" width="10" height="10"/></g>' +
    '<circle cx="85" cy="90" r="28" fill="#fff" stroke="#182527" stroke-width="2.5"/><circle cx="127" cy="90" r="28" fill="#20a3cd" fill-opacity=".92"/>' +
    '<path d="M127 78v24M115 90h24" stroke="#fff" stroke-width="6" stroke-linecap="round"/>' +
    // pinzas
    '<g transform="translate(66 236) rotate(-18)" fill="none" stroke-linecap="round"><path class="tintas" d="M4 6L-12 128" stroke-width="13"/><path class="tintas" d="M12 6L28 128" stroke-width="13"/>' +
    '<path d="M4 6L-12 128" stroke="#d9d9d9" stroke-width="7"/><path d="M12 6L28 128" stroke="#d9d9d9" stroke-width="7"/><rect class="tinta" x="-3" y="-4" width="24" height="30" rx="9" stroke="none"/></g>' +
    // bisturí
    '<g transform="translate(400 30) rotate(35)"><rect class="tinta" x="-8" y="0" width="16" height="96" rx="7"/>' +
    '<path class="tintas" d="M-8 96h16v26q0 16-16 30z" fill="#d9d9d9" stroke-width="3" stroke-linejoin="round"/></g>' +
    '<path d="M455 55C500 15 545 60 535 125" fill="none" stroke="#20a3cd" stroke-width="3.5" stroke-linecap="round"/>' +
    '<path d="M455 55l30-27M535 125l-20 22" stroke="#20a3cd" stroke-width="1.6"/>' +
    '<g class="tinta"><rect x="450" y="50" width="10" height="10"/><rect x="530" y="120" width="10" height="10"/><rect x="480" y="23" width="8" height="8"/></g>' +
    '<circle cx="511" cy="158" r="44" fill="#182527"/><circle cx="505" cy="152" r="44" fill="#fff" stroke="#182527" stroke-width="3"/>' +
    '<rect x="483" y="130" width="44" height="44" rx="11" fill="#20a3cd"/><path d="M505 140v24M493 152h24" stroke="#fff" stroke-width="7" stroke-linecap="round"/>' +
    "</svg>";

  /* ---------- piezas comunes ---------- */
  function cab(h1, sub, extra, antes) {
    return '<section class="banda sky cab"><div class="wrap">' + (antes || "") + '<div class="tit"><h1>' + h1 + "</h1>" + (sub ? '<p class="sub">' + sub + "</p>" : "") + "</div>" + (extra || "") + "</div></section>";
  }
  const vacioPag = (txt) => '<p class="vacio-simple">' + txt + "</p>";

  /* ---------- INICIO ---------- */
  function viewHome() {
    const tarjProfes = profesores().map((p) => {
      const info = PROFES[p.nombre] || {};
      const av = info.foto
        ? '<span class="avatar"><img src="' + esc(ruta(info.foto)) + '" alt="' + esc(p.nombre) + '" loading="lazy" data-fb-avatar="' + esc(iniciales(p.nombre)) + '"></span>'
        : '<span class="avatar ini" aria-hidden="true">' + esc(iniciales(p.nombre)) + "</span>";
      const partes = [];
      if (p.clases.length) partes.push(pl(p.clases.length, "clase", "clases"));
      if (p.talleres.length) partes.push(pl(p.talleres.length, "taller", "talleres"));
      const lista = p.clases.map((c) => '<li><a href="#/clase/' + c.id + '">' + esc(c.tema) + "</a></li>").join("") +
        p.talleres.map((t) => '<li><a href="#/talleres">Taller: ' + esc(t.tema) + "</a></li>").join("");
      return '<li class="prof">' + av + '<span class="prof-n">' + esc(p.nombre) + "</span>" +
        '<span class="prof-d">' + (info.nota ? esc(info.nota) + "<br>" : "") + partes.join(" y ") + "</span>" +
        "<details><summary>Ver sus temas</summary><ul>" + lista + "</ul></details></li>";
    }).join("");

    const atajos = [
      ["#/clases", "Clases", pl(total, "clase", "clases") + " en " + pl(semanasTotal, "semana", "semanas")],
      ["#/talleres", "Talleres", pl(TALLERES.length, "taller", "talleres")],
      ["#/rotaciones", "Rotaciones", pl(ROTACION.semanas.length, "semana", "semanas") + " en el " + ROTACION.hospital],
      ["#/multimedia", "Multimedia", "Fotos y videos"],
      ["#/trabajos", "Trabajos", TRABAJOS.length ? pl(TRABAJOS.length, "trabajo", "trabajos") : "Mis trabajos de la materia"],
      ["#/extras", "Extras", "Guías y material aparte"],
    ].map((a) => '<li><a class="atajo" href="' + a[0] + '"><b>' + esc(a[1]) + "</b><span>" + esc(a[2]) + "</span></a></li>").join("");

    return (
      '<section class="banda sky hero"><div class="wrap"><div class="hero-grid"><div class="hero-t"><p class="marca">' + esc(PERFIL.nombre) + "</p><div>" +
      "<h1>Entre pinzas y bisturís.</h1>" +
      '<div class="pills"><span class="pill azul">' + esc(PERFIL.anio) + '</span><span class="pill oscura">' + esc(PERFIL.semestre) + "</span></div></div></div>" +
      '<div class="hero-art">' + ARTE + "</div></div>" +
      '<div class="sutura" id="sutura"></div></div></section>' +

      '<section class="banda azul"><div class="wrap sobre-mi"><div class="retrato">' + imgHtml(PERFIL.foto, "Foto de " + PERFIL.nombre, "Aquí va tu foto") + "</div>" +
      '<div><div class="tit tit-blanco"><h2>Sobre mí</h2><p class="sub">' + esc(PERFIL.nombre) + "</p></div>" +
      '<div class="texto-blanco">' + fmt(PERFIL.bio) + "</div>" +
      '<div class="pills"><span class="pill oscura">' + esc(PERFIL.universidad) + '</span><span class="pill oscura">' + esc(PERFIL.materia) + '</span><span class="pill oscura">' + esc(PERFIL.hospital) + "</span></div></div></div></section>" +

      '<section class="banda oscura"><div class="wrap"><div class="tit"><h2>Mis profesores</h2><p class="sub">Quienes dieron las clases de Cirugía este semestre.</p></div>' +
      '<ul class="profes">' + tarjProfes + "</ul></div></section>" +

      '<section class="banda sky"><div class="wrap"><div class="tit"><h2>Explora el diario</h2><p class="sub">Todo lo que hay aquí, por secciones.</p></div><ul class="atajos">' + atajos + "</ul></div></section>"
    );
  }

  function pintarSutura() {
    const el = $("#sutura");
    if (!el) return;
    let s = '<svg viewBox="0 0 1200 56" preserveAspectRatio="xMinYMid slice" aria-hidden="true" focusable="false"><path class="inc" d="M16 30H1184"/>';
    for (let i = 0; i < 40; i++) {
      const x = 42 + i * 28;
      s += '<g class="pt" style="--i:' + i + '"><path pathLength="1" d="M' + x + " 8L" + (x + 7) + ' 52"/><circle cx="' + x + '" cy="8" r="3.2"/></g>';
    }
    el.innerHTML = s + "</svg>";
  }

  /* ---------- CLASES ---------- */
  function rowHtml(c) {
    const ok = listo(c.id);
    const rep = store.get("repasadas", []).indexOf(c.id) > -1;
    return (
      '<li><a class="row" href="#/clase/' + c.id + '"><span class="n">' + c.id + "</span>" +
      '<span class="t"><b>' + esc(c.tema) + "</b><small>" + esc(c.profe) + "</small></span>" +
      '<span class="est"><span class="st ' + (ok ? "ok" : "no") + '" data-est="' + c.id + '">' + (ok ? "Resumen listo" : "En preparación") + "</span>" + (rep ? '<span class="rep">Repasada</span>' : "") + "</span></a></li>"
    );
  }

  function viewClases() {
    let semanas = "";
    for (let s = 1; s <= semanasTotal; s++) {
      const lista = CLASES.filter((c) => c.semana === s);
      if (!lista.length) continue;
      semanas += '<section class="sem"><h2>Semana ' + s + "<small>" + pl(lista.length, "tema", "temas") + "</small></h2><ol>" + lista.map(rowHtml).join("") + "</ol></section>";
    }
    return (
      cab("Clases", "Las clases y las clases especiales del semestre, semana por semana. Toca un tema para ver mi resumen.",
        '<div class="pills"><span class="pill azul" id="cuenta">' + listosCount() + " de " + total + " resúmenes listos</span></div>") +
      '<div class="wrap pagina">' + semanas + "</div>"
    );
  }

  function viewClase(id) {
    const c = byId(id);
    if (!c) return viewNoEncontrado();
    const R = RESUMENES[id] || {};
    const texto = String(R.resumen || "").trim();
    const prev = byId(id - 1), next = byId(id + 1);
    const rep = store.get("repasadas", []).indexOf(id) > -1;
    const checks = (store.get("claves", {})[id]) || [];

    let cuerpo = visorSlot({
      archivo: R.archivo, enlace: R.enlace, auto: "clase-" + pad2(id) + ".pdf", titulo: "Resumen: " + c.tema,
      vacio: texto ? "" : "Este resumen todavía está en preparación. Estoy pasando en limpio mis apuntes de esta clase.",
    });
    if (texto) cuerpo += '<div class="cuerpo">' + fmt(texto) + "</div>";
    if (R.perla) cuerpo += '<div class="perla"><h4>Perla clínica</h4><p>' + inline(R.perla) + "</p></div>";
    if (R.preguntas && R.preguntas.length) {
      cuerpo += '<section class="flash"><h2>Ponte a prueba</h2><p>Piensa la respuesta primero y luego toca la tarjeta.</p><div class="fcs">' +
        R.preguntas.map((q) => '<button type="button" class="fc" aria-expanded="false"><span class="q">' + esc(q.p) + '</span><span class="r">' + inline(q.r) + '</span><span class="hint">Toca para ver la respuesta</span></button>').join("") +
        "</div></section>";
    }
    if (R.fotos && R.fotos.length) cuerpo += '<section class="flash"><h2>Fotos</h2>' + galeria(R.fotos, 0, c.tema) + "</section>";

    let lado = '<div class="ficha"><h2>Datos de la clase</h2><dl><dt>Profesor</dt><dd>' + esc(c.profe) + "</dd><dt>Semana</dt><dd>" + c.semana + "</dd><dt>Clase</dt><dd>" + c.id + " de " + total + "</dd>" +
      (texto ? "<dt>Lectura</dt><dd>" + minutos(texto) + " min</dd>" : "") + "</dl></div>";
    if (R.claves && R.claves.length) {
      lado += '<div class="ficha"><h2>Puntos clave</h2><ul class="claves">' +
        R.claves.map((k, i) => '<li><label><input type="checkbox" data-i="' + i + '"' + (checks.indexOf(i) > -1 ? " checked" : "") + "><span>" + inline(k) + "</span></label></li>").join("") + "</ul></div>";
    }
    lado += '<button type="button" class="btn ghost repasar" aria-pressed="' + rep + '">' + (rep ? "Repasada" : "Marcar como repasada") + "</button>";

    const pills = '<div class="pills"><span class="pill azul">Semana ' + c.semana + '</span><span class="pill oscura">Clase ' + c.id + " de " + total + "</span>" + (c.tipo === "especial" ? '<span class="pill">Clase especial</span>' : "") + "</div>";
    return (
      cab(esc(c.tema), esc(c.profe), pills, '<a class="back" href="#/clases">Volver a las clases</a>') +
      '<article class="wrap pagina"><div class="cols"><div>' + cuerpo + '</div><aside class="lado" aria-label="Datos y repaso">' + lado + "</aside></div>" +
      '<nav class="pn" aria-label="Clase anterior y siguiente">' +
      (prev ? '<a href="#/clase/' + prev.id + '"><small>Anterior</small><b>' + esc(prev.tema) + "</b></a>" : "<span></span>") +
      (next ? '<a class="sig" href="#/clase/' + next.id + '"><small>Siguiente</small><b>' + esc(next.tema) + "</b></a>" : "") +
      "</nav></article>"
    );
  }

  function bindClase(id) {
    $$(".fc").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") === "true" ? "false" : "true")));
    $$(".claves input").forEach((cb) => cb.addEventListener("change", () => {
      const todo = store.get("claves", {});
      todo[id] = $$(".claves input").filter((x) => x.checked).map((x) => Number(x.getAttribute("data-i")));
      store.set("claves", todo);
    }));
    const rp = $(".repasar");
    if (rp) rp.addEventListener("click", () => {
      let lista = store.get("repasadas", []);
      const ya = lista.indexOf(id) > -1;
      lista = ya ? lista.filter((x) => x !== id) : lista.concat(id);
      store.set("repasadas", lista);
      rp.setAttribute("aria-pressed", String(!ya));
      rp.textContent = ya ? "Marcar como repasada" : "Repasada";
    });
  }

  /* ---------- TALLERES ---------- */
  function viewTalleres() {
    const cuerpo = TALLERES.length ? TALLERES.map((t, i) =>
      '<section class="taller"><div class="tit"><h2>' + esc(t.tema) + '</h2><p class="sub">' + esc(t.profe) + "</p></div>" +
      '<div class="pills">' + (t.semana ? '<span class="pill azul">Semana ' + t.semana + "</span>" : "") + '<span class="pill oscura">Taller ' + (i + 1) + "</span></div>" +
      '<div class="dos-taller"><div>' + (t.descripcion ? '<div class="cuerpo">' + fmt(t.descripcion) + "</div>" : "") +
      visorSlot({ archivo: t.archivo, enlace: t.enlace, auto: "taller-" + (i + 1) + ".pdf", titulo: "Taller: " + t.tema, vacio: "El material de este taller todavía está en preparación." }) +
      "</div><div>" + galeria(t.fotos, 2, t.tema) + "</div></div></section>"
    ).join("") : vacioPag("Todavía no hay talleres publicados.");
    return cab("Talleres", "Lo que practicamos con las manos.") + '<div class="wrap pagina">' + cuerpo + "</div>";
  }

  /* ---------- ROTACIONES ---------- */
  function viewRotaciones() {
    const sems = ROTACION.semanas;
    if (rotTab > sems.length) rotTab = 0;
    const tabs = ['<button type="button" role="tab" data-s="0" aria-selected="' + (rotTab === 0) + '">Toda la rotación</button>']
      .concat(sems.map((s, i) => '<button type="button" role="tab" data-s="' + (i + 1) + '" aria-selected="' + (i + 1 === rotTab) + '">Semana ' + (i + 1) + "</button>")).join("");

    let cuerpo;
    if (rotTab === 0) {
      const b = ROTACION.bitacora || {};
      cuerpo = '<div class="tit"><h2>Bitácora completa</h2><p class="sub">' + esc(ROTACION.hospital) + "</p></div>" +
        '<div class="bloque">' + visorSlot({ archivo: b.archivo, enlace: b.enlace, auto: "bitacora-completa.pdf", titulo: "Bitácora de rotación", vacio: "La bitácora completa todavía está en preparación." }) + "</div>" +
        '<div class="bloque"><h3 class="mini">Fotos de la rotación</h3>' + galeria(ROTACION.fotos, 3, "Rotación") + "</div>";
    } else {
      const w = sems[rotTab - 1] || {};
      cuerpo = '<div class="tit"><h2>Semana ' + rotTab + '</h2><p class="sub">' + esc(w.servicio || "Servicio por definir") + "</p></div>" +
        (w.nota ? '<div class="cuerpo bloque">' + fmt(w.nota) + "</div>" : "") +
        '<div class="bloque">' + visorSlot({ archivo: w.archivo, enlace: w.enlace, auto: "bitacora-semana-" + rotTab + ".pdf", titulo: "Bitácora de la semana " + rotTab, vacio: "La bitácora de esta semana todavía está en preparación." }) + "</div>" +
        '<div class="bloque"><h3 class="mini">Fotos de la semana</h3>' + galeria(w.fotos, 3, "Semana " + rotTab) + "</div>";
    }
    return (
      cab("Rotaciones", "Mi paso por el " + esc(ROTACION.hospital) + ", semana por semana.", '<div class="tabs" role="tablist" aria-label="Semanas de rotación">' + tabs + "</div>") +
      '<div class="wrap pagina">' + cuerpo + '<p class="aviso"><b>Ojo con la privacidad.</b> Los casos están anonimizados: sin nombres, iniciales, camas ni datos que identifiquen a un paciente.</p></div>'
    );
  }

  function bindRotaciones() {
    $$(".tabs button").forEach((b) => b.addEventListener("click", () => { rotTab = Number(b.getAttribute("data-s")); render(false); }));
  }

  /* ---------- MULTIMEDIA ---------- */
  function viewMultimedia() {
    const chip = (v, t) => '<button type="button" class="chip" data-f="' + v + '" aria-pressed="' + (mmFiltro === v) + '">' + t + "</button>";
    const items = MULTIMEDIA.filter((m) => mmFiltro === "todo" || m.tipo === mmFiltro);
    let grid;
    if (!MULTIMEDIA.length) {
      grid = '<div class="mm-grid">' + [1, 2, 3, 4, 5, 6].map(() => '<div class="foto-cel">' + fotoVacia("Aquí va tu foto o video") + "</div>").join("") + "</div>";
    } else if (!items.length) {
      grid = vacioPag("No hay nada de este tipo por ahora.");
    } else {
      grid = '<div class="mm-grid">' + items.map((m) => {
        const cap = (m.titulo || m.descripcion) ? "<figcaption>" + (m.titulo ? "<b>" + esc(m.titulo) + "</b>" : "") + (m.descripcion ? "<span>" + esc(m.descripcion) + "</span>" : "") + "</figcaption>" : "";
        if (m.tipo === "video") return '<figure class="mm">' + videoHtml(m) + cap + "</figure>";
        return '<figure class="mm"><button type="button" class="foto" data-full="' + esc(ruta(m.archivo)) + '" data-cap="' + esc(m.titulo || "") + '"><img src="' + esc(ruta(m.archivo)) + '" alt="' + esc(m.titulo || "Foto") + '" loading="lazy" data-fb="Foto no encontrada"></button>' + cap + "</figure>";
      }).join("") + "</div>";
    }
    return (
      cab("Multimedia", "Fotos y videos de las clases, los talleres y la rotación.",
        MULTIMEDIA.length ? '<div class="chips" role="group" aria-label="Filtrar">' + chip("todo", "Todo") + chip("foto", "Fotos") + chip("video", "Videos") + "</div>" : "") +
      '<div class="wrap pagina">' + grid + "</div>"
    );
  }

  function bindMultimedia() {
    $$(".chip").forEach((b) => b.addEventListener("click", () => { mmFiltro = b.getAttribute("data-f"); render(false); }));
  }

  /* ---------- TRABAJOS ---------- */
  function viewTrabajos() {
    let cuerpo;
    if (!TRABAJOS.length) {
      cuerpo = '<ul class="trabajos">' + [1, 2, 3].map(() => '<li class="trabajo vacio-t"><span>Aquí va tu próximo trabajo</span></li>').join("") + "</ul>";
    } else {
      cuerpo = '<ul class="trabajos">' + TRABAJOS.map((t) =>
        '<li class="trabajo"><details><summary><span class="tt">' + esc(t.titulo) + "</span>" + (t.fecha ? '<span class="pill peq">' + esc(t.fecha) + "</span>" : "") + "</summary>" +
        '<div class="tc">' + (t.descripcion ? '<div class="cuerpo">' + fmt(t.descripcion) + "</div>" : "") +
        visorSlot({ archivo: t.archivo, enlace: t.enlace, titulo: t.titulo, vacio: (t.archivo || t.enlace) ? "" : "El documento de este trabajo todavía no está subido." }) +
        galeria(t.fotos, 0, t.titulo) + "</div></details></li>"
      ).join("") + "</ul>";
    }
    return cab("Trabajos", "Los trabajos y casos que he entregado en la materia.") + '<div class="wrap pagina">' + cuerpo + "</div>";
  }

  /* ---------- EXTRAS ---------- */
  function viewExtras() {
    let cuerpo;
    if (!EXTRAS.length) {
      cuerpo = '<ul class="extras">' + [1, 2, 3].map(() => '<li class="extra"><div class="extra-f">' + fotoVacia("Aquí va tu foto") + '</div><div class="extra-t"><b>Aquí va un extra</b><span>Guías, algoritmos, enlaces útiles.</span></div></li>').join("") + "</ul>";
    } else {
      cuerpo = '<ul class="extras">' + EXTRAS.map((x) => {
        const url = x.archivo ? ruta(x.archivo) : x.enlace ? esc(x.enlace) : "";
        return '<li class="extra"><div class="extra-f">' + imgHtml(x.foto, x.titulo, "Aquí va tu foto") + '</div><div class="extra-t"><b>' + esc(x.titulo) + "</b>" +
          (x.descripcion ? "<span>" + esc(x.descripcion) + "</span>" : "") + (url ? '<a class="btn peq" href="' + url + '" target="_blank" rel="noopener">Abrir</a>' : "") + "</div></li>";
      }).join("") + "</ul>";
    }
    return cab("Extras", "Material aparte que me ha servido.") + '<div class="wrap pagina">' + cuerpo + "</div>";
  }

  function viewNoEncontrado() {
    return cab("Esa página no existe", "Puede que el enlace esté mal escrito.") +
      '<div class="wrap pagina"><div class="acciones"><a class="btn" href="#/">Ir al inicio</a><a class="btn ghost" href="#/clases">Ver las clases</a></div></div>';
  }

  /* ---------- rutas ---------- */
  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, "");
    return { parts: raw.split("?")[0].split("/").filter(Boolean) };
  }

  function marcarNav() {
    let key = parseRoute().parts[0] || "";
    if (key === "clase") key = "clases";
    if (key === "rotacion") key = "rotaciones";
    $$("a", nav).forEach((a) => {
      if (a.getAttribute("data-r") === key) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function render(scroll) {
    const r = parseRoute();
    const ruta0 = r.parts[0] || "";
    let html = "", despues = null, titulo = PERFIL.blog + " - " + PERFIL.nombre;
    const t = (x) => x + " - " + PERFIL.blog;

    if (ruta0 === "") { html = viewHome(); despues = pintarSutura; }
    else if (ruta0 === "clases") { html = viewClases(); titulo = t("Clases"); }
    else if (ruta0 === "clase") {
      const id = Number(r.parts[1]); const c = byId(id);
      html = viewClase(id); despues = () => bindClase(id);
      if (c) titulo = t(c.tema);
    }
    else if (ruta0 === "talleres") { html = viewTalleres(); titulo = t("Talleres"); }
    else if (ruta0 === "rotaciones" || ruta0 === "rotacion") { html = viewRotaciones(); despues = bindRotaciones; titulo = t("Rotaciones"); }
    else if (ruta0 === "multimedia") { html = viewMultimedia(); despues = bindMultimedia; titulo = t("Multimedia"); }
    else if (ruta0 === "trabajos") { html = viewTrabajos(); titulo = t("Trabajos"); }
    else if (ruta0 === "extras") { html = viewExtras(); titulo = t("Extras"); }
    else { html = viewNoEncontrado(); }

    app.innerHTML = html;
    document.title = titulo;
    marcarNav();
    if (despues) despues();
    $$(".visor").forEach(montarVisor);
    if (scroll !== false) { window.scrollTo(0, 0); app.focus({ preventScroll: true }); }
  }

  /* ---------- fotos que no cargan: se muestra el espacio vacío ---------- */
  app.addEventListener("error", (e) => {
    const img = e.target;
    if (!img || img.tagName !== "IMG") return;
    if (img.hasAttribute("data-fb-avatar")) {
      const s = document.createElement("span");
      s.className = "avatar ini"; s.textContent = img.getAttribute("data-fb-avatar");
      if (img.parentNode) img.parentNode.replaceWith(s);
      return;
    }
    if (!img.hasAttribute("data-fb")) return;
    const holder = document.createElement("div");
    holder.innerHTML = fotoVacia(img.getAttribute("data-fb"));
    const p = img.parentNode;
    if (p && p.classList && p.classList.contains("foto")) p.removeAttribute("data-full");
    img.replaceWith(holder.firstChild);
  }, true);

  /* ---------- ampliar fotos ---------- */
  const lb = document.createElement("div");
  lb.className = "lb"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Foto ampliada");
  lb.innerHTML = '<button type="button" class="lb-x" aria-label="Cerrar">×</button><img alt=""><p class="lb-cap"></p>';
  document.body.appendChild(lb);
  const cerrarLb = () => { lb.hidden = true; document.body.classList.remove("sin-scroll"); };
  lb.addEventListener("click", (e) => { if (e.target !== $("img", lb)) cerrarLb(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) cerrarLb(); });
  app.addEventListener("click", (e) => {
    const b = e.target.closest ? e.target.closest(".foto[data-full]") : null;
    if (!b) return;
    $("img", lb).src = b.getAttribute("data-full");
    $("img", lb).alt = b.getAttribute("data-cap") || "Foto ampliada";
    $(".lb-cap", lb).textContent = b.getAttribute("data-cap") || "";
    lb.hidden = false; document.body.classList.add("sin-scroll");
    $(".lb-x", lb).focus();
  });

  /* ---------- modo claro / oscuro ---------- */
  $("#tema").addEventListener("click", () => {
    const actual = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", actual);
    try { localStorage.setItem("tema", actual); } catch (e) { /* sin almacenamiento */ }
  });

  const firma = $("#pie-firma");
  if (firma) firma.textContent = PERFIL.nombre + ", " + PERFIL.universidad + ", " + PERFIL.semestre + ".";

  window.addEventListener("hashchange", () => render(true));
  render(false);
  detectar();
})();

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
  const plain = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Formato sencillo para tus textos: párrafos, "## subtítulo", "- viñeta", **negrita**, *cursiva*
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

  /* ---------- datos derivados ---------- */
  const total = CLASES.length;
  const semanasTotal = Math.max.apply(null, CLASES.map((c) => c.semana));
  const byId = (id) => CLASES.find((c) => c.id === id);
  const has = (id) => !!(RESUMENES[id] && String(RESUMENES[id].resumen || "").trim());
  const minutos = (id) => Math.max(1, Math.round(String(RESUMENES[id].resumen).trim().split(/\s+/).length / 200));
  const listosCount = () => CLASES.filter((c) => has(c.id)).length;
  const areaDe = (c) => AREAS[c.area] || { nombre: "General", color: "#476565" };
  const tipoTxt = (t) => (t === "taller" ? "Taller" : t === "especial" ? "Clase especial" : "Clase");
  const pl = (n, s, p) => n + " " + (n === 1 ? s : p);

  const CAMPOS_DIA = ["titulo", "vi", "hice", "aprendi", "casos", "estudiar"];
  const diaKey = (s, d) => s + "-" + d;
  const diaTiene = (s, d) => {
    const e = ROTACION.dias[diaKey(s, d)];
    return !!e && CAMPOS_DIA.some((k) => String(e[k] || "").trim());
  };
  const diasEscritos = () => {
    let n = 0;
    for (let s = 1; s <= ROTACION.semanas.length; s++) for (let d = 1; d <= ROTACION.diasPorSemana; d++) if (diaTiene(s, d)) n++;
    return n;
  };

  /* ---------- estado ---------- */
  const F = { q: "", area: "todas", semana: "todas", tipo: "todas", solo: false };
  let rotSem = 1;

  /* ---------- vistas ---------- */
  function viewHome() {
    const listos = listosCount();
    const extras = CLASES.filter((c) => c.tipo !== "clase");
    const extrasOk = extras.filter((c) => has(c.id)).length;
    const diasTot = ROTACION.semanas.length * ROTACION.diasPorSemana;
    const diasOk = diasEscritos();

    const items = [
      { ok: true, t: "Programa cargado", d: pl(total, "clase", "clases") + " en " + pl(semanasTotal, "semana", "semanas"), p: 1 },
      { ok: listos === total, t: "Resúmenes escritos", d: listos + " de " + total, p: listos / total },
      { ok: extrasOk === extras.length, t: "Talleres y clases especiales", d: extrasOk + " de " + extras.length, p: extrasOk / extras.length },
      { ok: diasOk === diasTot, t: "Rotación en " + ROTACION.hospital, d: diasOk + " de " + diasTot + " días escritos", p: diasOk / diasTot },
    ];

    const pausa = items.map((i) =>
      '<li><span class="caja ' + (i.ok ? "on" : "") + '" aria-hidden="true"></span><div><b>' + esc(i.t) + "</b><small>" + esc(i.d) +
      (i.ok ? ", completo" : "") + '</small><span class="barra"><u style="width:' + Math.round(i.p * 100) + '%"></u></span></div></li>'
    ).join("");

    const areas = Object.keys(AREAS).map((k) => {
      const lista = CLASES.filter((c) => c.area === k);
      if (!lista.length) return "";
      const ok = lista.filter((c) => has(c.id)).length;
      return '<li><a href="#/clases?area=' + k + '" style="--c:' + AREAS[k].color + '"><span class="nom"><i class="sw"></i>' + esc(AREAS[k].nombre) +
        '</span><span class="barra" aria-hidden="true"><u style="width:' + Math.round((ok / lista.length) * 100) + '%;background:' + AREAS[k].color + '"></u></span>' +
        '<span class="cnt">' + ok + " de " + lista.length + " listos</span></a></li>";
    }).join("");

    const recientes = CLASES.filter((c) => has(c.id)).sort((a, b) => b.id - a.id).slice(0, 5);
    const recHtml = recientes.length
      ? '<ol class="recientes">' + recientes.map(rowHtml).join("") + "</ol>"
      : '<p class="vacio-simple">Todavía no hay resúmenes publicados. Los primeros van a aparecer aquí, en cuanto los pase en limpio.</p>';

    return (
      '<div class="wrap">' +
      '<section class="hero"><div class="hero-grid"><div>' +
      "<h1>Cirugía, con puntos y aparte.</h1>" +
      '<p class="lead">Mis resúmenes de clase, talleres y días de rotación de Cirugía, en 5.º año de Medicina en la Universidad de Panamá.</p>' +
      '<div class="acciones"><a class="btn" href="#/clases">Ver las clases</a><a class="btn ghost" href="#/rotacion">Diario de rotación</a></div>' +
      '</div><section class="pausa" aria-labelledby="pq"><h2 id="pq">Pausa quirúrgica</h2><ul>' + pausa + "</ul></section></div>" +
      '<div class="sutura" id="sutura"></div></section>' +
      '<section class="seccion"><h2>Elige por área</h2><p class="sub">Las mismas ' + total + " clases, agrupadas por tema para estudiar por bloques.</p>" +
      '<ul class="areas">' + areas + "</ul></section>" +
      '<section class="seccion"><h2>Resúmenes más recientes</h2>' + recHtml + "</section>" +
      '<section class="seccion"><div class="dos"><div><h2>Rotación en el ' + esc(ROTACION.hospital) + "</h2>" +
      '<div class="rot-call"><p>Cuatro semanas de rotación, contadas día por día: qué vi, qué hice y qué me quedó por estudiar.</p><a class="btn ghost" href="#/rotacion">Leer el diario</a></div></div>' +
      '<div><h2>Especiales y talleres</h2><div class="rot-call"><p>Síndrome aórtico agudo, politraumatizado, accesos vasculares, el taller del reto torácico, psicología y ética.</p><a class="btn ghost" href="#/clases?tipo=extra">Verlos</a></div></div></div></section>' +
      "</div>"
    );
  }

  function rowHtml(c) {
    const a = areaDe(c);
    const ok = has(c.id);
    const rep = store.get("repasadas", []).indexOf(c.id) > -1;
    const tag = c.tipo === "clase" ? "" : '<span class="tag ' + c.tipo + '">' + tipoTxt(c.tipo) + "</span>";
    return (
      "<li><a class=\"row\" href=\"#/clase/" + c.id + '" style="--c:' + a.color + '"><span class="n">' + c.id + '</span>' +
      '<span class="t"><b>' + esc(c.tema) + "</b>" + tag + "<small>" + esc(c.profe) + "</small></span>" +
      '<span class="a">' + esc(a.nombre) + "</span>" +
      '<span class="st ' + (ok ? "ok" : "no") + '">' + (ok ? "Resumen listo" : "En preparación") + (rep ? '<span class="rep">Repasada</span>' : "") + "</span></a></li>"
    );
  }

  function viewClases() {
    const semanas = [];
    for (let s = 1; s <= semanasTotal; s++) semanas.push(s);
    const optA = '<option value="todas">Todas las áreas</option>' + Object.keys(AREAS).map((k) => '<option value="' + k + '">' + esc(AREAS[k].nombre) + "</option>").join("");
    const optS = '<option value="todas">Todas las semanas</option>' + semanas.map((s) => '<option value="' + s + '">Semana ' + s + "</option>").join("");
    const titulo = F.tipo === "extra" ? "Especiales y talleres" : "Clases del semestre";
    const lead = F.tipo === "extra"
      ? "Las clases especiales y el taller. Toca un tema para leer mi resumen."
      : "El programa completo de Cirugía. Toca un tema para leer mi resumen.";
    return (
      '<div class="wrap page"><h1>' + titulo + '</h1><p class="lead">' + lead + "</p>" +
      '<div class="tools" role="search">' +
      '<label class="field grow"><span>Buscar</span><input id="fq" type="search" placeholder="Tema o profesor" autocomplete="off"></label>' +
      '<label class="field"><span>Área</span><select id="fArea">' + optA + "</select></label>" +
      '<label class="field"><span>Semana</span><select id="fSem">' + optS + "</select></label>" +
      '<label class="field"><span>Tipo</span><select id="fTipo"><option value="todas">Todos</option><option value="clase">Clases</option><option value="extra">Especiales y talleres</option></select></label>' +
      '<label class="tog"><input type="checkbox" id="fSolo"><span>Solo con resumen</span></label></div>' +
      '<p class="count" id="count" aria-live="polite"></p><div id="lista"></div></div>'
    );
  }

  function pintarLista() {
    const q = plain(F.q).trim();
    const items = CLASES.filter((c) => {
      if (F.area !== "todas" && c.area !== F.area) return false;
      if (F.semana !== "todas" && String(c.semana) !== String(F.semana)) return false;
      if (F.tipo === "clase" && c.tipo !== "clase") return false;
      if (F.tipo === "extra" && c.tipo === "clase") return false;
      if (F.solo && !has(c.id)) return false;
      if (q && plain(c.tema + " " + c.profe + " " + areaDe(c).nombre).indexOf(q) === -1) return false;
      return true;
    });
    $("#count").textContent = items.length === total ? "Mostrando las " + total + " clases." : "Mostrando " + items.length + " de " + total + ".";
    if (!items.length) {
      $("#lista").innerHTML = '<div class="sinres"><p>No encontré nada con esos filtros. Prueba con otra palabra o quita alguno.</p></div>';
      return;
    }
    const grupos = {};
    items.forEach((c) => { (grupos[c.semana] = grupos[c.semana] || []).push(c); });
    $("#lista").innerHTML = Object.keys(grupos).map((s) =>
      '<section class="sem"><h2>Semana ' + s + "<small>" + pl(grupos[s].length, "tema", "temas") + "</small></h2><ol>" + grupos[s].map(rowHtml).join("") + "</ol></section>"
    ).join("");
  }

  function bindClases() {
    $("#fq").value = F.q;
    $("#fArea").value = F.area;
    $("#fSem").value = F.semana;
    $("#fTipo").value = F.tipo;
    $("#fSolo").checked = F.solo;
    $("#fq").addEventListener("input", (e) => { F.q = e.target.value; pintarLista(); });
    $("#fArea").addEventListener("change", (e) => { F.area = e.target.value; pintarLista(); });
    $("#fSem").addEventListener("change", (e) => { F.semana = e.target.value; pintarLista(); });
    $("#fTipo").addEventListener("change", (e) => { F.tipo = e.target.value; pintarLista(); marcarNav(); });
    $("#fSolo").addEventListener("change", (e) => { F.solo = e.target.checked; pintarLista(); });
    pintarLista();
  }

  function viewClase(id) {
    const c = byId(id);
    if (!c) return viewNoEncontrado();
    const a = areaDe(c);
    const r = RESUMENES[id] || {};
    const listo = has(id);
    const prev = byId(id - 1), next = byId(id + 1);
    const rep = store.get("repasadas", []).indexOf(id) > -1;
    const checks = (store.get("claves", {})[id]) || [];

    let cuerpo;
    if (listo) {
      cuerpo = '<div class="cuerpo">' + fmt(r.resumen) + "</div>";
      if (r.perla) cuerpo += '<div class="perla"><h4>Perla clínica</h4><p>' + inline(r.perla) + "</p></div>";
      if (r.preguntas && r.preguntas.length) {
        cuerpo += '<section class="flash"><h2>Ponte a prueba</h2><p>Piensa la respuesta primero y luego toca la tarjeta.</p><div class="fcs">' +
          r.preguntas.map((q) => '<button type="button" class="fc" aria-expanded="false"><span class="q">' + esc(q.p) + '</span><span class="r">' + inline(q.r) + '</span><span class="hint">Toca para ver la respuesta</span></button>').join("") +
          "</div></section>";
      }
    } else {
      cuerpo = '<div class="pendiente"><h2>Este resumen todavía está en preparación</h2><p>Estoy pasando en limpio mis apuntes de esta clase. Vuelve en unos días o revisa los temas que ya están listos.</p><p style="margin-top:1rem"><a class="btn ghost" href="#/clases?solo=1">Ver resúmenes listos</a></p></div>';
    }

    let lado = '<div class="ficha"><h2>Datos de la clase</h2><dl><dt>Profesor</dt><dd>' + esc(c.profe) + "</dd><dt>Área</dt><dd>" + esc(a.nombre) + "</dd><dt>Semana</dt><dd>" + c.semana + "</dd><dt>Tipo</dt><dd>" + tipoTxt(c.tipo) + "</dd>" +
      (listo ? "<dt>Lectura</dt><dd>" + minutos(id) + " min</dd>" : "") + "</dl></div>";
    if (listo && r.claves && r.claves.length) {
      lado += '<div class="ficha"><h2>Puntos clave</h2><ul class="claves">' +
        r.claves.map((k, i) => '<li><label><input type="checkbox" data-i="' + i + '"' + (checks.indexOf(i) > -1 ? " checked" : "") + "><span>" + inline(k) + "</span></label></li>").join("") + "</ul></div>";
    }
    if (listo) lado += '<button type="button" class="btn ghost repasar" aria-pressed="' + rep + '">' + (rep ? "Repasada" : "Marcar como repasada") + "</button>";

    return (
      '<article class="wrap reader" style="--c:' + a.color + '"><a class="back" href="#/clases?keep=1">Volver a la lista</a>' +
      '<header><p class="crumb">Semana ' + c.semana + ", clase " + c.id + " de " + total + "</p><h1>" + esc(c.tema) + '</h1><p class="by">' + esc(c.profe) + "</p></header>" +
      '<div class="cols"><div>' + cuerpo + '</div><aside class="lado" aria-label="Datos y repaso">' + lado + "</aside></div>" +
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
      const marcados = $$(".claves input").filter((x) => x.checked).map((x) => Number(x.getAttribute("data-i")));
      todo[id] = marcados;
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

  function seccionDia(titulo, texto) {
    if (!String(texto || "").trim()) return "";
    return "<div><h3>" + titulo + "</h3>" + fmt(texto) + "</div>";
  }

  function viewRotacion() {
    const sems = ROTACION.semanas;
    const w = sems[rotSem - 1] || {};
    const tabs = sems.map((s, i) => '<button type="button" role="tab" data-s="' + (i + 1) + '" aria-selected="' + (i + 1 === rotSem) + '">Semana ' + (i + 1) + "</button>").join("");
    let dias = "";
    for (let d = 1; d <= ROTACION.diasPorSemana; d++) {
      const e = ROTACION.dias[diaKey(rotSem, d)] || {};
      const tiene = diaTiene(rotSem, d);
      const contenido = tiene
        ? seccionDia("Lo que vi", e.vi) + seccionDia("Lo que hice", e.hice) + seccionDia("Lo que aprendí", e.aprendi) + seccionDia("Caso del día (anonimizado)", e.casos) + seccionDia("Para estudiar", e.estudiar)
        : "";
      const vacio = tiene && !contenido.trim();
      dias += '<li class="dia ' + (tiene ? "ok" : "") + '"><details><summary><span class="dn">Día ' + d + '</span><span class="dt ' + (e.titulo ? "" : "vacio") + '">' +
        (e.titulo ? esc(e.titulo) : "Todavía no escrito") + "</span>" + (e.animo ? '<span aria-hidden="true">' + esc(e.animo) + "</span>" : "") + "</summary>" +
        '<div class="dc">' + (tiene && !vacio ? contenido : '<p class="nada">Este día todavía está en blanco. Aquí van lo que vi, lo que hice y lo que aprendí.</p>') + "</div></details></li>";
    }
    return (
      '<div class="wrap page"><h1>Rotación en el ' + esc(ROTACION.hospital) + '</h1><p class="lead">Cuatro semanas, día por día.</p>' +
      '<div class="tabs" role="tablist" aria-label="Semanas de rotación">' + tabs + "</div>" +
      '<div class="semana-cab"><h2>Semana ' + rotSem + "</h2><p>" + esc(w.servicio || "Servicio por definir") + "</p>" + (w.nota ? '<p style="margin-top:.6rem">' + esc(w.nota) + "</p>" : "") + "</div>" +
      '<p class="aviso">Los casos están anonimizados: sin nombres, iniciales, camas ni datos que identifiquen a un paciente.</p>' +
      '<ol class="dias">' + dias + "</ol></div>"
    );
  }

  function bindRotacion() {
    $$(".tabs button").forEach((b) => b.addEventListener("click", () => { rotSem = Number(b.getAttribute("data-s")); render(false); }));
  }

  function viewSobre() {
    const p = PERFIL;
    return (
      '<div class="wrap page"><h1>Sobre mí</h1><div class="sobre"><div class="cuerpo">' + fmt(p.bio) + "</div>" +
      '<div class="ficha"><h2>' + esc(p.nombre) + "</h2><dl><dt>Estudio</dt><dd>" + esc(p.anio) + "</dd><dt>Universidad</dt><dd>" + esc(p.universidad) + "</dd><dt>Materia</dt><dd>" + esc(p.materia) + "</dd><dt>Semestre</dt><dd>" + esc(p.semestre) + "</dd><dt>Rotación</dt><dd>" + esc(p.hospital) + "</dd></dl></div></div></div>"
    );
  }

  function viewNoEncontrado() {
    return '<div class="wrap page"><h1>Esa página no existe</h1><p class="lead">Puede que el enlace esté mal escrito. Vuelve al inicio o a la lista de clases.</p><p style="margin-top:1.5rem"><a class="btn" href="#/">Ir al inicio</a></p></div>';
  }

  /* ---------- sutura del inicio ---------- */
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

  /* ---------- rutas ---------- */
  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, "");
    const partes = raw.split("?");
    return { parts: partes[0].split("/").filter(Boolean), params: new URLSearchParams(partes[1] || "") };
  }

  function marcarNav() {
    const r = parseRoute();
    let key = r.parts[0] || "";
    if (key === "clase") key = "clases";
    if (key === "clases" && F.tipo === "extra") key = "extra";
    $$("a", nav).forEach((a) => {
      if (a.getAttribute("data-r") === key) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function render(scroll) {
    const r = parseRoute();
    const ruta = r.parts[0] || "";
    let html = "", despues = null, titulo = PERFIL.blog + " - " + PERFIL.nombre;

    if (ruta === "") {
      html = viewHome(); despues = pintarSutura;
    } else if (ruta === "clases") {
      if (!r.params.has("keep")) {
        F.area = r.params.get("area") || "todas";
        F.tipo = r.params.get("tipo") || "todas";
        F.semana = r.params.get("semana") || "todas";
        F.solo = r.params.get("solo") === "1";
        F.q = "";
      }
      html = viewClases(); despues = bindClases;
      titulo = (F.tipo === "extra" ? "Especiales y talleres" : "Clases") + " - " + PERFIL.blog;
    } else if (ruta === "clase") {
      const id = Number(r.parts[1]);
      const c = byId(id);
      html = viewClase(id); despues = () => bindClase(id);
      if (c) titulo = c.tema + " - " + PERFIL.blog;
    } else if (ruta === "rotacion") {
      html = viewRotacion(); despues = bindRotacion; titulo = "Rotación - " + PERFIL.blog;
    } else if (ruta === "sobre-mi") {
      html = viewSobre(); titulo = "Sobre mí - " + PERFIL.blog;
    } else {
      html = viewNoEncontrado();
    }

    app.innerHTML = html;
    document.title = titulo;
    marcarNav();
    if (despues) despues();
    if (scroll !== false) { window.scrollTo(0, 0); app.focus({ preventScroll: true }); }
  }

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
})();

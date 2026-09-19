// Rellena la página de un enlace compartido (perfil o ruta) con lo que trae
// la dirección, lo enriquece con los datos públicos de Supabase y prepara el
// botón «Abrir en la app».
//
// Esta página solo la ve quien no tiene la app, o quien abre el enlace desde
// un navegador que no respeta los App Links (el de Instagram, por ejemplo).
// Con la app instalada y el enlace verificado, Android la abre directamente
// y esto no llega a cargarse.
//
// Lo que se enseña es SOLO lo público: el perfil que ya sale en el cuadro de
// honor, las rutas aprobadas y las reseñas publicadas. Nada de visitas,
// favoritos ni sellos: eso es el historial de por dónde se mueve alguien y la
// app la usan menores. Ver `fn_perfil_publico` en SUPABASE_SCHEMA.md.
//
// `textContent` y nunca `innerHTML` con datos de fuera: el nombre lo escribe
// cualquiera en la dirección, y así no se puede colar código en la página.
(function () {
  var PAQUETE = 'com.selu.sevitime';
  var PLAY = 'https://play.google.com/store/apps/details?id=' + PAQUETE;
  var SUPABASE_URL = 'https://kdqiwhvtovafugpcrumf.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_sBgKboeZMNaMLZWDekEW6A_1kG8JH8l';

  var params = new URLSearchParams(location.search);
  var cuerpo = document.body;
  var tipo = cuerpo.getAttribute('data-tipo');

  function poner(id, texto) {
    var el = document.getElementById(id);
    if (el) el.textContent = texto;
  }

  // Intent de Chrome para Android: abre la app por su esquema propio si está
  // instalada y, si no, manda a Play. El esquema `sevitime://` lo entienden
  // también las versiones que todavía no tienen App Links.
  function intent(ruta) {
    return 'intent://' + ruta + '#Intent;scheme=sevitime;package=' + PAQUETE +
      ';S.browser_fallback_url=' + encodeURIComponent(PLAY) + ';end';
  }

  var abrir = document.getElementById('abrir');
  var nota = document.getElementById('nota');
  function ocultarAbrir() {
    abrir.hidden = true;
    if (nota) nota.hidden = true;
  }

  var nombre = (params.get('n') || '').trim();
  var idRuta = (params.get('id') || '').trim();

  if (tipo === 'perfil' && nombre) {
    poner('titulo', nombre);
    document.title = nombre + ' en SeviTime';
    abrir.href = intent('perfil/' + encodeURIComponent(nombre));
  } else if (tipo === 'ruta' && /^\d+$/.test(idRuta)) {
    if (nombre) {
      poner('titulo', nombre);
      document.title = nombre + ' · SeviTime';
    }
    abrir.href = intent('ruta/' + idRuta);
  } else {
    ocultarAbrir();
    poner('titulo', 'Enlace incompleto');
    poner('explicacion', 'A este enlace le falta un trozo. Pídele a quien te lo mandó que lo vuelva a compartir.');
  }

  // Fuera de Android el intent no sirve de nada.
  if (!/android/i.test(navigator.userAgent)) ocultarAbrir();

  // ---------------------------------------------------------------
  // Datos reales desde Supabase (solo lectura, con la clave anónima).
  // Si no hay red o el enlace es viejo, la página se queda con lo que
  // ya decía: es un añadido, no un requisito para funcionar.
  // ---------------------------------------------------------------

  function iniciales(nombre) {
    var partes = (nombre || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
  }

  var COLOR_PRESET = {
    giralda: '#00897B', catedral: '#5E7A8A', azahar: '#7CB342', ceramica: '#1E88E5',
    rebujito: '#C0A020', barco: '#00838F', flamenco: '#AD1457', abanico: '#6D4C9F',
    farol: '#E65100', sol: '#F9A825', madruga: '#37474F', cafe: '#6D4C41'
  };
  var EMOJI_PRESET = {
    giralda: '🏛️', catedral: '⛪', azahar: '🌸', ceramica: '🔷',
    rebujito: '🍷', barco: '⛵', flamenco: '🎵', abanico: '🎐',
    farol: '💡', sol: '☀️', madruga: '🌙', cafe: '☕'
  };
  var EMOJI_RUTA = {
    monumento: '🏛️', rio: '⛵', parque: '🌳', iglesia: '⛪', tapas: '🍷',
    setas: '🍄', museo: '🖼️', cafe: '☕', mirador: '🌅', compras: '🛍️',
    familia: '👨‍👩‍👧', noche: '🌙'
  };

  function el(tag, clase) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    return e;
  }

  function avatar(guardado, nombre) {
    var c = el('div', 'avatar');
    if (guardado && guardado.indexOf('preset:') === 0) {
      var id = guardado.slice(7);
      c.style.background = COLOR_PRESET[id] || '#00897B';
      c.textContent = EMOJI_PRESET[id] || '📍';
      c.classList.add('preset');
    } else if (guardado) {
      var img = document.createElement('img');
      img.src = guardado;
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      c.appendChild(img);
      c.classList.add('foto');
    } else {
      c.textContent = iniciales(nombre);
      c.classList.add('iniciales');
    }
    return c;
  }

  function numero(n) {
    return (n || 0).toLocaleString('es-ES');
  }

  function mesDesde(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return 'desde ' + meses[d.getMonth()] + ' de ' + d.getFullYear();
  }

  var TIPOS_APORTACION = {
    resena: 'Reseñas',
    resena_foto: 'Fotos',
    resena_texto: 'Comentarios',
    util_recibido: '«Útil»',
    reporte: 'Avisos',
    foto_erronea: 'Fotos corregidas',
    sugerencia: 'Sitios nuevos',
    sello: 'Sellos',
    ruta: 'Rutas'
  };

  function enlaceRutaWeb(r) {
    return '/ruta/?id=' + encodeURIComponent(r.id) +
      '&n=' + encodeURIComponent(r.nombre);
  }

  var sb = null;
  try {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    sb = null;
  }

  var datos = document.getElementById('datos');
  if (!sb || !datos) return;

  function mostrarPerfil(p, rutas) {
    var cab = el('div', 'perfil-cabecera');
    cab.appendChild(avatar(p.avatar, p.nombre_publico));

    var id = el('div', 'perfil-identidad');
    var h = el('h1', 'perfil-nombre');
    h.textContent = p.nombre_publico;
    id.appendChild(h);
    var sub = el('div', 'perfil-titulo');
    sub.textContent = (p.titulo || '') + ' · nivel ' + p.nivel;
    id.appendChild(sub);
    cab.appendChild(id);
    datos.appendChild(cab);

    var stats = el('div', 'stats');
    stats.appendChild(stat(numero(p.xp), 'XP', true));
    stats.appendChild(stat('#' + p.posicion, 'en el ranking'));
    if (p.desde) stats.appendChild(stat(mesDesde(p.desde), ''));
    if (p.seguidores != null) stats.appendChild(stat(numero(p.seguidores), 'seguidores'));
    if (p.siguiendo != null) stats.appendChild(stat(numero(p.siguiendo), 'siguiendo'));
    datos.appendChild(stats);

    if (p.bio) {
      var bio = el('p', 'bio');
      bio.textContent = p.bio;
      datos.appendChild(bio);
    }

    var aport = p.aportaciones || {};
    var claves = Object.keys(aport).filter(function (k) { return TIPOS_APORTACION[k]; });
    if (claves.length) {
      var chips = el('div', 'chips');
      claves.forEach(function (k) {
        var chip = el('span', 'chip');
        chip.textContent = TIPOS_APORTACION[k] + ' · ' + numero(aport[k]);
        chips.appendChild(chip);
      });
      datos.appendChild(chips);
    }

    if (rutas && rutas.length) {
      var t = el('h2', 'seccion-titulo');
      t.textContent = 'Sus rutas';
      datos.appendChild(t);
      var lista = el('div', 'rutas');
      rutas.forEach(function (r) {
        var a = el('a', 'ruta');
        a.href = enlaceRutaWeb(r);
        var ico = el('span', 'ruta-icono');
        ico.textContent = EMOJI_RUTA[r.icono] || '📍';
        a.appendChild(ico);
        var cuerpo2 = el('div', 'ruta-cuerpo');
        var h2 = el('div', 'ruta-nombre');
        h2.textContent = r.nombre;
        cuerpo2.appendChild(h2);
        var meta = el('div', 'ruta-meta');
        meta.textContent = r.paradas + ' paradas · ' + r.minutos + ' min';
        cuerpo2.appendChild(meta);
        a.appendChild(cuerpo2);
        lista.appendChild(a);
      });
      datos.appendChild(lista);
    }
  }

  function stat(valor, etiqueta, dorado) {
    var s = el('div', 'stat');
    var v = el('div', 'stat-valor' + (dorado ? ' dorado' : ''));
    v.textContent = valor;
    s.appendChild(v);
    if (etiqueta) {
      var e = el('div', 'stat-etiqueta');
      e.textContent = etiqueta;
      s.appendChild(e);
    }
    return s;
  }

  function mostrarRuta(r) {
    var cab = el('div', 'ruta-cabecera');
    var ico = el('span', 'ruta-icono-grande');
    ico.textContent = EMOJI_RUTA[r.icono] || '📍';
    cab.appendChild(ico);
    var id = el('div', 'ruta-identidad');
    var h = el('h1', 'ruta-titulo');
    h.textContent = r.nombre;
    id.appendChild(h);
    var meta = el('div', 'ruta-sub');
    meta.textContent = r.minutos + ' min · ' + (r.paradas ? r.paradas.length : 0) + ' paradas';
    if (r.autor) meta.textContent += ' · por ' + r.autor;
    id.appendChild(meta);
    cab.appendChild(id);
    datos.appendChild(cab);

    if (r.descripcion) {
      var d = el('p', 'ruta-descripcion');
      d.textContent = r.descripcion;
      datos.appendChild(d);
    }

    if (r.paradas && r.paradas.length) {
      var t = el('h2', 'seccion-titulo');
      t.textContent = 'Paradas';
      datos.appendChild(t);
      var ol = el('ol', 'paradas');
      r.paradas.forEach(function (pa, i) {
        var li = el('li', 'parada');
        var n = el('span', 'parada-numero');
        n.textContent = String(i + 1);
        li.appendChild(n);
        var nom = el('span', 'parada-nombre');
        nom.textContent = pa.nombre;
        li.appendChild(nom);
        ol.appendChild(li);
      });
      datos.appendChild(ol);
    }

    // El título de la cabecera genérica se ajusta al nombre real.
    poner('titulo', r.nombre);
    document.title = r.nombre + ' · SeviTime';
  }

  if (tipo === 'perfil' && nombre) {
    Promise.all([
      sb.rpc('fn_perfil_publico', { p_nombre: nombre }),
      sb.rpc('fn_rutas_de_usuario', { p_nombre: nombre })
    ]).then(function (res) {
      var perfil = res[0].data && res[0].data[0];
      var rutas = (res[1].data || []).map(function (x) { return x; });
      if (perfil) mostrarPerfil(perfil, rutas);
    }).catch(function () { /* sin datos: se queda el texto de siempre */ });
  } else if (tipo === 'ruta' && /^\d+$/.test(idRuta)) {
    sb.rpc('fn_rutas_publicas').then(function (res) {
      var rutas = res.data || [];
      var propia = null;
      for (var i = 0; i < rutas.length; i++) {
        if (String(rutas[i].id) === idRuta) { propia = rutas[i]; break; }
      }
      if (propia) mostrarRuta(propia);
    }).catch(function () { /* sin datos */ });
  }
})();

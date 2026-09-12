// Rellena la página de un enlace compartido (perfil o ruta) con lo que trae
// la dirección, y prepara el botón «Abrir en la app».
//
// Esta página solo la ve quien no tiene la app, o quien abre el enlace desde
// un navegador que no respeta los App Links (el de Instagram, por ejemplo).
// Con la app instalada y el enlace verificado, Android la abre directamente
// y esto no llega a cargarse.
//
// No consulta ninguna base de datos ni carga nada de fuera: todo lo que
// enseña viene en el propio enlace.
(function () {
  var PAQUETE = 'com.selu.sevitime';
  var PLAY = 'https://play.google.com/store/apps/details?id=' + PAQUETE;

  var params = new URLSearchParams(location.search);
  var cuerpo = document.body;
  var tipo = cuerpo.getAttribute('data-tipo');

  // `textContent` y nunca `innerHTML`: el nombre lo escribe cualquiera en la
  // dirección, y así no se puede colar código en la página.
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
  var nombre = (params.get('n') || '').trim();

  if (tipo === 'perfil' && nombre) {
    poner('titulo', nombre);
    document.title = nombre + ' en SeviTime';
    abrir.href = intent('perfil/' + encodeURIComponent(nombre));
  } else if (tipo === 'ruta' && /^\d+$/.test(params.get('id') || '')) {
    if (nombre) {
      poner('titulo', nombre);
      document.title = nombre + ' · SeviTime';
    }
    abrir.href = intent('ruta/' + params.get('id'));
  } else {
    // Un enlace roto o recortado por el camino: no se ofrece abrir algo que
    // no se sabe qué es, solo la app.
    abrir.hidden = true;
    poner('titulo', 'Enlace incompleto');
    poner('explicacion', 'A este enlace le falta un trozo. Pídele a quien te lo mandó que lo vuelva a compartir.');
  }

  // Fuera de Android el intent no sirve de nada.
  if (!/android/i.test(navigator.userAgent)) abrir.hidden = true;
})();

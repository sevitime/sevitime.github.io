# sevitime.github.io

Web pública de SeviTime (GitHub Pages).

- `/.well-known/assetlinks.json`: demuestra a Android que este dominio y la app
  `com.selu.sevitime` son del mismo dueño, para que los enlaces `/perfil/` y
  `/ruta/` abran la app (App Links). Lleva tres huellas SHA-256: las dos que
  Play Console registra para el paquete en *Verificación de desarrolladores de
  Android* (las claves con las que la app llega a un móvil: `26:15:DE…` es la
  de firma de Play y `F2:FD:C9…`, casi seguro, la del uso compartido interno) y la de la clave de subida,
  para las pruebas con `flutter run --release`.
- `/perfil/?n=<apodo>` y `/ruta/?id=<id>&n=<nombre>`: lo que ve quien abre un
  enlace compartido sin tener la app. No consultan ninguna base de datos:
  enseñan lo que viene en el propio enlace.
- `.nojekyll`: sin él, Jekyll se salta la carpeta `.well-known`.

La política de privacidad vive en su propio repositorio y se sirve en
`/privacidad/`.

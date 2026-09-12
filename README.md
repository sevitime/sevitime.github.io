# sevitime.github.io

Web pública de SeviTime (GitHub Pages).

- `/.well-known/assetlinks.json`: demuestra a Android que este dominio y la app
  `com.selu.sevitime` son del mismo dueño, para que los enlaces `/perfil/` y
  `/ruta/` abran la app (App Links). Lleva tres huellas SHA-256: las dos que
  enseña Play Console en *Integridad de la app* (una es la de firma de Play) y
  la de la clave de subida, para las pruebas con `flutter run --release`.
- `/perfil/?n=<apodo>` y `/ruta/?id=<id>&n=<nombre>`: lo que ve quien abre un
  enlace compartido sin tener la app. No consultan ninguna base de datos:
  enseñan lo que viene en el propio enlace.
- `.nojekyll`: sin él, Jekyll se salta la carpeta `.well-known`.

La política de privacidad vive en su propio repositorio y se sirve en
`/privacidad/`.

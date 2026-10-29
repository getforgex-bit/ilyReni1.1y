# Para Reni

Experiencia local sin dependencias de ejecución ni servicios externos. Servir esta carpeta por HTTP (no abrir index.html con file://).

Con Python 3 instalado, ejecutar `python scripts/serve.py` y abrir http://127.0.0.1:4174. Para detenerla, Ctrl+C en esa terminal. El servidor admite peticiones de rangos para iniciar el audio en el segundo indicado.

## Materiales

- Corazón de líneas: adaptado de `send-a-heart-main`, Devansh Singhal, MIT.
- Lirios de caracteres: adaptados de `send-a-bouquet-main`, Devansh Singhal, MIT. Se conserva la geometría y el render original; se integra un controlador de reproducción independiente del audio.
- Modelo: objeto `Corazon` del archivo suministrado `Corazon_morado.blend`. `assets/corazon.glb` conserva el material; `corazon.json` contiene la geometría que utiliza el render web sin dependencias. `corazon.png` es la alternativa renderizada desde el mismo archivo.
- Música: `assets/Neo Romeo.mp3`, audio proporcionado por el usuario. Activada por defecto; inicia en 0:57 al pulsar «Hice algo para ti». Se puede silenciar.
- Fuente Petrona: Google Fonts, SIL Open Font License (licencia en assets).

El botón para continuar aparece en 1:10 de la canción. Si aún no se ha pulsado, la música espera en 1:13,9. Las flores empiezan a crecer en 1:14 y tardan 4,8 segundos en abrirse.

`scripts/export_heart.py` exporta el objeto y renderiza su imagen con Blender. La carta está reservada como punto de inserción en index.html. El repositorio contiene la página y sus recursos; el alojamiento web se configura por separado.



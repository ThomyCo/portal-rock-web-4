# Fuentes de datos y licencias

- **MusicBrainz:** identificadores, nombres y fechas mediante su API pública. Se respeta una solicitud por segundo y se identifica el cliente.
- **Wikidata:** descripciones y sitios oficiales mediante entidades QID.
- **OpenStreetMap / OpenMapTiles:** datos cartográficos mostrados a través de OpenFreeMap. La atribución permanece visible en MapLibre.
- **Contenido editorial:** resúmenes y biografías revisados por administradores. Los proveedores externos nunca reemplazan estos campos automáticamente.
- **Imágenes:** solamente archivos propios, con licencia compatible o enlaces oficiales permitidos. El proyecto no distribuye MP3.

Cada banda publicada requiere fuente, coordenadas verificadas y texto editorial. Registra la URL consultada y la fecha de revisión.
# Fotografías y contenido de bandas

`content/bands.es.json` contiene los 54 QID revisados y el texto editorial en español. `npm run content:bands` consulta `wbgetentities` de Wikidata para P18 y `imageinfo` de Wikimedia Commons para URL, autor y licencia. La herramienta requiere `ADMIN_CONTACT`, elimina HTML de los metadatos, acepta solamente HTTPS y escribe las incidencias en `migration-reports/band-profile-content.json`.

La atribución visible enlaza la página del archivo en Commons. Referencias técnicas: https://www.wikidata.org/w/api.php y https://www.mediawiki.org/wiki/API:Imageinfo.

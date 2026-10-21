# Portal Rock — Perfiles enriquecidos de bandas

**Estado:** Aprobado para planificación  
**Fecha:** 21 de octubre de 2026  
**Alcance:** Las 54 bandas publicadas

## 1. Objetivo

Cada página de banda mostrará dentro de Portal Rock una fotografía real, datos esenciales y una historia clara en español. El visitante podrá comprender el origen, trayectoria e influencia de la banda sin tener que abrir una fuente externa.

## 2. Resultado para el visitante

La ruta `/bandas/:slug` presentará:

1. Fotografía principal de la banda.
2. Nombre, ciudad y país de origen.
3. Año de formación y, cuando corresponda, año de separación.
4. Géneros principales.
5. Resumen editorial breve.
6. Historia completa dividida en párrafos legibles.
7. Acción para guardar la banda en favoritos.
8. Atribución discreta de la fotografía.

Se eliminará de la interfaz pública el enlace «Consultar fuente abierta». Las páginas de fuente se conservarán en la base de datos para trazabilidad editorial y atribución, pero no serán necesarias para leer la historia.

## 3. Diseño visual aprobado

### 3.1 Escritorio

La cabecera tendrá dos columnas. La izquierda mostrará origen, nombre, resumen, datos principales y favoritos. La derecha estará ocupada por la fotografía. La historia aparecerá debajo, con un encabezado editorial y texto en columnas cuando el ancho lo permita.

### 3.2 Celular

La fotografía aparecerá primero. Después se mostrarán nombre, resumen y datos. La historia utilizará una sola columna, sin desplazamiento horizontal. La atribución permanecerá legible debajo de la imagen.

### 3.3 Imagen alternativa

Si no existe una fotografía verificada o la imagen no carga, la página mostrará el diseño gráfico actual con las iniciales de la banda. El contenido textual seguirá disponible.

## 4. Fuentes y licencias

Las fotografías procederán de Wikimedia Commons. Cada registro deberá conservar:

- URL directa de la imagen o miniatura apropiada.
- URL de la página del archivo en Wikimedia Commons.
- Nombre del autor o institución acreditada.
- Identificador o nombre de la licencia.
- Texto alternativo descriptivo.

Solo se aceptarán archivos con licencia identificable y uso compatible con la publicación del portal. No se copiarán fotografías de buscadores, redes sociales, sitios de noticias o páginas oficiales sin una licencia adecuada.

Las biografías serán textos editoriales originales en español. Wikidata, MusicBrainz y fuentes verificables podrán utilizarse para comprobar hechos, pero no se copiarán artículos completos ni fragmentos extensos.

## 5. Modelo de datos

La tabla `bands` incorporará:

| Campo | Tipo | Propósito |
|---|---|---|
| `image_url` | `text` existente | Imagen optimizada mostrada al visitante |
| `image_source_url` | `text` | Página original del archivo |
| `image_author` | `text` | Autor o institución |
| `image_license` | `text` | Licencia declarada |
| `image_alt` | `text` | Descripción accesible |
| `ended_year` | `int` existente | Año de separación, si aplica |
| `biography` | `text` existente | Historia editorial completa |
| `wikidata_id` | `text` existente | Identidad estable para sincronización |

El periodo de actividad se derivará de `formed_year` y `ended_year`; no se almacenará como texto duplicado.

La vista `public_band_catalog` expondrá los campos públicos de imagen, atribución, texto alternativo y año de separación. La página no consultará Wikimedia directamente.

## 6. Adquisición de contenido

Se implementará un script administrativo que procese el catálogo por lotes:

1. Leer las bandas publicadas desde Supabase.
2. Resolver cada banda mediante un identificador de Wikidata revisado.
3. Leer la propiedad de imagen asociada.
4. Consultar los metadatos del archivo en Wikimedia Commons.
5. Extraer URL, autor, licencia y página de procedencia.
6. Validar los campos obligatorios.
7. Generar una migración SQL revisable antes de escribir en producción.

El script no elegirá una entidad utilizando únicamente el nombre. Las asociaciones ambiguas quedarán marcadas para revisión manual. Una imagen de un integrante individual no se utilizará como imagen del grupo salvo que el archivo describa explícitamente a la banda completa.

La primera entrega actualizará las 54 bandas existentes. El mismo proceso podrá reutilizarse cuando se añadan bandas desde administración.

## 7. Contenido editorial

Cada biografía tendrá entre dos y cuatro párrafos breves y cubrirá:

- Formación y ciudad de origen.
- Integrantes o etapa que definió su identidad.
- Evolución musical y trabajos relevantes.
- Influencia o legado.

El resumen tendrá una o dos frases y no repetirá literalmente el primer párrafo. Los textos evitarán afirmaciones promocionales, rumores y datos no verificables.

## 8. Componentes y flujo

### 8.1 Base de datos

Una migración agregará los campos faltantes y actualizará la vista pública. Otra migración, generada por el proceso de importación y revisada, cargará metadatos e historias.

### 8.2 Acceso a datos

`getBand(slug)` continuará siendo el punto de entrada. `BandDetail` añadirá atribución, texto alternativo y periodo de actividad. No se realizará una petición externa durante la navegación pública.

### 8.3 Interfaz

`BandPage` dividirá la presentación en unidades enfocadas:

- Cabecera editorial.
- Imagen con estado alternativo.
- Datos esenciales.
- Historia.
- Atribución.

La atribución será visible, pero tendrá menor jerarquía que la historia. La URL de procedencia no se presentará como la acción principal ni interrumpirá la lectura.

## 9. Estados y errores

- **Carga:** conservar el estado «Cargando historia…» con espacio reservado para evitar saltos bruscos.
- **Banda inexistente:** mantener la salida «Banda no encontrada» y el regreso al mapa.
- **Sin fotografía:** mostrar iniciales y mantener la información completa.
- **Imagen rota:** cambiar al diseño alternativo mediante el evento de error de la imagen.
- **Metadatos incompletos:** no publicar la imagen hasta completar autor y licencia.
- **Wikimedia no disponible durante la importación:** registrar el error y continuar con la siguiente banda; no afecta la web pública.
- **Resultado ambiguo:** exigir revisión manual, sin selección automática.

## 10. Accesibilidad y rendimiento

- Toda fotografía tendrá `alt` específico.
- El texto alternativo no repetirá «imagen de» ni el nombre visible sin aportar información.
- La atribución será texto real y legible.
- La imagen usará dimensiones declaradas para reducir cambios de diseño.
- Se solicitará un tamaño adecuado desde Wikimedia en vez del archivo original cuando sea excesivo.
- Las imágenes fuera de la primera pantalla usarán carga diferida.
- La página será utilizable a 360, 768 y 1440 píxeles.

## 11. Seguridad y privacidad

- Las consultas de adquisición se ejecutarán desde un script administrativo o una función protegida.
- No se expondrán claves administrativas en el navegador.
- La aplicación solo renderizará URLs `https` validadas.
- Las biografías se mostrarán como texto, sin HTML procedente de terceros.

## 12. Pruebas

### 12.1 Datos

- La migración crea los campos y actualiza la vista.
- Cada fotografía publicada tiene URL HTTPS, autor, licencia, fuente y texto alternativo.
- Las 54 bandas tienen una biografía con al menos dos párrafos.
- Los años cumplen las restricciones existentes.

### 12.2 Importación

- Una entidad válida produce metadatos normalizados.
- Una entidad sin imagen queda pendiente.
- Una respuesta ambigua no actualiza la banda.
- Los errores de red no detienen el lote completo.

### 12.3 Interfaz

- La página muestra fotografía y atribución cuando existen.
- Una imagen rota activa el diseño alternativo.
- La historia se muestra dentro de Portal Rock.
- «Consultar fuente abierta» deja de aparecer.
- El nombre, ciudad, año y géneros siguen visibles.
- La distribución se adapta a celular y escritorio.

## 13. Criterios de aceptación

El cambio estará terminado cuando:

1. Las 54 bandas tengan información clara dentro de Portal Rock.
2. Cada fotografía publicada corresponda a la banda y tenga licencia y atribución verificadas.
3. Ningún perfil dependa de una consulta externa durante la visita.
4. El enlace externo anterior haya sido retirado.
5. Las imágenes fallidas utilicen el diseño alternativo.
6. Las migraciones se apliquen sobre la base actual sin eliminar usuarios, favoritos ni contenido comunitario.
7. Las pruebas automatizadas y la compilación de producción finalicen correctamente.
8. La revisión manual confirme el diseño a 360, 768 y 1440 píxeles.

## 14. Fuera de alcance

- Galerías con varias fotografías por banda.
- Reproducción de canciones o videos comerciales.
- Copia íntegra de artículos externos.
- Imágenes obtenidas de fuentes sin licencia identificable.
- Edición colaborativa de biografías por usuarios normales.

## 15. Decisiones cerradas

- Wikimedia Commons será la fuente de fotografías.
- Supabase almacenará el resultado y será la fuente de lectura pública.
- Las biografías estarán redactadas en español dentro del portal.
- La atribución será visible y discreta.
- La página conservará un diseño alternativo sin fotografía.
- La distribución seguirá el mockup aprobado: cabecera dividida en escritorio y fotografía primero en celular.

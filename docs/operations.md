# Operación

## Rutina mensual

- Revisa consumo de base, egress, Storage, Realtime y Functions en Supabase.
- Exporta un respaldo lógico con `npx supabase db dump -f backups/portal-rock.sql` y guárdalo cifrado fuera del proyecto.
- Revisa reportes abiertos y registros de sincronización.
- Actualiza dependencias en una rama y ejecuta toda la verificación.
- Comprueba que las páginas de privacidad y fuentes sigan vigentes.

## Proyecto pausado

Supabase puede pausar un proyecto Free con poca actividad. En Dashboard selecciona el proyecto y pulsa **Resume project**. Después prueba `/mapa`, una consulta autenticada y Realtime. La restauración directa permanece disponible hasta un año según la documentación vigente.

## Incidente

1. Desactiva temporalmente publicación o la función afectada.
2. Revoca claves filtradas en Supabase y actualiza Cloudflare.
3. Conserva registros sin copiar contraseñas, tokens ni contenido privado.
4. Restaura desde el último respaldo verificado si hubo pérdida.
5. Documenta alcance, fechas y corrección.
# Publicación de perfiles de bandas

1. Haz una copia de seguridad de la base de datos.
2. Ejecuta `npm run content:bands` con `ADMIN_CONTACT` configurado y revisa el reporte.
3. Aplica `npx supabase db push`; se instalarán `202610210004_band_profile_media.sql` y `202610210005_band_profile_content.sql`.
4. Comprueba que `public_band_catalog` devuelve 54 filas, biografías con párrafos separados y atribución completa cuando existe una imagen.
5. Revisa Beatles, Queen, Guns N' Roses, Mötley Crüe y Soda Stereo a 360, 768 y 1440 píxeles.

Para revertir solamente las fotografías, asigna `null` a `image_url`, `image_source_url`, `image_author`, `image_license` e `image_alt` en `public.bands`. Las biografías, cuentas, favoritos, foro y ubicaciones permanecen intactos.

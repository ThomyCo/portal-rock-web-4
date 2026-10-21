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

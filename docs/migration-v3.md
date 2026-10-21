# Migración segura desde Portal Rock Web 3.0

La migración conserva publicaciones válidas y reserva nombres de usuario. Las contraseñas PBKDF2 del prototipo no se copian: cada persona debe crear una cuenta nueva y verificar su correo.

1. Copia `usuarios.txt` y `mensajes.txt` a una carpeta privada.
2. Ejecuta el ensayo: `npm run import:v3 -- --source=C:\ruta\a\datos`.
3. Revisa el JSON nuevo en `migration-reports/`.
4. Configura las variables administrativas de Supabase solamente en tu terminal.
5. Ejecuta con `--apply` cuando el informe sea correcto.

El importador usa claves estables por línea y registra procedencia en `private.migration_log`. Nunca publiques los archivos originales ni una clave `service_role`.

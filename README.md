# Andalucia Joyeria

Landing y catalogo administrable para la marca de joyeria Andalucia.

## Stack

- Frontend: HTML, Bootstrap y JavaScript puro.
- Backend: Node.js + Express.
- ORM: Sequelize.
- Base de datos: PostgreSQL en Neon.
- Imagenes: Cloudinary.
- Deploy: Vercel.

## Estado actual

El proyecto completo incluye:

- Landing publica en `public/index.html`.
- Panel admin en `public/admin.html`.
- API REST con Express en `api/`.
- Base de datos PostgreSQL en Neon con Sequelize.
- Subida de imagenes a Cloudinary.
- Autenticacion JWT para el panel admin.

## Documentacion

- [Plan paso a paso](docs/plan-paso-a-paso.md)
- [Instalacion local](docs/instalacion.md)
- [Base de datos](docs/base-de-datos.md)
- [Cloudinary](docs/cloudinary.md)
- [Deploy en Vercel](docs/deploy-vercel.md)

## Seguridad

No subir credenciales reales al repositorio.

Archivos y valores privados:

- `.env`
- `DATABASE_URL`
- `JWT_SECRET`
- `CLOUDINARY_API_SECRET`

Si el API Secret de Cloudinary fue compartido en una captura o chat, debe regenerarse antes de produccion.

# Base de datos

Esquema, tablas y como Sequelize gestiona la base de datos en PostgreSQL (Neon).

---

## Tecnologia

- **Motor**: PostgreSQL 15+
- **Host**: Neon (serverless)
- **ORM**: Sequelize 6
- **Conexion**: Pool con maximo 2 conexiones (optimizado para Vercel)

---

## Tablas

### admin_users

Guarda el unico usuario administrador del panel.

| Columna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| name | VARCHAR | Nombre del admin |
| email | VARCHAR | Unico, usado para login |
| passwordHash | VARCHAR | Hash de bcrypt (12 rondas) |
| isActive | BOOLEAN | Default true |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

### categories

Categorias de productos (anillos, collares, aros, pulseras, etc.).

| Columna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| name | VARCHAR | Nombre visible |
| slug | VARCHAR | Unico, para URLs |
| description | TEXT | Opcional |
| isActive | BOOLEAN | Default true. Si se desactiva, los productos vinculados quedan huerfanos |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

### products

Cada producto del catalogo.

| Columna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| name | VARCHAR | Nombre del producto |
| slug | VARCHAR | Unico, generado desde el nombre |
| description | TEXT | Descripcion larga |
| price | DECIMAL(12,2) | Precio en ARS |
| stock | INTEGER | Unidades disponibles |
| material | VARCHAR | Ej: "Plata", "Acero", "Dorado" |
| imageUrl | TEXT | URL de Cloudinary |
| imagePublicId | VARCHAR | ID en Cloudinary (para eliminar) |
| imageAlt | TEXT | Texto alternativo para accesibilidad |
| isFeatured | BOOLEAN | Destacado (aparece primero) |
| isActive | BOOLEAN | Si es false no se muestra en la landing |
| categoryId | INTEGER FK | Relacion con categories |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

---

## Relaciones

```
Category  1 ──── *  Product
```

- Una categoria tiene muchos productos.
- Un producto pertenece a una categoria.
- `categoryId` es clave foranea en `products`.

---

## Como se crean las tablas

Sequelize puede crear las tablas de dos formas:

### 1. Automatica al recibir la primera peticion (por defecto)

El middleware `database.middleware.js` llama a `sequelize.authenticate()` para verificar la conexion. Las tablas **no** se crean automaticamente por seguridad.

### 2. Manual con DB_SYNC

Para desarrollo podes activar la sincronizacion automatica en `.env`:

```env
DB_SYNC=true
DB_SYNC_ALTER=true
```

`DB_SYNC=true` ejecuta `sequelize.sync()` que crea las tablas si no existen.
`DB_SYNC_ALTER=true` ejecuta `sequelize.sync({ alter: true })` que adiciona columnas faltantes (no elimina existentes).

> En produccion **no** uses `DB_SYNC=true`. Actualiza el esquema con migraciones o scripts manuales.

### 3. Via seed:admin

El comando `npm run seed:admin` ejecuta `sequelize.sync({ alter: true })` y luego crea o actualiza el usuario admin.

```bash
npm run seed:admin
```

Es la forma recomendada para la configuracion inicial.

---

## Configuracion de conexion

Archivo: `api/config/database.js`

- Usa `DATABASE_URL` del `.env`.
- SSL habilitado en produccion.
- Pool limitado a 2 conexiones (maximo) para entornos serverless.
- Logging desactivado.

Si necesitas mas conexiones ajusta `DB_POOL_MAX` en `.env`.

# Instalacion local

Guia paso a paso para poner el proyecto en funcionamiento en tu maquina.

## Requisitos

- Node.js 18 o superior
- npm
- Una cuenta en [Neon](https://neon.tech)
- Una cuenta en [Cloudinary](https://cloudinary.com)

---

## 1. Crear base de datos en Neon

1. Anda a [console.neon.tech](https://console.neon.tech) y crea una cuenta o inicia sesion.
2. Crea un nuevo proyecto. Elegi la region mas cercana a Argentina (us-east-1 o sa-east-1).
3. En la seccion "Connection Details" copia la **Connection string** (DATABASE_URL). Tiene este formato:

```
postgresql://usuario:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

4. Guardala temporalmente; la vas a necesitar en el paso 3.

---

## 2. Configurar Cloudinary

Sigue la guia en [docs/cloudinary.md](cloudinary.md) para obtener:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 3. Crear archivo `.env`

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Abri `.env` y completa los valores:
   ```env
   NODE_ENV=development

   # De Neon (paso 1)
   DATABASE_URL=postgresql://usuario:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require

   # Genera una clave segura, por ejemplo con:
   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   JWT_SECRET=un_secreto_muy_largo_y_aleatorio

   # De Cloudinary (paso 2)
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret

   # Admin inicial (lo crea el seed)
   ADMIN_NAME=Admin
   ADMIN_EMAIL=admin@andalucia.com
   ADMIN_PASSWORD=UnaClaveSegura123
   ```

   > **Importante**: usa una password fuerte para el admin y un JWT_SECRET unico.

---

## 4. Instalar dependencias

```bash
npm install
```

Esto instala Express, Sequelize, pg, bcryptjs, jsonwebtoken, multer, cloudinary, etc.

---

## 5. Sincronizar base de datos y crear admin

El proyecto crea las tablas automaticamente al recibir la primera peticion (`DB_SYNC` esta desactivado por defecto). Para crearlas manualmente y crear el usuario admin:

```bash
npm run seed:admin
```

Este comando:
- Conecta con Neon.
- Crea las tablas `admin_users`, `categories` y `products` si no existen.
- Crea o actualiza el usuario administrador con los datos de `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

Si el admin ya existe solo actualiza nombre y password.

---

## 6. Iniciar el servidor

```bash
npm run dev
```

El servidor arranca en `http://localhost:3000`.

---

## 7. Verificar que funciona

| Que probar | URL |
|---|---|
| Landing publica | `http://localhost:3000` |
| Panel admin | `http://localhost:3000/admin` |
| Health check | `http://localhost:3000/api/health` |
| Productos API | `http://localhost:3000/api/products` |
| Categorias API | `http://localhost:3000/api/categories` |

Inicia sesion en `/admin` con el email y password que pusiste en `.env`.

---

## Solucion de problemas

**"DATABASE_URL no esta configurada"**
: Revisa que `.env` exista y tenga la variable `DATABASE_URL` correcta.

**"JWT_SECRET no esta configurado"**
: Agrega `JWT_SECRET` en `.env`.

**Error de conexion a Neon**
: Verifica que la `DATABASE_URL` este bien copiada y que la IP no este bloqueada (Neon permite conexiones desde cualquier IP por defecto).

**El seed falla**
: Ejecuta `npm run seed:admin` de nuevo. Si el problema persiste revisa la consola para ver el error exacto.

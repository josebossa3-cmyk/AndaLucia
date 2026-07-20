# Deploy en Vercel

Guia para subir el proyecto a Vercel con base de datos en Neon e imagenes en Cloudinary.

---

## Requisitos previos

Antes de empezar necesitas tener:

1. **Repositorio en GitHub** con el proyecto subido.
2. **Cuenta en Vercel** ([vercel.com](https://vercel.com)) — podes usar login con GitHub.
3. **Base de datos en Neon** — seguí [docs/instalacion.md](instalacion.md) paso 1.
4. **Cuenta en Cloudinary** — seguí [docs/cloudinary.md](cloudinary.md).

> No necesitas un archivo `.env` local para el deploy. Las variables se configuran directamente en Vercel.

---

## Paso 1: Subir el proyecto a GitHub

```bash
# Inicializa git (si no lo hiciste ya)
git init
git add .
git commit -m "Initial commit"

# Crea un repo en GitHub y conectalo
git remote add origin https://github.com/tu-usuario/andalucia-joyeria.git
git branch -M main
git push -u origin main
```

El `.gitignore` ya excluye `node_modules/`, `.env`, `.vercel/` y archivos temporales.

---

## Paso 2: Importar en Vercel

1. Anda a [vercel.com/new](https://vercel.com/new).
2. Elegi **Import Git Repository** y conecta tu repositorio de GitHub.
3. Selecciona el repo `andalucia-joyeria`.
4. Vercel detecta automaticamente la configuracion:

   | Configuracion | Valor |
   |---|---|
   | Framework | **Other** |
   | Root Directory | `./` |
   | Build Command | *(ninguno, dejar vacio)* |
   | Output Directory | *(ninguno, dejar vacio)* |
   | Install Command | `npm install` |

   Vercel usa `npm install` + `npm start` por defecto, que es justo lo que necesita.

5. No hagas clic en **Deploy** todavia. Primero configura las variables de entorno.

---

## Paso 3: Configurar variables de entorno en Vercel

En la pantalla de configuracion del proyecto en Vercel, antes de deployar, anda a la seccion **Environment Variables** y agrega estas:

| Variable | Valor | Nota |
|---|---|---|
| `NODE_ENV` | `production` | |
| `DATABASE_URL` | `postgresql://...` | De Neon, con `?sslmode=require` al final |
| `JWT_SECRET` | *(clave secreta larga)* | Generala con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CLOUDINARY_CLOUD_NAME` | `tu_cloud_name` | De tu dashboard de Cloudinary |
| `CLOUDINARY_API_KEY` | `123456789` | De tu dashboard de Cloudinary |
| `CLOUDINARY_API_SECRET` | `abc...` | De tu dashboard de Cloudinary |
| `ADMIN_NAME` | `Admin` | Nombre del admin inicial |
| `ADMIN_EMAIL` | `admin@andalucia.com` | Email para login |
| `ADMIN_PASSWORD` | `UnaClaveSegura` | Password del admin inicial |
| `DB_POOL_MAX` | `2` | Maximo de conexiones simultaneas |

> **Importante**: Marca todas como **"Production"** (y Development si queres usarlas en preview branches).

---

## Paso 4: Hacer clic en Deploy

Una vez configuradas las variables, hace clic en **Deploy**. Vercel va a:

1. Instalar dependencias (`npm install`).
2. Iniciar la app con `node api/index.js`.
3. Asignar una URL tipo `https://andalucia-joyeria.vercel.app`.

---

## Paso 5: Crear el usuario admin en produccion

Vercel no puede ejecutar el seed automaticamente. Despues del deploy tenes que correrlo una vez desde tu maquina local apuntando a la base de Neon:

```bash
# Temporalmente edita tu .env local con la DATABASE_URL de Neon
# y las credenciales de admin que pusiste en Vercel
npm run seed:admin
```

Esto crea las tablas y el usuario admin en la base de Neon. Una vez ejecutado, el proyecto ya funciona completo en produccion.

---

## Estructura final del proyecto

```
andalucia-joyeria/
├── api/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── database.middleware.js
│   ├── models/
│   │   ├── AdminUser.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   ├── product.routes.js
│   │   ├── public.routes.js
│   │   └── upload.routes.js
│   ├── seeders/
│   │   └── create-admin.js
│   ├── utils/
│   │   └── slugify.js
│   └── index.js
├── admin.css
├── admin.html
├── admin.js
├── index.html
├── script.js
├── styles.css
├── docs/
│   ├── base-de-datos.md
│   ├── cloudinary.md
│   ├── deploy-vercel.md
│   ├── instalacion.md
│   └── plan-paso-a-paso.md
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── vercel.json
└── README.md
```

---

## Verificar que funciona

Despues del deploy:

| Pagina | URL |
|---|---|
| Landing | `https://tu-app.vercel.app` |
| Panel admin | `https://tu-app.vercel.app/admin` |
| Health check | `https://tu-app.vercel.app/api/health` |
| Productos API | `https://tu-app.vercel.app/api/products` |
| Categorias API | `https://tu-app.vercel.app/api/categories` |

---

## Notas importantes

- **No incluyas** el `.env` en el repo (ya esta en `.gitignore`).
- Las variables de entorno en Vercel se configuran desde el dashboard, no desde archivos.
- Si cambias las variables de entorno en Vercel, hace un **redeploy** para que se apliquen.
- Vercel asigna automaticamente un dominio `*.vercel.app`. Si tenes dominio propio, podes configurarlo en **Domains**.
- El seed `npm run seed:admin` solo se ejecuta una vez. Si ya corriste y necesitas cambiar el admin, podes volver a ejecutarlo: actualiza el admin existente sin duplicarlo.

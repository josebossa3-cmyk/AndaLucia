# Cloudinary

Configuracion del servicio de imagenes para el catalogo de productos.

---

## Que es Cloudinary

Cloudinary es un servicio en la nube para almacenar, optimizar y servir imagenes. En este proyecto se usa para:

- Almacenar una imagen por producto.
- Servir las imagenes con URLs publicas.
- Optimizar las imagenes automaticamente (formato, calidad, tamaño).

No se guardan archivos de imagen en el servidor ni en la base de datos; solo se guardan las URLs que devuelve Cloudinary.

---

## Crear cuenta y obtener credenciales

1. Anda a [cloudinary.com](https://cloudinary.com) y registrate (es gratis, no requiere tarjeta).
2. Una vez dentro, vas a ver el **Dashboard** con tus credenciales:

   - **Cloud name** — lo usas como `CLOUDINARY_CLOUD_NAME`
   - **API Key** — lo usas como `CLOUDINARY_API_KEY`
   - **API Secret** — lo usas como `CLOUDINARY_API_SECRET`

3. Copia esos tres valores a tu archivo `.env`:

   ```env
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abc123def456ghi789
   ```

---

## Como funciona en el proyecto

1. El panel admin permite seleccionar un archivo de imagen al crear o editar un producto.
2. Al guardar, el backend recibe el archivo, lo sube a Cloudinary via API y guarda la URL publica en la base de datos.
3. Si el producto ya tenia una imagen y se sube una nueva, la anterior se elimina automaticamente de Cloudinary.
4. La landing y el panel muestran la imagen desde la URL de Cloudinary.

Flujo:

```
Admin elige imagen → Express + Multer recibe el archivo
  → Se sube a Cloudinary (carpeta "andalucia/productos")
    → Cloudinary devuelve secure_url y public_id
      → Se guardan en el producto (columna imageUrl, imagePublicId)
```

---

## Seguridad

- **No compartas** `CLOUDINARY_API_SECRET`. Si se filtró, regeneralo desde el dashboard de Cloudinary.
- Las imagenes se suben a una carpeta especifica (`andalucia/productos`) para mantener el orden.
- El archivo se procesa en memoria (`multer memoryStorage`) y no se guarda en el servidor.

---

## Limite del plan gratuito

El plan gratuito de Cloudinary incluye:

- 25 GB de almacenamiento
- 25 GB de ancho de banda por mes
- Transformaciones basicas (formato, calidad, redimension)

Para un catalogo de joyeria con algunas decenas de productos es mas que suficiente.

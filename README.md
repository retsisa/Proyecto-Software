# RestoGest

Sistema web de gestión de pedidos para restaurante. Proyecto de Ingeniería de Software, Fase II.

El mesero toma el pedido desde el celular, la cocina lo ve en su pantalla y cambia su estado, la caja cobra y emite el comprobante, y el administrador gestiona el menú, las mesas, los usuarios y consulta reportes.

**Tecnologías:** Node.js · Express · EJS · PostgreSQL · JWT · bcrypt. Arquitectura en 3 capas con MVC.

## Roles y qué puede hacer cada uno

| Rol | Acceso |
|---|---|
| administrador | Todo: menú, mesas, pedidos, cocina, caja, reportes y usuarios |
| mesero | Mesas, toma de pedidos y sus pedidos en curso |
| cocina | Pantalla de cocina (empezar a preparar, marcar listo) |
| caja | Cobro (efectivo, tarjeta o QR) y comprobante |

Flujo de un pedido: `pendiente → en_preparacion → listo → entregado → pagado` (se puede cancelar mientras está pendiente).

## Estructura

```
app.js                  Punto de entrada
config/db.js            Conexión a PostgreSQL (Singleton)
middleware/auth.js      Autenticación y control de roles
routes/index.js         Todas las rutas
controllers/            Controladores (C)
services/               Reglas de negocio con transacciones
repositories/           Acceso a datos (Repository)
factories/              Fábrica de pagos (Factory Method)
events/                 Aviso a cocina (Observer)
views/                  Vistas EJS (V)
public/                 CSS y JavaScript del navegador
scripts/schema.sql      Script de la base de datos
scripts/initDb.js       Ejecuta el script anterior
scripts/crearAdmin.js   Crea el primer administrador
```

## Probarlo en tu computadora

Necesitas Node.js 18 o superior y una base de datos PostgreSQL (local o la de Neon).

1. Instala las dependencias:
   ```
   npm install
   ```
2. Copia `.env.example` como `.env` y completa `DATABASE_URL` y `JWT_SECRET`.
   Si usas PostgreSQL local sin SSL, agrega `DB_SSL=false`.
3. Crea las tablas y los datos iniciales (menú de ejemplo y 6 mesas):
   ```
   npm run db:init
   ```
4. Crea el primer administrador:
   ```
   npm run admin:crear -- admin@correo.com MiClave123
   ```
5. Inicia el servidor y abre http://localhost:3000
   ```
   npm start
   ```
6. Entra como administrador, ve a **Usuarios** y crea un mesero, un usuario de cocina y uno de caja.

## Subirlo a GitHub

```
git init
git add .
git commit -m "feat: versión inicial de RestoGest"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/restogest.git
git push -u origin main
```

El archivo `.env` está en `.gitignore`: nunca se sube. Para trabajar en equipo, creen la rama `develop` y una rama `feature/...` por cada tarea.

## Publicarlo gratis (Neon + Render)

**1. Base de datos en Neon**
1. Crea una cuenta en https://neon.tech y un proyecto nuevo.
2. Copia la cadena de conexión (*connection string*), que empieza con `postgresql://`.
3. Crea las tablas de una de estas dos formas:
   - Pega el contenido de `scripts/schema.sql` en el editor SQL de Neon y ejecútalo, o
   - En tu computadora, con la cadena de Neon en `.env`, ejecuta `npm run db:init`.
4. Crea el administrador desde tu computadora (el plan gratuito de Render no tiene terminal), con la cadena de Neon en `.env`:
   ```
   npm run admin:crear -- admin@correo.com MiClave123
   ```

**2. Aplicación en Render**
1. Crea una cuenta en https://render.com y elige **New → Web Service**.
2. Conecta tu repositorio de GitHub.
3. Configura:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free
4. En **Environment** agrega:
   - `DATABASE_URL` = la cadena de conexión de Neon
   - `JWT_SECRET` = una clave larga y aleatoria
   - `NODE_ENV` = `production`
5. Pulsa **Create Web Service**. Cuando el estado sea *Live*, abre la URL pública que te da Render.

En el plan gratuito la app se "duerme" tras unos minutos sin uso, y la primera carga después tarda. Es normal.
Cada `git push` a `main` vuelve a desplegar la app automáticamente.

## Notas de seguridad

- Las contraseñas se guardan cifradas con bcrypt y las consultas SQL usan parámetros.
- La sesión viaja en una cookie `httpOnly` con vigencia de 8 horas.
- Las claves van en variables de entorno, no en el código.
- Las fechas se guardan en UTC y se muestran en la zona `America/La_Paz` (se puede cambiar con la variable `TZ_NEGOCIO`).

## Licencia

MIT.

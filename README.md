# Sistema web político

Proyecto con dos partes:

- `backend/`: Django 6.1 conectado a una base Postgres en Neon.
- `app-movil/`: app para celular en React Native + Expo (reemplaza al frontend web de
  React + Vite). Cómo instalarla y probarla: ver `app-movil/README.md`.

## Backend

### 1. Crear el entorno e instalar dependencias (Windows / PowerShell)

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configurar la base de datos

Copiar `backend/.env.example` a `backend/.env` y pegar en `DATABASE_URL` la cadena de
conexión de Neon (proyecto `noisy-haze-97297807`, rama `production`). Se obtiene en
https://console.neon.tech, botón **Connect**. Debe terminar en `?sslmode=require`.

El archivo `.env` está en `.gitignore` y nunca se sube al repositorio.

### 3. Probar la conexión a la base de datos

Con el entorno activado, dentro de `backend/`:

```powershell
python manage.py check --database default
python manage.py shell -c "from django.db import connection; c = connection.cursor(); c.execute('select version()'); print(c.fetchone()[0])"
```

Si todo está bien, el primer comando dice `System check identified no issues` y el
segundo imprime la versión de PostgreSQL de Neon. Ninguno de los dos crea tablas.

Los modelos están en `backend/core/models.py` (usuario propio `core.Usuario` con login por
email). Las tablas ya están creadas en Neon. Si se cambian los modelos:

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 4. Levantar el servidor

```powershell
python manage.py runserver
```

### 5. Crear un usuario para entrar

```powershell
python manage.py createsuperuser   # pide email, username y contraseña
```

También se pueden crear usuarios desde el admin: http://127.0.0.1:8000/admin/

### 6. Tests

Corren sobre SQLite local, sin tocar Neon:

```powershell
$env:DATABASE_URL = "sqlite:///test.sqlite3"; python manage.py test core; Remove-Item Env:DATABASE_URL
```

## App móvil

```powershell
cd app-movil
npm install
copy .env.example .env    # y poner la IP de la compu: EXPO_PUBLIC_API_URL=http://192.168.0.10:8000
npm start                 # escanear el QR con Expo Go
```

Django tiene que escuchar en la red para que lo vea el celular:
`python manage.py runserver 0.0.0.0:8000` (y la IP en `DJANGO_ALLOWED_HOSTS`).
Detalles en `app-movil/README.md`.

## Login

Usa las tablas de Django (`usuarios`, `django_session`, grupos y permisos) con sesiones y
CSRF, sin librerías extra. El celular guarda la cookie de sesión solo; como la app no
puede leer cookies, `/api/auth/csrf/` y `/api/auth/login/` devuelven también el token
CSRF en el JSON (`csrfToken`), y la app lo manda en el header `X-CSRFToken`.

| Endpoint | Método | Qué hace |
|---|---|---|
| `/api/auth/csrf/` | GET | Deja la cookie `csrftoken` |
| `/api/auth/login/` | POST | `{"email", "password"}`, inicia la sesión |
| `/api/auth/me/` | GET | Usuario actual, o 401 si no hay sesión |
| `/api/auth/logout/` | POST | Cierra la sesión |

Los POST llevan el header `X-CSRFToken` con el token que devolvió `/api/auth/csrf/`.

## Mapa: barrios, calles, zonas y rutas

En la app, Territorio → Mapa (react-native-maps):

- **Barrios y calles** ya vienen cargados. Clic en un barrio para ver sus calles.
- **Zonas**: "+ Nueva zona", se toca el mapa vértice por vértice y "Cerrar contorno"; los barrios
  cuyo centro queda adentro se asignan a la zona.
- **Rutas**: "+ Nueva ruta", se tocan los puntos en orden y OpenRouteService calcula el
  recorrido por las calles, con distancia y tiempo estimado.

Todo se guarda en GeoJSON (`geometria`) en la base.

### Cargar barrios y calles de una ciudad (OpenStreetMap)

```powershell
cd backend
python manage.py importar_osm "Córdoba, Córdoba, Argentina" --simular   # muestra qué cargaría
python manage.py importar_osm "Córdoba, Córdoba, Argentina"             # guarda
```

Se puede correr de nuevo: actualiza lo existente y no borra nada. Algunos barrios en
OpenStreetMap son solo un punto (sin contorno); se muestran como círculos.

### API key de OpenRouteService

Registrarse en https://openrouteservice.org/dev/#/signup, crear un token y agregarlo en
`backend/.env`:

```
ORS_API_KEY=el-token
```

| Endpoint | Métodos | Qué hace |
|---|---|---|
| `/api/mapa/barrios/` | GET | Barrios (GeoJSON) |
| `/api/mapa/calles/?barrio=ID` | GET | Calles de un barrio (GeoJSON) |
| `/api/mapa/zonas/` | GET, POST | Listar / crear zonas |
| `/api/mapa/zonas/ID/` | PATCH, DELETE | Editar / borrar una zona |
| `/api/mapa/rutas/` | GET, POST | Listar / crear rutas (calcula con OpenRouteService) |
| `/api/mapa/rutas/ID/` | PATCH, DELETE | Editar / borrar una ruta |

## Campañas, usuarios y permisos

- **Campañas:** el superusuario (o quien tenga el permiso "Puede elegir la campaña al
  ingresar") elige la campaña después de iniciar sesión. Todo lo que ve (rutas,
  cuestionarios, usuarios y actividad) es de esa campaña. Barrios, calles y zonas son
  territorio compartido por todas las campañas. El resto de los usuarios trabaja
  siempre en la campaña de su usuario.
- **Permisos:** se usan las tablas de Django: permisos (`auth_permission`), grupos
  (`auth_group`) y grupos por permisos (`auth_group_permissions`). Hay dos permisos propios:
  "Puede administrar la campaña" (incluye mapa, cuestionarios, categorías, usuarios, ver
  permisos y actividad) y "Puede elegir la campaña al ingresar". La migración `0005_grupos`
  crea el grupo "Militantes" (cargar encuestas). En la app se consultan en Gestión → Permisos.
- **Usuarios:** Gestión → Usuarios. Al crear un usuario se marca si administra la campaña y/o su grupo; los usuarios no se
  borran, se desactivan (así se conserva su historial).
- **Actividad:** cada alta, cambio, baja e inicio de sesión queda en el log de Django
  (`django_admin_log`) con el valor anterior y el nuevo de cada campo.

### Barrios sin contorno en OpenStreetMap

Algunos barrios figuran solo como un punto. El importador les estima un contorno (el área
más cercana a ese barrio que a los vecinos, hasta 450 m) y lo marca como aproximado; en el
mapa se dibuja con línea punteada. Para datos ya cargados:

```powershell
python manage.py aproximar_barrios
```


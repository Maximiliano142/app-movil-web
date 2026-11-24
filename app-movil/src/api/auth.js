// API de autenticación de Django
import { guardar, leer } from '../util/almacen'
import { guardarCsrf, pedir } from './cliente'

export async function prepararCsrf() {
  const r = await pedir('/api/auth/csrf/')
  guardarCsrf(r.csrfToken)
}

export async function usuarioActual() {
  try {
    const { usuario } = await pedir('/api/auth/me/')
    return usuario
  } catch (error) {
    if (error.status === 401) return null
    throw error
  }
}

// En la web, sin "Recordar" la sesión terminaba al cerrar el navegador. En la
// app: sin "Recordar", al volver a abrirla se pide el login de nuevo.
const RECORDAR = 'sesion-recordada'
export const sesionRecordada = () => leer(RECORDAR) === '1'

// Se ingresa con el nombre de usuario (apellido + inicial del nombre)
export async function iniciarSesion(nombreDeUsuario, password, recordar = false) {
  const { usuario } = await pedir('/api/auth/login/', {
    method: 'POST',
    datos: { usuario: nombreDeUsuario, password, recordar },
  })
  guardar(RECORDAR, recordar ? '1' : null)
  guardar(ULTIMO_USUARIO, usuario.username)
  // Django rota el token CSRF al iniciar sesión
  await prepararCsrf().catch(() => {})
  return usuario
}

// Último nombre de usuario que ingresó en este celular: se propone en el
// login y en "¿Olvidó su contraseña?" para no tener que recordarlo
const ULTIMO_USUARIO = 'ultimo-usuario'
export const ultimoUsuario = () => leer(ULTIMO_USUARIO, '')

// Configuración → Mi perfil. Las tres devuelven el usuario actualizado.
export const guardarPerfil = (datos) => pedir('/api/auth/perfil/', { method: 'PATCH', datos }).then((r) => r.usuario)
export const guardarFoto = (foto) => pedir('/api/auth/foto/', { method: 'PUT', datos: { foto } }).then((r) => r.usuario)
export const quitarFoto = () => pedir('/api/auth/foto/', { method: 'DELETE' }).then((r) => r.usuario)

// Mi perfil → "Cambiar contraseña": el enlace llega al correo del usuario. Devuelve { email }
export const pedirCambioDeContrasena = () => pedir('/api/auth/cambiar-contrasena/', { method: 'POST' })

// "¿Olvidó su contraseña?": con el nombre de usuario, el enlace llega al correo asociado
export const pedirEnlace = (usuario) => pedir('/api/auth/olvide/', { method: 'POST', datos: { usuario } })

// Enlace del correo para elegir o restablecer la contraseña (/restablecer/:uid/:token)
export const comprobarEnlace = (uid, token) => pedir(`/api/auth/restablecer/${uid}/${token}/`)

export const restablecerContrasena = (uid, token, password, repetida) =>
  pedir(`/api/auth/restablecer/${uid}/${token}/`, { method: 'POST', datos: { password, repetida } })

export async function cerrarSesion() {
  guardar(RECORDAR, null)
  await pedir('/api/auth/logout/', { method: 'POST' })
  await prepararCsrf().catch(() => {})
}

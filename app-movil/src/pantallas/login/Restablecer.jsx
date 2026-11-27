import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { router } from 'expo-router'
import { Lock } from 'lucide-react-native'
import { comprobarEnlace, restablecerContrasena } from '../../api/auth'
import { ProveedorTemaClaro } from '../../tema/claro'
import { Boton, Entrada } from '../../ui'
import { contrasenaValida, MENSAJE_CONTRASENA, requisitosContrasena } from '../../util/validaciones'
import FondoLogin, { estilos } from './FondoLogin'

// Pantalla del enlace que llega por correo (sistemapolitico://restablecer/UID/TOKEN
// o la dirección web configurada): elegir la contraseña (la primera vez, desde
// la invitación, o una nueva). No hace falta haber iniciado sesión.
const INCOMPLETO = 'El enlace está incompleto. Ábralo desde el correo o cópielo completo (puede ocupar más de una línea).'

export default function Restablecer({ uid, token }) {
  const [estado, setEstado] = useState(token ? 'comprobando' : 'invalido') // comprobando | formulario | invalido | listo
  const [cuenta, setCuenta] = useState('')
  const [nueva, setNueva] = useState(false)
  const [password, setPassword] = useState('')
  const [repetida, setRepetida] = useState('')
  const [tocados, setTocados] = useState({ password: false, repetida: false })
  const [error, setError] = useState(token ? '' : INCOMPLETO)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!token) return
    comprobarEnlace(uid, token)
      .then((r) => {
        setCuenta(r.username || r.email)
        setNueva(Boolean(r.nueva))
        setEstado('formulario')
      })
      .catch((e) => {
        setError(e.message)
        setEstado('invalido')
      })
  }, [uid, token])

  const errores = {
    password: !password ? 'Ingrese la contraseña nueva.' : contrasenaValida(password) ? '' : MENSAJE_CONTRASENA,
    repetida: !repetida ? 'Repita la contraseña.' : repetida !== password ? 'Las contraseñas no coinciden.' : '',
  }
  const valores = { password, repetida }
  const verError = (campo) => (tocados[campo] || valores[campo] !== '' ? errores[campo] : '')
  const coinciden = repetida !== '' && !errores.password && !errores.repetida

  async function guardar() {
    setError('')
    setTocados({ password: true, repetida: true })
    if (errores.password || errores.repetida) return
    setGuardando(true)
    try {
      await restablecerContrasena(uid, token, password, repetida)
      setEstado('listo')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const titulo = {
    comprobando: 'Elegir contraseña',
    formulario: nueva ? 'Elegir contraseña' : 'Restablecer contraseña',
    invalido: 'Enlace no válido',
    listo: 'Contraseña guardada',
  }[estado]
  const subtitulo = {
    comprobando: 'Comprobando el enlace…',
    formulario: `Elija una contraseña para el usuario ${cuenta}`,
    invalido: 'No se puede usar este enlace.',
    listo: `Ya puede ingresar con su usuario ${cuenta} y su contraseña.`,
  }[estado]

  return (
    <ProveedorTemaClaro>
      <FondoLogin titulo={titulo} subtitulo={subtitulo}>
        {estado === 'formulario' && (
          <>
            <Entrada
              etiqueta="Contraseña nueva"
              icono={Lock}
              contrasena
              value={password}
              onChangeText={setPassword}
              onBlur={() => setTocados((t) => ({ ...t, password: true }))}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              maxLength={128}
              placeholder="••••••••"
              error={verError('password')}
              autoFocus
            />
            <View style={{ marginTop: -4, marginBottom: 12, gap: 2 }} accessibilityLabel="Requisitos de la contraseña">
              {requisitosContrasena(password).map((r) => (
                <Text key={r.texto} style={{ color: r.ok ? '#1f7a50' : '#5d5a66', fontSize: 13 }}>
                  {r.ok ? '✓' : '○'} {r.texto}
                </Text>
              ))}
            </View>
            <Entrada
              etiqueta="Repita la contraseña"
              icono={Lock}
              contrasena
              value={repetida}
              onChangeText={setRepetida}
              onBlur={() => setTocados((t) => ({ ...t, repetida: true }))}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={guardar}
              maxLength={128}
              placeholder="••••••••"
              error={verError('repetida')}
            />
            {coinciden ? <Text style={{ color: '#1f7a50', marginTop: -6, marginBottom: 12 }}>✓ Las contraseñas coinciden.</Text> : null}
          </>
        )}
        {error ? <Text style={estilos.error}>{error}</Text> : null}
        {estado === 'formulario' && (
          <Boton
            titulo={guardando ? 'Guardando…' : 'Guardar contraseña'}
            onPress={guardar}
            cargando={guardando}
            disabled={Boolean(errores.password || errores.repetida)}
            grande
          />
        )}
        {(estado === 'invalido' || estado === 'listo') && <Boton titulo="Ir a iniciar sesión" onPress={() => router.replace('/login')} grande />}
        {estado === 'invalido' && (
          <Text style={estilos.enlace} onPress={() => router.replace('/olvide')}>
            Solicitar un enlace nuevo
          </Text>
        )}
      </FondoLogin>
    </ProveedorTemaClaro>
  )
}

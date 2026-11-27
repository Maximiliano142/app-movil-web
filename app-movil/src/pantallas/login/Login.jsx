import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { Lock, User } from 'lucide-react-native'
import { iniciarSesion, ultimoUsuario } from '../../api/auth'
import { ProveedorTemaClaro } from '../../tema/claro'
import { MARCA } from '../../tema/tema'
import { Boton, Casilla, Entrada, Text } from '../../ui'
import { errorUsuario } from '../../util/validaciones'
import FondoLogin, { AvisoAcceso } from './FondoLogin'

// Login: nombre de usuario (apellido + inicial del nombre) y contraseña.
// onIngreso se ejecuta cuando el login sale bien.
export default function Login({ onIngreso }) {
  const [nombre, setNombre] = useState(ultimoUsuario)
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  // Los errores se muestran mientras se escribe y, si quedó vacío, al salir del campo o al enviar
  const [tocados, setTocados] = useState({ nombre: false, password: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // En el login solo se pide que la contraseña esté escrita: la regla (8 caracteres,
  // mayúscula, etc.) se exige al crearla. Si falla, el servidor da siempre el mismo mensaje.
  const errores = { nombre: errorUsuario(nombre), password: password ? '' : 'Ingrese su contraseña.' }
  const completo = Boolean(nombre.trim() && password)
  const valores = { nombre, password }
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))
  const verError = (campo) => (tocados[campo] || valores[campo] !== '' ? errores[campo] : '')

  async function enviar() {
    setError('')
    setTocados({ nombre: true, password: true })
    if (errores.nombre || errores.password) return
    setLoading(true)
    try {
      // "remember": si es false, al volver a abrir la app se pide el login
      const usuario = await iniciarSesion(nombre.trim(), password, remember)
      onIngreso?.(usuario)
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Por favor, verifique su usuario y contraseña.')
      setLoading(false)
    }
  }

  return (
    <ProveedorTemaClaro>
      <FondoLogin titulo="Iniciar sesión" subtitulo="Ingrese a su cuenta para continuar">
        <Entrada
          etiqueta="Nombre de usuario"
          icono={User}
          value={nombre}
          onChangeText={(t) => {
            setNombre(t)
            setError('')
          }}
          onBlur={tocar('nombre')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          maxLength={254}
          placeholder="apellido + inicial del nombre"
          error={verError('nombre')}
          ayuda="Su apellido y la primera letra de su nombre. Ejemplo: Juan Pérez → perezj"
        />
        <Entrada
          etiqueta="Contraseña"
          icono={Lock}
          contrasena
          value={password}
          onChangeText={(t) => {
            setPassword(t)
            setError('')
          }}
          onBlur={tocar('password')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={enviar}
          maxLength={128}
          placeholder="••••••••"
          error={verError('password')}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, marginBottom: 18 }}>
          <Casilla marcada={remember} onCambio={setRemember}>
            Recordar
          </Casilla>
          <Link href={{ pathname: '/olvide', params: { usuario: nombre.trim() } }} asChild>
            <Pressable hitSlop={8} accessibilityRole="link">
              <Text style={{ color: MARCA.violeta, fontSize: 14, fontWeight: '700' }}>¿Olvidó su usuario o contraseña?</Text>
            </Pressable>
          </Link>
        </View>
        <AvisoAcceso>{error}</AvisoAcceso>
        <Boton
          titulo={loading ? 'Ingresando…' : 'Iniciar sesión'}
          onPress={enviar}
          cargando={loading}
          disabled={!completo}
          grande
          style={{ alignSelf: 'center', width: '80%', minWidth: 220 }}
        />
      </FondoLogin>
    </ProveedorTemaClaro>
  )
}

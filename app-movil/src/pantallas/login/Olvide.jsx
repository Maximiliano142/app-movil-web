import { useState } from 'react'
import { View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { User } from 'lucide-react-native'
import { pedirEnlace, ultimoUsuario } from '../../api/auth'
import { ProveedorTemaClaro } from '../../tema/claro'
import { Boton, Entrada, Text } from '../../ui'
import { errorUsuario } from '../../util/validaciones'
import FondoLogin, { AvisoAcceso, COLORES, estilos } from './FondoLogin'

// El correo trae un enlace .../restablecer/UID/TOKEN. Si se abre en el celular
// y no lleva a la app, se puede copiar y pegar acá.
function PegarEnlace() {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  function abrir() {
    const m = texto.trim().match(/restablecer\/([^/\s]+)\/([^/\s?#]+)/)
    if (!m) return setError('Pegue el enlace completo que llegó por correo.')
    setError('')
    router.push(`/restablecer/${m[1]}/${m[2]}`)
  }
  return (
    <View style={{ marginTop: 22, borderTopWidth: 1, borderColor: COLORES.linea, paddingTop: 14 }}>
      <Entrada
        etiqueta="¿Ya tiene el enlace del correo? Péguelo acá"
        value={texto}
        onChangeText={setTexto}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="https://…/restablecer/…"
        error={error}
      />
      <Boton titulo="Abrir enlace" variante="borde" onPress={abrir} disabled={!texto.trim()} />
    </View>
  )
}

// "¿Olvidó su contraseña?": la persona confirma su nombre de usuario y el
// enlace para elegir una contraseña nueva se envía al correo asociado.
// La respuesta es siempre la misma, exista o no.
export default function Olvide() {
  const params = useLocalSearchParams()
  const [nombre, setNombre] = useState(() => params.usuario || ultimoUsuario())
  const [tocado, setTocado] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState('')
  const [enviando, setEnviando] = useState(false)

  const errorCampo = errorUsuario(nombre)
  const verError = (tocado || nombre !== '') && errorCampo

  async function enviar() {
    setError('')
    setTocado(true)
    if (errorCampo) return
    setEnviando(true)
    try {
      const r = await pedirEnlace(nombre.trim())
      setEnviado(r.mensaje)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ProveedorTemaClaro>
      <FondoLogin
        titulo={enviado ? 'Revise su correo' : 'Recuperar contraseña'}
        subtitulo={
          enviado
            ? 'El enlace vence en 24 horas y sirve una sola vez.'
            : 'Enviaremos al correo asociado a su usuario un enlace para elegir una contraseña nueva.'
        }
      >
        {enviado ? (
          <AvisoAcceso tipo="ok">{enviado}</AvisoAcceso>
        ) : (
          <>
            <Entrada
              etiqueta="Nombre de usuario"
              icono={User}
              value={nombre}
              onChangeText={setNombre}
              onBlur={() => setTocado(true)}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              returnKeyType="send"
              onSubmitEditing={enviar}
              maxLength={254}
              placeholder="apellido + inicial del nombre"
              autoFocus
              error={verError || ''}
              ayuda="Su apellido y la primera letra de su nombre. Ejemplo: Juan Pérez → perezj"
            />
            <AvisoAcceso>{error}</AvisoAcceso>
            <Boton titulo={enviando ? 'Enviando…' : 'Enviar enlace'} onPress={enviar} cargando={enviando} grande />
          </>
        )}
        <PegarEnlace />
        <Text style={estilos.enlace} onPress={() => router.replace('/login')} accessibilityRole="link">
          ← Volver a iniciar sesión
        </Text>
      </FondoLogin>
    </ProveedorTemaClaro>
  )
}

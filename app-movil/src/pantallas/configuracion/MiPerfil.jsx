import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Camera, Image as IconoImagen, KeyRound, Pencil, Trash2 } from 'lucide-react-native'
import { guardarFoto, guardarPerfil, pedirCambioDeContrasena, quitarFoto, usuarioActual } from '../../api/auth'
import { MARCA, useTema } from '../../tema/tema'
import { Acciones, Avatar, AvisoOk, Boton, Confirmacion, Entrada, Fila, Modal, Tarjeta, Texto, TextoError } from '../../ui'
import { errorEmail, errorPersona, useConCambios } from '../../util/validaciones'
import FichaUsuario from '../perfil/FichaUsuario'
import { elegirFotoCuadrada } from './foto'

// Mi perfil: puede cambiar su foto, modificar sus datos (nombre, apellido,
// correo, teléfono y dirección) y pedir el enlace para cambiar la contraseña.
function errorTelefono(valor) {
  const texto = valor.trim()
  if (!texto) return ''
  const cifras = texto.replace(/\D/g, '').length
  return /^\+?[\d\s()-]+$/.test(texto) && cifras >= 8 && cifras <= 15 ? '' : 'El teléfono debe tener entre 8 y 15 números.'
}

function EditarDatos({ usuario, onGuardado, onCerrar }) {
  const { c } = useTema()
  const [form, setForm] = useState({
    nombre: usuario.nombre ?? '',
    apellido: usuario.apellido ?? '',
    email: usuario.email ?? '',
    telefono: usuario.telefono ?? '',
    direccion: usuario.direccion ?? '',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const conCambios = useConCambios(form)
  const cambiar = (campo) => (v) => setForm((f) => ({ ...f, [campo]: v }))
  const errores = {
    nombre: form.nombre.trim() ? errorPersona(form.nombre) : 'Ingrese el nombre.',
    apellido: errorPersona(form.apellido, 'El apellido'),
    email: errorEmail(form.email),
    telefono: errorTelefono(form.telefono),
  }
  const valido = !Object.values(errores).some(Boolean)

  async function guardar() {
    if (!valido) return
    setError('')
    setGuardando(true)
    try {
      onGuardado(await guardarPerfil(form))
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal titulo="Editar mis datos" onCerrar={onCerrar}>
      <Fila gap={10} style={{ alignItems: 'flex-start' }}>
        <Entrada style={{ flex: 1 }} etiqueta="Nombre" value={form.nombre} onChangeText={cambiar('nombre')} maxLength={150} autoCapitalize="words" error={errores.nombre} />
        <Entrada style={{ flex: 1 }} etiqueta="Apellido (opcional)" value={form.apellido} onChangeText={cambiar('apellido')} maxLength={150} autoCapitalize="words" error={errores.apellido} />
      </Fila>
      <Entrada etiqueta="Correo electrónico" value={form.email} onChangeText={cambiar('email')} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254} error={errores.email} />
      <Fila gap={10} style={{ alignItems: 'flex-start' }}>
        <Entrada style={{ flex: 1 }} etiqueta="Teléfono (opcional)" value={form.telefono} onChangeText={cambiar('telefono')} keyboardType="phone-pad" maxLength={20} error={errores.telefono} />
        <Entrada style={{ flex: 1 }} etiqueta="Documento" value={usuario.documento || 'Sin cargar'} editable={false} />
      </Fila>
      <Entrada etiqueta="Dirección (opcional)" value={form.direccion} onChangeText={cambiar('direccion')} maxLength={200} autoCapitalize="sentences" />
      <Texto estilo="chico" style={{ backgroundColor: c.superficie2, padding: 10, borderRadius: 10 }}>
        El documento no se puede modificar. Al correo llegan los enlaces para cambiar la contraseña. Si cambia su nombre o su apellido, también cambia su nombre
        de usuario (apellido + inicial del nombre).
      </Texto>
      <TextoError>{error}</TextoError>
      <Acciones onCancelar={onCerrar}>
        <Boton titulo={guardando ? 'Guardando…' : 'Guardar cambios'} onPress={guardar} cargando={guardando} disabled={!valido || !conCambios} />
      </Acciones>
    </Modal>
  )
}

export default function MiPerfil({ usuario, onCambio }) {
  const { c } = useTema()
  const [editando, setEditando] = useState(false)
  const [confirmando, setConfirmando] = useState(null) // 'contrasena' | 'foto' | 'origen'
  const [subiendo, setSubiendo] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  // Datos frescos (por si cambiaron desde que se inició sesión)
  useEffect(() => {
    usuarioActual()
      .then((u) => u && onCambio(u))
      .catch(() => {})
  }, [onCambio])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(''), 8000)
    return () => clearTimeout(t)
  }, [aviso])

  async function cambiarContrasena() {
    setError('')
    try {
      const r = await pedirCambioDeContrasena()
      setAviso(`Se envió a ${r.email} un enlace para elegir una contraseña nueva. Revise su correo.`)
    } catch (e) {
      setError(e.message)
    } finally {
      setConfirmando(null)
    }
  }

  async function elegirFoto(conCamara) {
    setConfirmando(null)
    setError('')
    try {
      const foto = await elegirFotoCuadrada(conCamara)
      if (!foto) return
      setSubiendo(true)
      onCambio(await guardarFoto(foto))
      setAviso('Se actualizó su foto de perfil.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
    }
  }

  async function borrarFoto() {
    setError('')
    try {
      onCambio(await quitarFoto())
      setAviso('Se quitó su foto de perfil.')
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirmando(null)
    }
  }

  function guardado(nuevo) {
    const cambioUsuario = nuevo.username !== usuario.username
    onCambio(nuevo)
    setEditando(false)
    setAviso(
      cambioUsuario ? `Sus datos se guardaron. Su nombre de usuario ahora es «${nuevo.username}»: úselo para ingresar.` : 'Sus datos se guardaron correctamente.',
    )
  }

  const avatar = (
    <Pressable onPress={() => setConfirmando('origen')} disabled={subiendo} accessibilityLabel="Cambiar la foto de perfil">
      <Avatar usuario={usuario} tamano={72} />
      <View style={{ position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: MARCA.magenta, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.superficie }}>
        <Camera size={14} color="#fff" />
      </View>
    </Pressable>
  )

  return (
    <>
      <View style={{ gap: 8 }}>
        <Boton titulo="Editar mis datos" icono={Pencil} onPress={() => setEditando(true)} />
        <Fila gap={8}>
          <Boton flex titulo={subiendo ? 'Subiendo…' : usuario.foto ? 'Cambiar foto' : 'Subir foto'} icono={Camera} variante="borde" onPress={() => setConfirmando('origen')} cargando={subiendo} />
          {usuario.foto ? <Boton flex titulo="Quitar foto" icono={Trash2} variante="borde" onPress={() => setConfirmando('foto')} /> : null}
        </Fila>
        <Boton titulo="Cambiar contraseña" icono={KeyRound} variante="borde" onPress={() => setConfirmando('contrasena')} />
      </View>
      <AvisoOk>{aviso}</AvisoOk>
      <TextoError>{error}</TextoError>
      <Tarjeta>
        <FichaUsuario usuario={usuario} campana={usuario.campana?.nombre ?? ''} avatar={avatar} />
      </Tarjeta>

      {editando && <EditarDatos usuario={usuario} onGuardado={guardado} onCerrar={() => setEditando(false)} />}
      {confirmando === 'origen' && (
        <Modal titulo="Foto de perfil" onCerrar={() => setConfirmando(null)}>
          <View style={{ gap: 8 }}>
            <Boton titulo="Elegir de la galería" icono={IconoImagen} onPress={() => elegirFoto(false)} />
            <Boton titulo="Sacar una foto" icono={Camera} variante="borde" onPress={() => elegirFoto(true)} />
          </View>
        </Modal>
      )}
      {confirmando === 'contrasena' && (
        <Confirmacion titulo="Cambiar contraseña" textoConfirmar="Enviar enlace" peligro={false} onCerrar={() => setConfirmando(null)} onConfirmar={cambiarContrasena}>
          {`Se enviará a ${usuario.email} un enlace para elegir una contraseña nueva. Su contraseña actual sigue funcionando hasta que elija la nueva.`}
        </Confirmacion>
      )}
      {confirmando === 'foto' && (
        <Confirmacion titulo="Quitar foto" textoConfirmar="Quitar" onCerrar={() => setConfirmando(null)} onConfirmar={borrarFoto}>
          ¿Desea quitar su foto de perfil? Se mostrará la inicial de su nombre.
        </Confirmacion>
      )}
    </>
  )
}

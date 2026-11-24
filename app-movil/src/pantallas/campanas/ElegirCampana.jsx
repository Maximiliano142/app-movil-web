import { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { ArrowRight, Pencil, Plus } from 'lucide-react-native'
import * as api from '../../api/campanas'
import { MARCA, useTema } from '../../tema/tema'
import {
  Acciones,
  Boton,
  BotonIcono,
  Entrada,
  Fila,
  Franja,
  InterruptorCampo,
  Modal,
  Paginacion,
  Tarjeta,
  Texto,
  TextoError,
  VacioTarjeta,
  usePaginado,
} from '../../ui'
import { tiene } from '../../util/permisos'
import { useConCambios } from '../../util/validaciones'

// Crear o editar una campaña (nombre, descripción y si está activa)
function FormularioCampana({ campana, onGuardada, onCerrar }) {
  const [form, setForm] = useState({
    nombre: campana?.nombre ?? '',
    descripcion: campana?.descripcion ?? '',
    activa: campana?.activa ?? true,
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const conCambios = useConCambios(form)
  const cambiar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }))

  async function guardar() {
    setError('')
    setGuardando(true)
    try {
      onGuardada(campana ? await api.editarCampana(campana.id, form) : await api.crearCampana(form))
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal titulo={campana ? 'Editar campaña' : 'Nueva campaña'} onCerrar={onCerrar}>
      <Entrada etiqueta="Nombre" value={form.nombre} onChangeText={cambiar('nombre')} maxLength={150} autoCapitalize="sentences" autoFocus />
      <Entrada etiqueta="Descripción" value={form.descripcion} onChangeText={cambiar('descripcion')} maxLength={500} multiline />
      <InterruptorCampo valor={form.activa} onCambio={cambiar('activa')}>
        Activa
      </InterruptorCampo>
      <TextoError>{error}</TextoError>
      <Acciones onCancelar={onCerrar}>
        <Boton
          titulo={guardando ? 'Guardando…' : campana ? 'Guardar cambios' : 'Crear campaña'}
          onPress={guardar}
          cargando={guardando}
          disabled={!form.nombre.trim() || !conCambios}
        />
      </Acciones>
    </Modal>
  )
}

const resumen = (c) =>
  `${c.cuestionarios} cuestionario${c.cuestionarios === 1 ? '' : 's'} · ${c.usuarios} usuario${
    c.usuarios === 1 ? '' : 's'
  } · ${c.rutas} ruta${c.rutas === 1 ? '' : 's'}`

// Pantalla que ve quien puede elegir la campaña después de ingresar. Acá mismo
// se crean campañas nuevas y se activan o desactivan.
export default function ElegirCampana({ usuario, onElegida, onSalir }) {
  const { c } = useTema()
  const [campanas, setCampanas] = useState(null)
  const [error, setError] = useState('')
  const [entrando, setEntrando] = useState(null)
  const [editando, setEditando] = useState(null) // null | 'nueva' | campaña
  const puedeCrear = tiene(usuario, 'core.add_campana')
  const puedeEditar = tiene(usuario, 'core.change_campana')

  useEffect(() => {
    api
      .obtenerCampanas()
      .then(setCampanas)
      .catch((e) => setError(e.message))
  }, [])

  const activas = (campanas ?? []).filter((x) => x.activa).sort((a, b) => a.nombre.localeCompare(b.nombre))
  const inactivas = (campanas ?? []).filter((x) => !x.activa).sort((a, b) => a.nombre.localeCompare(b.nombre))
  const paginado = usePaginado(activas)

  async function entrar(campana) {
    setError('')
    setEntrando(campana.id)
    try {
      onElegida(await api.elegirCampana(campana.id))
    } catch (e) {
      setError(e.message)
      setEntrando(null)
    }
  }

  function guardada(campana) {
    setCampanas((lista) => {
      const sin = (lista ?? []).filter((x) => x.id !== campana.id)
      const anterior = (lista ?? []).find((x) => x.id === campana.id)
      // Al crear o editar, el servidor no manda los conteos: se conservan los que había
      return [...sin, { cuestionarios: 0, usuarios: 0, rutas: 0, ...anterior, ...campana }]
    })
    setEditando(null)
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.fondo }}>
      <Svg style={{ position: 'absolute', top: 0, right: 0 }} width={220} height={90} viewBox="0 0 400 140" preserveAspectRatio="none">
        <Path d="M0 0h400v140c-40 6-80-2-110-22C250 92 215 50 160 48 105 46 60 70 0 104Z" fill={MARCA.violeta} />
      </Svg>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14, maxWidth: 760, width: '100%', alignSelf: 'center' }}>
          <Image source={require('../../../assets/img/logo.png')} style={{ width: 64, height: 64 }} resizeMode="contain" />
          <View>
            <Texto estilo="titulo" accessibilityRole="header">
              Seleccione la campaña
            </Texto>
            <Texto estilo="suave" style={{ marginTop: 4, marginBottom: 10 }}>
              Bienvenido/a, {usuario.nombre || usuario.email}. Seleccione la campaña en la que va a trabajar: se mostrarán solo sus datos.
            </Texto>
            <Franja />
          </View>
          {puedeCrear && <Boton titulo="Nueva campaña" icono={Plus} onPress={() => setEditando('nueva')} grande />}
          <TextoError>{error}</TextoError>

          {campanas === null ? (
            <VacioTarjeta>Cargando…</VacioTarjeta>
          ) : activas.length === 0 ? (
            <VacioTarjeta titulo="No hay campañas activas.">
              {puedeCrear ? 'Cree una campaña para comenzar.' : 'Solicite a la administración que cree una.'}
            </VacioTarjeta>
          ) : (
            <>
              {paginado.items.map((x) => (
                <Fila key={x.id} gap={8} style={{ alignItems: 'stretch' }}>
                  <Pressable
                    onPress={() => entrar(x)}
                    disabled={entrando !== null}
                    accessibilityRole="button"
                    style={({ pressed }) => ({
                      flex: 1,
                      backgroundColor: c.superficie,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: pressed ? MARCA.violeta : c.linea,
                      padding: 16,
                      gap: 4,
                      opacity: entrando !== null && entrando !== x.id ? 0.6 : 1,
                    })}
                  >
                    <Text style={{ color: c.texto, fontSize: 17, fontWeight: '800' }}>{x.nombre}</Text>
                    {x.descripcion ? <Texto estilo="suave">{x.descripcion}</Texto> : null}
                    <Texto estilo="chico">{resumen(x)}</Texto>
                    <Fila gap={4} style={{ marginTop: 6 }}>
                      <Text style={{ color: c.violetaTexto, fontWeight: '700' }}>{entrando === x.id ? 'Ingresando…' : 'Ingresar'}</Text>
                      {entrando !== x.id && <ArrowRight size={16} color={c.violetaTexto} />}
                    </Fila>
                  </Pressable>
                  {puedeEditar && <BotonIcono icono={Pencil} etiqueta={`Editar ${x.nombre}`} ayuda="Editar o desactivar" onPress={() => setEditando(x)} />}
                </Fila>
              ))}
              <Paginacion {...paginado} />
            </>
          )}

          {inactivas.length > 0 && (
            <Tarjeta style={{ gap: 10 }}>
              <Texto estilo="subtitulo">Campañas desactivadas</Texto>
              {inactivas.map((x) => (
                <Fila key={x.id} style={{ justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Texto estilo="negrita">{x.nombre}</Texto>
                    <Texto estilo="chico">{resumen(x)}</Texto>
                  </View>
                  {puedeEditar && <Boton titulo="Editar" variante="borde" chico onPress={() => setEditando(x)} />}
                </Fila>
              ))}
            </Tarjeta>
          )}

          <Text onPress={onSalir} style={{ color: c.violetaTexto, fontWeight: '700', textAlign: 'center', padding: 14 }} accessibilityRole="button">
            Cerrar sesión
          </Text>
        </ScrollView>
      </SafeAreaView>

      {editando && <FormularioCampana campana={editando === 'nueva' ? null : editando} onGuardada={guardada} onCerrar={() => setEditando(null)} />}
    </View>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { AppState, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Bell, BellOff, CirclePlus, ClipboardCheck, ClipboardList, Pencil, Trash2 } from 'lucide-react-native'
import { obtenerAvisos } from '../../api/avisos'
import { MARCA, useTema } from '../../tema/tema'
import { Boton, Modal, Texto } from '../../ui'
import { guardar, leer } from '../../util/almacen'
import { tiene } from '../../util/permisos'

// Campanita de la barra superior con los avisos automáticos del sistema
// (los arma el backend en core/avisos_views.py). El número rojo son los avisos
// nuevos desde la última vez que se abrió. Se actualiza sola cada minuto
// mientras la app está a la vista.
const CADA = 60 * 1000
const ICONOS = { asignacion: ClipboardList, encuesta: ClipboardCheck, crear: CirclePlus, editar: Pencil, borrar: Trash2 }
const COLORES = { asignacion: MARCA.violeta, encuesta: MARCA.celeste, crear: '#1f8a5b', editar: MARCA.naranja, borrar: MARCA.rojo }

export function hace(iso) {
  const segundos = (new Date(iso) - Date.now()) / 1000
  const minutos = Math.round(segundos / 60)
  if (minutos > -1) return 'recién'
  if (minutos > -60) return `hace ${-minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas > -24) return `hace ${-horas} h`
  const dias = Math.round(horas / 24)
  if (dias === -1) return 'ayer'
  if (dias > -7) return `hace ${-dias} días`
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Avisos({ usuario }) {
  const { c } = useTema()
  const clave = `avisos-vistos-${usuario.id}`
  const [avisos, setAvisos] = useState(null)
  const [error, setError] = useState(false)
  const [visto, setVisto] = useState(() => Number(leer(clave)) || 0)
  const [abierto, setAbierto] = useState(false)
  const [nuevosDesde, setNuevosDesde] = useState(null)

  const cargar = useCallback(() => {
    obtenerAvisos()
      .then((lista) => {
        setAvisos(lista)
        setError(false)
      })
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    cargar()
    const reloj = setInterval(() => AppState.currentState === 'active' && cargar(), CADA)
    const sub = AppState.addEventListener('change', (e) => e === 'active' && cargar())
    return () => {
      clearInterval(reloj)
      sub.remove()
    }
  }, [cargar, usuario.campana?.id])

  const esNuevo = (a, desde) => new Date(a.fecha).getTime() > desde
  const sinLeer = (avisos ?? []).filter((a) => esNuevo(a, visto)).length

  function abrir() {
    cargar()
    setNuevosDesde(visto)
    const masNuevo = avisos?.length ? new Date(avisos[0].fecha).getTime() : 0
    const marca = Math.max(Date.now(), masNuevo)
    setVisto(marca)
    guardar(clave, marca)
    setAbierto(true)
  }

  function ir(ruta) {
    setAbierto(false)
    if (ruta) router.navigate(ruta)
  }

  return (
    <>
      <Pressable onPress={abrir} hitSlop={6} accessibilityLabel={sinLeer ? `Avisos: ${sinLeer} sin leer` : 'Avisos'} style={{ padding: 6 }}>
        <Bell size={22} color={c.texto} />
        {sinLeer > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: MARCA.rojo,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{sinLeer > 9 ? '9+' : sinLeer}</Text>
          </View>
        )}
      </Pressable>
      {abierto && (
        <Modal titulo="Avisos" onCerrar={() => setAbierto(false)}>
          {avisos?.length > 0 && (
            <Texto estilo="chico" style={{ marginBottom: 8 }}>
              Últimos 30 días
            </Texto>
          )}
          {error && !avisos ? (
            <Texto estilo="suave">No se pudieron cargar los avisos.</Texto>
          ) : avisos === null ? (
            <Texto estilo="suave">Cargando…</Texto>
          ) : avisos.length === 0 ? (
            <View style={{ alignItems: 'center', gap: 8, paddingVertical: 20 }}>
              <BellOff size={28} color={c.gris} strokeWidth={1.5} />
              <Texto estilo="suave">No tiene avisos por ahora.</Texto>
            </View>
          ) : (
            avisos.map((a) => {
              const Icono = ICONOS[a.tipo] ?? Bell
              const nuevo = nuevosDesde !== null && esNuevo(a, nuevosDesde)
              return (
                <Pressable
                  key={a.id}
                  onPress={() => ir(a.enlace)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    gap: 10,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: nuevo ? c.superficie2 : pressed ? c.superficie2 : 'transparent',
                  })}
                >
                  <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: (COLORES[a.tipo] ?? MARCA.violeta) + '22' }}>
                    <Icono size={17} color={COLORES[a.tipo] ?? MARCA.violeta} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Texto estilo="negrita">{a.titulo}</Texto>
                    <Texto estilo="suave">{a.texto}</Texto>
                    <Texto estilo="chico">{hace(a.fecha)}</Texto>
                  </View>
                  {nuevo && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: MARCA.magenta, marginTop: 6 }} accessibilityLabel="Nuevo" />}
                </Pressable>
              )
            })
          )}
          {tiene(usuario, 'admin.view_logentry') && (
            <Boton titulo="Ver toda la actividad" variante="borde" onPress={() => ir('/actividad')} style={{ marginTop: 10 }} />
          )}
        </Modal>
      )}
    </>
  )
}

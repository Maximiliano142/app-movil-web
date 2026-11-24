import { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, Pressable, Text, View, useWindowDimensions } from 'react-native'
import { router } from 'expo-router'
import { ArrowRight, Flag, Mail } from 'lucide-react-native'
import { obtenerCuestionarios } from '../../api/cuestionarios'
import { obtenerEncuestasPorDia, obtenerParaResponder } from '../../api/encuestas'
import { obtenerRutas, obtenerZonas } from '../../api/mapa'
import { MARCA, useTema } from '../../tema/tema'
import { Avatar, Franja, Pagina, Tarjeta, Texto, isoLocal } from '../../ui'
import { seccionesPara } from '../../util/opciones'
import { tiene } from '../../util/permisos'
import { nombreDe, rolDe } from '../../util/usuario'

const COLORES = ['celeste', 'violeta', 'naranja', 'magenta']

// Accesos de la pantalla de inicio: solo las secciones del día a día, en este orden y con su color.
const TARJETAS = [
  { ruta: '/cuestionarios', color: 'violeta' },
  { ruta: '/responder', color: 'magenta' },
  { ruta: '/mapa', color: 'celeste' },
  { ruta: '/mi-ruta', color: 'celeste' },
  { ruta: '/equipos', color: 'naranja' },
  { ruta: '/usuarios', color: 'violeta' },
]
const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Números del tablero según los permisos del usuario: solo se pide lo que puede ver.
async function cargarResumen(usuario) {
  const cantidad = (promesa) => promesa.then((l) => l.length).catch(() => null)
  const si = (permiso, pedir) => (tiene(usuario, permiso) ? pedir() : undefined)

  const [cuestionarios, zonas, rutas, paraCargar] = await Promise.all([
    si('core.view_cuestionario', () => obtenerCuestionarios().catch(() => null)),
    si('core.view_zona', () => cantidad(obtenerZonas())),
    si('core.view_ruta', () => cantidad(obtenerRutas())),
    si('core.add_encuesta', () => cantidad(obtenerParaResponder())),
  ])
  const numeros = [
    cuestionarios !== undefined && { texto: 'Cuestionarios activos', valor: cuestionarios && cuestionarios.filter((c) => c.activo).length },
    cuestionarios !== undefined && { texto: 'Encuestas cargadas', valor: cuestionarios && cuestionarios.reduce((t, c) => t + c.encuestas, 0) },
    zonas !== undefined && { texto: 'Zonas', valor: zonas },
    rutas !== undefined && { texto: 'Rutas', valor: rutas },
    paraCargar !== undefined && { texto: 'Encuestas para cargar', valor: paraCargar },
  ].filter(Boolean)
  return {
    numeros: numeros.slice(0, 4),
    ultimos: [...(cuestionarios ?? [])].sort((a, b) => b.creado_en.localeCompare(a.creado_en)).slice(0, 4),
  }
}

function semanaActual() {
  const hoy = new Date()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    return { dia: DIAS[i], numero: d.getDate(), fecha: isoLocal(d), esHoy: d.toDateString() === hoy.toDateString(), futuro: d > hoy }
  })
}

function saludo() {
  const hora = new Date().getHours()
  if (hora >= 6 && hora < 12) return 'Buenos días'
  return hora >= 12 && hora < 20 ? 'Buenas tardes' : 'Buenas noches'
}

const fechaCorta = (iso) => new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

// Número que cuenta desde 0 hasta su valor (700ms, frenando al final)
function Contador({ valor, style }) {
  const [mostrado, setMostrado] = useState(0)
  useEffect(() => {
    let cuadro
    let vigente = true
    AccessibilityInfo.isReduceMotionEnabled().then((reducir) => {
      if (!vigente) return
      if (reducir || !valor) return setMostrado(valor)
      const inicio = Date.now()
      const paso = () => {
        const t = Math.min(1, (Date.now() - inicio) / 700)
        setMostrado(Math.round(valor * (1 - (1 - t) ** 3)))
        if (t < 1) cuadro = requestAnimationFrame(paso)
      }
      cuadro = requestAnimationFrame(paso)
    })
    return () => {
      vigente = false
      cancelAnimationFrame(cuadro)
    }
  }, [valor])
  return <Text style={style}>{mostrado.toLocaleString('es-AR')}</Text>
}

function Barra({ alto, orden, color }) {
  const valor = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(valor, { toValue: alto, duration: 500, delay: orden * 60, useNativeDriver: false }).start()
  }, [alto, orden, valor])
  return (
    <Animated.View
      style={{
        width: 14,
        borderRadius: 7,
        backgroundColor: color,
        height: valor.interpolate({ inputRange: [0, 1], outputRange: [4, 60] }),
      }}
    />
  )
}

export default function Inicio({ usuario }) {
  const { c } = useTema()
  const { width } = useWindowDimensions()
  const [resumen, setResumen] = useState(null)
  const permitidas = seccionesPara(usuario).flatMap((s) => s.opciones)
  const tarjetas = TARJETAS.map((t) => {
    const opcion = permitidas.find((o) => o.ruta === t.ruta)
    return opcion && { ...opcion, color: t.color }
  }).filter(Boolean)
  const colorDe = { violeta: MARCA.violeta, magenta: MARCA.magenta, celeste: MARCA.celeste, naranja: MARCA.naranja }
  const columnas = width >= 700 ? 3 : 2

  const cargar = () => cargarResumen(usuario).then(setResumen)
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])

  const [semana] = useState(semanaActual)
  const verEncuestas = tiene(usuario, 'core.view_encuesta')
  const [porDia, setPorDia] = useState(null)
  useEffect(() => {
    if (!verEncuestas) return
    obtenerEncuestasPorDia(semana[0].fecha, semana[6].fecha)
      .then((dias) => setPorDia(Object.fromEntries(dias.map((d) => [d.fecha, d.encuestas]))))
      .catch(() => setPorDia(null))
  }, [verEncuestas, semana])
  const maximo = porDia ? Math.max(1, ...Object.values(porDia)) : 1
  const totalSemana = porDia ? Object.values(porDia).reduce((t, n) => t + n, 0) : 0
  const mes = (() => {
    const texto = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    return texto.charAt(0).toUpperCase() + texto.slice(1)
  })()

  return (
    <Pagina alRefrescar={cargar}>
      <View>
        <Texto estilo="titulo" accessibilityRole="header">
          {saludo()}, {usuario.nombre || nombreDe(usuario)}
        </Texto>
        <Texto estilo="suave" style={{ marginTop: 4, marginBottom: 10 }}>
          ¿Qué desea gestionar hoy?
        </Texto>
        <Franja />
      </View>

      <Tarjeta style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <Avatar usuario={usuario} tamano={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <Texto estilo="negrita" style={{ fontSize: 17 }}>
            {nombreDe(usuario)}
          </Texto>
          <Text style={{ color: c.magentaTexto, fontWeight: '700', fontSize: 13 }}>{rolDe(usuario)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Mail size={13} color={c.gris} />
            <Texto estilo="chico" numberOfLines={1} style={{ flex: 1 }}>
              {usuario.email}
            </Texto>
          </View>
          {usuario.campana && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Flag size={13} color={c.gris} />
              <Texto estilo="chico" numberOfLines={1}>
                {usuario.campana.nombre}
              </Texto>
            </View>
          )}
        </View>
      </Tarjeta>

      {tarjetas.length === 0 && (
        <Tarjeta>
          <Texto estilo="negrita">Todavía no tiene secciones habilitadas</Texto>
          <Texto estilo="suave">Solicite a la administración que le asigne un rol con permisos.</Texto>
        </Tarjeta>
      )}

      {(resumen === null || resumen.numeros.length > 0) && (
        <Tarjeta style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }} accessibilityLabel="Resumen">
          {(resumen?.numeros ?? [{ texto: 'Cargando…', valor: null }]).map((n, i) => {
            const color = colorDe[COLORES[(i + 1) % COLORES.length]]
            return (
              <View key={n.texto} style={{ flexBasis: '46%', flexGrow: 1, borderLeftWidth: 4, borderLeftColor: color, paddingLeft: 10, paddingVertical: 4 }}>
                {resumen && n.valor != null ? (
                  <Contador valor={n.valor} style={{ color: c.texto, fontSize: 26, fontWeight: '800' }} />
                ) : (
                  <Text style={{ color: c.texto, fontSize: 26, fontWeight: '800' }}>{resumen ? '–' : '·'}</Text>
                )}
                <Texto estilo="chico">{n.texto}</Texto>
              </View>
            )
          })}
        </Tarjeta>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }} accessibilityLabel="Secciones">
        {tarjetas.map(({ ruta, texto, descripcion, icono: Icono, color }, i) => {
          const grande = tarjetas.length % columnas !== 0 && i < tarjetas.length % columnas
          return (
            <Pressable
              key={ruta}
              onPress={() => router.navigate(ruta)}
              accessibilityRole="link"
              style={({ pressed }) => ({
                flexBasis: grande && tarjetas.length % columnas === 1 ? '100%' : `${100 / columnas - 2}%`,
                flexGrow: 1,
                minHeight: 120,
                backgroundColor: colorDe[color],
                borderRadius: 16,
                padding: 14,
                justifyContent: 'space-between',
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' }}>
                <Icono size={22} color="#fff" />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{texto}</Text>
                  {descripcion ? <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5 }}>{descripcion}</Text> : null}
                </View>
                <ArrowRight size={16} color="#fff" />
              </View>
            </Pressable>
          )
        })}
      </View>

      <Tarjeta style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Texto estilo="subtitulo">Esta semana</Texto>
          <Texto estilo="suave">{mes}</Texto>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {semana.map((d, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 4, flex: 1 }} accessibilityLabel={d.futuro || !porDia ? undefined : `${porDia[d.fecha] ?? 0} encuestas`}>
              <Texto estilo="chico">{d.dia}</Texto>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: d.esHoy ? MARCA.violeta : 'transparent',
                }}
              >
                <Text style={{ color: d.esHoy ? '#fff' : c.texto, fontWeight: '700' }}>{d.numero}</Text>
              </View>
              {porDia && (
                <View style={{ height: 80, justifyContent: 'flex-end', alignItems: 'center' }}>
                  {!d.futuro && (
                    <>
                      <Barra alto={(porDia[d.fecha] ?? 0) / maximo} orden={i} color={d.esHoy ? MARCA.magenta : MARCA.celeste} />
                      <Texto estilo="chico" style={{ fontSize: 11 }}>
                        {porDia[d.fecha] ?? 0}
                      </Texto>
                    </>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
        {porDia && (
          <Texto estilo="suave" style={{ textAlign: 'center' }}>
            {totalSemana === 1 ? '1 encuesta cargada' : `${totalSemana} encuestas cargadas`} esta semana
          </Texto>
        )}
      </Tarjeta>

      {tiene(usuario, 'core.view_cuestionario') && (
        <Tarjeta style={{ gap: 8 }}>
          <Texto estilo="subtitulo">Últimos cuestionarios</Texto>
          {resumen === null ? (
            <Texto estilo="suave">Cargando…</Texto>
          ) : resumen.ultimos.length === 0 ? (
            <Texto estilo="suave">Cuando se creen cuestionarios, aquí se mostrarán los últimos.</Texto>
          ) : (
            resumen.ultimos.map((q) => (
              <Pressable
                key={q.id}
                onPress={() => router.navigate(tiene(usuario, 'core.view_encuesta') ? `/cuestionarios/${q.id}/estadisticas` : `/cuestionarios/${q.id}`)}
                style={({ pressed }) => ({ padding: 10, borderRadius: 10, backgroundColor: pressed ? c.superficie2 : c.fondo })}
              >
                <Texto estilo="negrita">{q.titulo}</Texto>
                <Texto estilo="chico">
                  {fechaCorta(q.creado_en)} · {q.encuestas === 1 ? '1 encuesta' : `${q.encuestas} encuestas`}
                </Texto>
              </Pressable>
            ))
          )}
        </Tarjeta>
      )}
    </Pagina>
  )
}

/* Pruebas de humo: dibuja cada pantalla con datos de ejemplo (sin servidor) y prueba
   algunas acciones básicas. Correr con: npm test */
import { act, render, screen } from '@testing-library/react-native'
import { Image } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ProveedorTema } from '../src/tema/tema'

jest.spyOn(Image, 'getSize').mockImplementation((u, ok) => ok && ok(320, 240))

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))
jest.mock('react-native-maps', () => {
  const { View } = require('react-native')
  const C = (p) => <View {...p} />
  const M = require('react').forwardRef((p, ref) => {
    require('react').useImperativeHandle(ref, () => ({ fitToCoordinates: () => {} }))
    return <View>{p.children}</View>
  })
  return { __esModule: true, default: M, Marker: C, Polygon: C, Polyline: C, Circle: C, Callout: C }
})
jest.mock('expo-video', () => {
  const { View } = require('react-native')
  return { useVideoPlayer: () => ({ addListener: () => ({ remove() {} }), play() {} }), VideoView: () => <View /> }
})
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native')
  const icono = () => <View />
  return new Proxy({ __esModule: true }, { get: (o, k) => (k in o ? o[k] : icono) })
})
jest.mock('expo', () => ({ useEvent: (_p, _e, inicial) => inicial }))
jest.mock('expo-print', () => ({}))
jest.mock('expo-sharing', () => ({}))
jest.mock('expo-file-system/legacy', () => ({}))
jest.mock('expo-asset', () => ({ Asset: {} }))
jest.mock('expo-image-picker', () => ({}))
jest.mock('expo-image-manipulator', () => ({}))
jest.mock('expo-constants', () => ({ expoConfig: { extra: { apiUrl: 'http://x' } } }))
jest.mock('@react-native-community/datetimepicker', () => () => null)
jest.mock('expo-router', () => {
  const React = require('react')
  return {
    router: { push: jest.fn(), replace: jest.fn(), navigate: jest.fn(), back: jest.fn(), canGoBack: () => true, setParams: jest.fn() },
    useLocalSearchParams: () => ({}),
    usePathname: () => '/inicio',
    useNavigation: () => ({ addListener: () => () => {}, dispatch() {} }),
    useFocusEffect: (fn) => React.useEffect(() => fn(), []),
    Redirect: ({ href }) => { const { Text } = require('react-native'); return <Text>REDIRECT {String(href)}</Text> },
    Link: ({ children }) => children,
  }
})

const usuario = {
  id: 1, email: 'a@b.com', username: 'perezj', nombre: 'Juan', apellido: 'Pérez', es_superusuario: true, grupos: ['Admin'],
  permisos: ['core.view_zona','core.add_zona','core.change_zona','core.delete_zona','core.view_ruta','core.add_ruta','core.change_ruta','core.delete_ruta','core.view_equipo','core.add_equipo','core.change_equipo','core.view_categoria','core.change_categoria','core.view_cuestionario','core.add_cuestionario','core.change_cuestionario','core.delete_cuestionario','core.view_encuesta','core.add_encuesta','core.view_usuario','core.add_usuario','core.change_usuario','core.view_grupo','auth.view_group','admin.view_logentry','core.view_asignacioncuestionario','core.change_asignacioncuestionario','core.add_campana','core.change_campana','core.view_campana'],
  puede_elegir_campana: true, campana: { id: 1, nombre: 'Campaña 2027' }, documento: '30111222', telefono: '', direccion: '', foto: '', equipo: 'Norte',
  ultimo_ingreso: '2026-11-20T10:00:00Z', alta: '2026-01-01T10:00:00Z',
}
const poligono = { type: 'Polygon', coordinates: [[[-64.2, -31.4], [-64.1, -31.4], [-64.1, -31.3], [-64.2, -31.4]]] }
const linea = { type: 'LineString', coordinates: [[-64.2, -31.4], [-64.1, -31.3]] }
const cuestionario = { id: 7, titulo: 'Seguridad barrial', descripcion: 'Desc', categoria: { id: 2, nombre: 'Seguridad' }, activo: true, preguntas: 2, encuestas: 3, creado_en: '2026-10-01T10:00:00Z' }
const preguntaEst = (id, variable) => ({ id, enunciado: 'P' + id, tipo: 'una_opcion', variable, obligatoria: true, respondidas: 3, sin_responder: 1, elecciones: 3,
  opciones: [{ id: 1, texto: variable === 'cuantitativa' ? '1' : 'Sí', cantidad: 2 }, { id: 2, texto: variable === 'cuantitativa' ? '2' : 'No', cantidad: 1 }],
  medidas: variable === 'cuantitativa' ? { media: 1.3, mediana: 1, moda: [1], desvio: 0.5, minimo: 1, maximo: 2, rango: 1 } : null })

const mockDATOS = [
  [/^\/api\/auth\/me\//, { usuario }],
  [/^\/api\/campanas\/$/, { campanas: [{ id: 1, nombre: 'Campaña 2027', descripcion: 'x', activa: true, cuestionarios: 1, usuarios: 2, rutas: 3 }, { id: 2, nombre: 'Vieja', activa: false, cuestionarios: 0, usuarios: 0, rutas: 0 }] }],
  [/^\/api\/cuestionarios\/$/, { cuestionarios: [cuestionario] }],
  [/^\/api\/cuestionarios\/7\/estadisticas\//, { cuestionario: { titulo: 'Seguridad barrial', categoria: 'Seguridad', activo: true, creado_en: '2026-10-01' }, campana: 'C', generado_por: 'Juan', total_encuestas: 3, militantes: 1, ultima_encuesta: '2026-11-01T10:00:00Z', preguntas: [preguntaEst(1, 'cualitativa'), preguntaEst(2, 'cuantitativa')] }],
  [/^\/api\/cuestionarios\/7\/asignaciones\//, { cuestionario: { categoria: 'Seguridad', preguntas: 2, activo: false, descripcion: '' }, equipos: [{ id: 1, nombre: 'Norte', activo: true, usuarios: [{ id: 3, nombre: 'Ana', email: 'a@x', asignado: true, elegible: true }, { id: 4, nombre: 'Leo', email: 'l@x', asignado: false, elegible: false }] }], sin_equipo: [{ id: 5, nombre: 'Sol', email: 's@x', asignado: false, elegible: true }], asignados: 1 }],
  [/^\/api\/cuestionarios\/7\/$/, { cuestionario: { ...cuestionario, categoria: 2, bloqueado: true, preguntas: [{ id: 1, enunciado: '¿Edad?', obligatoria: true, opciones: [{ id: 1, texto: '18' }, { id: 2, texto: '30' }] }] } }],
  [/^\/api\/categorias\//, { categorias: [{ id: 2, nombre: 'Seguridad', descripcion: 'd', activa: true, cuestionarios: 1 }, { id: 3, nombre: 'Salud', descripcion: '', activa: false, cuestionarios: 0 }] }],
  [/^\/api\/mapa\/zonas\//, { zonas: [{ id: 1, nombre: 'Norte', color: '#51318f', geometria: poligono, barrios: [{ id: 1, nombre: 'Centro' }] }] }],
  [/^\/api\/mapa\/rutas\//, { rutas: [{ id: 1, nombre: 'R1', perfil: 'foot-walking', descripcion: '', geometria: linea, paradas: [[-64.2, -31.4], [-64.1, -31.3]], zonas: ['Norte'], distancia_m: 1200, duracion_s: 900, calles: 'A, B', equipos: ['Norte'] }] }],
  [/^\/api\/mapa\/barrios\//, { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: poligono, properties: { id: 1, nombre: 'Centro', zona: 1 } }, { type: 'Feature', geometry: { type: 'Point', coordinates: [-64.15, -31.35] }, properties: { id: 2, nombre: 'Punto', zona: null } }] }],
  [/^\/api\/mapa\/encuestas\//, { features: [{ geometry: { coordinates: [-64.15, -31.35] }, properties: { id: 1, cuestionario: 'Q', militante: 'Ana', fecha: '2026-11-01T10:00:00Z' } }] }],
  [/^\/api\/mi-ruta\//, { equipo: { nombre: 'Norte' }, ruta: { nombre: 'R1', perfil: 'foot-walking', descripcion: 'x', geometria: linea, paradas: [[-64.2, -31.4], [-64.1, -31.3]], zonas: ['Norte'], distancia_m: 1200, duracion_s: 900 } }],
  [/^\/api\/responder\/$/, { cuestionarios: [{ id: 7, titulo: 'Seguridad', categoria: 'Seg', descripcion: '', preguntas: 2 }] }],
  [/^\/api\/responder\/7\//, { cuestionario: { titulo: 'Seguridad', categoria: 'Seg', descripcion: '', preguntas: [{ id: 1, enunciado: '¿A?', obligatoria: true, tipo: 'una_opcion', opciones: [{ id: 1, texto: 'Sí' }] }, { id: 2, enunciado: '¿B?', obligatoria: false, tipo: 'opcion_multiple', opciones: [{ id: 3, texto: 'X' }] }] } }],
  [/^\/api\/encuestas\/por-dia\//, { dias: [{ fecha: '2026-11-23', encuestas: 4 }] }],
  [/^\/api\/equipos\//, { equipos: [{ id: 1, nombre: 'Norte', activo: true, ruta: 1, ruta_nombre: 'R1', usuarios: [{ id: 3, nombre: 'Ana', email: 'a@x' }] }], rutas: [{ id: 1, nombre: 'R1' }], usuarios_disponibles: [{ id: 5, nombre: 'Sol', email: 's@x' }] }],
  [/^\/api\/usuarios\//, { usuarios: [{ id: 1, nombre: 'Juan', apellido: 'Pérez', username: 'perezj', email: 'a@b.com', activo: true, grupos: [{ id: 1, nombre: 'Admin' }], ultimo_ingreso: null, alta: '2026-01-01T00:00:00Z' }, { id: 2, nombre: 'Ana', apellido: '', username: 'anaa', email: 'n@b.com', activo: false, grupos: [], ultimo_ingreso: '2026-11-01T00:00:00Z' }], grupos: [{ id: 1, nombre: 'Admin' }] }],
  [/^\/api\/permisos\//, { grupos: [{ id: 1, nombre: 'Admin', usuarios: 1, permisos: [{ seccion: 'Mapa', acciones: ['Ver', 'Crear'] }] }], usuarios: [{ id: 1, nombre: 'Juan', email: 'a', superusuario: true, grupos: ['Admin'] }] }],
  [/^\/api\/grupos\/$/, { grupos: [{ id: 1, nombre: 'Admin', permisos: [1, 2], usuarios: [{ id: 1, nombre: 'Juan', email: 'a', activo: true }, { id: 2, nombre: 'Ana', email: 'n', activo: false }], total_usuarios: 2 }] }],
  [/^\/api\/historial\//, { total: 2, pagina: 1, paginas: 1, filtros: { usuarios: [{ id: 1, nombre: 'Juan' }], secciones: [{ id: 'mapa', nombre: 'Mapa' }] }, movimientos: [{ id: 1, fecha: '2026-11-20T10:00:00Z', accion: 'editar', usuario: { nombre: 'Juan' }, seccion: 'Zona', objeto: 'Norte', detalle: '', cambios: [{ campo: 'Color', antes: '#000', despues: '' }] }, { id: 2, fecha: '2026-11-19T10:00:00Z', accion: 'sesion', usuario: { nombre: 'Ana' }, detalle: 'Inició sesión', cambios: [] }] }],
  [/^\/api\/analitica\//, { encuestas: 5, desde: '2026-11-01', hasta: '2026-11-24', explicaciones: {} }],
  [/^\/api\/avisos\//, { avisos: [] }],
  [/^\/api\/backup\//, { configurado: true, faltan: [], maximo: 1, backups: [{ id: 'b1', nombre: 'snap', creado: '2026-11-01T00:00:00Z', automatico: true }], error_neon: '', aviso: '', programacion: { activo: true, frecuencia: 'semanal', dia_semana: 2, hora: '03:00', proximo: '2026-11-26T03:00:00Z', ultimo_automatico: null, ultimo_error: '' } }],
]

jest.mock('../src/api/cliente', () => ({
  API_URL: 'http://x',
  guardarCsrf: () => {},
  alSinCampana: () => () => {},
  urlCompleta: (u) => u,
  pedirImagen: async () => 'data:image/png;base64,AAAA',
  pedir: async (url) => {
    const fila = mockDATOS.find(([r]) => r.test(url))
    if (!fila) throw new Error('Sin datos de prueba para ' + url)
    return JSON.parse(JSON.stringify(fila[1]))
  },
}))

jest.mock('../src/sesion/Sesion', () => ({ useSesion: () => ({ usuario: global.__usuario, setUsuario: () => {}, salir: () => {} }) }))

const pantallas = {
  Login: () => require('../src/pantallas/login/Login').default,
  Olvide: () => require('../src/pantallas/login/Olvide').default,
  Restablecer: () => require('../src/pantallas/login/Restablecer').default,
  ElegirCampana: () => require('../src/pantallas/campanas/ElegirCampana').default,
  Inicio: () => require('../src/pantallas/inicio/Inicio').default,
  Categorias: () => require('../src/pantallas/categorias/Categorias').default,
  Equipos: () => require('../src/pantallas/equipos/Equipos').default,
  Permisos: () => require('../src/pantallas/permisos/Permisos').default,
  Grupos: () => require('../src/pantallas/grupos/Grupos').default,
  Usuarios: () => require('../src/pantallas/usuarios/Usuarios').default,
  Actividad: () => require('../src/pantallas/actividad/Actividad').default,
  ListaCuestionarios: () => require('../src/pantallas/cuestionarios/ListaCuestionarios').default,
  EditorNuevo: () => require('../src/pantallas/cuestionarios/EditorCuestionario').default,
  EditorExistente: () => require('../src/pantallas/cuestionarios/EditorCuestionario').default,
  Detalle: () => require('../src/pantallas/cuestionarios/DetalleCuestionario').default,
  ListaResponder: () => require('../src/pantallas/responder/ListaResponder').default,
  Responder: () => require('../src/pantallas/responder/ResponderCuestionario').default,
  Configuracion: () => require('../src/pantallas/configuracion/Configuracion').default,
  Backup: () => require('../src/pantallas/configuracion/Configuracion').default,
  Mapa: () => require('../src/pantallas/mapa/Mapa').default,
  MiRuta: () => require('../src/pantallas/mapa/MiRuta').default,
  Analitica: () => require('../src/pantallas/analitica/Analitica').default,
  Tutorial: () => require('../src/pantallas/tutorial/Tutorial').default,
  Lateral: () => require('../src/pantallas/menu/Lateral').default,
  Barra: () => require('../src/pantallas/menu/Barra').default,
}
const props = {
  Restablecer: { uid: 'MQ', token: undefined },
  EditorExistente: { id: '7' },
  Detalle: { id: '7' },
  Responder: { id: '7' },
  Backup: { pestana: 'backup' },
  Lateral: { navigation: { closeDrawer() {} } },
  Barra: { navigation: { toggleDrawer() {} } },
}

global.__usuario = usuario
for (const [nombre, cargar] of Object.entries(pantallas)) {
  test(`dibuja ${nombre}`, async () => {
    const errores = []
    const original = console.error
    console.error = (...a) => errores.push(a.map(String).join(' '))
    const Pantalla = cargar()
    await render(
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
      <ProveedorTema>
        <Pantalla usuario={usuario} onCambio={() => {}} onElegida={() => {}} onSalir={() => {}} onIngreso={() => {}} {...(props[nombre] ?? {})} />
      </ProveedorTema>
      </SafeAreaProvider>,
    )
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })
    console.error = original
    const graves = errores.filter((e) => !/act\(|not wrapped|Warning: An update/.test(e))
    expect(graves).toEqual([])
    expect(screen.toJSON()).toBeTruthy()
  })
}

// --- Interacciones básicas ---
const { fireEvent } = require('@testing-library/react-native')
const envolver = (el) => (
  <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
    <ProveedorTema>{el}</ProveedorTema>
  </SafeAreaProvider>
)
const esperar = () => act(async () => { await new Promise((r) => setTimeout(r, 200)) })

test('editor: agrega una pregunta y valida', async () => {
  const Editor = require('../src/pantallas/cuestionarios/EditorCuestionario').default
  await render(envolver(<Editor />))
  await esperar()
  await fireEvent.press(screen.getByText(/\+ Agregar pregunta \(1 de 15\)/))
  await esperar()
  expect(screen.getByText(/\(2 de 15\)/)).toBeTruthy()
  await fireEvent.changeText(screen.getByPlaceholderText('Título del cuestionario'), 'Nuevo')
  expect(screen.getByText('Sin guardar')).toBeTruthy()
})

test('responder: marca obligatorias al enviar vacío', async () => {
  const R = require('../src/pantallas/responder/ResponderCuestionario').default
  await render(envolver(<R id="7" />))
  await esperar()
  await fireEvent.press(await screen.findByText('Enviar encuesta'))
  await esperar()
  expect(screen.getByText('Revise los campos marcados en rojo.')).toBeTruthy()
  expect(screen.getByText('Esta pregunta es obligatoria.')).toBeTruthy()
})

test('cuestionarios: abre el detalle y la asignación', async () => {
  const L = require('../src/pantallas/cuestionarios/ListaCuestionarios').default
  await render(envolver(<L usuario={usuario} />))
  await esperar()
  await fireEvent.press(await screen.findByLabelText('Ver detalles'))
  await esperar()
  expect(screen.getByText('Detalle del cuestionario')).toBeTruthy()
  expect(await screen.findByText('¿Edad?', { exact: false })).toBeTruthy()
})

test('mapa: dibuja una zona tocando el mapa', async () => {
  const M = require('../src/pantallas/mapa/Mapa').default
  await render(envolver(<M />))
  await esperar()
  await fireEvent.press(await screen.findByText('+ Nueva zona'))
  await esperar()
  expect(screen.getByText(/0 marcados/)).toBeTruthy()
})

test('estadísticas: cambia de gráfico y abre el PDF', async () => {
  const D = require('../src/pantallas/cuestionarios/DetalleCuestionario').default
  await render(envolver(<D id="7" />))
  await esperar()
  await fireEvent.press((await screen.findAllByText('Tabla de frecuencias'))[0])
  await esperar()
  expect(screen.getAllByText('fi').length).toBeGreaterThan(0)
  await fireEvent.press(screen.getByText('PDF'))
  await esperar()
  expect(screen.getByText('Descargar PDF')).toBeTruthy()
})

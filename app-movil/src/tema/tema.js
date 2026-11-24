// Modo claro / oscuro y colores de la campaña (los mismos de index.css de la web).
// La elección se recuerda en el celular (AsyncStorage).
import { createContext, useContext, useMemo, useState } from 'react'
import { guardar, leer } from '../util/almacen'

export const MARCA = {
  violeta: '#51318f',
  violetaOscuro: '#41267a',
  celeste: '#2fb4e9',
  magenta: '#c3268c',
  naranja: '#f7a832',
  rojo: '#c0182f',
  verde: '#1f8a5b',
}

const CLARO = {
  oscuro: false,
  fondo: '#f4f5f7',
  superficie: '#ffffff',
  superficie2: '#f3f0fa',
  texto: '#15121c',
  gris: '#5d5a66',
  borde: '#d9d8df',
  linea: '#ebe9f0',
  violetaTexto: MARCA.violeta,
  magentaTexto: MARCA.magenta,
  rojoTexto: MARCA.rojo,
  verdeTexto: '#1f7a50',
  azulTexto: '#137fb0',
  ambarTexto: '#a76508',
  fondoError: '#fdf1f2',
  bordeError: '#e7b4bb',
  fondoOk: '#ecf8f1',
  bordeOk: '#a9dcc1',
  fondoMagenta: '#fbeef6',
  velo: 'rgba(21,18,28,0.45)',
}

const OSCURO = {
  oscuro: true,
  fondo: '#15121d',
  superficie: '#1f1b2b',
  superficie2: '#2a2539',
  texto: '#ece9f5',
  gris: '#aaa5ba',
  borde: '#3b3450',
  linea: '#332c45',
  violetaTexto: '#c4b2f8',
  magentaTexto: '#f29bd0',
  rojoTexto: '#ff95a1',
  verdeTexto: '#6dd9ad',
  azulTexto: '#7fd0f0',
  ambarTexto: '#f5c676',
  fondoError: '#3a1c25',
  bordeError: '#7a3340',
  fondoOk: '#173428',
  bordeOk: '#2c6a50',
  fondoMagenta: '#3a1c33',
  velo: 'rgba(0,0,0,0.6)',
}

export const ContextoTema = createContext({ c: { ...CLARO, ...MARCA }, claro: { ...CLARO, ...MARCA }, tema: 'claro', alternar: () => {} })

export function ProveedorTema({ children }) {
  const [tema, setTema] = useState(() => (leer('tema') === 'oscuro' ? 'oscuro' : 'claro'))
  const valor = useMemo(
    () => ({
      tema,
      c: { ...(tema === 'oscuro' ? OSCURO : CLARO), ...MARCA },
      claro: { ...CLARO, ...MARCA },
      alternar: () =>
        setTema((t) => {
          const nuevo = t === 'oscuro' ? 'claro' : 'oscuro'
          guardar('tema', nuevo)
          return nuevo
        }),
    }),
    [tema],
  )
  return <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>
}

// const { c } = useTema()  → colores del modo actual
export const useTema = () => useContext(ContextoTema)

// Estilos que dependen del tema, memorizados: const s = useEstilos(crear)
export function useEstilos(crear) {
  const { c } = useTema()
  return useMemo(() => crear(c), [c, crear])
}

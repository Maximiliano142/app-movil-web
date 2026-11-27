// Tipografías del Manual de Identidad (las mismas del desarrollo móvil):
//  - Titulares: Montserrat.
//  - Texto: Arial. En Android Arial no viene instalada, así que se usa Arimo,
//    que tiene exactamente las mismas medidas; se usa en las dos plataformas
//    para que la app se vea igual en todos los celulares.
// Se cargan en app/_layout.jsx (useFonts) antes de dibujar la app.
//
// En React Native cada grosor de una fuente cargada es un archivo distinto,
// por eso el fontWeight se traduce al nombre de la fuente correspondiente.
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat'
import { Arimo_400Regular, Arimo_700Bold } from '@expo-google-fonts/arimo'

export const FUENTES = {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Arimo_400Regular,
  Arimo_700Bold,
}

const MONTSERRAT = {
  400: 'Montserrat_400Regular',
  500: 'Montserrat_500Medium',
  600: 'Montserrat_600SemiBold',
  700: 'Montserrat_700Bold',
  800: 'Montserrat_800ExtraBold',
  900: 'Montserrat_800ExtraBold',
}

const peso = (fontWeight) => parseInt(fontWeight === 'bold' ? '700' : fontWeight || '400', 10) || 400

// Fuente de un titular según el grosor (por defecto, negrita)
export const fuenteTitulo = (fontWeight = '700') => ({ fontFamily: MONTSERRAT[Math.max(400, peso(fontWeight))] })

// Fuente de texto común: Arial/Arimo solo tiene normal y negrita
export const fuenteTexto = (fontWeight = '400') => ({ fontFamily: peso(fontWeight) >= 600 ? 'Arimo_700Bold' : 'Arimo_400Regular' })

// Le pone la fuente que corresponde a un estilo de texto ya aplanado.
// titulo: true / false para forzarlo; si no se indica, los textos grandes y en
// negrita (17 px o más) se consideran titulares, como en el desarrollo móvil.
export function conFuente(estilo, titulo) {
  const { fontWeight, ...resto } = estilo ?? {}
  if (resto.fontFamily) return estilo
  const esTitulo = titulo ?? (peso(fontWeight) >= 700 && (resto.fontSize ?? 15) >= 17)
  return { ...resto, ...(esTitulo ? fuenteTitulo(fontWeight) : fuenteTexto(fontWeight)) }
}

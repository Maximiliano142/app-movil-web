// Tipografías del Manual de Identidad (las mismas del proyecto Consultora-Grupo7):
// Montserrat para títulos y botones, Arial para el texto. Arimo es igual a
// Arial y se usa porque Android no trae Arial instalada.
// En Android el peso lo da el archivo de la fuente (fontWeight no alcanza),
// por eso cada peso tiene su propio nombre.
// Se importa cada peso por separado para no meter en la app todas las variantes.
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat/400Regular'
import { Montserrat_500Medium } from '@expo-google-fonts/montserrat/500Medium'
import { Montserrat_600SemiBold } from '@expo-google-fonts/montserrat/600SemiBold'
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat/700Bold'
import { Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat/800ExtraBold'
import { Arimo_400Regular } from '@expo-google-fonts/arimo/400Regular'
import { Arimo_700Bold } from '@expo-google-fonts/arimo/700Bold'

// Para useFonts() en app/_layout.jsx
export const ARCHIVOS_FUENTES = {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Arimo_400Regular,
  Arimo_700Bold,
}

export const FUENTES = {
  titulo: 'Montserrat_800ExtraBold',
  subtitulo: 'Montserrat_700Bold',
  boton: 'Montserrat_700Bold',
  semi: 'Montserrat_600SemiBold',
  texto: 'Arimo_400Regular',
  negrita: 'Arimo_700Bold',
}

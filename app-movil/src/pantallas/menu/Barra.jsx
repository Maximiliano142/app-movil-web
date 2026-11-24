// Barra superior: menú, logo, sección actual, modo oscuro, avisos y usuario
import { Image, Pressable, View } from 'react-native'
import { router, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Menu as IconoMenu, Moon, Sun } from 'lucide-react-native'
import { salirDeCampana } from '../../api/campanas'
import { useSesion } from '../../sesion/Sesion'
import { useTema } from '../../tema/tema'
import { Franja, Texto } from '../../ui'
import { opcionActual, seccionesPara } from '../../util/opciones'
import Avisos from './Avisos'
import MenuUsuario from './MenuUsuario'

export default function Barra({ navigation, permanente }) {
  const { c, tema, alternar } = useTema()
  const { usuario, setUsuario, salir } = useSesion()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  if (!usuario) return null
  const actual = opcionActual(seccionesPara(usuario), pathname)
  const oscuro = tema === 'oscuro'

  async function cambiarCampana() {
    setUsuario(await salirDeCampana())
    router.replace('/campana')
  }

  return (
    <View style={{ backgroundColor: c.superficie, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 58 }}>
        {!permanente && (
          <Pressable onPress={() => navigation.toggleDrawer()} hitSlop={8} accessibilityLabel="Mostrar u ocultar el menú" style={{ padding: 4 }}>
            <IconoMenu size={24} color={c.texto} />
          </Pressable>
        )}
        <Image source={require('../../../assets/img/logo.png')} style={{ width: 32, height: 32 }} resizeMode="contain" />
        <View style={{ flex: 1 }}>
          <Texto estilo="negrita" style={{ fontSize: 14 }} numberOfLines={1}>
            Panel de gestión
          </Texto>
          <Texto estilo="chico" numberOfLines={1}>
            {actual?.texto ?? 'Inicio'}
          </Texto>
        </View>
        <Pressable onPress={alternar} hitSlop={6} accessibilityRole="switch" accessibilityState={{ checked: oscuro }} accessibilityLabel="Modo oscuro" style={{ padding: 6 }}>
          {oscuro ? <Moon size={22} color={c.texto} /> : <Sun size={22} color={c.texto} />}
        </Pressable>
        {usuario.campana && <Avisos usuario={usuario} />}
        <MenuUsuario usuario={usuario} onCambiarCampana={usuario.puede_elegir_campana ? cambiarCampana : null} onSalir={salir} />
      </View>
      <Franja ancho={'100%'} alto={3} />
    </View>
  )
}

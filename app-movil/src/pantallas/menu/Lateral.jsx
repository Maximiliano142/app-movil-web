// Menú lateral (cajón): secciones con sus opciones. Las opciones salen de util/opciones.js
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { router, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LogOut } from 'lucide-react-native'
import { useSesion } from '../../sesion/Sesion'
import { MARCA, useTema } from '../../tema/tema'
import { Avatar, Franja, Texto } from '../../ui'
import { opcionActual, seccionesPara } from '../../util/opciones'
import { nombreDe, rolDe } from '../../util/usuario'

export default function Lateral({ navigation }) {
  const { c } = useTema()
  const { usuario, salir } = useSesion()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  if (!usuario) return null
  const secciones = seccionesPara(usuario)
  const actual = opcionActual(secciones, pathname)

  return (
    <View style={{ flex: 1, backgroundColor: c.superficie }}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 14, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image source={require('../../../assets/img/logo.png')} style={{ width: 38, height: 38 }} resizeMode="contain" />
          <Texto estilo="negrita" style={{ fontSize: 16 }}>
            Panel de gestión
          </Texto>
        </View>
        <Franja ancho={'100%'} alto={3} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <Avatar usuario={usuario} tamano={42} />
          <View style={{ flex: 1 }}>
            <Texto estilo="negrita" numberOfLines={1}>
              {nombreDe(usuario)}
            </Texto>
            <Texto estilo="chico">{rolDe(usuario)}</Texto>
          </View>
        </View>
        {usuario.campana && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.superficie2, padding: 8, borderRadius: 10 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22b26b' }} />
            <Texto estilo="chico" numberOfLines={1} style={{ flex: 1, color: c.texto, fontWeight: '600' }}>
              {usuario.campana.nombre}
            </Texto>
          </View>
        )}
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}>
        {secciones.map((seccion, i) => (
          <View key={seccion.titulo ?? i} style={{ marginTop: 8 }}>
            {seccion.titulo && (
              <Text style={{ color: c.gris, fontSize: 11.5, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginLeft: 12, marginBottom: 4 }}>
                {seccion.titulo}
              </Text>
            )}
            {seccion.opciones.map(({ ruta, texto, icono: Icono }) => {
              const activa = actual?.ruta === ruta
              return (
                <Pressable
                  key={ruta}
                  onPress={() => {
                    navigation.closeDrawer()
                    router.navigate(ruta)
                  }}
                  accessibilityRole="link"
                  accessibilityState={{ selected: activa }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 11,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    backgroundColor: activa ? MARCA.violeta : pressed ? c.superficie2 : 'transparent',
                  })}
                >
                  <Icono size={21} strokeWidth={1.8} color={activa ? '#fff' : c.violetaTexto} />
                  <Text style={{ color: activa ? '#fff' : c.texto, fontSize: 15, fontWeight: activa ? '700' : '500' }}>{texto}</Text>
                </Pressable>
              )
            })}
          </View>
        ))}
      </ScrollView>
      <Pressable
        onPress={salir}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18, paddingBottom: insets.bottom + 18, borderTopWidth: 1, borderColor: c.linea }}
      >
        <LogOut size={20} color={c.rojoTexto} />
        <Text style={{ color: c.rojoTexto, fontWeight: '700' }}>Salir</Text>
      </Pressable>
    </View>
  )
}

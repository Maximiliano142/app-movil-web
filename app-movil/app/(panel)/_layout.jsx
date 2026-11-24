// Estructura del panel: barra superior + menú lateral (cajón) + la pantalla actual.
// En tablets y pantallas anchas el menú queda fijo a la izquierda.
import { useWindowDimensions } from 'react-native'
import { Redirect } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import Barra from '../../src/pantallas/menu/Barra'
import Lateral from '../../src/pantallas/menu/Lateral'
import { useSesion } from '../../src/sesion/Sesion'
import { useTema } from '../../src/tema/tema'

export default function Panel() {
  const { usuario } = useSesion()
  const { c } = useTema()
  const { width } = useWindowDimensions()
  if (!usuario) return <Redirect href="/login" />
  const permanente = width >= 1000
  return (
    <Drawer
      drawerContent={(props) => <Lateral {...props} />}
      screenOptions={{
        header: (props) => <Barra {...props} permanente={permanente} />,
        drawerType: permanente ? 'permanent' : 'front',
        drawerStyle: { width: 290, backgroundColor: c.superficie },
        sceneStyle: { backgroundColor: c.fondo },
        swipeEdgeWidth: 40,
      }}
    />
  )
}

import { useEffect, useRef, useState } from 'react'
import { Animated, Image, StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ProveedorSesion, useSesion } from '../src/sesion/Sesion'
import { MARCA, ProveedorTema, useTema } from '../src/tema/tema'
import { cargarAlmacen } from '../src/util/almacen'
import { ARCHIVOS_FUENTES } from '../src/tema/fuentes'

// Pantalla de arranque: logo y tres puntos mientras se consulta la sesión
function Arranque() {
  const puntos = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current]
  useEffect(() => {
    const anim = Animated.loop(
      Animated.stagger(
        160,
        puntos.map((p) =>
          Animated.sequence([
            Animated.timing(p, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(p, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
        ),
      ),
    )
    anim.start()
    return () => anim.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <View style={estilos.arranque} accessibilityLabel="Cargando…">
      <Image source={require('../assets/img/logo.png')} style={{ width: 96, height: 96 }} resizeMode="contain" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
        {puntos.map((p, i) => (
          <Animated.View
            key={i}
            style={{ width: 10, height: 10, borderRadius: 5, opacity: p, backgroundColor: [MARCA.violeta, MARCA.celeste, MARCA.magenta][i] }}
          />
        ))}
      </View>
      <Text style={{ marginTop: 12, color: '#5d5a66' }}>Cargando…</Text>
    </View>
  )
}

function Navegacion() {
  const { cargando } = useSesion()
  const { c } = useTema()
  if (cargando) return <Arranque />
  return (
    <>
      <StatusBar style={c.oscuro ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.fondo } }} />
    </>
  )
}

export default function Raiz() {
  // Lo guardado en el celular (tema, último usuario…) se lee antes de dibujar
  const [listo, setListo] = useState(false)
  // Montserrat y Arimo (Manual de Identidad). Si no cargan, sigue con la del sistema.
  const [fuentes, errorFuentes] = useFonts(ARCHIVOS_FUENTES)
  useEffect(() => {
    cargarAlmacen().finally(() => setListo(true))
  }, [])
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {!listo || (!fuentes && !errorFuentes) ? (
          <Arranque />
        ) : (
          <ProveedorTema>
            <ProveedorSesion>
              <Navegacion />
            </ProveedorSesion>
          </ProveedorTema>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const estilos = StyleSheet.create({
  arranque: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
})

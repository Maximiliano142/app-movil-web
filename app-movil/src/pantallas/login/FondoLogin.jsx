// Fondo del login: olas de colores arriba y abajo con el formulario en el medio.
// Lo usan Login, Olvide y Restablecer. El login queda siempre en modo claro.
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { Franja } from '../../ui'

export default function FondoLogin({ titulo, subtitulo, children }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Image source={require('../../../assets/img/fondo.png')} style={[StyleSheet.absoluteFill, { opacity: 0.07 }]} resizeMode="cover" blurRadius={6} />
      <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0 }} height={110} width="100%" viewBox="0 0 1440 160" preserveAspectRatio="none">
        <Path d="M0 0 H1440 V70 C1180 150 900 20 620 80 C380 130 180 110 0 60 Z" fill="#533693" />
      </Svg>
      <Svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} height={130} width="100%" viewBox="0 0 1440 260" preserveAspectRatio="none">
        <Path d="M0 120 C300 40 700 220 1000 120 C1200 55 1340 70 1440 30 V260 H0 Z" fill="#fdb03e" />
        <Path d="M0 170 C260 110 620 250 960 175 C1190 125 1330 150 1440 110 V260 H0 Z" fill="#d8267e" />
        <Path d="M0 215 C300 170 640 270 980 220 C1200 190 1340 205 1440 180 V260 H0 Z" fill="#533693" />
      </Svg>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 80, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
              <Image source={require('../../../assets/img/logo.png')} style={{ width: 88, height: 88, alignSelf: 'center', marginBottom: 10 }} resizeMode="contain" accessibilityLabel="Logo" />
              <Text style={estilos.titulo} accessibilityRole="header">
                {titulo}
              </Text>
              {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
              <Franja ancho={120} style={{ alignSelf: 'center', marginTop: 12, marginBottom: 24 }} />
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

export const estilos = StyleSheet.create({
  titulo: { fontSize: 28, fontWeight: '800', color: '#15121c', textAlign: 'center' },
  subtitulo: { fontSize: 15, color: '#5d5a66', textAlign: 'center', marginTop: 6 },
  error: {
    color: '#c0182f',
    backgroundColor: '#fdf1f2',
    borderColor: '#e7b4bb',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    fontWeight: '500',
  },
  ok: {
    color: '#1f7a50',
    backgroundColor: '#ecf8f1',
    borderColor: '#a9dcc1',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  enlace: { color: '#51318f', fontWeight: '700', textAlign: 'center', paddingVertical: 12 },
})

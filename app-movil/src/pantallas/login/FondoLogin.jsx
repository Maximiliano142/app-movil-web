// Fondo del login: olas de colores arriba y abajo con el formulario en el medio.
// Lo usan Login, Olvide y Restablecer. El login queda siempre en modo claro.
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { Franja } from '../../ui'
import { FUENTES } from '../../tema/fuentes'

export default function FondoLogin({ titulo, subtitulo, children }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Image source={require('../../../assets/img/fondo.png')} style={[StyleSheet.absoluteFill, { opacity: 0.07 }]} resizeMode="cover" blurRadius={6} />
      {/* Ondas de Consultora-Grupo7: violeta arriba; violeta, magenta y naranja abajo */}
      <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0 }} height={120} width="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
        <Path d="M0 0 H400 V50 C340 105 260 98 200 72 C140 46 60 30 0 64 Z" fill="#53368F" />
      </Svg>
      <Svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} height={90} width="100%" viewBox="0 0 400 80" preserveAspectRatio="none">
        <Path d="M0 25 C90 0 170 40 250 40 C320 40 360 10 400 20 V80 H0 Z" fill="#53368F" />
        <Path d="M150 80 C220 50 300 35 400 40 V80 Z" fill="#D6247F" opacity={0.9} />
        <Path d="M290 80 C330 55 365 35 400 22 V80 Z" fill="#FDB03F" />
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
  titulo: { fontSize: 28, fontWeight: '800', color: '#111111', textAlign: 'center', fontFamily: FUENTES.titulo },
  subtitulo: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 6, fontFamily: FUENTES.texto },
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

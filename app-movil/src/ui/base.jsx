// Piezas básicas de la interfaz (equivalen a las clases .boton, .entrada,
// .etiqueta, .vacio-tarjeta… de index.css en la web).
import { useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Check, Eye, EyeOff } from 'lucide-react-native'
import { MARCA, useTema } from '../tema/tema'
import { FUENTES } from '../tema/fuentes'
import { inicialDe } from '../util/usuario'

export function Texto({ estilo = 'normal', style, children, ...resto }) {
  const { c } = useTema()
  const base = {
    normal: { color: c.texto, fontSize: 15, fontFamily: FUENTES.texto },
    titulo: { color: c.texto, fontSize: 26, fontWeight: '800', fontFamily: FUENTES.titulo },
    subtitulo: { color: c.texto, fontSize: 18, fontWeight: '700', fontFamily: FUENTES.subtitulo },
    negrita: { color: c.texto, fontSize: 15, fontWeight: '700', fontFamily: FUENTES.negrita },
    suave: { color: c.gris, fontSize: 14, fontFamily: FUENTES.texto },
    chico: { color: c.gris, fontSize: 12.5, fontFamily: FUENTES.texto },
    error: { color: c.rojoTexto, fontSize: 14, fontWeight: '500', fontFamily: FUENTES.texto },
    ok: { color: c.verdeTexto, fontSize: 14, fontWeight: '600', fontFamily: FUENTES.negrita },
    etiqueta: { color: c.gris, fontSize: 13.5, fontWeight: '600', marginBottom: 6, fontFamily: FUENTES.semi },
  }[estilo]
  return (
    <Text style={[base, style]} {...resto}>
      {children}
    </Text>
  )
}

// variante: 'lleno' (violeta), 'borde', 'peligro' (borde rojo) o 'rojo' (lleno rojo)
export function Boton({ titulo, onPress, variante = 'lleno', chico, grande, disabled, cargando, icono: Icono, style, flex }) {
  const { c } = useTema()
  const colores = {
    lleno: { fondo: MARCA.violeta, texto: '#fff', borde: MARCA.violeta },
    borde: { fondo: c.superficie, texto: c.violetaTexto, borde: MARCA.violeta },
    peligro: { fondo: c.superficie, texto: c.rojoTexto, borde: c.bordeError },
    rojo: { fondo: MARCA.rojo, texto: '#fff', borde: MARCA.rojo },
  }[variante]
  const inactivo = disabled || cargando
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        {
          height: chico ? 34 : grande ? 50 : 44,
          paddingHorizontal: chico ? 12 : 18,
          borderRadius: 10,
          borderWidth: 1.5,
          backgroundColor: colores.fondo,
          borderColor: colores.borde,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: inactivo ? 0.55 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        flex && { flex: 1 },
        style,
      ]}
    >
      {cargando ? <ActivityIndicator size="small" color={colores.texto} /> : Icono && <Icono size={17} color={colores.texto} />}
      <Text style={{ color: colores.texto, fontWeight: '700', fontSize: chico ? 13.5 : 15, fontFamily: FUENTES.boton }} numberOfLines={1}>
        {titulo}
      </Text>
    </Pressable>
  )
}

// Botón cuadrado con solo un ícono; la etiqueta queda como nombre accesible
// (en la web era el cartelito). Con mantener apretado se ve la etiqueta.
export function BotonIcono({ icono: Icono, etiqueta, onPress, variante = 'borde', disabled, ayuda }) {
  const { c } = useTema()
  const [cartel, setCartel] = useState(false)
  const color = variante === 'peligro' ? c.rojoTexto : variante === 'lleno' ? '#fff' : c.violetaTexto
  return (
    <View>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onLongPress={() => {
          setCartel(true)
          setTimeout(() => setCartel(false), 1500)
        }}
        accessibilityRole="button"
        accessibilityLabel={etiqueta}
        accessibilityHint={ayuda}
        hitSlop={4}
        style={({ pressed }) => ({
          width: 40,
          height: 40,
          borderRadius: 10,
          borderWidth: 1.5,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: variante === 'peligro' ? c.bordeError : variante === 'lleno' ? MARCA.violeta : c.borde,
          backgroundColor: variante === 'lleno' ? MARCA.violeta : pressed ? c.superficie2 : c.superficie,
          opacity: disabled ? 0.45 : 1,
        })}
      >
        <Icono size={18} color={color} strokeWidth={2} />
      </Pressable>
      {cartel && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 46,
            right: 0,
            backgroundColor: '#15121c',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            minWidth: 70,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>{ayuda || etiqueta}</Text>
        </View>
      )}
    </View>
  )
}

// Campo de texto con etiqueta y error debajo
export function Entrada({ etiqueta, error, ayuda, style, multiline, contrasena, icono: Icono, ...resto }) {
  const { c } = useTema()
  const [foco, setFoco] = useState(false)
  const [ver, setVer] = useState(false)
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {etiqueta ? <Texto estilo="etiqueta">{etiqueta}</Texto> : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          borderWidth: 1.5,
          borderRadius: 10,
          borderColor: error ? c.rojoTexto : foco ? MARCA.violeta : c.borde,
          backgroundColor: c.superficie,
          paddingHorizontal: 12,
          minHeight: multiline ? 84 : 46,
          gap: 8,
        }}
      >
        {Icono && <Icono size={18} color={c.gris} />}
        <TextInput
          placeholderTextColor={c.gris}
          multiline={multiline}
          secureTextEntry={contrasena && !ver}
          onFocus={() => setFoco(true)}
          onBlur={(e) => {
            setFoco(false)
            resto.onBlur?.(e)
          }}
          style={{
            flex: 1,
            color: c.texto,
            fontSize: 15.5,
            fontFamily: FUENTES.texto,
            paddingVertical: multiline ? 10 : 8,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          {...resto}
        />
        {contrasena && (
          <Pressable
            onPress={() => setVer((v) => !v)}
            accessibilityLabel={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={8}
          >
            {ver ? <EyeOff size={19} color={c.gris} /> : <Eye size={19} color={c.gris} />}
          </Pressable>
        )}
      </View>
      {error ? (
        <Texto estilo="error" style={{ marginTop: 4, fontSize: 13 }}>
          {error}
        </Texto>
      ) : ayuda ? (
        <Texto estilo="chico" style={{ marginTop: 4 }}>
          {ayuda}
        </Texto>
      ) : null}
    </View>
  )
}

// Casilla de verificación (checkbox)
export function Casilla({ marcada, onCambio, children, disabled, style }) {
  const { c } = useTema()
  return (
    <Pressable
      onPress={() => !disabled && onCambio(!marcada)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcada, disabled }}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: marcada ? MARCA.violeta : c.borde,
          backgroundColor: marcada ? MARCA.violeta : c.superficie,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {marcada && <Check size={15} color="#fff" strokeWidth={3} />}
      </View>
      <View style={{ flex: 1 }}>{typeof children === 'string' ? <Texto>{children}</Texto> : children}</View>
    </Pressable>
  )
}

// Etiqueta chica de color ("Desactivada", "Superusuario"…)
export function Etiqueta({ children, color = 'gris' }) {
  const { c } = useTema()
  const colores = {
    gris: [c.superficie2, c.gris],
    violeta: [c.oscuro ? '#2f2650' : '#efe9fb', c.violetaTexto],
    magenta: [c.fondoMagenta, c.magentaTexto],
    verde: [c.fondoOk, c.verdeTexto],
    rojo: [c.fondoError, c.rojoTexto],
    celeste: [c.oscuro ? '#163444' : '#e6f6fd', c.azulTexto],
    naranja: [c.oscuro ? '#3a2c14' : '#fff4e2', c.ambarTexto],
  }[color]
  return (
    <View style={{ backgroundColor: colores[0], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' }}>
      <Text style={{ color: colores[1], fontSize: 12, fontWeight: '700' }}>{children}</Text>
    </View>
  )
}

export function Tarjeta({ children, style, apagada }) {
  const { c } = useTema()
  return (
    <View
      style={[
        {
          backgroundColor: c.superficie,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: c.linea,
          padding: 16,
          opacity: apagada ? 0.7 : 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

// Las cuatro franjas de color de la campaña
export function Franja({ ancho = 72, alto = 4, style }) {
  return (
    <View style={[{ flexDirection: 'row', width: ancho, height: alto, borderRadius: 2, overflow: 'hidden' }, style]}>
      {[MARCA.violeta, MARCA.celeste, MARCA.magenta, MARCA.naranja].map((color) => (
        <View key={color} style={{ flex: 1, backgroundColor: color }} />
      ))}
    </View>
  )
}

export function VacioTarjeta({ titulo, children }) {
  const { c } = useTema()
  return (
    <View
      style={{
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: c.borde,
        borderRadius: 12,
        paddingVertical: 36,
        paddingHorizontal: 16,
        alignItems: 'center',
        gap: 4,
      }}
    >
      {titulo ? (
        <Texto estilo="negrita" style={{ textAlign: 'center', color: c.gris }}>
          {titulo}
        </Texto>
      ) : null}
      {children ? (
        <Texto estilo="suave" style={{ textAlign: 'center' }}>
          {children}
        </Texto>
      ) : null}
    </View>
  )
}

export function TextoError({ children, style }) {
  if (!children) return null
  return (
    <Texto estilo="error" accessibilityRole="alert" style={[{ marginVertical: 6 }, style]}>
      {children}
    </Texto>
  )
}

// Círculo del usuario: su foto de perfil o, si no cargó una, su inicial
export function Avatar({ usuario, tamano = 40 }) {
  const { c } = useTema()
  return (
    <View
      style={{
        width: tamano,
        height: tamano,
        borderRadius: tamano / 2,
        backgroundColor: MARCA.violeta,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: c.superficie,
      }}
    >
      {usuario.foto ? (
        <Image source={{ uri: usuario.foto }} style={StyleSheet.absoluteFill} />
      ) : (
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: tamano * 0.42 }}>{inicialDe(usuario)}</Text>
      )}
    </View>
  )
}

// Fila: elementos uno al lado del otro
export const Fila = ({ children, style, gap = 8, envolver }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: envolver ? 'wrap' : 'nowrap' }, style]}>
    {children}
  </View>
)

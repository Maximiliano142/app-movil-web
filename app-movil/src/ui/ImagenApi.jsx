// Imagen PNG de la API que necesita la sesión (gráficos de matplotlib).
// Se descarga con las cookies y se muestra como data URI.
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, View } from 'react-native'
import { pedirImagen } from '../api/cliente'
import { MARCA, useTema } from '../tema/tema'
import { Texto } from './base'

export default function ImagenApi({ url, relacion = 1.6, onCargada, alTocar, etiqueta }) {
  const { c } = useTema()
  const [estado, setEstado] = useState({ url: null, datos: null, error: '' })
  const [proporcion, setProporcion] = useState(relacion)

  useEffect(() => {
    let vigente = true
    pedirImagen(url)
      .then((datos) => {
        if (!vigente) return
        setEstado({ url, datos, error: '' })
        Image.getSize(datos, (w, h) => vigente && h && setProporcion(w / h), () => {})
        onCargada?.(datos)
      })
      .catch((e) => vigente && setEstado({ url, datos: null, error: e.message }))
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const actual = estado.url === url
  return (
    <View
      style={{
        width: '100%',
        aspectRatio: proporcion,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: c.oscuro ? 0 : 1,
        borderColor: c.linea,
      }}
    >
      {!actual ? (
        <ActivityIndicator color={MARCA.violeta} />
      ) : estado.error ? (
        <Texto estilo="error" style={{ padding: 12, textAlign: 'center' }}>
          {estado.error}
        </Texto>
      ) : (
        <Pressable onPress={alTocar ? () => alTocar(estado.datos) : undefined} style={{ width: '100%', height: '100%' }}>
          <Image source={{ uri: estado.datos }} style={{ width: '100%', height: '100%' }} resizeMode="contain" accessibilityLabel={etiqueta} />
        </Pressable>
      )}
    </View>
  )
}

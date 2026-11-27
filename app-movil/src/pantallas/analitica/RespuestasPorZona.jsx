// Dashboard → "Respuestas por zona y cuestionario" (igual que en la web).
// Se elige una zona y un cuestionario y se ven sus preguntas con lo que se
// respondió. La zona es la del equipo de quien cargó la encuesta (equipo →
// ruta → calles → barrios → zona), no el GPS. Cada opción muestra la cantidad,
// el porcentaje y una barra para comparar de un vistazo.
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { obtenerRespuestasPorZona } from '../../api/analitica'
import { useTema } from '../../tema/tema'
import { Fila, Selector, Tarjeta, Texto, TextoError, VacioTarjeta } from '../../ui'

const cuantas = (n) => (n === 1 ? '1 encuesta' : `${n.toLocaleString('es-AR')} encuestas`)
const pct = (n) => `${n.toLocaleString('es-AR', { maximumFractionDigits: 1 })} %`

function Pregunta({ pregunta }) {
  const { c } = useTema()
  const maximo = Math.max(1, ...pregunta.opciones.map((o) => o.cantidad))
  return (
    <Tarjeta style={{ gap: 10 }}>
      <Texto estilo="negrita">
        {pregunta.orden}. {pregunta.enunciado}
      </Texto>
      <Texto estilo="chico">
        {pregunta.multiple
          ? 'Opción múltiple: cada persona puede elegir varias, por eso los porcentajes no suman 100 %.'
          : 'Una sola opción.'}
      </Texto>
      {pregunta.opciones.map((o) => (
        <View
          key={o.id}
          style={{ gap: 4 }}
          accessible
          accessibilityLabel={`${o.texto}: ${o.cantidad} respuestas, ${pct(o.porcentaje)} de las encuestas`}
        >
          <Fila style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: c.texto, flex: 1, fontSize: 15 }}>{o.texto}</Text>
            <Text style={{ color: c.texto, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
              {o.cantidad.toLocaleString('es-AR')} · {pct(o.porcentaje)}
            </Text>
          </Fila>
          <View style={{ height: 10, borderRadius: 999, backgroundColor: c.superficie2, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${(100 * o.cantidad) / maximo}%`, borderRadius: 999, backgroundColor: c.violetaTexto }} />
          </View>
        </View>
      ))}
    </Tarjeta>
  )
}

export default function RespuestasPorZona({ zonas, cuestionarios }) {
  const { c } = useTema()
  const [zona, setZona] = useState('')
  const [cuestionario, setCuestionario] = useState('')
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const completo = Boolean(zona && cuestionario)

  // Se vuelve a consultar cada vez que cambia cualquiera de los dos filtros
  useEffect(() => {
    if (!completo) return undefined
    let vigente = true
    obtenerRespuestasPorZona(zona, cuestionario)
      .then((r) => vigente && (setDatos(r), setError('')))
      .catch((e) => vigente && (setDatos(null), setError(e.message)))
    return () => {
      vigente = false
    }
  }, [zona, cuestionario, completo])

  // Mientras llega la respuesta de los filtros nuevos no se muestra la anterior
  const vigentes = datos && String(datos.zona.id) === String(zona) && String(datos.cuestionario.id) === String(cuestionario)
  const aviso = { backgroundColor: c.superficie2, padding: 12, borderRadius: 10, gap: 6 }

  return (
    <View style={{ gap: 12, marginTop: 12 }}>
      <Texto estilo="subtitulo" accessibilityRole="header">
        Respuestas por zona y cuestionario
      </Texto>
      <Texto estilo="suave">
        La zona de cada encuesta es la del equipo de quien la cargó (los barrios que recorre su ruta). Esta consulta no usa
        las fechas de arriba.
      </Texto>
      <Tarjeta>
        <Selector
          etiqueta="Zona *"
          valor={zona}
          placeholder="Elegir zona…"
          opciones={zonas.map((z) => ({ valor: z.id, texto: z.nombre }))}
          onCambio={setZona}
        />
        <Selector
          etiqueta="Cuestionario *"
          valor={cuestionario}
          placeholder="Elegir cuestionario…"
          opciones={cuestionarios.map((q) => ({ valor: q.id, texto: q.titulo }))}
          onCambio={setCuestionario}
        />
      </Tarjeta>

      {!completo ? (
        <VacioTarjeta>Elija una zona y un cuestionario para ver sus preguntas y respuestas.</VacioTarjeta>
      ) : error && !vigentes ? (
        <TextoError>{error}</TextoError>
      ) : !vigentes ? (
        <VacioTarjeta>Cargando…</VacioTarjeta>
      ) : datos.encuestas === 0 ? (
        <Texto style={aviso} accessibilityRole="alert">
          No hay resultados: no se cargaron encuestas de «{datos.cuestionario.titulo}» en {datos.zona.nombre}.
        </Texto>
      ) : !datos.separable ? (
        <View style={aviso} accessibilityRole="alert">
          <Texto>
            En {datos.zona.nombre} hay {cuantas(datos.encuestas)} de «{datos.cuestionario.titulo}», pero este cuestionario
            también se cargó fuera de esta zona y las respuestas guardadas no indican a qué encuesta pertenecen. Por eso no se
            pueden mostrar solo las de esta zona sin mezclarlas con las de otras.
          </Texto>
          <Texto estilo="negrita">Encuestas de este cuestionario por zona:</Texto>
          {datos.reparto.map((r) => (
            <Texto key={r.zona}>
              • {r.zona}: {cuantas(r.encuestas)}
            </Texto>
          ))}
        </View>
      ) : (
        <>
          <Texto estilo="negrita" style={{ color: c.violetaTexto }}>
            {cuantas(datos.encuestas)} de «{datos.cuestionario.titulo}» en {datos.zona.nombre}
          </Texto>
          {datos.preguntas.map((p) => (
            <Pregunta key={p.id} pregunta={p} />
          ))}
        </>
      )}
    </View>
  )
}

// Ficha con los datos de un usuario. La usan "Mi perfil" y el botón "Ver" de
// Gestión → Usuarios.
import { View } from 'react-native'
import { AtSign, CalendarDays, Clock, Flag, IdCard, Mail, MapPin, Phone, ShieldCheck, Users } from 'lucide-react-native'
import { useTema } from '../../tema/tema'
import { Avatar, Etiqueta, Fila, Texto } from '../../ui'

const fecha = (iso) =>
  iso ? new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

function rolesDe(u) {
  if (u.es_superusuario) return 'Superusuario'
  const nombres = (u.grupos ?? []).map((g) => (typeof g === 'string' ? g : g.nombre))
  return nombres.join(', ') || 'Sin rol'
}

function Dato({ icono: Icono, etiqueta, valor }) {
  const { c } = useTema()
  return (
    <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: c.linea }}>
      <Fila gap={6}>
        <Icono size={15} color={c.gris} />
        <Texto estilo="chico">{etiqueta}</Texto>
      </Fila>
      <Texto style={{ marginTop: 2, color: valor ? c.texto : c.gris }}>{valor || 'Sin cargar'}</Texto>
    </View>
  )
}

export default function FichaUsuario({ usuario: u, campana, avatar }) {
  const nombre = `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || u.email
  return (
    <View>
      <Fila gap={14} style={{ marginBottom: 8 }}>
        {avatar ?? <Avatar usuario={u} tamano={64} />}
        <View style={{ flex: 1, gap: 4 }}>
          <Texto estilo="subtitulo">{nombre}</Texto>
          <Fila envolver gap={6}>
            <Etiqueta color="magenta">{rolesDe(u)}</Etiqueta>
            {u.activo === false && <Etiqueta>Desactivado</Etiqueta>}
          </Fila>
        </View>
      </Fila>
      <Dato icono={AtSign} etiqueta="Nombre de usuario" valor={u.username} />
      <Dato icono={Mail} etiqueta="Correo electrónico" valor={u.email} />
      <Dato icono={IdCard} etiqueta="Documento" valor={u.documento} />
      <Dato icono={Phone} etiqueta="Teléfono" valor={u.telefono} />
      <Dato icono={MapPin} etiqueta="Dirección" valor={u.direccion} />
      {campana !== undefined && <Dato icono={Flag} etiqueta="Campaña" valor={campana} />}
      {u.equipo !== undefined && <Dato icono={Users} etiqueta="Equipo" valor={u.equipo} />}
      <Dato icono={ShieldCheck} etiqueta="Rol" valor={rolesDe(u)} />
      <Dato icono={Clock} etiqueta="Último ingreso" valor={u.ultimo_ingreso ? fecha(u.ultimo_ingreso) : 'Nunca ingresó'} />
      <Dato icono={CalendarDays} etiqueta="Usuario desde" valor={fecha(u.alta)} />
    </View>
  )
}

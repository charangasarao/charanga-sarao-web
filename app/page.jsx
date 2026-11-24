"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Car, Users, Wallet, Shield, MapPin, 
  Plus, Navigation, Music, Fuel, Settings, Calculator, Check, Key, Bell, CheckCheck, Circle, X, 
  UserPlus, Trash2, Shirt, ArrowRight, Home, Clock, AlertCircle, 
  ChevronLeft, ChevronRight, BarChart3, Download, Undo2, FileText, 
  Edit3, Upload, Mail, Eye, Loader2, ClipboardList, XCircle, UserCheck, LogOut, Search, Phone
} from 'lucide-react';

import { db } from './firebase';
import { collection, doc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import PushNotifications from './PushNotifications';

const CONFIG_CUERDAS = {
  'Saxos': { label: 'Saxos', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: '#34d399' },
  'Trompetas': { label: 'Trompetas', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: '#fbbf24' },
  'Trombones': { label: 'Trombones', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: '#60a5fa' },
  'Tuba': { label: 'Tuba', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: '#22d3ee' },
  'Percusión': { label: 'Percusión', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', dot: '#e879f9' }
};

const CANCIONES = [
  {
    titulo: 'Terriblemente cruel',
    artista: 'Leiva',
    secciones: [{
      titulo: 'Letra',
      letra: `Sabes que yo puedo ser terriblemente cruel
Para que no pierda la tensión
Tal vez, la historia se me fue de las manos

Voy a ser terriblemente fiel
Cuando se te pase la emoción
Ya sé, te puede parecer demasiado`
    }]
  },
  {
    titulo: 'Solo quiero bailar',
    artista: 'Zentric',
    secciones: [{
      titulo: 'Letra',
      letra: `Si no vas a venir.. Avisame pronto
que yo quiero bailar solo quiero bailar
solo quiero olvidar toda esta situacion. (x2)`
    }]
  },
  {
    titulo: 'El fin del mundo',
    artista: 'La La Love You',
    secciones: [{
      titulo: 'Letra',
      letra: `Y tú bailando, bailando, bailando
Y yo llorando, llorando por ti
Me voy muriendo mientras bailas
Me voy muriendo mientras bailas

Y tú bailando, bailando, bailando
Y yo llorando, sufriendo de amor
Me voy muriendo mientras bailas
Me voy muriendo mientras bailas`
    }]
  },
  {
    titulo: 'Emborracharme',
    artista: 'Lori Meyers',
    secciones: [{
      titulo: 'Letra',
      letra: `Y beber todo ese batido, acompañarlo después con vino
Beber hasta emborracharme
Hasta caer rendido y levantarme
Sigo aún borracho perdido
Pero, me atrevo a contarte que yo no quiero ser tu amante.
Que yo no quiero ser tu amante`
    }]
  },
  {
    titulo: 'La mujer de verde',
    artista: 'Izal',
    secciones: [
      { titulo: 'Primera parte', letra: 'dadme una señal...' },
      { titulo: 'Segunda parte', letra: 'tu dame una señal...' }
    ],
    estribilloPendiente: true
  },
  { titulo: 'Toda la noche en la calle', artista: 'Amaral' },
  { titulo: 'Marta, Sebas, Guille y los demás', artista: 'Amaral' },
  { titulo: 'Tenía tanto que darte', artista: 'Nena Daconte' },
  { titulo: 'No puedo vivir sin ti', artista: 'Los Ronaldos' },
  { titulo: 'Debí tirar más fotos', artista: 'Bad Bunny' },
  { titulo: 'Estrella Polar', artista: 'Pereza' },
  { titulo: 'Pienso en aquella tarde', artista: 'Pereza' },
  { titulo: 'Nunca volverá', artista: 'El Sueño de Morfeo' },
  {
    titulo: 'Freed From Desire',
    artista: 'Artista no indicado',
    secciones: [{ titulo: 'Parte indicada', letra: 'Vamos arriba, que no pare la fiesta', repeticiones: 4 }]
  },
  {
    titulo: "L'amour toujours",
    artista: 'Artista no indicado',
    secciones: [{ titulo: 'Parte indicada', letra: 'Que buenos son, que buenos son, los chicos de este pueblo que nos llevan de excursión', repeticiones: 2 }]
  },
  { titulo: 'Las babys', artista: 'Aitana' },
  { titulo: 'El columpio asesino', artista: 'Toro salvaje' },
  { titulo: 'Pedro', artista: 'Raffaella Carrà' },
  { titulo: 'Potra salvaje', artista: 'Isabel Aaiún' },
  { titulo: 'Nochentera', artista: 'Vicco' },
  { titulo: 'La bachata', artista: 'Manuel Turizo' },
  { titulo: 'El merengue', artista: 'Manuel Turizo' },
  { titulo: 'Clavaito', artista: 'Abraham Mateo' },
  {
    titulo: 'Que hubiera sido si antes te hubiera conocido',
    artista: 'Artista no indicado',
    secciones: [{ titulo: 'Parte indicada', letra: 'Yo me caso contigo, tu nombre suena bien con mi apellido...' }],
    estribilloPendiente: true
  },
  { titulo: 'La morocha', artista: 'Artista no indicado' }
];

const INSTRUMENTOS_DISPONIBLES = [
  { nombre: 'Saxo alto', cuerda: 'Saxos' },
  { nombre: 'Saxo tenor', cuerda: 'Saxos' },
  { nombre: 'Trompeta', cuerda: 'Trompetas' },
  { nombre: 'Trombón', cuerda: 'Trombones' },
  { nombre: 'Sousafón / Tuba', cuerda: 'Tuba' },
  { nombre: 'Caja', cuerda: 'Percusión' },
  { nombre: 'Bombo', cuerda: 'Percusión' }
];

const CATALOGO_EXTRAS_POR_CUERDA = [
  { cuerda: 'Saxos', charanga: 'Boqueron', nombres: ['Hector Boqueron', 'Pancete Boqueron'] },
  { cuerda: 'Saxos', charanga: 'Cbrass', nombres: ['Migueli Cbrass'] },
  { cuerda: 'Saxos', charanga: 'Chicuelina', nombres: ['Alonso Chicuelina', 'Pollo Chicuelina'] },
  { cuerda: 'Saxos', charanga: 'Cubalibre', nombres: ['Polo Cubalibre', 'Chovo Cubalibre'] },
  { cuerda: 'Saxos', charanga: 'Cucu', nombres: ['Tudela Cucu'] },
  { cuerda: 'Saxos', charanga: 'Imparables', nombres: ['Josema Imparables'] },
  { cuerda: 'Saxos', charanga: 'Jaleo', nombres: ['Polani Jaleo', 'Pablo Laguna Jaleo', 'Jorge Laguna Jaleo'] },
  { cuerda: 'Saxos', charanga: 'Jarra', nombres: ['Juan Jarra'] },
  { cuerda: 'Saxos', charanga: 'Mejias', nombres: ['Fer Mejias'] },
  { cuerda: 'Saxos', charanga: 'Meneito', nombres: ['Berrón Meneito', 'Alvaro Meneito'] },
  { cuerda: 'Saxos', charanga: 'Nota', nombres: ['Mateo Nota', 'Mateín Nota'] },
  { cuerda: 'Saxos', charanga: 'Ojayo', nombres: ['Alvaro Ojayo', 'Hector Ojayo'] },
  { cuerda: 'Saxos', charanga: 'PDT', nombres: ['Antonio PDT'] },
  { cuerda: 'Saxos', charanga: 'Puntillo', nombres: ['Iñigo Puntillo'] },
  { cuerda: 'Saxos', charanga: 'Relamido', nombres: ['Nico Relamido', 'Sebas Relamido'] },
  { cuerda: 'Saxos', charanga: 'Resaka', nombres: ['Hector Resaka', 'Polo Resaka', 'Parra Resaka'] },
  { cuerda: 'Saxos', charanga: 'SoundBand', nombres: ['Angel SoundBand', 'Cristobal SoundBand'] },
  { cuerda: 'Trompetas', charanga: 'Ayllon', nombres: ['Tino Ayllon'] },
  { cuerda: 'Trompetas', charanga: 'Boqueron', nombres: ['Isma Boquerón'] },
  { cuerda: 'Trompetas', charanga: 'Cbrass', nombres: ['Marcos Cbrass', 'Abraham Cbrass'] },
  { cuerda: 'Trompetas', charanga: 'Chicuelina', nombres: ['Cascas Chicuelina', 'Charly Chicuelina'] },
  { cuerda: 'Trompetas', charanga: 'Cucu', nombres: ['Nacho Cucu', 'Pablo Cucu'] },
  { cuerda: 'Trompetas', charanga: 'Huevera', nombres: ['Victor Huevera'] },
  { cuerda: 'Trompetas', charanga: 'Imparables', nombres: ['Oscar Imparables'] },
  { cuerda: 'Trompetas', charanga: 'Jaleo', nombres: ['Adri Jaleo', 'Jorge Jaleo'] },
  { cuerda: 'Trompetas', charanga: 'Jarra', nombres: ['Pablo Jarra', 'Urko Jarra', 'Guille Jarra'] },
  { cuerda: 'Trompetas', charanga: 'Juerga', nombres: ['Xumy Juerga'] },
  { cuerda: 'Trompetas', charanga: 'Nota', nombres: ['Dani Nota', 'Barrunta Nota'] },
  { cuerda: 'Trompetas', charanga: 'Ojayo', nombres: ['Tobes Ojayo', 'Andres Ojayo'] },
  { cuerda: 'Trompetas', charanga: 'Resaka', nombres: ['Guille Resaka', 'Luisen Resaka'] },
  { cuerda: 'Trombones', charanga: 'Boqueron', nombres: ['Jorge Boqueron', 'Mario Boqueron'] },
  { cuerda: 'Trombones', charanga: 'Chicuelina', nombres: ['Camaron Chicuelina', 'Rulas Chicuelina'] },
  { cuerda: 'Trombones', charanga: 'Cubalibre', nombres: ['Morris Cubalibre', 'Ledo Cubalibre', 'Moradillo Cubalibre'] },
  { cuerda: 'Trombones', charanga: 'Espinar Freelance', nombres: ['Isma Espinar Freelance'] },
  { cuerda: 'Trombones', charanga: 'Huevera', nombres: ['Raul Huevera', 'Mario Huevera', 'Oscar Huevera'] },
  { cuerda: 'Trombones', charanga: 'Jaleo', nombres: ['Pablo Jr Jaleo', 'Monjas Jaleo', 'Pablo Jaleo', 'Zarzuela Jaleo'] },
  { cuerda: 'Trombones', charanga: 'Jarra', nombres: ['Moragues Jarra', 'Rodrigo Jarra'] },
  { cuerda: 'Trombones', charanga: 'Nota', nombres: ['Cordero Nota', 'Tipitin Nota'] },
  { cuerda: 'Trombones', charanga: 'Ojayo', nombres: ['Oso Ojayo'] },
  { cuerda: 'Trombones', charanga: 'Patxaran', nombres: ['David Patxaran'] },
  { cuerda: 'Trombones', charanga: 'Queloques', nombres: ['Hector Queloques'] },
  { cuerda: 'Trombones', charanga: 'Resaka', nombres: ['Guille Resaka', 'Ramon Resaka', 'Maria Resaka'] },
  { cuerda: 'Trombones', charanga: 'SoundBand', nombres: ['Chuty SoundBand'] },
  { cuerda: 'Tuba', charanga: 'Atrevida', nombres: ['Aitor Atrevida'] },
  { cuerda: 'Tuba', charanga: 'Boqueron', nombres: ['Emilio Boqueron'] },
  { cuerda: 'Tuba', charanga: 'Chicuelina', nombres: ['Alonso Chicuelina', 'Pinillos Chicuelina'] },
  { cuerda: 'Tuba', charanga: 'Conejo', nombres: ['Chechu Conejo'] },
  { cuerda: 'Tuba', charanga: 'Cubalibre', nombres: ['Carlos Cubalibre', 'Avispilla Cubalibre'] },
  { cuerda: 'Tuba', charanga: 'Cucu', nombres: ['Pablo Cucu'] },
  { cuerda: 'Tuba', charanga: 'Desacuerdo', nombres: ['Carlos Desacuerdo'] },
  { cuerda: 'Tuba', charanga: 'Desfase', nombres: ['Jesus Desfase'] },
  { cuerda: 'Tuba', charanga: 'Fugitivos', nombres: ['Alfredo Fugitivos'] },
  { cuerda: 'Tuba', charanga: 'Imparables', nombres: ['Javi Imparables', 'Oscar Imparables'] },
  { cuerda: 'Tuba', charanga: 'Jarra', nombres: ['Borja Jarra'] },
  { cuerda: 'Tuba', charanga: 'Meneito', nombres: ['Guille Meneito'] },
  { cuerda: 'Tuba', charanga: 'Queloques', nombres: ['Carlos Queloques', 'Hector Queloques'] },
  { cuerda: 'Tuba', charanga: 'Relamido', nombres: ['Sergio Relamido'] },
  { cuerda: 'Tuba', charanga: 'Resaka', nombres: ['Jesus Resaka'] },
  { cuerda: 'Tuba', charanga: 'SoundBand', nombres: ['Jesus SoundBand'] },
  { cuerda: 'Tuba', charanga: 'Temblones', nombres: ['Armando Temblones'] },
  { cuerda: 'Tuba', charanga: 'Vicio', nombres: ['Joseba Vicio'] },
  { cuerda: 'Tuba', charanga: 'Villanos del Ruido', nombres: ['Carba Villanos del Ruido'] },
  { cuerda: 'Percusión', charanga: 'Boqueron', nombres: ['Vegas Boqueron', 'Victor Boqueron'] },
  { cuerda: 'Percusión', charanga: 'Chicue', nombres: ['Bulgaro Chicue'] },
  { cuerda: 'Percusión', charanga: 'Cubalibre', nombres: ['Chino Cubalibre'] },
  { cuerda: 'Percusión', charanga: 'Cucu', nombres: ['Saul Cucu', 'Carolo Cucu'] },
  { cuerda: 'Percusión', charanga: 'Fugitivos', nombres: ['Ledesma Fugitivos'] },
  { cuerda: 'Percusión', charanga: 'Huevera', nombres: ['Cristian Huevera'] },
  { cuerda: 'Percusión', charanga: 'Jaleo', nombres: ['Mangon Jaleo', 'Juanma Jaleo', 'Fer Jaleo'] },
  { cuerda: 'Percusión', charanga: 'Jarra', nombres: ['Elias Jarra'] },
  { cuerda: 'Percusión', charanga: 'Mejias', nombres: ['Ruben Mejias'] },
  { cuerda: 'Percusión', charanga: 'New Tocados', nombres: ['Coli New Tocados'] },
  { cuerda: 'Percusión', charanga: 'Nota', nombres: ['Ander Nota', 'Montalvillo Nota', 'Javi Nota'] },
  { cuerda: 'Percusión', charanga: 'Ojayo', nombres: ['Campas Ojayo'] },
  { cuerda: 'Percusión', charanga: 'Rumano Imparables', nombres: ['Carlillos Rumano Imparables'] },
  { cuerda: 'Percusión', charanga: 'SoundBand', nombres: ['Carlitos SoundBand', 'Chtuy Jr SoundBand'] },
  { cuerda: 'Percusión', charanga: 'Union', nombres: ['Dani Union'] }
];

const ORDEN_CUERDAS_EXTRAS = ['Saxos', 'Trompetas', 'Trombones', 'Tuba', 'Percusión'];
const COMPARADOR_EXTRAS = new Intl.Collator('es', { sensitivity: 'base' });
const CATALOGO_EXTRAS = CATALOGO_EXTRAS_POR_CUERDA
  .flatMap(({ cuerda, charanga, nombres }) => nombres.map(nombre => ({
    id: `extra-${cuerda}-${charanga}-${nombre}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    nombre,
    charanga,
    cuerda,
    instrumento: cuerda
  })))
  .sort((a, b) =>
    ORDEN_CUERDAS_EXTRAS.indexOf(a.cuerda) - ORDEN_CUERDAS_EXTRAS.indexOf(b.cuerda) ||
    COMPARADOR_EXTRAS.compare(a.charanga, b.charanga) ||
    COMPARADOR_EXTRAS.compare(a.nombre, b.nombre)
  );

const OPCIONES_VESTUARIO = [
  { id: 'Por definir', label: 'Por definir', color: 'bg-zinc-900 text-zinc-400 border-zinc-800' },
  { id: 'Negro', label: 'Camiseta Negra', color: 'bg-zinc-800 text-zinc-100 border-zinc-700' },
  { id: 'Blanco', label: 'Camiseta Blanca', color: 'bg-zinc-100 text-black border-white font-black' },
  { id: 'Full Print', label: 'Full Print Sarao', color: 'bg-gradient-to-r from-green-500 to-emerald-400 text-black font-black border-green-400' }
];

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Generar lista de meses desde Sep 2026 hasta Dic 2028
const MESES_PERMITIDOS = [];
for (let anio = 2026; anio <= 2028; anio++) {
  const mesInicio = anio === 2026 ? 8 : 0;
  const mesFin = 11;
  for (let mes = mesInicio; mes <= mesFin; mes++) {
    MESES_PERMITIDOS.push({ anio, mes, label: `${NOMBRES_MESES[mes]} ${anio}` });
  }
}

export default function CharangaSaraoApp() {
  const [cargado, setCargado] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [nombreRegistro, setNombreRegistro] = useState('');
  const [instrumentosSeleccionados, setInstrumentosSeleccionados] = useState(['Sousafón / Tuba']);
  const PASSWORD_CHARANGA = 'sarao2k27';
  const PASSWORD_ADMIN = 'adminsarao';

  // Estados globales sincronizados con Firebase
  const [miembros, setMiembros] = useState([]);
  const [bolos, setBolos] = useState([]);
  const [vacaciones, setVacaciones] = useState([]);
  const [showModalVacaciones, setShowModalVacaciones] = useState(false);
  const [fechaInicioVacaciones, setFechaInicioVacaciones] = useState('');
  const [fechaFinVacaciones, setFechaFinVacaciones] = useState('');
  const [movimientosBote, setMovimientosBote] = useState([]);
  const [anioFinanzasSeleccionado, setAnioFinanzasSeleccionado] = useState('todos');
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busquedaClientes, setBusquedaClientes] = useState('');
  const [mostrarFormularioCliente, setMostrarFormularioCliente] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  const [formCliente, setFormCliente] = useState({ nombre: '', tipo: 'Ayuntamiento', contacto: '', telefono: '', email: '', localidad: '', notas: '' });
  const [correoFacturacion, setCorreoFacturacion] = useState('');
  const [inputCorreoAdmin, setInputCorreoAdmin] = useState('');

  const [historialEstados, setHistorialEstados] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [notificacionesPersonales, setNotificacionesPersonales] = useState([]);
  const [filtroNotificaciones, setFiltroNotificaciones] = useState('todas');
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [pestañaActiva, setPestañaActiva] = useState('landing');
  const [seccionAdminActiva, setSeccionAdminActiva] = useState('resumen');
  const [boloSeleccionadoId, setBoloSeleccionadoId] = useState(null);
  const [nuevaTareaBolo, setNuevaTareaBolo] = useState('');
  const [responsableTareaBolo, setResponsableTareaBolo] = useState('');
  const [boloDisponibilidadAbiertoId, setBoloDisponibilidadAbiertoId] = useState(null);
  const [mesIndexActivo, setMesIndexActivo] = useState(0);
  const [calendarZoom, setCalendarZoom] = useState(1);
  const calendarPinchRef = React.useRef(null);
  const navGestureRef = React.useRef(null);
  const [navGestureTab, setNavGestureTab] = useState(null);
  const seleccionarPestanaInferior = (id) => {
    setPestañaActiva(id);
    if (id !== 'bolos') setBoloSeleccionadoId(null);
  };
  const detectarPestanaBajoDedo = (nav, x, y) => {
    const botones = [...nav.querySelectorAll('button[data-nav-tab]')];
    const encontrado = botones.find(b => {
      const r = b.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top - 16 && y <= r.bottom + 16;
    });
    if (encontrado) return encontrado.dataset.navTab;
    return botones.reduce((mejor, b) => {
      const r = b.getBoundingClientRect();
      const distancia = Math.abs(x - (r.left + r.right) / 2);
      return !mejor || distancia < mejor.distancia ? { id: b.dataset.navTab, distancia } : mejor;
    }, null)?.id || null;
  };


  // Modales Bolos (Añadir, Editar, Eliminar)
  const [showModalBolo, setShowModalBolo] = useState(false);
  const [tipoCreacionEvento, setTipoCreacionEvento] = useState('confirmado'); // 'confirmado' | 'presupuestado' | 'ensayo'
  const [showModalEditarBolos, setShowModalEditarBolos] = useState(false);
  const [boloEditandoId, setBoloEditandoId] = useState(null);
  const [showModalEliminarBolos, setShowModalEliminarBolos] = useState(false);

  // Modal específico para Crear / Editar Ensayos
  const [showModalEnsayo, setShowModalEnsayo] = useState(false);
  const [ensayoEditandoId, setEnsayoEditandoId] = useState(null);
  const [lugarEnsayo, setLugarEnsayo] = useState('');
  const [fechaEnsayo, setFechaEnsayo] = useState('');
  const [horaEnsayo, setHoraEnsayo] = useState('');
  const [repertorioEnsayo, setRepertorioEnsayo] = useState('');

  // Modal de Confirmación de Presupuesto
  const [showModalConfirmarPresupuesto, setShowModalConfirmarPresupuesto] = useState(false);
  const [presupuestoAConfirmarId, setPresupuestoAConfirmarId] = useState(null);

  const [nuevoLugarBolo, setNuevoLugarBolo] = useState('');
  const [nuevoTituloBolo, setNuevoTituloBolo] = useState('');
  const [nuevaFechaBolo, setNuevaFechaBolo] = useState('');
  const [nuevaHoraInicioBolo, setNuevaHoraInicioBolo] = useState('');
  const [nuevaHoraFinBolo, setNuevaHoraFinBolo] = useState('');
  const [nuevoPresupuestoBolo, setNuevoPresupuestoBolo] = useState('');
  const [nuevoConFacturaBolo, setNuevoConFacturaBolo] = useState(false);
  const [nuevoRepertorioEnsayo, setNuevoRepertorioEnsayo] = useState('');

  // Estados de Edición / Confirmación de Bolo
  const [editLugarBolo, setEditLugarBolo] = useState('');
  const [editTituloBolo, setEditTituloBolo] = useState('');
  const [editFechaBolo, setEditFechaBolo] = useState('');
  const [editHoraInicioBolo, setEditHoraInicioBolo] = useState('');
  const [editHoraFinBolo, setEditHoraFinBolo] = useState('');
  const [editPresupuestoBolo, setEditPresupuestoBolo] = useState('');
  const [editConFacturaBolo, setEditConFacturaBolo] = useState(false);
  const [editRepertorioBolo, setEditRepertorioBolo] = useState('');

  // Modal Músico Extra
  const [showModalExtra, setShowModalExtra] = useState(false);
  const [extraCatalogoSeleccionadoId, setExtraCatalogoSeleccionadoId] = useState('');

  // Trayectos y Plazas de Coches
  const [showModalTrayectoBolo, setShowModalTrayectoBolo] = useState(false);
  const [extraAsignadoTrayectoId, setExtraAsignadoTrayectoId] = useState('');
  const [puntosRecogidaSeleccionados, setPuntosRecogidaSeleccionados] = useState({});
  const [vehiculoTrayecto, setVehiculoTrayecto] = useState('');
  const [plazasTrayecto, setPlazasTrayecto] = useState('4');
  const [origenTrayecto, setOrigenTrayecto] = useState('');
  const [horaSalidaOrigen, setHoraSalidaOrigen] = useState('');
  const [paradasIntermedias, setParadasIntermedias] = useState([{ lugar: '', hora: '' }]);
  const [destinoTrayecto, setDestinoTrayecto] = useState('');
  const [horaLlegadaDestino, setHoraLlegadaDestino] = useState('');
  const [instrumentoElegidoBolo, setInstrumentoElegidoBolo] = useState('');

  // Bote y Gasolina
  const [showModalMovimientoBote, setShowModalMovimientoBote] = useState(false);
  const [conceptoBote, setConceptoBote] = useState('');
  const [importeBote, setImporteBote] = useState('');
  const [tipoMovimientoBote, setTipoMovimientoBote] = useState('ingreso');
  const [boloSeleccionadoIngreso, setBoloSeleccionadoIngreso] = useState('');

  const [showModalGasolina, setShowModalGasolina] = useState(false);
  const [kmGasolina, setKmGasolina] = useState('');
  const [destinoGasolina, setDestinoGasolina] = useState('');
  const [conductorGasolinaNombre, setConductorGasolinaNombre] = useState('');
  const TARIFA_KM = 0.2;

  // Estados de Facturas
  const [showModalSubirFactura, setShowModalSubirFactura] = useState(false);
  const [archivoFactura, setArchivoFactura] = useState(null);
  const [errorArchivoFactura, setErrorArchivoFactura] = useState('');
  const [previewArchivoUrl, setPreviewArchivoUrl] = useState('');
  const [nombreArchivoFactura, setNombreArchivoFactura] = useState('');
  const [conceptoFactura, setConceptoFactura] = useState('');
  const [importeFacturaDetectado, setImporteFacturaDetectado] = useState('');
  const [analizandoFactura, setAnalizandoFactura] = useState(false);
  const [enviandoFactura, setEnviandoFactura] = useState(false);
  const [mensajeAnalisis, setMensajeAnalisis] = useState('');

  // Sincronización Firebase y cálculo del mes actual
  useEffect(() => {
    const hoy = new Date();
    const anioHoy = hoy.getFullYear();
    const mesHoy = hoy.getMonth();
    const idxActual = MESES_PERMITIDOS.findIndex(m => m.anio === anioHoy && m.mes === mesHoy);
    if (idxActual !== -1) {
      setMesIndexActivo(idxActual);
    }

    let usuarioLocal = null;
    try {
      const uGuardado = localStorage.getItem('sarao_usuario_actual');
      if (uGuardado) {
        usuarioLocal = JSON.parse(uGuardado);
        setUsuarioActual(usuarioLocal);
        setAutenticado(true);
      }
    } catch (e) {
      console.error(e);
    }

    const docRef = doc(db, 'charanga', 'datos_generales');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMiembros(data.miembros || []);
        setVacaciones(Array.isArray(data.vacaciones) ? data.vacaciones : []);
        if (data.bolos) setBolos(data.bolos);
        if (data.movimientosBote) setMovimientosBote(data.movimientosBote);
        if (data.facturas) setFacturas(data.facturas);
        setClientes(data.clientes || []);
        if (data.correoFacturacion !== undefined) {
          setCorreoFacturacion(data.correoFacturacion);
          setInputCorreoAdmin(data.correoFacturacion);
        }
      } else {
        setDoc(docRef, {
          miembros: usuarioLocal ? [usuarioLocal] : [],
          bolos: [{
            id: 1,
            titulo: 'Pasacalles y Vermú',
            lugar: 'Cuéllar',
            fecha: '2027-08-15',
            horaInicio: '13:00h',
            horaFin: '17:00h',
            vestuario: 'Negro',
            presupuesto: 1200,
            conFactura: true,
            estadoBolo: 'confirmado',
            cochesAsignados: [],
            musicosExtras: []
          }],
          movimientosBote: [{ id: 1, concepto: 'Fondo inicial caja Sarao', cantidad: 0, fecha: 'Inicio', tipo: 'ingreso', autor: 'Admin', verificado: true }],
          facturas: [],
          correoFacturacion: ''
        });
      }
      setCargado(true);
    }, (error) => {
      console.error("Error conectando a Firestore:", error);
      setCargado(true);
    });

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Bangers&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (usuarioActual && miembros.length > 0) {
      const actualEnBD = miembros.find(
        m => m.id === usuarioActual.id || m.nombre?.trim().toLowerCase() === usuarioActual.nombre?.trim().toLowerCase()
      );
      if (actualEnBD && JSON.stringify(actualEnBD) !== JSON.stringify(usuarioActual)) {
        setUsuarioActual(actualEnBD);
        localStorage.setItem('sarao_usuario_actual', JSON.stringify(actualEnBD));
      }
    }
  }, [miembros]);

  useEffect(() => {
    if (!autenticado || !cargado || typeof window === 'undefined') return;

    const eventId = new URLSearchParams(window.location.search).get('evento');
    const calendarEvent = bolos.find(evento => String(evento.id) === eventId);
    if (!calendarEvent) return;

    setBoloSeleccionadoId(calendarEvent.id);
    setPestañaActiva('bolos');
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.hash}`,
    );
  }, [autenticado, cargado, bolos]);

  const guardarEnNube = async (nuevosMiembros, nuevosBolos, nuevoBote, nuevasFacturas = null, nuevoCorreo = null) => {
    try {
      await setDoc(doc(db, 'charanga', 'datos_generales'), {
        miembros: nuevosMiembros ?? miembros,
        bolos: nuevosBolos ?? bolos,
        movimientosBote: nuevoBote ?? movimientosBote,
        facturas: nuevasFacturas ?? facturas,
        correoFacturacion: nuevoCorreo !== null ? nuevoCorreo : correoFacturacion
      }, { merge: true });
      return true;
    } catch (e) {
      console.error("Error guardando en la nube:", e);
      alert("No se pudo sincronizar con Firebase. Revisa tu conexión.");
      return false;
    }
  };

  const guardarClientesEnNube = async (listaClientes) => {
    try {
      await setDoc(doc(db, 'charanga', 'datos_generales'), { clientes: listaClientes }, { merge: true });
      setClientes(listaClientes);
      return true;
    } catch (error) {
      console.error('Error guardando clientes:', error);
      alert('No se pudieron guardar los cambios de clientes. Comprueba la conexión.');
      return false;
    }
  };

  const guardarNotificacionesBandeja = async ({ titulo, mensaje, tipo = 'general', destinatarios = null, destino = 'bolos', boloId = null }) => {
    const receptores = destinatarios || miembros.map(m => m.id).filter(Boolean);
    if (!receptores.length) return;
    const creadaEn = new Date().toISOString();
    try {
      await Promise.all(receptores.map(async receptorId => {
        const notificacionId = `notif-${receptorId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await setDoc(doc(db, 'notificaciones', notificacionId), {
          receptorId: String(receptorId), titulo, mensaje, tipo, destino, boloId: boloId ?? null,
          creadaEn, leida: false
        });
      }));
    } catch (error) { console.error('No se pudo guardar la notificación en la bandeja:', error); }
  };

  useEffect(() => {
    if (!usuarioActual?.id) { setNotificacionesPersonales([]); return; }
    const consultaPersonal = query(collection(db, 'notificaciones'), where('receptorId', '==', String(usuarioActual.id)));
    const unsubscribe = onSnapshot(consultaPersonal, snapshot => {
      const propias = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.creadaEn || 0) - new Date(a.creadaEn || 0));
      setNotificacionesPersonales(propias);
    }, error => console.error('Error cargando notificaciones personales:', error));
    return () => unsubscribe();
  }, [usuarioActual?.id]);

  const marcarNotificacionLeida = async (notificacion, leida = true) => {
    try {
      await setDoc(doc(db, 'notificaciones', notificacion.id), { leida }, { merge: true });
    } catch (error) { console.error('No se pudo actualizar la notificación:', error); }
  };

  const abrirNotificacion = async notificacion => {
    if (!notificacion.leida) await marcarNotificacionLeida(notificacion, true);
    setNotificacionesAbiertas(false);
    if (notificacion.boloId) seleccionarBolo(notificacion.boloId);
    else seleccionarPestanaInferior(notificacion.destino || 'bolos');
  };

  const enviarNotificacionAUsuarios = async ({ titulo, mensaje }) => {
    try {
      await guardarNotificacionesBandeja({ titulo, mensaje, tipo: 'general' });
      const snapshot = await getDocs(collection(db, 'tokens_notificaciones'));
      const tokens = [...new Set(
        snapshot.docs
          .map(docSnap => docSnap.data()?.token)
          .filter(token => typeof token === 'string' && token.trim())
          .map(token => token.trim())
      )];

      if (tokens.length === 0) {
        console.warn('No hay tokens FCM guardados para enviar la notificación.');
        alert('El cambio se guardó, pero no hay dispositivos registrados para notificar.');
        return;
      }

      let successCount = 0;
      let failureCount = 0;
      for (let index = 0; index < tokens.length; index += 500) {
        const response = await fetch('/api/enviar-notificacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo,
            mensaje,
            tokens: tokens.slice(index, index + 500)
          })
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
          throw new Error(result.error || 'No se pudo enviar la notificación.');
        }

        successCount += result.response?.successCount || 0;
        failureCount += result.response?.failureCount || 0;
      }

      if (failureCount > 0) {
        console.warn('Algunos dispositivos no recibieron la notificación:', {
          successCount,
          failureCount
        });
        alert(`Notificación enviada a ${successCount} dispositivo(s); falló en ${failureCount}.`);
      }
    } catch (error) {
      console.error('Error enviando la notificación:', error);
      alert('El cambio se guardó, pero no se pudieron enviar las notificaciones. Revisa la consola.');
    }
  };

  const notificarTareaAsignada = async ({ miembroId, tarea, bolo }) => {
    if (!miembroId) return;
    try {
      await guardarNotificacionesBandeja({
        titulo: 'Te han asignado una tarea',
        mensaje: `En ${bolo.lugar || bolo.titulo || 'un bolo'}: ${tarea}`,
        tipo: 'personal', destinatarios: [miembroId], destino: 'bolos', boloId: bolo.id
      });
      const snapshot = await getDocs(collection(db, 'tokens_notificaciones'));
      const tokens = [...new Set(snapshot.docs
        .filter(d => String(d.data()?.userId) === String(miembroId))
        .map(d => d.data()?.token)
        .filter(token => typeof token === 'string' && token.trim())
        .map(token => token.trim())
      )];
      if (!tokens.length) {
        console.warn('El responsable no tiene ningún dispositivo registrado para recibir notificaciones.');
        return;
      }
      for (let index = 0; index < tokens.length; index += 500) {
        const response = await fetch('/api/enviar-notificacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: 'Te han asignado una tarea',
            mensaje: `En ${bolo.lugar || bolo.titulo || 'un bolo'}: ${tarea}`,
            tokens: tokens.slice(index, index + 500)
          })
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
          throw new Error(result.error || 'No se pudo enviar la notificación de la tarea.');
        }
      }
    } catch (error) {
      console.error('Error notificando la tarea asignada:', error);
    }
  };

  const enviarNotificacionBoloConEnlace = async ({ titulo, mensaje, url }) => {
    try {
      await guardarNotificacionesBandeja({ titulo, mensaje, tipo: 'general', destino: 'bolos' });
      const snapshot = await getDocs(collection(db, 'tokens_notificaciones'));
      const tokens = [...new Set(
        snapshot.docs
          .map(docSnap => docSnap.data()?.token)
          .filter(token => typeof token === 'string' && token.trim())
          .map(token => token.trim())
      )];

      if (tokens.length === 0) {
        console.warn('No hay tokens FCM guardados para enviar la notificación del bolo.');
        return;
      }

      for (let index = 0; index < tokens.length; index += 500) {
        const response = await fetch('/api/enviar-notificacion-bolo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo,
            mensaje,
            url,
            tokens: tokens.slice(index, index + 500)
          })
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
          throw new Error(result.error || 'No se pudo enviar la notificación del bolo.');
        }
      }
    } catch (error) {
      console.error('Error enviando la notificación del bolo:', error);
      alert('El bolo se ha guardado, pero no se pudo enviar la notificación push.');
    }
  };

  // Avisos nuevos de cambios: flujo independiente del sistema antiguo.
  const enviarNotificacionCambio = async ({ type, previousEvent, currentEvent = null }) => {
    try {
      const response = await fetch('/api/notificar-cambio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, previousEvent, currentEvent })
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        console.error('No se pudo enviar el aviso del cambio:', result.error || result);
      }
    } catch (error) {
      console.error('Error enviando el aviso nuevo del cambio:', error);
    }
  };

  const registrarSnapshot = () => {
    setHistorialEstados(prev => [
      ...prev.slice(-15),
      {
        miembros: JSON.parse(JSON.stringify(miembros)),
        bolos: JSON.parse(JSON.stringify(bolos)),
        movimientosBote: JSON.parse(JSON.stringify(movimientosBote)),
        facturas: JSON.parse(JSON.stringify(facturas))
      }
    ]);
  };

  const deshacerUltimoCambio = async () => {
    if (historialEstados.length === 0) {
      alert('No hay acciones previas para deshacer.');
      return;
    }
    const anterior = historialEstados[historialEstados.length - 1];
    setHistorialEstados(prev => prev.slice(0, -1));
    await guardarEnNube(anterior.miembros, anterior.bolos, anterior.movimientosBote, anterior.facturas);
    alert('Acción revertida correctamente en todos los dispositivos.');
  };

  // ROLES Y PERMISOS
  const esAdmin = usuarioActual?.roles?.includes('admin');
  const esGestorBolos = usuarioActual?.roles?.includes('bolos') || esAdmin;
  const esGestorVacaciones = esAdmin || usuarioActual?.roles?.includes('bolos');
  const ROLES_CUERDAS = [
    { id: 'percusion', label: 'Percusión' },
    { id: 'trompetas', label: 'Trompetas' },
    { id: 'saxos', label: 'Saxos' },
    { id: 'trombones', label: 'Trombones' },
    { id: 'tuba', label: 'Tuba' }
  ];
  const rolesCuerdaUsuario = (usuarioActual?.roles || []).filter(r => ROLES_CUERDAS.some(c => c.id === r));
  const vacacionesVisibles = vacaciones.filter(v =>
    esGestorVacaciones ||
    String(v.usuarioId) === String(usuarioActual?.id) ||
    (v.rolesCuerda || []).some(r => rolesCuerdaUsuario.includes(r))
  );
  const tieneRolConductor = usuarioActual?.roles?.includes('conductor');
  const esConductor = tieneRolConductor || esAdmin;
  const esTesorero = usuarioActual?.roles?.includes('tesorero') || esAdmin;
  const esFacturador = usuarioActual?.roles?.includes('facturador') || esAdmin;
  const esJefeCuerda = usuarioActual?.roles?.includes('jefe_cuerda');
  const puedeGestionarExtras = esAdmin || esJefeCuerda;

  const handleLogin = async (e) => {
    e.preventDefault();
    const pass = passwordInput.trim();

    if (pass !== PASSWORD_CHARANGA && pass !== PASSWORD_ADMIN) {
      alert('Contraseña incorrecta.');
      return;
    }
    if (!nombreRegistro.trim()) {
      alert('Introduce tu nombre.');
      return;
    }

    const instPrincipal = instrumentosSeleccionados[0];
    const matchCuerda = INSTRUMENTOS_DISPONIBLES.find(i => i.nombre === instPrincipal)?.cuerda || 'Saxos';
    const esAdminAcceso = pass === PASSWORD_ADMIN || nombreRegistro.trim().toLowerCase() === 'edgar';

    const existente = miembros.find(m => m.nombre.trim().toLowerCase() === nombreRegistro.trim().toLowerCase());
    if (existente) {
      const miembroActualizado = {
        ...existente,
        roles: esAdminAcceso && !existente.roles.includes('admin') ? [...new Set([...existente.roles, 'admin'])] : existente.roles
      };
      setUsuarioActual(miembroActualizado);
      localStorage.setItem('sarao_usuario_actual', JSON.stringify(miembroActualizado));
      setAutenticado(true);
      const listaActualizada = miembros.map(m => m.id === existente.id ? miembroActualizado : m);
      setMiembros(listaActualizada);
      await guardarEnNube(listaActualizada, null, null);
      return;
    }

    const extraRegistrado = CATALOGO_EXTRAS.find(
      extra => extra.nombre.toLocaleLowerCase('es') === nombreRegistro.trim().toLocaleLowerCase('es')
    );
    if (extraRegistrado && !esAdminAcceso) {
      const perfilExtra = {
        ...extraRegistrado,
        tipoPerfil: 'extra',
        instrumentos: [extraRegistrado.instrumento],
        roles: ['extra']
      };
      setUsuarioActual(perfilExtra);
      localStorage.setItem('sarao_usuario_actual', JSON.stringify(perfilExtra));
      setAutenticado(true);
      return;
    }

    registrarSnapshot();
    const nuevoMiembro = {
      id: Date.now(),
      nombre: nombreRegistro.trim(),
      instrumentos: instrumentosSeleccionados,
      cuerda: matchCuerda,
      roles: esAdminAcceso ? ['admin'] : ['musico'],
      disponibilidadBolos: {}
    };

    const nuevaLista = [...miembros, nuevoMiembro];
    setUsuarioActual(nuevoMiembro);
    setMiembros(nuevaLista);
    localStorage.setItem('sarao_usuario_actual', JSON.stringify(nuevoMiembro));
    setAutenticado(true);
    await guardarEnNube(nuevaLista, null, null);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('sarao_usuario_actual');
    setUsuarioActual(null);
    setAutenticado(false);
    setPasswordInput('');
    setPestañaActiva('landing');
  };

  const toggleInstrumentoRegistro = (nombreInst) => {
    if (instrumentosSeleccionados.includes(nombreInst)) {
      if (instrumentosSeleccionados.length > 1) {
        setInstrumentosSeleccionados(instrumentosSeleccionados.filter(i => i !== nombreInst));
      }
    } else {
      setInstrumentosSeleccionados([...instrumentosSeleccionados, nombreInst]);
    }
  };

  const notificarBajaUrgencia = async (bolo, miembro) => {
    try {
      const responsables = miembros.filter(m =>
        m.roles?.includes('admin') ||
        (m.roles?.includes('jefe_cuerda') && m.cuerda === miembro.cuerda)
      );
      const idsResponsables = new Set(responsables.map(m => String(m.id ?? m.nombre)));
      const snapshot = await getDocs(collection(db, 'tokens_notificaciones'));
      const tokens = [...new Set(snapshot.docs
        .filter(d => idsResponsables.has(String(d.data()?.userId)))
        .map(d => d.data()?.token)
        .filter(token => typeof token === 'string' && token.trim())
        .map(token => token.trim())
      )];
      if (!tokens.length) {
        console.warn('No hay dispositivos registrados para el jefe de cuerda o administración de esta baja.');
        return;
      }
      for (let i = 0; i < tokens.length; i += 500) {
        const response = await fetch('/api/enviar-notificacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: 'Baja de disponibilidad por urgencia',
            mensaje: `${miembro.nombre} finalmente no puede asistir al bolo de ${bolo.lugar} (${bolo.fecha}).`,
            tokens: tokens.slice(i, i + 500)
          })
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
          throw new Error(result.error || 'No se pudo enviar el aviso de baja.');
        }
      }
    } catch (error) {
      console.error('Error notificando la baja por urgencia:', error);
      alert('La baja se ha guardado, pero no se pudo enviar la notificación al jefe de cuerda y administración.');
    }
  };

  const registrarBajaUrgencia = async (boloId) => {
    const bolo = bolos.find(b => String(b.id) === String(boloId));
    const miembro = miembros.find(m => String(m.id) === String(usuarioActual.id)) || usuarioActual;
    if (!bolo || bolo.estadoBolo !== 'confirmado' || bolo.estadoBolo === 'ensayo') return;
    if (miembro.disponibilidadBolos?.[boloId]?.estado !== 'puedo') {
      alert('Esta opción solo está disponible si habías confirmado que podías asistir.');
      return;
    }
    if ((bolo.bajasUrgencia || []).some(b => String(b.miembroId) === String(miembro.id))) {
      alert('Ya has comunicado que no puedes asistir a este bolo.');
      return;
    }
    if (!confirm(`¿Comunicar que finalmente no puedes asistir al bolo de ${bolo.lugar}? Se te retirará del organigrama y se avisará a tu jefe de cuerda y administración.`)) return;
    registrarSnapshot();
    const nuevaBaja = {
      miembroId: miembro.id,
      nombre: miembro.nombre,
      cuerda: miembro.cuerda,
      fecha: new Date().toISOString()
    };
    const nuevosBolos = bolos.map(b => String(b.id) === String(boloId)
      ? { ...b, bajasUrgencia: [...(b.bajasUrgencia || []).filter(x => String(x.miembroId) !== String(miembro.id)), nuevaBaja] }
      : b
    );
    setBolos(nuevosBolos);
    const guardado = await guardarEnNube(null, nuevosBolos, null);
    if (guardado) await notificarBajaUrgencia(bolo, miembro);
  };

  const setDisponibilidadBolo = async (boloId, estado, instrumentoElegido = null) => {
    registrarSnapshot();

    const datosDisp = estado === 'puedo' 
      ? { estado, instrumento: instrumentoElegido || usuarioActual.instrumentos?.[0] || 'Saxo alto' } 
      : (estado ? { estado } : null);

    const nuevaDispUsuario = { ...(usuarioActual.disponibilidadBolos || {}) };
    if (datosDisp) {
      nuevaDispUsuario[boloId] = datosDisp;
    } else {
      delete nuevaDispUsuario[boloId];
    }

    const usuarioActualizado = { ...usuarioActual, disponibilidadBolos: nuevaDispUsuario };
    setUsuarioActual(usuarioActualizado);
    localStorage.setItem('sarao_usuario_actual', JSON.stringify(usuarioActualizado));
    if (boloDisponibilidadAbiertoId === boloId) {
      setBoloDisponibilidadAbiertoId(null);
    }

    let listaActualizada = [...miembros];
    const index = listaActualizada.findIndex(
      m => m.id === usuarioActual.id || m.nombre?.trim().toLowerCase() === usuarioActual.nombre?.trim().toLowerCase()
    );

    if (index !== -1) {
      listaActualizada[index] = usuarioActualizado;
    } else {
      listaActualizada.push(usuarioActualizado);
    }

    setMiembros(listaActualizada);
    let nuevosBolos = bolos;
    const boloDeDisponibilidad = bolos.find(b => b.id === boloId);
    if (estado && boloDeDisponibilidad?.estadoBolo !== 'presupuestado') {
      nuevosBolos = bolos.map(b => {
        if (b.id !== boloId) return b;
        const clavePago = `miembro-${usuarioActual.id}`;
        const pagoActual = b.pagosMiembros?.[clavePago] || {};
        return {
          ...b,
          pagosMiembros: {
            ...(b.pagosMiembros || {}),
            [clavePago]: {
              ...pagoActual,
              personaId: usuarioActual.id,
              tipo: 'miembro',
              nombre: usuarioActual.nombre,
              // La disponibilidad no registra por sí sola la asistencia real.
              // La asistencia se marca después desde la ficha de pagos del evento.
            }
          }
        };
      });
      setBolos(nuevosBolos);
    }
    await guardarEnNube(listaActualizada, nuevosBolos !== bolos ? nuevosBolos : null, null);
  };

  const guardarPagoMiembro = async (boloId, persona, tipo, campo, valor) => {
    if (!esAdmin) return;
    registrarSnapshot();
    const clavePago = `${tipo}-${persona.id}`;
    const nuevosBolos = bolos.map(b => {
      if (b.id !== boloId) return b;
      const pagoActual = b.pagosMiembros?.[clavePago] || {};
      return {
        ...b,
        pagosMiembros: {
          ...(b.pagosMiembros || {}),
          [clavePago]: {
            ...pagoActual,
            personaId: persona.id,
            tipo,
            nombre: persona.nombre,
            [campo]: valor,
            ...(campo === 'asistio' ? { asistenciaRegistrada: true, asistenciaValidadaManualmente: true } : {})
          }
        }
      };
    });
    setBolos(nuevosBolos);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const toggleRolMiembro = async (miembroId, rol) => {
    if (!esAdmin) return;
    registrarSnapshot();
    const nuevaLista = miembros.map(m => {
      if (m.id === miembroId) {
        const tieneRol = m.roles?.includes(rol);
        const nuevosRoles = tieneRol ? m.roles.filter(r => r !== rol) : [...(m.roles || []), rol];
        const actualizado = { ...m, roles: nuevosRoles };
        if (usuarioActual.id === m.id) {
          setUsuarioActual(actualizado);
          localStorage.setItem('sarao_usuario_actual', JSON.stringify(actualizado));
        }
        return actualizado;
      }
      return m;
    });
    setMiembros(nuevaLista);
    await guardarEnNube(nuevaLista, null, null);
  };

  const cambiarVestuarioBolo = async (boloId, nuevoVestuario) => {
    if (!esGestorBolos) return;
    registrarSnapshot();
    const boloAnterior = bolos.find(b => b.id === boloId);
    const nuevosBolos = bolos.map(b => b.id === boloId ? { ...b, vestuario: nuevoVestuario } : b);
    const boloActualizado = nuevosBolos.find(b => b.id === boloId);
    setBolos(nuevosBolos);
    const guardado = await guardarEnNube(null, nuevosBolos, null);
    if (guardado && boloAnterior?.estadoBolo === 'confirmado' && boloAnterior.vestuario !== nuevoVestuario) {
      await enviarNotificacionCambio({ type: 'vestuario', previousEvent: boloAnterior, currentEvent: boloActualizado });
    }
  };

  // =========================================================================
  // UNIRSE / SALIR DE LA RUTA DE UN CONDUCTOR (CONTROL DE PLAZAS LIBRES)
  // =========================================================================

  const toggleUnirseRutaCoche = async (boloId, cocheId, puntoRecogida) => {
    const miNombre = usuarioActual.nombre.trim();
    const clavePasajero = miNombre.toLocaleLowerCase('es');
    registrarSnapshot();

    const nuevosBolos = bolos.map(b => {
      if (b.id !== boloId) return b;

      const cocheObjetivo = (b.cochesAsignados || []).find(c => c.id === cocheId);
      if (!cocheObjetivo) return b;

      const pasajerosActuales = cocheObjetivo.pasajeros || [];
      const yaEstoyEnEsteCoche = pasajerosActuales.some(
        p => p.trim().toLocaleLowerCase('es') === clavePasajero
      );
      const plazasTotales = typeof cocheObjetivo.plazasTotales === 'number' ? cocheObjetivo.plazasTotales : 4;
      const huecosLibres = plazasTotales - pasajerosActuales.length;

      if (!yaEstoyEnEsteCoche && huecosLibres <= 0) {
        alert('Este coche ya no tiene plazas libres.');
        return b;
      }

      const nuevosCoches = (b.cochesAsignados || []).map(c => {
        const listaPasajeros = c.pasajeros || [];
        // Si el usuario se une a este coche, lo quitamos de cualquier otro coche de este mismo bolo para no duplicarlo
        const sinMi = listaPasajeros.filter(
          p => p.trim().toLocaleLowerCase('es') !== clavePasajero
        );

        if (c.id === cocheId) {
          return {
            ...c,
            pasajeros: yaEstoyEnEsteCoche ? sinMi : [...sinMi, miNombre],
            recogidasPasajeros: {
              ...(c.recogidasPasajeros || {}),
              ...(yaEstoyEnEsteCoche
                ? Object.fromEntries(Object.entries(c.recogidasPasajeros || {}).filter(([nombre]) => nombre !== clavePasajero))
                : { [clavePasajero]: puntoRecogida || c.origen || '' })
            }
          };
        }
        return {
          ...c,
          pasajeros: sinMi,
          recogidasPasajeros: Object.fromEntries(
            Object.entries(c.recogidasPasajeros || {}).filter(([nombre]) => nombre !== clavePasajero)
          )
        };
      });

      return { ...b, cochesAsignados: nuevosCoches };
    });

    setBolos(nuevosBolos);
    await guardarEnNube(null, nuevosBolos, null);
  };

  // Permitir al conductor o admin bajar a un pasajero concreto de su coche
  const quitarPasajeroDeCoche = async (boloId, cocheId, nombrePasajero) => {
    registrarSnapshot();
    const nuevosBolos = bolos.map(b => {
      if (b.id !== boloId) return b;
      const nuevosCoches = (b.cochesAsignados || []).map(c => {
        if (c.id !== cocheId) return c;
        return {
          ...c,
          pasajeros: (c.pasajeros || []).filter(p => p !== nombrePasajero),
          recogidasPasajeros: Object.fromEntries(
            Object.entries(c.recogidasPasajeros || {}).filter(
              ([nombre]) => nombre !== nombrePasajero.trim().toLocaleLowerCase('es')
            )
          )
        };
      });
      return { ...b, cochesAsignados: nuevosCoches };
    });

    setBolos(nuevosBolos);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const seleccionarBoloParaEditar = (bolo) => {
    setBoloEditandoId(bolo.id);
    setEditLugarBolo(bolo.lugar || '');
    setEditTituloBolo(bolo.estadoBolo === 'ensayo' ? 'Ensayo' : (bolo.titulo || ''));
    setEditFechaBolo(bolo.fecha || '');
    setEditHoraInicioBolo(bolo.horaInicio || '');
    setEditHoraFinBolo(bolo.horaFin || '');
    setEditPresupuestoBolo(bolo.presupuesto ? String(bolo.presupuesto) : '');
    setEditConFacturaBolo(Boolean(bolo.conFactura));
    setEditRepertorioBolo(bolo.repertorio || '');
  };

  const guardarEdicionBolo = async (e) => {
    e.preventDefault();
    if (!esGestorBolos || !boloEditandoId) return;
    if (!editLugarBolo.trim() || !editFechaBolo) {
      alert('El lugar y la fecha son obligatorios.');
      return;
    }

    registrarSnapshot();
    const boloAnterior = bolos.find(b => b.id === boloEditandoId);
    const nuevosBolos = bolos.map(b => {
      if (b.id === boloEditandoId) {
        const esEns = b.estadoBolo === 'ensayo';
        return {
          ...b,
          lugar: editLugarBolo.trim(),
          titulo: esEns ? 'Ensayo' : (editTituloBolo.trim() || 'Actuación'),
          fecha: editFechaBolo,
          horaInicio: editHoraInicioBolo,
          horaFin: esEns ? '' : editHoraFinBolo,
          presupuesto: esEns ? 0 : (parseFloat(editPresupuestoBolo) || 0),
          conFactura: esEns ? false : editConFacturaBolo,
          repertorio: esEns ? editRepertorioBolo.trim() : (b.repertorio || '')
        };
      }
      return b;
    });

    setBolos(nuevosBolos);
    setBoloEditandoId(null);
    setShowModalEditarBolos(false);
    const guardado = await guardarEnNube(null, nuevosBolos, null);
    const boloActualizado = nuevosBolos.find(b => b.id === boloEditandoId);
    if (guardado && boloAnterior?.estadoBolo === 'confirmado' && boloActualizado?.estadoBolo === 'confirmado' &&
        (boloAnterior.fecha !== boloActualizado.fecha || boloAnterior.horaInicio !== boloActualizado.horaInicio)) {
      await enviarNotificacionCambio({ type: 'fecha', previousEvent: boloAnterior, currentEvent: boloActualizado });
    }
  };

  // =========================================================================
  // FUNCIONES DE ENSAYOS
  // =========================================================================

  const abrirModalNuevoEnsayo = () => {
    if (!esGestorBolos) return;
    setEnsayoEditandoId(null);
    setLugarEnsayo('');
    setFechaEnsayo('');
    setHoraEnsayo('');
    setRepertorioEnsayo('');
    setShowModalEnsayo(true);
  };

  const abrirModalEditarEnsayo = (ensayo) => {
    if (!esGestorBolos) return;
    setEnsayoEditandoId(ensayo.id);
    setLugarEnsayo(ensayo.lugar || '');
    setFechaEnsayo(ensayo.fecha || '');
    setHoraEnsayo(ensayo.horaInicio || '');
    setRepertorioEnsayo(ensayo.repertorio || '');
    setShowModalEnsayo(true);
  };

  const guardarEnsayo = async (e) => {
    e.preventDefault();
    if (!esGestorBolos) return;
    if (!lugarEnsayo.trim() || !fechaEnsayo || !horaEnsayo.trim()) {
      alert('Por favor indica el lugar, el día y la hora del ensayo.');
      return;
    }

    registrarSnapshot();
    const creandoNuevoEnsayo = !ensayoEditandoId;
    let nuevosBolos;

    if (ensayoEditandoId) {
      nuevosBolos = bolos.map(b => {
        if (b.id === ensayoEditandoId) {
          return {
            ...b,
            titulo: 'Ensayo',
            lugar: lugarEnsayo.trim(),
            fecha: fechaEnsayo,
            horaInicio: horaEnsayo.trim(),
            repertorio: repertorioEnsayo.trim(),
            estadoBolo: 'ensayo'
          };
        }
        return b;
      });
    } else {
      const nuevoEnsayoObj = {
        id: Date.now(),
        titulo: 'Ensayo',
        lugar: lugarEnsayo.trim(),
        fecha: fechaEnsayo,
        horaInicio: horaEnsayo.trim(),
        horaFin: '',
        repertorio: repertorioEnsayo.trim(),
        vestuario: 'Por definir',
        presupuesto: 0,
        conFactura: false,
        estadoBolo: 'ensayo',
        cochesAsignados: [],
        musicosExtras: []
      };
      nuevosBolos = [...bolos, nuevoEnsayoObj];
    }

    setBolos(nuevosBolos);
    setShowModalEnsayo(false);
    setEnsayoEditandoId(null);
    setLugarEnsayo('');
    setFechaEnsayo('');
    setHoraEnsayo('');
    setRepertorioEnsayo('');
    const guardadoEnNube = await guardarEnNube(null, nuevosBolos, null);
    if (guardadoEnNube && creandoNuevoEnsayo) {
      await enviarNotificacionAUsuarios({
        titulo: 'Nuevo ensayo en el calendario',
        mensaje: `Tenemos nuevo ENSAYO fijado panzabucheeee: ${lugarEnsayo.trim()}`
      });
    }
  };

  const eliminarEnsayo = async (ensayoId, ensayoLugar, ensayoFecha) => {
    if (!esGestorBolos) return;
    if (confirm(`¿Eliminar el ensayo en "${ensayoLugar}" del día ${ensayoFecha}? Desaparecerá de la lista y del calendario.`)) {
      registrarSnapshot();
      const nuevosBolos = bolos.filter(b => b.id !== ensayoId);
      const nuevosMiembros = miembros.map(m => {
        const disp = { ...m.disponibilidadBolos };
        delete disp[ensayoId];
        return { ...m, disponibilidadBolos: disp };
      });
      if (boloSeleccionadoId === ensayoId) setBoloSeleccionadoId(null);
      setBolos(nuevosBolos);
      setMiembros(nuevosMiembros);
      await guardarEnNube(nuevosMiembros, nuevosBolos, null);
    }
  };

  // =========================================================================
  // FUNCIONES DE BOLOS PRESUPUESTADOS
  // =========================================================================

  const abrirModalConfirmarPresupuesto = (bolo) => {
    if (!esGestorBolos) return;
    setPresupuestoAConfirmarId(bolo.id);
    setEditLugarBolo(bolo.lugar || '');
    setEditTituloBolo(bolo.titulo || '');
    setEditFechaBolo(bolo.fecha || '');
    setEditHoraInicioBolo(bolo.horaInicio || '');
    setEditHoraFinBolo(bolo.horaFin || '');
    setEditPresupuestoBolo(bolo.presupuesto ? String(bolo.presupuesto) : '');
    setEditConFacturaBolo(Boolean(bolo.conFactura));
    setShowModalConfirmarPresupuesto(true);
  };

  const guardarDatosPresupuestoEnRevision = (bolo) => ({
    ...bolo,
    lugar: editLugarBolo.trim(),
    titulo: editTituloBolo.trim() || 'Actuación',
    fecha: editFechaBolo,
    horaInicio: editHoraInicioBolo,
    horaFin: editHoraFinBolo,
    presupuesto: parseFloat(editPresupuestoBolo) || 0,
    conFactura: editConFacturaBolo
  });

  const confirmarPresupuestacion = async (e) => {
    e.preventDefault();
    if (!esGestorBolos || !presupuestoAConfirmarId) return;
    if (!editLugarBolo.trim() || !editFechaBolo) {
      alert('El lugar y la fecha son obligatorios.');
      return;
    }

    registrarSnapshot();
    const nuevosBolos = bolos.map(b => b.id === presupuestoAConfirmarId
      ? { ...guardarDatosPresupuestoEnRevision(b), presupuestacionConfirmada: true, estadoBolo: 'presupuestado' }
      : b
    );
    setBolos(nuevosBolos);
    const guardado = await guardarEnNube(null, nuevosBolos, null);
    if (!guardado) return;
    setShowModalConfirmarPresupuesto(false);
    setPresupuestoAConfirmarId(null);
    const fechaPresupuesto = editFechaBolo
      ? new Date(`${editFechaBolo}T00:00:00`).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'fecha por definir';
    const horarioPresupuesto = editHoraInicioBolo?.trim()
      ? ` a las ${editHoraInicioBolo.trim()}${editHoraFinBolo?.trim() ? ` - ${editHoraFinBolo.trim()}` : ''}`
      : '';
    await enviarNotificacionAUsuarios({
      titulo: 'Presupuestación confirmada',
      mensaje: `El bolo del ${fechaPresupuesto}${horarioPresupuesto} en ${editLugarBolo.trim()} se ha presupuestado.`
    });
    alert(`Presupuestación de ${editLugarBolo.trim()} confirmada. Ahora puedes confirmar definitivamente el bolo cuando esté cerrado.`);
  };

  const confirmarBoloPresupuestadoDefinitivo = async (e) => {
    e.preventDefault();
    if (!esGestorBolos || !presupuestoAConfirmarId) return;
    if (!editLugarBolo.trim() || !editFechaBolo) {
      alert('El lugar y la fecha son obligatorios.');
      return;
    }

    registrarSnapshot();
    const nuevosBolos = bolos.map(b => b.id === presupuestoAConfirmarId
      ? { ...guardarDatosPresupuestoEnRevision(b), presupuestacionConfirmada: true, estadoBolo: 'confirmado' }
      : b
    );

    setBolos(nuevosBolos);
    const guardado = await guardarEnNube(null, nuevosBolos, null);
    if (!guardado) return;
    setShowModalConfirmarPresupuesto(false);
    setPresupuestoAConfirmarId(null);
    await enviarNotificacionAUsuarios({
      titulo: 'Bolo confirmado',
      mensaje: `El bolo de ${editLugarBolo.trim()} ya está confirmado. ¡Ya puedes consultar los detalles y organizarte!`
    });
    alert(`¡Bolo en ${editLugarBolo.trim()} confirmado! Ya aparece en color verde en el calendario oficial y en Próximos Bolos.`);
  };

  const rechazarBoloPresupuestado = async (boloId, boloLugar) => {
    if (!esGestorBolos) return;
    if (confirm(`¿Rechazar y descartar el presupuesto de "${boloLugar}"? Desaparecerá del listado y del calendario.`)) {
      registrarSnapshot();
      const nuevosBolos = bolos.filter(b => b.id !== boloId);
      if (boloSeleccionadoId === boloId) setBoloSeleccionadoId(null);
      setBolos(nuevosBolos);
      await guardarEnNube(null, nuevosBolos, null);
    }
  };

  const eliminarBolo = async (boloId, boloLugar) => {
    if (!esGestorBolos) return;
    if (confirm(`¿Eliminar "${boloLugar}" definitivamente del calendario?`)) {
      registrarSnapshot();
      const boloCancelado = bolos.find(b => b.id === boloId);
      const nuevosBolos = bolos.filter(b => b.id !== boloId);
      const nuevosMiembros = miembros.map(m => {
        const disp = { ...m.disponibilidadBolos };
        delete disp[boloId];
        return { ...m, disponibilidadBolos: disp };
      });
      if (boloSeleccionadoId === boloId) setBoloSeleccionadoId(null);
      setBolos(nuevosBolos);
      setMiembros(nuevosMiembros);
      const guardado = await guardarEnNube(nuevosMiembros, nuevosBolos, null);
      if (guardado && boloCancelado?.estadoBolo === 'confirmado') {
        await enviarNotificacionCambio({ type: 'cancelacion', previousEvent: boloCancelado });
      }
    }
  };

  const puedeEliminarAsistencia = (cuerdaMiembro) => {
    if (esAdmin || esGestorBolos) return true;
    if (esJefeCuerda && usuarioActual.cuerda === cuerdaMiembro) return true;
    return false;
  };

  const puedeDesconvocarMiembro = (cuerdaMiembro) =>
    esAdmin || (esJefeCuerda && usuarioActual.cuerda === cuerdaMiembro);

  const actualizarDesconvocatoria = async (miembroId, cuerdaMiembro, nombreMiembro, desconvocar) => {
    if (!puedeDesconvocarMiembro(cuerdaMiembro)) {
      alert('Solo administración o el jefe de la cuerda correspondiente pueden gestionar desconvocatorias.');
      return;
    }
    const accion = desconvocar ? 'Desconvocar' : 'Volver a convocar';
    if (!confirm(`¿${accion} a ${nombreMiembro} para este bolo?`)) return;
    registrarSnapshot();
    const nuevosBolos = bolos.map(b => {
      if (b.id !== boloSeleccionadoId) return b;
      const actuales = (b.desconvocados || []).map(String);
      const id = String(miembroId);
      const actualizados = desconvocar
        ? [...new Set([...actuales, id])]
        : actuales.filter(item => item !== id);
      return { ...b, desconvocados: actualizados };
    });
    setBolos(nuevosBolos);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const eliminarDisponibilidadMiembro = async (miembroId, cuerdaMiembro, nombreMiembro) => {
    if (!puedeEliminarAsistencia(cuerdaMiembro)) {
      alert(`Como jefe de cuerda, solo puedes descartar músicos de tu cuerda (${usuarioActual.cuerda}).`);
      return;
    }
    if (confirm(`¿Descartar a ${nombreMiembro} de este evento?`)) {
      registrarSnapshot();
      const nuevaLista = miembros.map(m => {
        if (m.id === miembroId) {
          const nuevaDisp = { ...m.disponibilidadBolos };
          delete nuevaDisp[boloSeleccionadoId];
          const actualizado = { ...m, disponibilidadBolos: nuevaDisp };
          if (usuarioActual.id === m.id) {
            setUsuarioActual(actualizado);
            localStorage.setItem('sarao_usuario_actual', JSON.stringify(actualizado));
          }
          return actualizado;
        }
        return m;
      });
      setMiembros(nuevaLista);
      await guardarEnNube(nuevaLista, null, null);
    }
  };

  const agregarMusicoExtra = async (e) => {
    e.preventDefault();
    if (!puedeGestionarExtras) {
      alert('No tienes permiso para añadir músicos extras.');
      return;
    }

    const extraSeleccionado = instrumentosParaExtra.find(extra => extra.id === extraCatalogoSeleccionadoId);
    if (!extraSeleccionado) {
      alert('Selecciona un músico extra disponible para tu cuerda.');
      return;
    }

    if (!esAdmin && extraSeleccionado.cuerda !== usuarioActual.cuerda &&
      !(usuarioActual.nombre?.trim().toLocaleLowerCase('es') === 'edgar' &&
        ['Saxos', 'Tuba'].includes(extraSeleccionado.cuerda))) {
      alert(`Solo puedes añadir refuerzos para tu cuerda (${usuarioActual.cuerda}).`);
      return;
    }

    if ((boloActual?.musicosExtras || []).some(extra => extra.id === extraSeleccionado.id)) {
      alert(`${extraSeleccionado.nombre} ya está añadido a este bolo.`);
      return;
    }

    registrarSnapshot();
    const nuevoExtra = {
      ...extraSeleccionado,
      agregadoPor: usuarioActual.nombre
    };

    const nuevosBolos = bolos.map(b => {
      if (b.id === boloSeleccionadoId) {
        return {
          ...b,
          musicosExtras: [...(b.musicosExtras || []), nuevoExtra]
        };
      }
      return b;
    });

    setBolos(nuevosBolos);
    setExtraCatalogoSeleccionadoId('');
    setShowModalExtra(false);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const eliminarMusicoExtra = async (extraId, cuerdaExtra, nombreExtra) => {
    if (!puedeEliminarAsistencia(cuerdaExtra)) {
      alert(`Solo puedes retirar refuerzos de tu cuerda (${usuarioActual.cuerda}).`);
      return;
    }

    if (confirm(`¿Retirar al refuerzo ${nombreExtra} de este bolo?`)) {
      registrarSnapshot();
      const nuevosBolos = bolos.map(b => {
        if (b.id === boloSeleccionadoId) {
          return {
            ...b,
            musicosExtras: (b.musicosExtras || []).filter(ex => ex.id !== extraId)
          };
        }
        return b;
      });
      setBolos(nuevosBolos);
      await guardarEnNube(null, nuevosBolos, null);
    }
  };

  const eliminarMiembroPlantilla = async (miembroId) => {
    if (!esAdmin) return;
    if (confirm('¿Seguro que deseas eliminar a este músico de la plantilla?')) {
      registrarSnapshot();
      const nuevaLista = miembros.filter(m => m.id !== miembroId);
      setMiembros(nuevaLista);
      await guardarEnNube(nuevaLista, null, null);
    }
  };

  const agregarMovimientoGeneralBote = async (e) => {
    e.preventDefault();
    if (!esTesorero) return;
    const boloCobrado = tipoMovimientoBote === 'ingreso'
      ? bolosPendientesDeCobro.find(b => String(b.id) === String(boloSeleccionadoIngreso))
      : null;
    const imp = tipoMovimientoBote === 'ingreso' && boloCobrado
      ? Number(boloCobrado.presupuesto)
      : parseFloat(importeBote);
    if (tipoMovimientoBote === 'ingreso' && !boloCobrado) {
      alert('Selecciona un bolo pendiente de cobro.');
      return;
    }
    if (isNaN(imp) || imp <= 0 || !conceptoBote.trim()) {
      alert('Introduce un concepto e importe válidos.');
      return;
    }
    registrarSnapshot();
    const cantidadReal = tipoMovimientoBote === 'ingreso' ? imp : -imp;
    const nuevoMov = {
      id: Date.now(),
      concepto: conceptoBote.trim(),
      ...(boloCobrado ? { boloId: boloCobrado.id, conceptoBolo: boloCobrado.titulo || boloCobrado.lugar } : {}),
      categoriaGasto: tipoMovimientoBote === 'gasto' ? conceptoBote.trim() : null,
      cantidad: cantidadReal,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      fechaISO: (() => { const hoy = new Date(); return [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'), String(hoy.getDate()).padStart(2, '0')].join('-'); })(),
      tipo: tipoMovimientoBote,
      autor: usuarioActual.nombre,
      verificado: true
    };
    const nuevoBote = [nuevoMov, ...movimientosBote];
    const nuevosBolos = boloCobrado
      ? bolos.map(b => String(b.id) === String(boloCobrado.id) ? { ...b, cobrado: true } : b)
      : bolos;
    setMovimientosBote(nuevoBote);
    if (boloCobrado) setBolos(nuevosBolos);
    setConceptoBote('');
    setBoloSeleccionadoIngreso('');
    setImporteBote('');
    setShowModalMovimientoBote(false);
    await guardarEnNube(null, boloCobrado ? nuevosBolos : null, nuevoBote);
  };

  const agregarGasolinaConductor = async (e) => {
    e.preventDefault();
    if (!esConductor) return;
    const km = parseFloat(kmGasolina);

    if (isNaN(km) || km <= 0) {
      alert('Introduce un número de kilómetros válido.');
      return;
    }

    const requiereNombreManual = esAdmin && !tieneRolConductor;
    const personaGasto = requiereNombreManual 
      ? conductorGasolinaNombre.trim() 
      : (conductorGasolinaNombre.trim() || usuarioActual.nombre);

    if (!personaGasto) {
      alert('Indica el nombre de la persona a la que pertenece este gasto de gasolina.');
      return;
    }

    const gastoCalculado = parseFloat((km * TARIFA_KM).toFixed(2));
    registrarSnapshot();

    const conceptoTexto = `Gasolina de ${personaGasto} (${km} km × 0,20€/km${destinoGasolina.trim() ? ` - ${destinoGasolina.trim()}` : ''})`;
    const nuevoGasto = {
      id: Date.now(),
      concepto: conceptoTexto,
      cantidad: -gastoCalculado,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      fechaISO: (() => { const hoy = new Date(); return [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'), String(hoy.getDate()).padStart(2, '0')].join('-'); })(),
      tipo: 'gasto',
      esGasolina: true,
      conductorGasto: personaGasto,
      autor: usuarioActual.nombre,
      verificado: false
    };

    const nuevoBote = [nuevoGasto, ...movimientosBote];
    setMovimientosBote(nuevoBote);
    setKmGasolina('');
    setDestinoGasolina('');
    setConductorGasolinaNombre('');
    setShowModalGasolina(false);
    await guardarEnNube(null, null, nuevoBote);
    alert(`Gasto de gasolina de ${personaGasto} (${gastoCalculado.toFixed(2)} €) apuntado. Se restará del bote cuando se verifique el pago con el tick ✓.`);
  };

  const toggleVerificarMovimientoBote = async (movId) => {
    if (!esTesorero) {
      alert('Solo el Tesorero o el Administrador pueden verificar pagos del bote.');
      return;
    }
    registrarSnapshot();
    const nuevoBote = movimientosBote.map(m => {
      if (m.id === movId) {
        const estadoActual = m.verificado !== false;
        return { ...m, verificado: !estadoActual };
      }
      return m;
    });
    setMovimientosBote(nuevoBote);
    await guardarEnNube(null, null, nuevoBote);
  };

  const eliminarMovimientoBote = async (movId) => {
    if (!esTesorero) return;
    if (confirm('¿Deseas eliminar este movimiento del bote?')) {
      registrarSnapshot();
      const nuevoBote = movimientosBote.filter(m => m.id !== movId);
      setMovimientosBote(nuevoBote);
      await guardarEnNube(null, null, nuevoBote);
    }
  };

  // =========================================================================
  // FUNCIONES DE FACTURACIÓN
  // =========================================================================

  const convertirImporteFactura = (valor) => {
    const texto = String(valor ?? '').trim().replace(/\s/g, '');
    if (!texto) return NaN;

    const ultimaComa = texto.lastIndexOf(',');
    const ultimoPunto = texto.lastIndexOf('.');
    let normalizado = texto;

    if (ultimaComa !== -1 && ultimoPunto !== -1) {
      const separadorDecimal = ultimaComa > ultimoPunto ? ',' : '.';
      const separadorMiles = separadorDecimal === ',' ? '.' : ',';
      normalizado = texto.split(separadorMiles).join('');
      normalizado = normalizado.replace(separadorDecimal, '.');
    } else if (ultimaComa !== -1 || ultimoPunto !== -1) {
      const separador = ultimaComa !== -1 ? ',' : '.';
      const partes = texto.split(separador);
      const pareceSeparadorMiles = partes.length > 1
        && partes[partes.length - 1].length === 3
        && partes[0].length >= 1
        && partes[0].length <= 3;
      normalizado = pareceSeparadorMiles
        ? partes.join('')
        : texto.replace(separador, '.');
    }

    return Number(normalizado);
  };

  const obtenerImporteFactura = (factura) => {
    const importe = convertirImporteFactura(factura.importe);
    return Number.isFinite(importe) ? importe : 0;
  };

  const facturaPerteneceAUsuario = (factura, usuario) => {
    if (!usuario) return false;
    const mismoId = factura.usuarioId != null && usuario.id != null
      && String(factura.usuarioId) === String(usuario.id);
    const mismoNombre = factura.usuarioNombre?.trim().toLowerCase()
      === usuario.nombre?.trim().toLowerCase();
    return mismoId || Boolean(mismoNombre && usuario.nombre);
  };

  const extraerImporteDeTexto = (texto) => {
    if (!texto) return null;
    const lineas = texto.split(/\r?\n/).map(linea => linea.trim()).filter(Boolean);
    if (lineas.length === 0) return null;

    const regexImportes = /(?<!\d)(?:\d{1,3}(?:[ .\u00a0]\d{3})+|\d+)(?:[,.]\d{1,2})?(?!\d)/g;
    const candidatos = [];
    const regexEtiquetas = /\bimporte\s+total\b|\btotal\s+(?:a\s+pagar|factura|pagar)\b|\b(?:a\s+pagar|pago)\b|\btotal\b/gi;

    lineas.forEach((linea, indice) => {
      for (const match of linea.matchAll(regexImportes)) {
        const valor = convertirImporteFactura(match[0]);
        if (!Number.isFinite(valor) || valor <= 0 || valor >= 50000) continue;

        const contexto = linea.slice(Math.max(0, match.index - 12), match.index + match[0].length + 12);
        const tieneMoneda = /€|\beur(?:os?)?\b/i.test(contexto);
        const tieneDecimales = /[,.]\d{1,2}$/.test(match[0]);
        if (!tieneMoneda && !tieneDecimales) continue;

        const etiquetas = [];
        for (let indiceEtiqueta = Math.max(0, indice - 1); indiceEtiqueta <= Math.min(lineas.length - 1, indice + 1); indiceEtiqueta += 1) {
          for (const etiqueta of lineas[indiceEtiqueta].matchAll(regexEtiquetas)) {
            const textoEtiqueta = etiqueta[0].toLowerCase();
            const esTotalExplicito = /importe\s+total|total\s+(?:a\s+pagar|factura|pagar)|a\s+pagar/.test(textoEtiqueta);
            const esDesglose = /\b(?:subtotal|base\s+imponible|base|iva|impuestos?|irpf|retenci[oó]n|descuento|anticipo)\b/i.test(lineas[indiceEtiqueta]);
            if (esDesglose && !esTotalExplicito) continue;

            const distanciaLinea = Math.abs(indice - indiceEtiqueta);
            const distanciaTexto = distanciaLinea === 0
              ? Math.abs(match.index - etiqueta.index)
              : distanciaLinea * 30;
            const prioridad = esTotalExplicito ? 300 : textoEtiqueta === 'pago' ? 250 : 200;
            const direccion = indiceEtiqueta <= indice ? 15 : -15;
            etiquetas.push(prioridad - distanciaTexto + direccion);
          }
        }

        candidatos.push({
          valor,
          indice,
          puntuacionEtiqueta: etiquetas.length > 0 ? Math.max(...etiquetas) : 0
        });
      }
    });

    if (candidatos.length === 0) return null;

    const candidatosEtiquetados = candidatos.filter(candidato => candidato.puntuacionEtiqueta > 0);
    if (candidatosEtiquetados.length > 0) {
      candidatosEtiquetados.sort((a, b) => b.puntuacionEtiqueta - a.puntuacionEtiqueta || b.valor - a.valor);
      return candidatosEtiquetados[0].valor.toFixed(2);
    }

    const inicioZonaInferior = Math.floor(lineas.length * 0.65);
    const candidatosInferiores = candidatos.filter(candidato => candidato.indice >= inicioZonaInferior);
    const candidatosZonaInferior = candidatosInferiores.length > 0 ? candidatosInferiores : candidatos;
    const mayorImporte = Math.max(...candidatosZonaInferior.map(candidato => candidato.valor));
    return mayorImporte.toFixed(2);
  };

  const cargarScriptFactura = (src, disponible) => {
    if (disponible()) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => disponible() ? resolve() : reject(new Error('El analizador no está disponible.'));
      script.onerror = () => reject(new Error(`No se pudo cargar el analizador: ${src}`));
      document.head.appendChild(script);
    });
  };

  const cargarTesseractFactura = async () => {
    await cargarScriptFactura(
      'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
      () => Boolean(window.Tesseract)
    );
    return window.Tesseract;
  };

  const manejarSeleccionArchivoFactura = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      e.target.value = '';
      setArchivoFactura(null);
      setPreviewArchivoUrl('');
      setNombreArchivoFactura('');
      setErrorArchivoFactura('El archivo supera el tamaño máximo permitido.');
      return;
    }

    setErrorArchivoFactura('');
    setImporteFacturaDetectado('');
    setPreviewArchivoUrl('');
    setArchivoFactura(file);
    setNombreArchivoFactura(file.name);
    if (!conceptoFactura) {
      setConceptoFactura(file.name.replace(/\.[^/.]+$/, ""));
    }
    setAnalizandoFactura(true);
    setMensajeAnalisis('Analizando documento para detectar el importe...');

    const readerDataUrl = new FileReader();
    readerDataUrl.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 900;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
              else { w = Math.round((w * maxDim) / h); h = maxDim; }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            setPreviewArchivoUrl(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.src = result;
        } else {
          if (file.size < 600000) {
            setPreviewArchivoUrl(result);
          } else {
            setPreviewArchivoUrl('');
          }
        }
      }
    };
    readerDataUrl.readAsDataURL(file);

    try {
      const importeEnNombre = extraerImporteDeTexto(file.name);

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        await cargarScriptFactura(
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
          () => Boolean(window.pdfjsLib)
        );
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        const pagina = await pdf.getPage(pdf.numPages);
        const contenido = await pagina.getTextContent();
        const elementosOrdenados = contenido.items
          .filter(item => typeof item.str === 'string' && item.str.trim())
          .sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);
        const lineasPagina = [];
        elementosOrdenados.forEach(item => {
          const y = item.transform[5];
          let linea = lineasPagina.find(actual => Math.abs(actual.y - y) < 3);
          if (!linea) {
            linea = { y, items: [] };
            lineasPagina.push(linea);
          }
          linea.items.push(item);
        });
        const textoPdf = lineasPagina
          .sort((a, b) => b.y - a.y)
          .map(linea => linea.items.sort((a, b) => a.transform[4] - b.transform[4]).map(item => item.str).join(' '))
          .join('\n');
        let detectado = extraerImporteDeTexto(textoPdf);

        if (!detectado) {
          const tesseract = await cargarTesseractFactura();
          const viewport = pagina.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const contexto = canvas.getContext('2d');
          if (!contexto) throw new Error('No se pudo preparar la página PDF para el OCR.');
          await pagina.render({ canvasContext: contexto, viewport }).promise;
          const { data: { text } } = await tesseract.recognize(canvas, 'spa');
          detectado = extraerImporteDeTexto(text);
        }
        detectado = detectado || importeEnNombre;

        if (detectado) {
          setImporteFacturaDetectado(String(detectado));
          setMensajeAnalisis(`✓ Importe mayor detectado en la parte inferior del PDF: ${detectado} € (revísalo antes de confirmar).`);
        } else {
          setMensajeAnalisis('ℹ️ PDF cargado. Confirma o escribe el importe abajo.');
        }
      } else if (file.type.startsWith('image/')) {
        const tesseract = await cargarTesseractFactura();
        const { data: { text } } = await tesseract.recognize(file, 'spa');
        const detectado = extraerImporteDeTexto(text) || importeEnNombre;
        if (detectado) {
          setImporteFacturaDetectado(String(detectado));
          setMensajeAnalisis(`✓ Importe mayor detectado en la parte inferior de la imagen: ${detectado} € (revísalo antes de confirmar).`);
        } else {
          setMensajeAnalisis('ℹ️ Imagen analizada. Por favor introduce o verifica el importe manualmente.');
        }
      }
    } catch (err) {
      console.error("Error analizando documento:", err);
      setMensajeAnalisis('ℹ️ Documento listo. Introduce el importe total de la factura abajo.');
    } finally {
      setAnalizandoFactura(false);
    }
  };

  const guardarYEnviarFactura = async (e) => {
    e.preventDefault();
    if (enviandoFactura) return;
    const imp = convertirImporteFactura(importeFacturaDetectado);
    if (!Number.isFinite(imp) || imp <= 0) {
      alert('Por favor introduce un importe de factura válido mayor que 0.');
      return;
    }
    if (!conceptoFactura.trim()) {
      alert('Indica un concepto o proveedor para la factura.');
      return;
    }
    setEnviandoFactura(true);
    let errorEnvioCorreo = '';
    const destinatario = String(correoFacturacion || '').trim();
    let facturasRegistradas = null;
    let nuevaFactura = null;
    try {
      registrarSnapshot();
      nuevaFactura = {
        id: Date.now(),
        usuarioId: usuarioActual.id,
        usuarioNombre: usuarioActual.nombre,
        cuerda: usuarioActual.cuerda,
        concepto: conceptoFactura.trim(),
        importe: parseFloat(imp.toFixed(2)),
        nombreArchivo: nombreArchivoFactura || 'Documento adjunto',
        tipoArchivo: archivoFactura?.type || 'desconocido',
        archivoDataUrl: previewArchivoUrl || '',
        fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        enviadaACorreo: destinatario || 'Sin correo configurado',
        estadoEnvioCorreo: destinatario ? 'pendiente' : 'sin_configurar'
      };
      const nuevasFacturas = [nuevaFactura, ...facturas];
      facturasRegistradas = nuevasFacturas;
      setFacturas(nuevasFacturas);
      void guardarEnNube(null, null, null, nuevasFacturas);

      if (destinatario && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinatario)) {
        const formData = new FormData();
        formData.append('to', destinatario);
        formData.append('musico', usuarioActual.nombre);
        formData.append('cuerda', usuarioActual.cuerda || '');
        formData.append('concepto', conceptoFactura.trim());
        formData.append('importe', imp.toFixed(2));
        formData.append('fecha', nuevaFactura.fecha);
        if (archivoFactura) {
          formData.append('file', archivoFactura, archivoFactura.name);
        }

        const controlador = new AbortController();
        const timeout = window.setTimeout(() => controlador.abort(), 20000);
        try {
          const respuesta = await fetch('/api/send', {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: formData,
            signal: controlador.signal
          });
          let resultado;
          try {
            resultado = await respuesta.json();
          } catch {
            throw new Error(`El servicio de correo devolvió una respuesta no válida (HTTP ${respuesta.status}).`);
          }
          if (!respuesta.ok || resultado.success !== true) {
            throw new Error(resultado.error || `El servicio de correo respondió con el estado ${respuesta.status}.`);
          }
        } finally {
          window.clearTimeout(timeout);
        }

        nuevaFactura.estadoEnvioCorreo = 'enviado';
      } else if (destinatario) {
        throw new Error('El correo de facturación configurado no es válido.');
      }
    } catch (err) {
      console.error("Error guardando o enviando factura:", err);
      errorEnvioCorreo = err instanceof Error
        ? err.name === 'AbortError'
          ? 'Resend no respondió en 20 segundos. Comprueba la conexión e inténtalo de nuevo.'
          : err.message
        : 'Error desconocido al enviar el correo.';
      if (destinatario && nuevaFactura) {
        nuevaFactura.estadoEnvioCorreo = 'error';
      }
    } finally {
      if (destinatario && facturasRegistradas && nuevaFactura) {
        const facturasActualizadas = facturasRegistradas.map(factura =>
          factura.id === nuevaFactura.id ? nuevaFactura : factura
        );
        setFacturas(facturasActualizadas);
        void guardarEnNube(null, null, null, facturasActualizadas);
      } else if (facturasRegistradas) {
        void guardarEnNube(null, null, null, facturasRegistradas);
      }
      setEnviandoFactura(false);
      setArchivoFactura(null);
      setErrorArchivoFactura('');
      setPreviewArchivoUrl('');
      setNombreArchivoFactura('');
      setConceptoFactura('');
      setImporteFacturaDetectado('');
      setMensajeAnalisis('');
      setShowModalSubirFactura(false);
    }

    if (!nuevaFactura) {
      alert('No se pudo preparar la factura. Revisa los datos e inténtalo de nuevo.');
    } else if (errorEnvioCorreo) {
      alert(`La factura de ${imp.toFixed(2)} € se ha registrado, pero no se pudo confirmar su envío a ${destinatario}.\n\n${errorEnvioCorreo}\n\nComprueba la configuración de Resend y vuelve a intentarlo.`);
    } else if (nuevaFactura.estadoEnvioCorreo === 'enviado') {
      alert(`Factura de ${imp.toFixed(2)} € registrada y enviada a ${destinatario}.`);
    } else {
      alert(`Factura de ${imp.toFixed(2)} € registrada correctamente.`);
    }
  };

  const eliminarFactura = async (factura) => {
    const esMia = facturaPerteneceAUsuario(factura, usuarioActual);
    if (!esMia && !esFacturador && !esAdmin) {
      alert('Solo puedes borrar tus propias facturas.');
      return;
    }

    const importe = convertirImporteFactura(factura.importe);
    const importeVisible = Number.isFinite(importe) ? `${importe.toFixed(2)} €` : 'importe no disponible';
    if (confirm(`¿Seguro que deseas eliminar la factura "${factura.concepto}" (${importeVisible})?`)) {
      const indiceFactura = facturas.findIndex(f => f === factura
        || (factura.id != null && f.id != null && String(f.id) === String(factura.id)));
      if (indiceFactura === -1) {
        alert('No se encontró la factura. Actualiza la lista e inténtalo de nuevo.');
        return;
      }
      registrarSnapshot();
      const nuevasFacturas = facturas.filter((_, indice) => indice !== indiceFactura);
      setFacturas(nuevasFacturas);
      await guardarEnNube(null, null, null, nuevasFacturas);
    }
  };

  const guardarCorreoFacturacionAdmin = async (e) => {
    e.preventDefault();
    if (!esAdmin) return;
    setCorreoFacturacion(inputCorreoAdmin.trim());
    await guardarEnNube(null, null, null, null, inputCorreoAdmin.trim());
    alert(`Correo de facturación actualizado a: ${inputCorreoAdmin.trim() || '(Vacío)'}`);
  };

  const abrirModalParaFecha = (fechaStr) => {
    if (!esGestorBolos) return;
    setTipoCreacionEvento('confirmado');
    setNuevaFechaBolo(fechaStr);
    setShowModalBolo(true);
  };

  const abrirModalVacaciones = (fechaStr) => {
    setFechaInicioVacaciones(fechaStr);
    setFechaFinVacaciones(fechaStr);
    setShowModalVacaciones(true);
  };

  const guardarVacaciones = async (e) => {
    e.preventDefault();
    if (!usuarioActual?.id || !fechaInicioVacaciones || !fechaFinVacaciones) return;
    if (fechaFinVacaciones < fechaInicioVacaciones) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }
    const nuevasVacaciones = [...vacaciones.filter(v => String(v.usuarioId) !== String(usuarioActual.id)), {
      id: `vac-${usuarioActual.id}-${Date.now()}`,
      usuarioId: usuarioActual.id,
      nombre: usuarioActual.nombre,
      rolesCuerda: rolesCuerdaUsuario,
      fechaInicio: fechaInicioVacaciones,
      fechaFin: fechaFinVacaciones,
      creadaEn: new Date().toISOString()
    }];
    try {
      await setDoc(doc(db, 'charanga', 'datos_generales'), { vacaciones: nuevasVacaciones }, { merge: true });
      setVacaciones(nuevasVacaciones);
      setShowModalVacaciones(false);
    } catch (error) {
      console.error('Error guardando vacaciones:', error);
      alert('No se pudieron guardar las vacaciones. Inténtalo de nuevo.');
    }
  };

  const eliminarVacaciones = async (vacacionId) => {
    const vacacion = vacaciones.find(v => v.id === vacacionId);
    if (!vacacion || (String(vacacion.usuarioId) !== String(usuarioActual?.id) && !esAdmin)) return;
    const nuevasVacaciones = vacaciones.filter(v => v.id !== vacacionId);
    try {
      await setDoc(doc(db, 'charanga', 'datos_generales'), { vacaciones: nuevasVacaciones }, { merge: true });
      setVacaciones(nuevasVacaciones);
    } catch (error) {
      console.error('Error eliminando vacaciones:', error);
      alert('No se pudieron eliminar las vacaciones.');
    }
  };

  // CÁLCULO DE TOTALES BOTE
  const movimientosContabilizados = movimientosBote.filter(m => m.verificado !== false);
  const totalIngresos = movimientosContabilizados.filter(m => m.cantidad > 0).reduce((acc, m) => acc + m.cantidad, 0);
  const totalGastos = movimientosContabilizados.filter(m => m.cantidad < 0).reduce((acc, m) => acc + Math.abs(m.cantidad), 0);
  const totalPendienteGasolina = movimientosBote.filter(m => m.verificado === false && m.cantidad < 0).reduce((acc, m) => acc + Math.abs(m.cantidad), 0);
  const saldoTotal = totalIngresos - totalGastos;
  // DATOS PARA EL DASHBOARD FINANCIERO
  // Los movimientos nuevos guardan fechaISO; los antiguos siguen en el histórico global
  // sin asignarles un año que no conocemos.
  const aniosFinanzas = [...new Set(movimientosBote.map(m => String(m.fechaISO || '').slice(0, 4)).filter(a => /^20\d{2}$/.test(a)))].sort((a, b) => Number(b) - Number(a));
  const movimientosPeriodoFinanzas = anioFinanzasSeleccionado === 'todos'
    ? movimientosBote
    : movimientosBote.filter(m => String(m.fechaISO || '').startsWith(anioFinanzasSeleccionado));
  const movimientosContabilizadosPeriodo = movimientosPeriodoFinanzas.filter(m => m.verificado !== false);
  const ingresosPeriodoFinanzas = movimientosContabilizadosPeriodo.filter(m => Number(m.cantidad) > 0).reduce((sum, m) => sum + Number(m.cantidad), 0);
  const gastosPeriodoFinanzas = movimientosContabilizadosPeriodo.filter(m => Number(m.cantidad) < 0).reduce((sum, m) => sum + Math.abs(Number(m.cantidad)), 0);
  const saldoPeriodoFinanzas = ingresosPeriodoFinanzas - gastosPeriodoFinanzas;
  const MESES_FINANZAS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const parsearMesMovimiento = (fecha) => {
    const texto = String(fecha || '').toLowerCase();
    const match = texto.match(/(?:\d{1,2}\s*[-/ ]\s*)?(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/i);
    if (match) return MESES_FINANZAS.indexOf(match[1].toLowerCase());
    const numerica = texto.match(/\d{1,2}[/-](\d{1,2})/);
    return numerica ? Math.max(0, Math.min(11, Number(numerica[1]) - 1)) : -1;
  };
  const datosMensualesFinanzas = Array.from({ length: 12 }, (_, index) => {
    const movimientosMes = movimientosContabilizadosPeriodo.filter(m => parsearMesMovimiento(m.fecha) === index);
    return {
      mes: MESES_FINANZAS[index].toUpperCase(),
      ingresos: movimientosMes.filter(m => Number(m.cantidad) > 0).reduce((sum, m) => sum + Number(m.cantidad), 0),
      gastos: movimientosMes.filter(m => Number(m.cantidad) < 0).reduce((sum, m) => sum + Math.abs(Number(m.cantidad)), 0)
    };
  });
  const maximoMensualFinanzas = Math.max(1, ...datosMensualesFinanzas.flatMap(m => [m.ingresos, m.gastos]));
  const gastosPorCategoriaFinanzas = Object.entries(
    movimientosContabilizadosPeriodo.filter(m => Number(m.cantidad) < 0).reduce((acc, m) => {
      const categoria = m.esGasolina ? 'Gasolina' : (m.categoriaGasto || m.concepto || 'Otros gastos');
      acc[categoria] = (acc[categoria] || 0) + Math.abs(Number(m.cantidad));
      return acc;
    }, {})
  ).map(([nombre, importe]) => ({ nombre, importe })).sort((a, b) => b.importe - a.importe);
  const maximoCategoriaFinanzas = Math.max(1, ...gastosPorCategoriaFinanzas.map(c => c.importe));




  // CÁLCULO DE TOTALES DE FACTURAS
  const misFacturas = facturas.filter(
    f => facturaPerteneceAUsuario(f, usuarioActual)
  );
  const miTotalFacturado = misFacturas.reduce((acc, f) => acc + obtenerImporteFactura(f), 0);
  const totalGeneralFacturado = facturas.reduce((acc, f) => acc + obtenerImporteFactura(f), 0);

  // COMPROBACIÓN EXACTA DE FECHA: DESCARTA CUALQUIER BOLO CUYO DÍA YA PASÓ
  const esBoloVigente = (fechaStr) => {
    if (!fechaStr) return false;
    const limpio = String(fechaStr).trim();
    const partes = limpio.split('-');
    if (partes.length !== 3) return false;

    const anio = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);

    const fechaBolo = new Date(anio, mes, dia);
    fechaBolo.setHours(0, 0, 0, 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return fechaBolo.getTime() >= hoy.getTime();
  };

  const bolosConfirmados = bolos.filter(b => b.estadoBolo !== 'presupuestado' && b.estadoBolo !== 'ensayo');
  // Un bolo se considera cobrado cuando existe un ingreso vinculado a su ID.
  const idsBolosCobrados = new Set(
    movimientosBote.filter(m => m.tipo === 'ingreso' && m.boloId != null).map(m => String(m.boloId))
  );
  const bolosPendientesDeCobro = bolosConfirmados
    .filter(b => Number(b.presupuesto) > 0 && !idsBolosCobrados.has(String(b.id)))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const bolosPendientesPeriodoFinanzas = anioFinanzasSeleccionado === 'todos' ? bolosPendientesDeCobro : bolosPendientesDeCobro.filter(b => String(b.fecha || '').startsWith(anioFinanzasSeleccionado));
  const totalPendienteCobroFinanzas = bolosPendientesPeriodoFinanzas.reduce((sum, b) => sum + Number(b.presupuesto || 0), 0);
  const numeroBolosPendientesFinanzas = bolosPendientesPeriodoFinanzas.length;


  const proximosBolosConfirmados = bolos
    .filter(b => b.estadoBolo !== 'presupuestado' && b.estadoBolo !== 'ensayo' && esBoloVigente(b.fecha))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // DETECCIÓN AUTOMÁTICA DE INCIDENCIAS EN PRÓXIMAS ACTUACIONES
  const alertasGestion = proximosBolosConfirmados.flatMap(bolo => {
    const incidencias = [];
    const desconvocados = new Set((bolo.desconvocados || []).map(String));
    const plantillaActiva = miembros.filter(m => !desconvocados.has(String(m.id)) && !m.roles?.includes('extra'));
    const sinRespuesta = plantillaActiva.filter(m => !m.disponibilidadBolos?.[bolo.id]?.estado);
    const enDuda = plantillaActiva.filter(m => m.disponibilidadBolos?.[bolo.id]?.estado === 'tal_vez');
    const tareasPendientes = (bolo.tareasGestion || []).filter(t => !t.completada);

    if (!bolo.horaInicio || !String(bolo.horaInicio).trim()) {
      incidencias.push({ tipo: 'Horario sin definir', detalle: 'Falta la hora de inicio de la actuación.', nivel: 'alto' });
    }
    if (!bolo.vestuario || bolo.vestuario === 'Por definir') {
      incidencias.push({ tipo: 'Vestuario pendiente', detalle: 'Todavía no se ha elegido la ropa para este bolo.', nivel: 'medio' });
    }
    if (sinRespuesta.length) {
      incidencias.push({ tipo: 'Músicos sin responder', detalle: `${sinRespuesta.length} músico(s): ${sinRespuesta.slice(0, 4).map(m => m.nombre).join(', ')}${sinRespuesta.length > 4 ? '…' : ''}`, nivel: 'alto' });
    }
    if (enDuda.length) {
      incidencias.push({ tipo: 'Disponibilidad en duda', detalle: `${enDuda.length} músico(s) han marcado «Tal vez».`, nivel: 'medio' });
    }
    if (tareasPendientes.length) {
      incidencias.push({ tipo: 'Tareas sin completar', detalle: `${tareasPendientes.length} tarea(s): ${tareasPendientes.slice(0, 3).map(t => t.texto || t.titulo || t.nombre || 'Tarea pendiente').join(', ')}${tareasPendientes.length > 3 ? '…' : ''}`, nivel: 'medio' });
    }
    if (!(bolo.cochesAsignados || []).length) {
      incidencias.push({ tipo: 'Transporte sin organizar', detalle: 'No hay ningún coche asignado a esta actuación.', nivel: 'medio' });
    }
    return incidencias.map(incidencia => ({ ...incidencia, bolo }));
  });
  const totalAlertasAltas = alertasGestion.filter(a => a.nivel === 'alto').length;
  const alertasPorBolo = proximosBolosConfirmados
    .map(bolo => ({
      bolo,
      alertas: alertasGestion.filter(alerta => String(alerta.bolo.id) === String(bolo.id))
    }))
    .filter(grupo => grupo.alertas.length > 0);

  const bolosPresupuestados = bolos
    .filter(b => b.estadoBolo === 'presupuestado')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const listaEnsayos = bolos
    .filter(b => b.estadoBolo === 'ensayo')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const exportarEstadisticasExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,Músico;Instrumentos;Cuerda;Bolos Confirmados;Total Bolos;Porcentaje (%);Total Facturado (€)\n";
    miembros.forEach(m => {
      const totalBolos = bolosConfirmados.length;
      const idsConfirmados = new Set(bolosConfirmados.map(b => String(b.id)));
      const dispoCount = Object.entries(m.disponibilidadBolos || {})
        .filter(([bId, v]) => idsConfirmados.has(String(bId)) && v?.estado === 'puedo').length;
      const porcentaje = totalBolos > 0 ? Math.round((dispoCount / totalBolos) * 100) : 0;
      const facturadoM = facturas
        .filter(f => f.usuarioId === m.id || f.usuarioNombre?.trim().toLowerCase() === m.nombre?.trim().toLowerCase())
        .reduce((acc, f) => acc + obtenerImporteFactura(f), 0);
      csvContent += `${m.nombre};${m.instrumentos.join(', ')};${m.cuerda};${dispoCount};${totalBolos};${porcentaje}%;${facturadoM.toFixed(2)}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "estadisticas_sarao.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!cargado) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-green-400 font-bold">
        Cargando datos de Sarao...
      </div>
    );
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-green-500/30 rounded-3xl p-6 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-green-500/40 shadow-lg bg-black">
              <img src="PEGATINAS.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl tracking-wider text-green-400" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
              CHARANGA SARAO
            </h1>
            <p className="text-xs text-zinc-400">Acceso Músicos</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Tu Nombre:</label>
              <input
                type="text"
                placeholder="Ej: Edgar"
                value={nombreRegistro}
                onChange={e => setNombreRegistro(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-green-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Los músicos extra pueden acceder a su ficha usando el nombre registrado en el catálogo.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1.5">Tus instrumentos:</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-black/60 rounded-2xl border border-zinc-800">
                {INSTRUMENTOS_DISPONIBLES.map(inst => {
                  const sel = instrumentosSeleccionados.includes(inst.nombre);
                  return (
                    <button
                      type="button"
                      key={inst.nombre}
                      onClick={() => toggleInstrumentoRegistro(inst.nombre)}
                      className={`p-2 rounded-xl text-xs font-bold text-left border flex items-center justify-between ${sel ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                    >
                      <span className="truncate pr-1">{inst.nombre}</span>
                      {sel && <Check className="w-3.5 h-3.5 text-green-400 shrink-0"/>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Contraseña:</label>
              <input
                type="password"
                placeholder="Introduce tu contraseña"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-green-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Tu sesión se mantendrá guardada para no volver a iniciar sesión.</p>
            </div>

            <button type="submit" className="w-full bg-green-500 text-black font-black py-3.5 rounded-2xl text-sm shadow-lg cursor-pointer mt-2" style={{ fontFamily: "'Bangers', cursive, sans-serif", fontSize: '1.2rem' }}>
              ENTRAR A LA APP
            </button>
          </form>
        </div>
      </div>
    );
  }

  const boloActual = bolos.find(b => b.id === boloSeleccionadoId);

  const mesSeleccionado = MESES_PERMITIDOS[mesIndexActivo] || MESES_PERMITIDOS[0];
  const totalDiasMes = new Date(mesSeleccionado.anio, mesSeleccionado.mes + 1, 0).getDate();
  const diaSemanaInicio = (new Date(mesSeleccionado.anio, mesSeleccionado.mes, 1).getDay() + 6) % 7;

  const esPerfilExtra = usuarioActual.tipoPerfil === 'extra';
  const seleccionarBolo = (boloId) => {
    const bolo = bolos.find(evento => evento.id === boloId);
    if (!bolo) return;

    const disponibilidad = usuarioActual.disponibilidadBolos?.[boloId];
    setBoloSeleccionadoId(boloId);
    setPestañaActiva('bolos');
    setInstrumentoElegidoBolo(disponibilidad?.instrumento || usuarioActual.instrumentos?.[0] || '');
    setBoloDisponibilidadAbiertoId(
      !esPerfilExtra &&
      bolo.estadoBolo !== 'presupuestado' &&
      (!disponibilidad?.estado || disponibilidad.estado === 'no')
        ? boloId
        : null
    );
  };

  const instrumentosParaExtra = CATALOGO_EXTRAS.filter(extra =>
    esAdmin ||
    (esJefeCuerda && (
      extra.cuerda === usuarioActual.cuerda ||
      (usuarioActual.nombre?.trim().toLocaleLowerCase('es') === 'edgar' &&
        ['Saxos', 'Tuba'].includes(extra.cuerda))
    ))
  );

  const listaConductoresPlantilla = miembros.filter(m => m.roles?.includes('conductor'));
  const bolosPerfil = bolos
    .filter(b => b.estadoBolo !== 'presupuestado' && b.estadoBolo !== 'ensayo')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const pagosPerfil = bolosPerfil.map(b => ({
    bolo: b,
    pago: b.pagosMiembros?.[`${esPerfilExtra ? 'extra' : 'miembro'}-${usuarioActual.id}`] ||
      (esPerfilExtra
        ? Object.values(b.pagosMiembros || {}).find(pago =>
          pago.tipo === 'extra' &&
          (pago.personaId === usuarioActual.id ||
            pago.nombre?.trim().toLocaleLowerCase('es') === usuarioActual.nombre.trim().toLocaleLowerCase('es'))
        )
        : null) ||
      {}
  })).filter(({ pago }) => !esPerfilExtra || pago.asistio === true);
  // Leer la disponibilidad del roster actualizado: usuarioActual puede ser una
  // copia de sesión anterior y quedarse desfasada tras responder en un bolo.
  const miembroPerfilActual = miembros.find(m => String(m.id) === String(usuarioActual.id)) || usuarioActual;
  // Estadísticas personales: solo bolos confirmados ya celebrados.
  // "Disponible" significa haber respondido Puedo; Tal vez equivale a No.
  // La asistencia real solo se cuenta cuando administración la registra expresamente.
  const misBolosDisponibles = bolosPerfil.filter(b =>
    !esBoloVigente(b.fecha) &&
    miembroPerfilActual.disponibilidadBolos?.[b.id]?.estado === 'puedo' &&
    !(b.desconvocados || []).map(String).includes(String(usuarioActual.id)) &&
    !(b.bajasUrgencia || []).some(baja => String(baja.miembroId) === String(usuarioActual.id))
  );
  const obtenerMiAsistencia = (bolo) =>
    bolo.pagosMiembros?.[`miembro-${usuarioActual.id}`] || {};
  const tieneAsistenciaValidada = (pago) =>
    pago.asistenciaValidadaManualmente === true &&
    pago.asistenciaRegistrada === true &&
    typeof pago.asistio === 'boolean';
  const misBolosAsistidos = misBolosDisponibles.filter(b => {
    const pago = obtenerMiAsistencia(b);
    return tieneAsistenciaValidada(pago) && pago.asistio === true;
  });
  const misBolosNoAsistidos = misBolosDisponibles.filter(b => {
    const pago = obtenerMiAsistencia(b);
    return tieneAsistenciaValidada(pago) && pago.asistio === false;
  });
  const misBolosPendientesAsistencia = misBolosDisponibles.filter(b =>
    !tieneAsistenciaValidada(obtenerMiAsistencia(b))
  );
  const porcentajeAsistencia = misBolosDisponibles.length > 0
    ? Math.round((misBolosAsistidos.length / misBolosDisponibles.length) * 100)
    : 0;

  const resumenPerfil = pagosPerfil.reduce((resumen, { pago }) => {
    if (pago.asistio !== true) return resumen;
    resumen.bolos += 1;
    resumen.musica += Number(pago.importeMusica) || 0;
    resumen.gasolina += Number(pago.gasolina) || 0;
    resumen.kilometros += Number(pago.kilometros) || 0;
    resumen.pagado += pago.pagado ? (Number(pago.importeMusica) || 0) + (Number(pago.gasolina) || 0) : 0;
    resumen.pendiente += pago.pagado ? 0 : (Number(pago.importeMusica) || 0) + (Number(pago.gasolina) || 0);
    return resumen;
  }, { bolos: 0, musica: 0, gasolina: 0, kilometros: 0, pagado: 0, pendiente: 0 });
  const pagosExtrasRealizados = bolosPerfil.flatMap(b =>
    Object.values(b.pagosMiembros || {})
      .filter(pago => pago.tipo === 'extra' && pago.asistio === true)
      .map(pago => ({ ...pago, bolo: b }))
  ).sort((a, b) => new Date(a.bolo.fecha) - new Date(b.bolo.fecha));

  const renderDetallePago = (persona, tipo) => {
    const clavePago = `${tipo}-${persona.id}`;
    const pago = boloActual?.pagosMiembros?.[clavePago] || {};
    const guardarImporte = (campo, valor) => {
      const importe = Number.parseFloat(valor);
      guardarPagoMiembro(boloActual.id, persona, tipo, campo, Number.isFinite(importe) ? importe : 0);
    };

    return (
      <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2 text-[11px]">
        <p className="font-black uppercase tracking-wide text-zinc-300">Pago del bolo</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-zinc-300">
          <span>Música: <strong className="text-emerald-300">{(Number(pago.importeMusica) || 0).toFixed(2)} €</strong></span>
          <span>Coche: <strong className="text-white">{pago.usoCoche ? 'Sí' : 'No'}</strong></span>
          <span>Gasolina: <strong className="text-amber-300">{(Number(pago.gasolina) || 0).toFixed(2)} €</strong></span>
          <span>Km: <strong className="text-white">{Number(pago.kilometros) || 0}</strong></span>
          <span className={(Number(pago.importeMusica) || 0) > 0 ? 'text-emerald-300' : 'text-zinc-400'}>
            {(Number(pago.importeMusica) || 0) > 0 ? 'Pagado' : 'Pendiente de pago'}
          </span>
        </div>
        {esAdmin && (
          <div className="space-y-2 pt-1">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2.5">
              <p className="text-[10px] uppercase tracking-wide font-black text-sky-300 mb-2">Asistencia real · solo administración</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => guardarPagoMiembro(boloActual.id, persona, tipo, 'asistio', true)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-black border transition ${pago.asistenciaValidadaManualmente && pago.asistio === true ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-900 text-emerald-300 border-emerald-500/30'}`}>
                  Sí asistió
                </button>
                <button type="button" onClick={() => guardarPagoMiembro(boloActual.id, persona, tipo, 'asistio', false)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-black border transition ${pago.asistenciaValidadaManualmente && pago.asistio === false ? 'bg-rose-500 text-white border-rose-400' : 'bg-zinc-900 text-rose-300 border-rose-500/30'}`}>
                  No asistió
                </button>
                <span className="self-center text-[10px] text-zinc-500">
                  {pago.asistenciaValidadaManualmente ? 'Registro guardado' : 'Pendiente de registrar'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <label className="flex items-center gap-1.5 text-zinc-300">
              <input type="checkbox" checked={pago.usoCoche === true} onChange={e => guardarPagoMiembro(boloActual.id, persona, tipo, 'usoCoche', e.target.checked)} />
              Usó coche
            </label>
            <label className="text-zinc-400">Música (€)
              <input type="number" min="0" step="0.01" defaultValue={pago.importeMusica ?? ''} onBlur={e => guardarImporte('importeMusica', e.target.value)} className="mt-1 w-full bg-black border border-zinc-700 rounded-lg px-2 py-1 text-white" />
            </label>
            <label className="text-zinc-400">Gasolina (€)
              <input type="number" min="0" step="0.01" defaultValue={pago.gasolina ?? ''} onBlur={e => guardarImporte('gasolina', e.target.value)} className="mt-1 w-full bg-black border border-zinc-700 rounded-lg px-2 py-1 text-white" />
            </label>
            <label className="text-zinc-400">Kilómetros
              <input type="number" min="0" step="1" defaultValue={pago.kilometros ?? ''} onBlur={e => guardarImporte('kilometros', e.target.value)} className="mt-1 w-full bg-black border border-zinc-700 rounded-lg px-2 py-1 text-white" />
            </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans pb-32 selection:bg-green-500 selection:text-black">
      <PushNotifications user={usuarioActual} />
      
      {/* BOTÓN DESHACER (SOLO ADMIN) */}
      {esAdmin && historialEstados.length > 0 && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={deshacerUltimoCambio}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black px-3 py-2 rounded-2xl shadow-2xl text-xs border border-black/40 transition active:scale-95 animate-bounce"
            title="Deshacer el último cambio realizado"
          >
            <Undo2 className="w-4 h-4"/> Deshacer acción ({historialEstados.length})
          </button>
        </div>
      )}

      <header className="bg-gradient-to-b from-zinc-900 to-black border-b border-green-500/20 px-4 sm:px-6 py-4 sm:py-5 sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border border-green-500/40 bg-black shrink-0">
              <img src="PEGATINAS.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl tracking-wider text-green-400 leading-none" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                  CHARANGA SARAO
                </h1>
                {esAdmin && (
                  <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3"/> Admin
                  </span>
                )}
                {!esAdmin && esGestorBolos && (
                  <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Gestor Bolos
                  </span>
                )}
                {!esAdmin && esFacturador && (
                  <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Facturador
                  </span>
                )}
                {!esAdmin && esJefeCuerda && (
                  <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Jefe {usuarioActual.cuerda}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {usuarioActual.nombre} • <span className="text-green-300 font-bold">{usuarioActual.instrumentos?.join(', ')}</span> ({usuarioActual.cuerda})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setNotificacionesAbiertas(v => !v)} aria-label="Abrir notificaciones" aria-expanded={notificacionesAbiertas} className="relative p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-emerald-400/40 hover:text-emerald-300">
              <Bell className="w-4 h-4"/>
              {notificacionesPersonales.filter(n => !n.leida).length > 0 && <span className="absolute -right-1.5 -top-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 px-1 text-[10px] font-black leading-[18px] text-white shadow-lg shadow-red-950/50">{notificacionesPersonales.filter(n => !n.leida).length > 99 ? '99+' : notificacionesPersonales.filter(n => !n.leida).length}</span>}
            </button>
            <button onClick={cerrarSesion} className="p-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-rose-400 bg-zinc-900 text-xs font-bold" title="Cerrar sesión">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-3 sm:p-6">

        {/* INICIO / LANDING PAGE */}
        {pestañaActiva === 'landing' && (
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-[#07130e] p-5 sm:p-8 shadow-[0_24px_80px_rgba(16,185,129,0.10)]">
              <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-green-500/10 blur-3xl" />
              <div className="relative z-10 grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-end">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                    Charanga Sarao · Backstage
                  </span>
                  <h2 className="mt-4 max-w-2xl text-4xl leading-[0.95] text-white sm:text-5xl" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    Que empiece el <span className="text-emerald-300">Sarao.</span>
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300">
                    Hola, {usuarioActual.nombre}. Aquí tienes tus próximos eventos y los accesos rápidos para organizarte.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => { setPestañaActiva('bolos'); setBoloSeleccionadoId(null); }}
                      className="rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-black text-black shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-300">
                      <CalendarIcon className="mr-1.5 inline h-4 w-4" /> Abrir calendario
                    </button>
                    <button type="button" onClick={() => setPestañaActiva('perfil')}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10">
                      <Wallet className="mr-1.5 inline h-4 w-4" /> Mi ficha
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5 backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Próximos bolos</p>
                    <p className="mt-1 text-3xl font-black tabular-nums text-white">{proximosBolosConfirmados.length}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3.5 backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200/70">Presupuestados</p>
                    <p className="mt-1 text-3xl font-black tabular-nums text-amber-200">{bolosPresupuestados.length}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">Tu espacio</p>
                    <p className="mt-1 text-sm font-bold text-white">{usuarioActual.instrumentos?.join(' · ') || usuarioActual.instrumento || 'Músico'} <span className="text-zinc-500">/</span> {usuarioActual.cuerda || 'Charanga Sarao'}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-end justify-between gap-3 px-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Agenda</p>
                  <h3 className="text-2xl text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Próximos bolos</h3>
                </div>
                <button type="button" onClick={() => { setPestañaActiva('bolos'); setBoloSeleccionadoId(null); }} className="text-[11px] font-bold text-emerald-300 hover:text-white">Ver calendario →</button>
              </div>
              {proximosBolosConfirmados.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-7 text-center">
                  <CalendarIcon className="mx-auto h-8 w-8 text-zinc-600" />
                  <p className="mt-2 text-sm font-bold text-zinc-300">Todavía no hay bolos confirmados próximos.</p>
                  <p className="mt-1 text-xs text-zinc-500">Cuando se confirme una actuación, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {proximosBolosConfirmados.slice(0, 3).map(b => {
                    const dispMiembro = usuarioActual.disponibilidadBolos?.[b.id]?.estado;
                    const vest = OPCIONES_VESTUARIO.find(v => v.id === b.vestuario) || OPCIONES_VESTUARIO[0];
                    const numConfirmados = miembros.filter(m => m.disponibilidadBolos?.[b.id]?.estado === 'puedo').length + (b.musicosExtras?.length || 0);
                    return (
                      <button type="button" key={b.id} onClick={() => seleccionarBolo(b.id)}
                        className="group rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-[#101713] p-4 text-left shadow-lg transition hover:-translate-y-1 hover:border-emerald-400/50">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-300">{b.fecha}</span>
                          <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${dispMiembro === 'puedo' ? 'bg-emerald-400/15 text-emerald-300' : dispMiembro === 'tal_vez' ? 'bg-amber-400/15 text-amber-300' : dispMiembro === 'no' ? 'bg-rose-400/15 text-rose-300' : 'bg-white/5 text-zinc-400'}`}>
                            {dispMiembro === 'puedo' ? 'Disponible' : dispMiembro === 'tal_vez' ? 'En duda' : dispMiembro === 'no' ? 'No disponible' : 'Sin respuesta'}
                          </span>
                        </div>
                        <h4 className="mt-4 truncate text-2xl text-white group-hover:text-emerald-300" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>{b.lugar}</h4>
                        <p className="mt-1 text-xs text-zinc-400">{b.titulo || 'Actuación'} · {b.horaInicio || 'Hora por confirmar'}{b.horaFin ? ` – ${b.horaFin}` : ''}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px]">
                          <span className="text-zinc-400"><Users className="mr-1 inline h-3.5 w-3.5" />{numConfirmados} disponibles</span>
                          <span className="font-black text-emerald-300">Ver bolo ↗</span>
                        </div>
                        <p className="mt-2 text-[10px] text-zinc-500">Vestuario: {vest.label}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <div className="px-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Accesos directos</p>
                <h3 className="text-2xl text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Todo a mano</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  {id:'landing',label:'Inicio',desc:'Panel principal',icon:Home,tone:'emerald'},
                  {id:'bolos',label:'Bolos',desc:'Calendario de actuaciones',icon:CalendarIcon,tone:'emerald'},
                  {id:'perfil',label:'Mi ficha',desc:'Estadísticas y pagos',icon:Wallet,tone:'green'},
                  {id:'ensayos',label:'Ensayos',desc:`Agenda · ${listaEnsayos.length}`,icon:Music,tone:'cyan'},
                  {id:'letras',label:'Letras de canciones',desc:`${CANCIONES.length} canciones`,icon:FileText,tone:'fuchsia'},
                  {id:'bote',label:'Bote',desc:`${saldoTotal.toFixed(2)} €`,icon:Wallet,tone:'emerald'},
                  {id:'facturas',label:'Facturas',desc:'Envío y seguimiento',icon:FileText,tone:'cyan'},
                  ...(esAdmin ? [{id:'admin',label:'Administración',desc:'Control y gestión',icon:Shield,tone:'rose'}] : [])
                ].map(item => {
                  const Icon = item.icon;
                  const tones = {
                    emerald:'border-emerald-400/20 bg-emerald-400/5 text-emerald-300',
                    green:'border-green-400/20 bg-green-400/5 text-green-300',
                    cyan:'border-cyan-400/20 bg-cyan-400/5 text-cyan-300',
                    fuchsia:'border-fuchsia-400/20 bg-fuchsia-400/5 text-fuchsia-300',
                    amber:'border-amber-400/20 bg-amber-400/5 text-amber-300',
                    violet:'border-violet-400/20 bg-violet-400/5 text-violet-300',
                    rose:'border-rose-400/20 bg-rose-400/5 text-rose-300'
                  };
                  return (
                    <button key={item.id + item.label} type="button" onClick={() => { if (item.id === 'admin') setSeccionAdminActiva('resumen'); setPestañaActiva(item.id); if (item.id !== 'bolos') setBoloSeleccionadoId(null); }}
                      className={`flex min-h-28 flex-col justify-between rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:bg-white/5 ${tones[item.tone]}`}>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30"><Icon className="h-5 w-5" /></span>
                      <span className="mt-3 block text-sm font-black text-white">{item.label}</span>
                      <span className="mt-0.5 block text-[10px] text-zinc-400">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {pestañaActiva === 'perfil' && (
          <section data-sarao-section="perfil" className="space-y-5">
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                    {esPerfilExtra ? 'Ficha de músico extra' : 'Ficha Personal'}
                  </p>
                  <h2 className="text-3xl text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>{usuarioActual.nombre}</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {esPerfilExtra ? `${usuarioActual.instrumento} · ${usuarioActual.charanga}` : `${usuarioActual.instrumentos?.join(', ')} · ${usuarioActual.cuerda}`}
                  </p>
                </div>
                <span className="text-xs text-zinc-400">
                  {pagosPerfil.length} {esPerfilExtra ? 'bolos realizados' : 'bolos en calendario'}
                </span>
              </div>

              {!esPerfilExtra && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
                  <div className="bg-black/50 border border-emerald-500/20 rounded-2xl p-3">
                    <p className="text-[10px] uppercase font-black text-emerald-300">Asistidos</p>
                    <p className="text-2xl font-black text-white tabular-nums">{misBolosAsistidos.length}</p>
                  </div>
                  <div className="bg-black/50 border border-rose-500/20 rounded-2xl p-3">
                    <p className="text-[10px] uppercase font-black text-rose-300">No asistidos</p>
                    <p className="text-2xl font-black text-white tabular-nums">{misBolosNoAsistidos.length}</p>
                  </div>
                  <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-3">
                    <p className="text-[10px] uppercase font-black text-amber-300">Disponibles</p>
                    <p className="text-2xl font-black text-white tabular-nums">{misBolosDisponibles.length}</p>
                  </div>
                  <div className="bg-black/50 border border-sky-500/20 rounded-2xl p-3">
                    <p className="text-[10px] uppercase font-black text-sky-300">% Asistencia</p>
                    <p className="text-2xl font-black text-white tabular-nums">{porcentajeAsistencia}%</p>
                  </div>
                  <div className="col-span-2 sm:col-span-4 bg-black/30 border border-white/5 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-zinc-400">Pendientes de registrar asistencia real: <strong className="text-white">{misBolosPendientesAsistencia.length}</strong></p>
                  </div>
                </div>
              )}
              {!esPerfilExtra && (
                <p className="text-[10px] text-zinc-500 mt-2">
                  El porcentaje se calcula sobre los bolos en los que respondiste «Puedo», excluyendo los que después te desconvocaron. «Tal vez» no cuenta como disponibilidad. La asistencia se valida manualmente desde administración; los registros antiguos sin esa validación no se incluyen en estas estadísticas.
                </p>
              )}

              {esPerfilExtra ? (
                <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-800">
                  {pagosPerfil.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-5 px-3">Todavía no hay bolos realizados registrados para este músico.</p>
                  ) : (
                    <table className="w-full min-w-[680px] text-left text-xs text-zinc-300">
                      <thead className="bg-black/50 text-[10px] uppercase text-zinc-500">
                        <tr>
                          <th className="px-3 py-2.5">Bolo</th>
                          <th className="px-3 py-2.5">Fecha</th>
                          <th className="px-3 py-2.5">Música</th>
                          <th className="px-3 py-2.5">Pago de gasolina</th>
                          <th className="px-3 py-2.5">Kilómetros</th>
                          <th className="px-3 py-2.5">Estado del pago</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/70">
                        {pagosPerfil.map(({ bolo, pago }) => (
                          <tr key={bolo.id}>
                            <td className="px-3 py-2.5">
                              <button
                                type="button"
                                onClick={() => seleccionarBolo(bolo.id)}
                                className="font-bold text-white hover:text-emerald-300 text-left"
                              >
                                {bolo.lugar}
                              </button>
                            </td>
                            <td className="px-3 py-2.5">{bolo.fecha}</td>
                            <td className="px-3 py-2.5 text-emerald-300">{(Number(pago.importeMusica) || 0).toFixed(2)} €</td>
                            <td className="px-3 py-2.5 text-amber-300">{(Number(pago.gasolina) || 0).toFixed(2)} €</td>
                            <td className="px-3 py-2.5">{Number(pago.kilometros) || 0} km</td>
                            <td className={`px-3 py-2.5 font-black ${pago.pagado ? 'text-emerald-300' : 'text-amber-300'}`}>
                              {pago.pagado ? 'Pagado' : 'Pendiente'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <div className="mt-5 -mx-1 flex gap-3 overflow-x-auto px-1 pb-3 snap-x">
                  {pagosPerfil.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-5">Todavía no hay bolos en el calendario.</p>
                  ) : pagosPerfil.map(({ bolo, pago }) => {
                    const disponibilidad = miembroPerfilActual.disponibilidadBolos?.[bolo.id];
                    const asistenciaManual = pago.asistenciaValidadaManualmente === true && pago.asistenciaRegistrada === true;
                    const perdido = disponibilidad?.estado === 'no' || (asistenciaManual && pago.asistio === false);
                    const pagado = pago.asistio === true && pago.pagado === true;
                    return (
                      <button key={bolo.id} onClick={() => seleccionarBolo(bolo.id)} className={`snap-start shrink-0 w-48 text-left p-3.5 rounded-xl border transition ${perdido ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' : pagado ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-black/50 border-zinc-700 text-zinc-100'}`}>
                        <span className={`block text-[10px] font-bold ${perdido ? 'line-through decoration-rose-400/70' : ''}`}>{bolo.fecha}</span>
                        <span className={`block mt-1 font-black truncate ${perdido ? 'line-through decoration-rose-400/70' : ''}`}>{bolo.lugar}</span>
                        <span className={`block mt-2 text-[10px] font-bold ${perdido ? 'text-rose-300' : pagado ? 'text-emerald-300' : 'text-zinc-400'}`}>
                          {disponibilidad?.estado === 'no' ? 'No disponible'  : perdido ? 'No asistió' : pagado ? 'Pagado' : asistenciaManual && pago.asistio === true ? 'Realizado · pendiente' : disponibilidad?.estado === 'tal_vez' ? 'En duda' : 'Sin confirmar'}
                        </span>
                        {pago.asistio === true && (
                          <span className="block mt-1.5 space-y-0.5 text-[10px] text-zinc-300">
                            <span className="block">Música: {(Number(pago.importeMusica) || 0).toFixed(2)} €</span>
                            <span className="block">Coche: {pago.usoCoche ? 'Sí' : 'No'}</span>
                            <span className="block">Gasolina: {(Number(pago.gasolina) || 0).toFixed(2)} €</span>
                            <span className="block">Kilómetros: {Number(pago.kilometros) || 0} km</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-zinc-800 pt-4 gap-y-4 gap-x-3">
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Bolos realizados</p><p className="text-xl font-black text-white">{resumenPerfil.bolos}</p></div>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Música</p><p className="text-xl font-black text-emerald-300">{resumenPerfil.musica.toFixed(2)} €</p></div>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Gasolina</p><p className="text-xl font-black text-amber-300">{resumenPerfil.gasolina.toFixed(2)} €</p></div>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Kilómetros</p><p className="text-xl font-black text-white">{resumenPerfil.kilometros} km</p></div>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Total generado</p><p className="text-xl font-black text-white">{(resumenPerfil.musica + resumenPerfil.gasolina).toFixed(2)} €</p></div>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Pagado</p><p className="text-xl font-black text-emerald-300">{resumenPerfil.pagado.toFixed(2)} €</p></div>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Pendiente</p><p className="text-xl font-black text-amber-300">{resumenPerfil.pendiente.toFixed(2)} €</p></div>
              </div>
            </div>

            {esAdmin && (
              <div className="bg-zinc-900 border border-rose-500/30 rounded-3xl p-5 sm:p-6 space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-wider text-rose-400">Administración</p>
                  <h3 className="text-2xl text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Bolos de músicos extra</h3>
                </div>
                {pagosExtrasRealizados.length === 0 ? (
                  <p className="text-xs text-zinc-500">No hay actuaciones de extras registradas todavía. Márcalas como asistidas desde el detalle del bolo.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs text-zinc-300">
                      <thead className="text-[10px] uppercase text-zinc-500 border-b border-zinc-800"><tr><th className="py-2 pr-3">Extra</th><th className="py-2 pr-3">Bolo</th><th className="py-2 pr-3">Fecha</th><th className="py-2 pr-3">Música</th><th className="py-2 pr-3">Pago de gasolina</th><th className="py-2 pr-3">Kilometraje</th><th className="py-2">Pago</th></tr></thead>
                      <tbody className="divide-y divide-zinc-800/70">
                        {pagosExtrasRealizados.map((pago, index) => (
                          <tr key={`${pago.personaId}-${pago.bolo.id}-${index}`}>
                            <td className="py-2.5 pr-3 font-bold text-white">{pago.nombre}</td>
                            <td className="py-2.5 pr-3">{pago.bolo.lugar}</td>
                            <td className="py-2.5 pr-3">{pago.bolo.fecha}</td>
                            <td className="py-2.5 pr-3">{(Number(pago.importeMusica) || 0).toFixed(2)} €</td>
                            <td className="py-2.5 pr-3 text-amber-300">{(Number(pago.gasolina) || 0).toFixed(2)} €</td>
                            <td className="py-2.5 pr-3">{Number(pago.kilometros) || 0} km</td>
                            <td className={`py-2.5 font-black ${pago.pagado ? 'text-emerald-300' : 'text-amber-300'}`}>{pago.pagado ? 'Pagado' : 'Pendiente'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* SECCIÓN: LETRAS DE CANCIONES */}
        {pestañaActiva === 'letras' && (
          <section data-sarao-section="letras" className="space-y-5">
            <div className="bg-zinc-900 border border-fuchsia-500/30 rounded-3xl p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Music className="w-6 h-6 text-fuchsia-400"/>
                <div>
                  <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    LETRAS DE CANCIONES
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">{CANCIONES.length} canciones del repertorio</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CANCIONES.map(cancion => (
                <article key={cancion.titulo} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-white">{cancion.titulo}</h3>
                    <p className="text-xs text-zinc-400">{cancion.artista}</p>
                  </div>

                  {cancion.secciones?.map(seccion => (
                    <div key={seccion.titulo} className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-fuchsia-300 mb-1">{seccion.titulo}</p>
                      {Array.from({ length: seccion.repeticiones || 1 }, (_, index) => (
                        <p key={index} className="text-sm text-zinc-200 whitespace-pre-line">
                          {seccion.letra}{seccion.repeticiones > 1 ? ` (${index + 1}/${seccion.repeticiones})` : ''}
                        </p>
                      ))}
                    </div>
                  ))}

                  {(!cancion.secciones || cancion.estribilloPendiente) && (
                    <p className="text-xs text-zinc-500 italic">
                      Estribillo pendiente: añade aquí un fragmento que tengas autorización para usar.
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* SECCIÓN: ENSAYOS */}
        {pestañaActiva === 'ensayos' && (
          <div data-sarao-section="ensayos" className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-6">
              
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span>
                    <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                      ENSAYOS PROGRAMADOS ({listaEnsayos.length})
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Todos los ensayos fijados aquí se añaden automáticamente al calendario general en color <strong>azul turquesa</strong> bajo el título <strong>"Ensayo"</strong>.
                  </p>
                </div>

                {esGestorBolos && (
                  <button
                    onClick={abrirModalNuevoEnsayo}
                    className="bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4"/> + Añadir Ensayo
                  </button>
                )}
              </div>

              {listaEnsayos.length === 0 ? (
                <div className="p-8 bg-black/40 border border-zinc-800 rounded-2xl text-center space-y-2">
                  <Music className="w-8 h-8 text-cyan-500/50 mx-auto"/>
                  <p className="text-xs text-zinc-400 font-bold">No hay ningún ensayo programado en este momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listaEnsayos.map(ens => {
                    const numConfirmados = miembros.filter(m => m.disponibilidadBolos?.[ens.id]?.estado === 'puedo').length;
                    return (
                      <div key={ens.id} className="bg-cyan-500/10 border border-cyan-400/40 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
                        <div>
                          <div className="flex justify-between items-center gap-2 mb-2">
                            <span className="text-xs font-black bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/40">
                              📅 {ens.fecha}
                            </span>
                            <span className="text-[10px] font-black uppercase bg-cyan-400 text-black px-2.5 py-0.5 rounded-full">
                              🎵 Ensayo
                            </span>
                          </div>

                          <h3 className="text-3xl tracking-wide text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                            Ensayo — 📍 {ens.lugar}
                          </h3>

                          <div className="mt-3 pt-3 border-t border-cyan-500/20 space-y-1.5 text-xs text-zinc-200">
                            <p className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-cyan-400"/> Hora: <strong>{ens.horaInicio || 'Por definir'}</strong>
                            </p>
                            <p className="flex items-start gap-1.5">
                              <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5"/> 
                              <span>Repertorio: <strong className="text-cyan-200">{ens.repertorio ? ens.repertorio : 'General / Por definir'}</strong></span>
                            </p>
                            <p className="text-[11px] text-zinc-400 pt-1">
                              👥 <strong>{numConfirmados}</strong> músico(s) han confirmado asistencia
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-cyan-500/20 flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => seleccionarBolo(ens.id)}
                            className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-black py-2 px-3 rounded-xl text-xs text-center transition cursor-pointer"
                          >
                            Ver en Calendario / Asistencia
                          </button>

                          {esGestorBolos && (
                            <>
                              <button
                                onClick={() => abrirModalEditarEnsayo(ens)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer border border-cyan-500/30"
                                title="Editar ensayo"
                              >
                                <Edit3 className="w-3.5 h-3.5"/> Editar
                              </button>
                              <button
                                onClick={() => eliminarEnsayo(ens.id, ens.lugar, ens.fecha)}
                                className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-black font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer border border-rose-500/40"
                                title="Quitar ensayo"
                              >
                                <Trash2 className="w-3.5 h-3.5"/> Quitar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

        {/* MODAL PARA AÑADIR / EDITAR ENSAYO */}
        {showModalEnsayo && esGestorBolos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-cyan-400/50 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-5 h-5 text-cyan-400"/>
                <h3 className="text-lg font-black text-white">
                  {ensayoEditandoId ? 'Editar Ensayo' : 'Añadir Nuevo Ensayo'}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                El ensayo se añadirá al listado y aparecerá en el calendario en color <strong>azul turquesa</strong> con el título fijo <strong>"Ensayo"</strong>.
              </p>

              <form onSubmit={guardarEnsayo} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-cyan-300 block mb-1">Título del evento (Fijo):</label>
                  <input
                    type="text"
                    value="Ensayo"
                    disabled
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-cyan-400 font-black cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-cyan-400 block mb-1">Lugar del Ensayo:</label>
                  <input
                    type="text"
                    placeholder="Ej: Local de ensayo, Nave, Segovia..."
                    value={lugarEnsayo}
                    onChange={e => setLugarEnsayo(e.target.value)}
                    className="w-full bg-black border border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Día del Ensayo:</label>
                    <input
                      type="date"
                      value={fechaEnsayo}
                      onChange={e => setFechaEnsayo(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Hora:</label>
                    <input
                      type="text"
                      placeholder="Ej: 19:30h"
                      value={horaEnsayo}
                      onChange={e => setHoraEnsayo(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Repertorio (Opcional):</label>
                  <textarea
                    rows={3}
                    placeholder="Ej: Temas nuevos 2027, Popurrí festivo, Pasodobles..."
                    value={repertorioEnsayo}
                    onChange={e => setRepertorioEnsayo(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-black py-2.5 rounded-xl text-sm shadow-lg cursor-pointer"
                  >
                    {ensayoEditandoId ? 'Guardar Cambios' : 'Guardar Ensayo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModalEnsayo(false);
                      setEnsayoEditandoId(null);
                    }}
                    className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECCIÓN: BOLOS PRESUPUESTADOS */}
        {pestañaActiva === 'bolos' && (
          <div data-sarao-section="bolos" className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-6">
              
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                    <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                      BOLOS PRESUPUESTADOS ({bolosPresupuestados.length})
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Bolos a los que se ha enviado presupuesto pero aún no han sido aceptados. Aparecen en <strong>amarillo</strong> en el calendario general.
                  </p>
                </div>

                {esGestorBolos && (
                  <button
                    onClick={() => {
                      setTipoCreacionEvento('presupuestado');
                      setNuevoLugarBolo('');
                      setNuevoTituloBolo('');
                      setNuevaFechaBolo('');
                      setNuevaHoraInicioBolo('');
                      setNuevaHoraFinBolo('');
                      setNuevoPresupuestoBolo('');
                      setNuevoConFacturaBolo(false);
                      setShowModalBolo(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4"/> + Añadir Nuevo Presupuesto
                  </button>
                )}
              </div>

              {bolosPresupuestados.length === 0 ? (
                <div className="p-8 bg-black/40 border border-zinc-800 rounded-2xl text-center space-y-2">
                  <ClipboardList className="w-8 h-8 text-zinc-600 mx-auto"/>
                  <p className="text-xs text-zinc-400 font-bold">No hay ningún bolo presupuestado pendiente de respuesta.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {bolosPresupuestados.map(b => (
                    <div key={b.id} className="bg-amber-500/10 border border-amber-500/40 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
                      <div>
                        <div className="flex justify-between items-center gap-2 mb-2">
                          <span className="text-xs font-black bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40">
                            📅 {b.fecha}
                          </span>
                          <span className="text-[10px] font-black uppercase bg-amber-400 text-black px-2.5 py-0.5 rounded-full">
                            ⏳ Pendiente de Aceptar
                          </span>
                        </div>

                        <h3 className="text-3xl tracking-wide text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                          📍 {b.lugar}
                        </h3>
                        {b.titulo && (
                          <p className="text-xs font-bold text-amber-300 mt-0.5">
                            {b.titulo}
                          </p>
                        )}

                        <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-1 text-xs text-zinc-300">
                          <p>⏰ Horario: <strong>{b.horaInicio || 'Por definir'} - {b.horaFin || 'Por definir'}</strong></p>
                          {esGestorBolos && (
                            <p className="text-amber-200 font-bold">
                              💰 Presupuesto enviado: <strong>{b.presupuesto ? `${b.presupuesto} €` : 'Sin especificar'}</strong> ({b.conFactura ? 'Con Factura' : 'Sin Factura'})
                            </p>
                          )}
                        </div>

                        {!esPerfilExtra && (
                          <div className="pt-3 border-t border-amber-500/20 space-y-2">
                            <p className="text-[11px] font-bold text-zinc-300">Tu disponibilidad para este presupuesto:</p>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { estado: 'puedo', label: 'Puedo', style: 'bg-emerald-500 text-black' },
                                { estado: 'tal_vez', label: 'Tal vez', style: 'bg-amber-400 text-black' },
                                { estado: 'no', label: 'No puedo', style: 'bg-rose-500 text-white' }
                              ].map(opcion => (
                                <button
                                  key={opcion.estado}
                                  type="button"
                                  onClick={() => setDisponibilidadBolo(b.id, opcion.estado)}
                                  className={`rounded-lg px-2 py-2 text-[11px] font-black transition ${
                                    usuarioActual.disponibilidadBolos?.[b.id]?.estado === opcion.estado
                                      ? `${opcion.style} ring-2 ring-white`
                                      : 'bg-black/50 border border-zinc-700 text-zinc-300 hover:border-zinc-400'
                                  }`}
                                >
                                  {opcion.label}
                                </button>
                              ))}
                            </div>
                            {usuarioActual.disponibilidadBolos?.[b.id]?.estado && (
                              <p className="text-[10px] text-zinc-400">
                                Tu respuesta: <strong className="text-white">{
                                  usuarioActual.disponibilidadBolos[b.id].estado === 'puedo'
                                    ? 'Puedo'
                                    : usuarioActual.disponibilidadBolos[b.id].estado === 'tal_vez'
                                      ? 'Tal vez'
                                      : 'No puedo'
                                }</strong>. Puedes cambiarla cuando quieras.
                              </p>
                            )}
                          </div>
                        )}

                        {esAdmin && (() => {
                          const respuestasMiembros = miembros
                            .map(m => ({ ...m, respuesta: m.disponibilidadBolos?.[b.id]?.estado }))
                            .filter(m => ['puedo', 'tal_vez', 'no'].includes(m.respuesta));
                          const respuestas = respuestasMiembros.map(m => m.respuesta);
                          const puedo = respuestas.filter(estado => estado === 'puedo').length;
                          const talVez = respuestas.filter(estado => estado === 'tal_vez').length;
                          const noPuedo = respuestas.filter(estado => estado === 'no').length;
                          const listaPorEstado = estado => respuestasMiembros.filter(m => m.respuesta === estado);
                          return (
                            <div className="pt-3 border-t border-amber-500/20">
                              <p className="text-[10px] font-black uppercase tracking-wide text-amber-300 mb-1.5">Disponibilidad de la plantilla</p>
                              <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                                <span className="text-emerald-300">Puedo: {puedo}</span>
                                <span className="text-amber-300">Tal vez: {talVez}</span>
                                <span className="text-rose-300">No puedo: {noPuedo}</span>
                                <span className="text-zinc-400">Sin responder: {Math.max(0, miembros.length - respuestas.length)}</span>
                              </div>
                              <div className="mt-3 grid gap-2 text-[11px]">
                                {[
                                  { estado: 'puedo', titulo: 'Puedo', color: 'text-emerald-300' },
                                  { estado: 'tal_vez', titulo: 'Tal vez', color: 'text-amber-300' },
                                  { estado: 'no', titulo: 'No puedo', color: 'text-rose-300' }
                                ].map(grupo => (
                                  <div key={grupo.estado}>
                                    <p className={`font-black ${grupo.color}`}>{grupo.titulo}</p>
                                    <p className="text-zinc-300">
                                      {listaPorEstado(grupo.estado).length
                                        ? listaPorEstado(grupo.estado).map(m => m.nombre).join(' · ')
                                        : 'Nadie todavía'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {esGestorBolos ? (
                        <div className="pt-3 border-t border-amber-500/20 flex items-center gap-2">
                          <button
                            onClick={() => abrirModalConfirmarPresupuesto(b)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                            title={b.presupuestacionConfirmada ? "Revisar datos y confirmar definitivamente el bolo" : "Revisar datos y confirmar que se ha presupuestado"}
                          >
                            <Check className="w-4 h-4"/> ✓ {b.presupuestacionConfirmada ? 'Confirmar Bolo' : 'Confirmar Presupuestación'}
                          </button>
                          <button
                            onClick={() => rechazarBoloPresupuestado(b.id, b.lugar)}
                            className="flex-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-black border border-rose-500/40 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            title="Rechazar presupuesto y borrar del calendario"
                          >
                            <XCircle className="w-4 h-4"/> ✕ Rechazar
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-400 italic">
                          Esperando confirmación del organizador para abrir la lista de asistencia.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* MODAL DE REVISIÓN AL PULSAR EL TICK DE CONFIRMAR PRESUPUESTO */}
        {showModalConfirmarPresupuesto && esGestorBolos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-emerald-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-6 h-6 text-emerald-400"/>
                <h3 className="text-lg font-black text-white">{bolos.find(b => b.id === presupuestoAConfirmarId)?.presupuestacionConfirmada ? 'Confirmar Bolo Definitivamente' : 'Confirmar Presupuestación'}</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Revisa o modifica los datos del presupuesto. {bolos.find(b => b.id === presupuestoAConfirmarId)?.presupuestacionConfirmada ? 'Al confirmar definitivamente, el bolo pasará a color verde y se abrirán las asistencias.' : 'Al confirmar la presupuestación, el evento seguirá pendiente y podrás confirmar el bolo en un segundo paso.'}
              </p>

              <form onSubmit={bolos.find(b => b.id === presupuestoAConfirmarId)?.presupuestacionConfirmada ? confirmarBoloPresupuestadoDefinitivo : confirmarPresupuestacion} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-emerald-400 block mb-1">Lugar del Bolo:</label>
                  <input
                    type="text"
                    value={editLugarBolo}
                    onChange={e => setEditLugarBolo(e.target.value)}
                    className="w-full bg-black border border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Tipo de Bolo (Opcional):</label>
                  <input
                    type="text"
                    value={editTituloBolo}
                    onChange={e => setEditTituloBolo(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Fecha del bolo:</label>
                  <input
                    type="date"
                    value={editFechaBolo}
                    onChange={e => setEditFechaBolo(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800">
                  <div>
                    <label className="text-[11px] font-bold text-green-400 block mb-1">Hora Inicio:</label>
                    <input
                      type="text"
                      placeholder="Ej: 13:00h"
                      value={editHoraInicioBolo}
                      onChange={e => setEditHoraInicioBolo(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-green-400 block mb-1">Hora Fin:</label>
                    <input
                      type="text"
                      placeholder="Ej: 17:00h"
                      value={editHoraFinBolo}
                      onChange={e => setEditHoraFinBolo(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-amber-400 block mb-1">Presupuesto final (€):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editPresupuestoBolo}
                      onChange={e => setEditPresupuestoBolo(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="confirmFacturaCheck"
                      checked={editConFacturaBolo}
                      onChange={e => setEditConFacturaBolo(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                    <label htmlFor="confirmFacturaCheck" className="text-xs text-zinc-300 font-bold cursor-pointer flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-zinc-400"/> Va con Factura oficial
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 rounded-xl text-sm shadow-lg cursor-pointer">
                    ✓ {bolos.find(b => b.id === presupuestoAConfirmarId)?.presupuestacionConfirmada ? 'Confirmar Bolo' : 'Confirmar Presupuestación'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModalConfirmarPresupuesto(false);
                      setPresupuestoAConfirmarId(null);
                    }}
                    className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PANEL ADMIN */}
        {pestañaActiva === 'admin' && esAdmin && (
          <div data-sarao-section="admin" className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-3xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    PANEL DE ADMINISTRACIÓN
                  </h2>
                  <p className="text-xs text-zinc-400">Gestión y control de Charanga Sarao.</p>
                </div>
                <div className="flex items-center gap-2">
                  {historialEstados.length > 0 && (
                    <button onClick={deshacerUltimoCambio} className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow">
                      <Undo2 className="w-4 h-4"/> Deshacer ({historialEstados.length})
                    </button>
                  )}
                  <button onClick={exportarEstadisticasExcel} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow">
                    <Download className="w-4 h-4"/> Exportar CSV
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'resumen', label: 'Resumen', icon: BarChart3, desc: 'Estadísticas y ajustes' },
                  { id: 'clientes', label: 'Cartera de clientes', icon: Users, desc: 'CRM y contactos' },
                  { id: 'alertas', label: 'Centro de alertas', icon: AlertCircle, desc: 'Incidencias por bolo' },
                  { id: 'plantilla', label: 'Plantilla de músicos', icon: Users, desc: 'Músicos y permisos' }
                ].map(item => {
                  const Icon = item.icon;
                  const activa = seccionAdminActiva === item.id;
                  return (
                    <button key={item.id} type="button" onClick={() => setSeccionAdminActiva(item.id)}
                      className={`rounded-2xl border p-3 text-left transition ${activa ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-200' : 'border-zinc-800 bg-black/40 text-zinc-400 hover:border-emerald-400/30 hover:text-white'}`}>
                      <Icon className="h-4 w-4 mb-2" />
                      <span className="block text-xs font-black">{item.label}</span>
                      <span className="mt-1 block text-[10px] opacity-70">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
              {seccionAdminActiva === 'resumen' && (
                <div className="space-y-6">
              <div className="bg-black/60 border border-cyan-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-cyan-400"/>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Correo de Facturación
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Introduce el correo electrónico al que se enviarán automáticamente todas las facturas que suban los músicos a la aplicación.
                </p>
                <form onSubmit={guardarCorreoFacturacionAdmin} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="ejemplo@charangasarao.com"
                    value={inputCorreoAdmin}
                    onChange={e => setInputCorreoAdmin(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none focus:border-cyan-400"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs px-5 py-2.5 rounded-xl shadow transition shrink-0 cursor-pointer"
                  >
                    Guardar Correo
                  </button>
                </form>
                {correoFacturacion && (
                  <p className="text-[11px] text-emerald-400 font-bold">
                    ✓ Correo activo actual: {correoFacturacion}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400"/> Asistencia a Bolos y Facturación acumulada
                </h3>
                
                {miembros.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-3">No hay miembros para calcular estadísticas.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="text-[10px] uppercase text-zinc-400 bg-black/60 border-b border-zinc-800">
                        <tr>
                          <th className="p-3">Músico</th>
                          <th className="p-3">Cuerda</th>
                          <th className="p-3">Roles</th>
                          <th className="p-3">Asistencia Bolos</th>
                          <th className="p-3">% Confirmado</th>
                          <th className="p-3">Facturado (€)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
                        {miembros.map(m => {
                          const totalBolos = bolosConfirmados.length;
                          const idsConfirmados = new Set(bolosConfirmados.map(b => String(b.id)));
                          const siVan = Object.entries(m.disponibilidadBolos || {})
                            .filter(([bId, v]) => idsConfirmados.has(String(bId)) && v?.estado === 'puedo').length;
                          const talVez = Object.entries(m.disponibilidadBolos || {})
                            .filter(([bId, v]) => idsConfirmados.has(String(bId)) && v?.estado === 'tal_vez').length;
                          const pct = totalBolos > 0 ? Math.round((siVan / totalBolos) * 100) : 0;
                          const totalFacturadoMiembro = facturas
                            .filter(f => f.usuarioId === m.id || f.usuarioNombre?.trim().toLowerCase() === m.nombre?.trim().toLowerCase())
                            .reduce((acc, f) => acc + obtenerImporteFactura(f), 0);

                          return (
                            <tr key={m.id} className="hover:bg-zinc-800/30">
                              <td className="p-3 font-bold text-white">{m.nombre}</td>
                              <td className="p-3 text-zinc-400">{m.cuerda}</td>
                              <td className="p-3">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                                  {m.roles?.join(', ')}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="text-emerald-400 font-bold">{siVan} sí</span> • <span className="text-amber-400">{talVez} duda</span> / {totalBolos}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                  </div>
                                  <span className="font-black text-xs text-green-400">{pct}%</span>
                                </div>
                              </td>
                              <td className="p-3 font-black text-cyan-400">
                                {totalFacturadoMiembro.toFixed(2)} €
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>


                </div>
              )}
            </div>
          </div>
        )}

        {/* PLANTILLA */}
        {pestañaActiva === 'admin' && esAdmin && seccionAdminActiva === 'plantilla' && (
          <div data-sarao-section="miembros" className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                  PLANTILLA DE MÚSICOS ({miembros.length})
                </h2>
                {esAdmin && (
                  <button onClick={() => { setSeccionAdminActiva('resumen'); setPestañaActiva('admin'); }} className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4"/> Estadísticas y Roles
                  </button>
                )}
              </div>

              {miembros.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">Aún no hay ningún músico registrado en la plantilla.</p>
              ) : (
                <div className="space-y-3">
                  {miembros.map(m => {
                    const conf = CONFIG_CUERDAS[m.cuerda] || CONFIG_CUERDAS['Saxos'];
                    return (
                      <div key={m.id} className={`p-4 rounded-2xl border ${conf.bg} ${conf.border} space-y-3`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded" style={{ backgroundColor: conf.dot + '22', color: conf.dot }}>
                              {m.cuerda}
                            </span>
                            <p className="font-bold text-base text-zinc-100 mt-1">{m.nombre}</p>
                            <p className="text-xs text-zinc-400">Instrumentos: {m.instrumentos?.join(', ')}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Roles: <strong className="text-zinc-300 uppercase">{m.roles?.join(', ')}</strong>
                            </p>
                          </div>

                          {esAdmin && m.nombre.toLowerCase() !== 'edgar' && (
                            <button onClick={() => eliminarMiembroPlantilla(m.id)} className="text-rose-400 hover:bg-rose-500/20 p-2 rounded-xl transition" title="Eliminar de la plantilla">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          )}
                        </div>

                        {esAdmin && (
                          <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                              <Key className="w-3 h-3 text-rose-400"/> Asignar rol (solo admin):
                            </span>
                            {[
                              { id: 'bolos', label: 'Bolos' },
                              { id: 'conductor', label: 'Conductor' },
                              { id: 'jefe_cuerda', label: 'Jefe Cuerda' },
                              { id: 'tesorero', label: 'Tesorero' },
                              { id: 'facturador', label: 'Facturador' },
                              ...ROLES_CUERDAS,
                              { id: 'admin', label: 'Admin' }
                            ].map(r => {
                              const tiene = m.roles?.includes(r.id);
                              return (
                                <button
                                  key={r.id}
                                  onClick={() => toggleRolMiembro(m.id, r.id)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border transition ${
                                    tiene 
                                      ? 'bg-zinc-100 text-black border-white shadow-sm' 
                                      : 'bg-black/40 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                                  }`}
                                >
                                  {r.label} {tiene ? '✓' : '+'}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN: FACTURAS */}
        {pestañaActiva === 'facturas' && (
          <div data-sarao-section="facturas" className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-6">
              
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    GESTIÓN DE FACTURAS
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Sube tus facturas en PDF o foto. El sistema detecta el importe y lo envía automáticamente al correo de facturación.
                  </p>
                  {correoFacturacion && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg mt-2">
                      <Mail className="w-3.5 h-3.5"/> Envío automático activo a: <strong>{correoFacturacion}</strong>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setArchivoFactura(null);
                    setErrorArchivoFactura('');
                    setPreviewArchivoUrl('');
                    setNombreArchivoFactura('');
                    setConceptoFactura('');
                    setImporteFacturaDetectado('');
                    setMensajeAnalisis('');
                    setShowModalSubirFactura(true);
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Upload className="w-4 h-4"/> + Subir Factura (PDF / Foto)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/60 border border-cyan-500/30 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-cyan-300 uppercase">Tu Total Facturado ({usuarioActual.nombre})</span>
                  <p className="text-3xl font-black text-white mt-1">
                    {miTotalFacturado.toFixed(2)} €
                  </p>
                  <span className="text-[11px] text-zinc-400">{misFacturas.length} factura(s) subida(s) por ti</span>
                </div>

                {(esFacturador || esAdmin) && (
                  <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-amber-300 uppercase">Total Global Facturado (Charanga Sarao)</span>
                    <p className="text-3xl font-black text-amber-400 mt-1">
                      {totalGeneralFacturado.toFixed(2)} €
                    </p>
                    <span className="text-[11px] text-zinc-400">{facturas.length} factura(s) registrada(s) en total</span>
                  </div>
                )}
              </div>

              {(esFacturador || esAdmin) && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4"/> Desglose de Cantidad Facturada por cada Miembro (Vista Facturador / Admin)
                  </h3>
                  <div className="overflow-x-auto bg-black/50 rounded-2xl border border-zinc-800">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="text-[10px] uppercase text-zinc-400 bg-zinc-950 border-b border-zinc-800">
                        <tr>
                          <th className="p-3">Músico</th>
                          <th className="p-3">Cuerda</th>
                          <th className="p-3">Nº Facturas</th>
                          <th className="p-3">Total Facturado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {miembros.map(m => {
                          const facturasMiembro = facturas.filter(
                            f => f.usuarioId === m.id || f.usuarioNombre?.trim().toLowerCase() === m.nombre?.trim().toLowerCase()
                          );
                          const sumaMiembro = facturasMiembro.reduce((acc, f) => acc + obtenerImporteFactura(f), 0);

                          return (
                            <tr key={m.id} className="hover:bg-zinc-800/30">
                              <td className="p-3 font-bold text-white">{m.nombre}</td>
                              <td className="p-3 text-zinc-400">{m.cuerda}</td>
                              <td className="p-3">{facturasMiembro.length}</td>
                              <td className="p-3 font-black text-cyan-400">{sumaMiembro.toFixed(2)} €</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                  {(esFacturador || esAdmin) ? 'Todas las Facturas Subidas' : 'Mis Facturas Subidas'}
                </h3>

                {((esFacturador || esAdmin) ? facturas : misFacturas).length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6 bg-black/40 rounded-2xl border border-zinc-800">
                    No hay facturas registradas todavía.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto">
                    {((esFacturador || esAdmin) ? facturas : misFacturas).map(f => (
                      <div key={f.id} className="p-3.5 bg-black/70 border border-zinc-800 hover:border-cyan-500/40 rounded-2xl flex justify-between items-center gap-3 text-xs transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-white text-sm">{f.concepto}</span>
                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full text-[10px] font-black">
                              {f.usuarioNombre}
                            </span>
                            <span className="text-[10px] text-zinc-500">({f.nombreArchivo})</span>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            📅 {f.fecha} • Destino: <strong className="text-zinc-300">{f.enviadaACorreo}</strong>
                            {f.estadoEnvioCorreo && (
                              <span className={`ml-2 font-bold ${
                                f.estadoEnvioCorreo === 'enviado' ? 'text-emerald-400' :
                                  f.estadoEnvioCorreo === 'error' ? 'text-rose-400' : 'text-amber-400'
                              }`}>
                                {f.estadoEnvioCorreo === 'enviado' ? 'Correo enviado' :
                                  f.estadoEnvioCorreo === 'error' ? 'Error de envío' :
                                    f.estadoEnvioCorreo === 'pendiente' ? 'Envío pendiente' : 'Sin correo configurado'}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-base font-black text-cyan-400">
                            {obtenerImporteFactura(f).toFixed(2)} €
                          </span>

                          {f.archivoDataUrl && (
                            <a
                              href={f.archivoDataUrl}
                              download={f.nombreArchivo || 'factura'}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 rounded-xl transition"
                              title="Ver / Descargar documento"
                            >
                              <Eye className="w-4 h-4"/>
                            </a>
                          )}

                          <button
                            onClick={() => eliminarFactura(f)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 rounded-xl transition"
                            title="Eliminar factura"
                          >
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* MODAL PARA SUBIR Y ANALIZAR FACTURA */}
        {showModalSubirFactura && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-cyan-400"/>
                <h3 className="text-lg font-black text-white">Subir y Analizar Factura</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Selecciona un PDF o haz una foto a la factura. Analizaremos el documento para extraer el importe total automáticamente.
              </p>

              <form onSubmit={guardarYEnviarFactura} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1.5">
                    1. Archivo de la factura (PDF o Imagen):
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={manejarSeleccionArchivoFactura}
                      className="w-full min-w-0 text-xs text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-cyan-500 file:text-black hover:file:bg-cyan-400 bg-black border border-zinc-800 rounded-2xl p-2 cursor-pointer"
                      required
                    />
                    <span className="shrink-0 rounded-lg border border-red-500/60 bg-red-500/15 px-3 py-2 text-center text-xs font-black uppercase tracking-wide text-red-300">
                      Máx. 4,5 MB de archivo
                    </span>
                  </div>
                  {errorArchivoFactura && (
                    <p role="alert" className="mt-2 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">
                      {errorArchivoFactura}
                    </p>
                  )}
                </div>

                {analizandoFactura && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-2 text-xs text-cyan-300">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0"/>
                    <span>Analizando factura para detectar el importe...</span>
                  </div>
                )}

                {!analizandoFactura && mensajeAnalisis && (
                  <div className="p-3 bg-zinc-950 border border-cyan-500/30 rounded-xl text-[11px] text-cyan-300 font-medium">
                    {mensajeAnalisis}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1">
                    2. Concepto / Proveedor:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Factura Autónomo Actuación / Repuestos..."
                    value={conceptoFactura}
                    onChange={e => setConceptoFactura(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-400 block mb-1">
                    3. Importe Total Detectado (€):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 150.00"
                    value={importeFacturaDetectado}
                    onChange={e => setImporteFacturaDetectado(e.target.value)}
                    className="w-full bg-black border border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-base font-black text-white outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={analizandoFactura || enviandoFactura}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5"
                  >
                    {enviandoFactura ? 'Enviando...' : 'Registrar y Enviar por Correo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModalSubirFactura(false)}
                    className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* POPUP PERSONAL DE NOTIFICACIONES */}
        {notificacionesAbiertas && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/65 px-3 pb-6 pt-20 backdrop-blur-sm sm:justify-end sm:px-6 sm:pt-24" onMouseDown={e => { if (e.target === e.currentTarget) setNotificacionesAbiertas(false); }}>
          <section role="dialog" aria-modal="true" aria-label="Notificaciones personales" className="max-h-[78vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-emerald-400/20 bg-[#090f0b] p-4 shadow-2xl shadow-black/60 sm:p-5">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#0b1711] via-zinc-950 to-[#101713] p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3"><div><span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">Tu espacio personal · Sarao</span><h2 className="mt-1 text-3xl text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Notificaciones</h2><p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">Avisos generales y mensajes dirigidos a ti.</p></div><button type="button" onClick={() => setNotificacionesAbiertas(false)} aria-label="Cerrar notificaciones" className="rounded-xl border border-white/10 bg-black/30 p-2 text-zinc-400 hover:text-white"><X className="h-4 w-4"/></button></div>
                <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-right"><p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Sin leer</p><p className="text-3xl font-black tabular-nums text-white">{notificacionesPersonales.filter(n => !n.leida).length}</p></div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
                {[['todas','Todas'],['sinLeer','Sin leer'],['general','Generales'],['personal','Para mí']].map(([id,label]) => <button key={id} type="button" onClick={() => setFiltroNotificaciones(id)} className={`rounded-xl px-3 py-2 text-[10px] font-black transition ${filtroNotificaciones === id ? 'bg-emerald-300 text-emerald-950' : 'text-zinc-400 hover:text-white'}`}>{label}</button>)}
              </div>
              {notificacionesPersonales.some(n => !n.leida) && <button type="button" onClick={() => Promise.all(notificacionesPersonales.filter(n => !n.leida).map(n => marcarNotificacionLeida(n, true)))} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/25 px-3 py-2 text-[10px] font-black text-emerald-200 hover:bg-emerald-400/10"><CheckCheck className="h-3.5 w-3.5"/> Marcar todas como leídas</button>}
            </div>
            {(() => { const visibles = notificacionesPersonales.filter(n => filtroNotificaciones === 'sinLeer' ? !n.leida : filtroNotificaciones === 'general' ? n.tipo === 'general' : filtroNotificaciones === 'personal' ? n.tipo === 'personal' : true); return visibles.length ? <div className="space-y-2">{visibles.map(n => <article key={n.id} className={`flex items-start gap-3 rounded-2xl border p-4 transition ${n.leida ? 'border-zinc-800 bg-zinc-900/55' : 'border-emerald-400/25 bg-emerald-400/[0.06]'}`}><span className={`mt-0.5 rounded-xl p-2 ${n.tipo === 'personal' ? 'bg-violet-400/10 text-violet-300' : 'bg-emerald-400/10 text-emerald-300'}`}>{n.leida ? <Bell className="h-4 w-4"/> : <Circle className="h-3.5 w-3.5 fill-current"/>}</span><button type="button" onClick={() => abrirNotificacion(n)} className="min-w-0 flex-1 text-left"><div className="flex flex-wrap items-center gap-2"><h3 className="text-xs font-black text-white">{n.titulo || 'Notificación'}</h3><span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${n.tipo === 'personal' ? 'bg-violet-400/10 text-violet-300' : 'bg-emerald-400/10 text-emerald-300'}`}>{n.tipo === 'personal' ? 'Para ti' : 'General'}</span></div><p className="mt-1 text-xs leading-relaxed text-zinc-400">{n.mensaje}</p><p className="mt-2 text-[9px] text-zinc-600">{n.creadaEn ? new Date(n.creadaEn).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : ''} · Toca para abrir</p></button>{!n.leida && <button type="button" title="Marcar como leída" onClick={() => marcarNotificacionLeida(n, true)} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-emerald-300"><Check className="h-4 w-4"/></button>}</article>)}</div> : <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-9 text-center"><Bell className="mx-auto h-9 w-9 text-zinc-600"/><h3 className="mt-3 text-sm font-black text-white">No tienes notificaciones aquí</h3><p className="mt-1 text-xs text-zinc-500">Cuando haya novedades generales o avisos para ti, aparecerán en esta bandeja.</p></div>; })()}
          </section>
          </div>
        )}

        {/* CENTRO DE ALERTAS · DETECCIÓN AUTOMÁTICA */}
        {pestañaActiva === 'admin' && esAdmin && seccionAdminActiva === 'alertas' && (
          <section data-sarao-section="alertas" className="mx-auto max-w-5xl space-y-5">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#0b1711] via-zinc-950 to-[#101713] p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">Control preventivo · Sarao</span>
                  <h2 className="mt-2 text-3xl text-white sm:text-4xl" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Centro de alertas</h2>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">Revisión automática de las próximas actuaciones para detectar detalles pendientes antes del día del bolo.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-right">
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Incidencias abiertas</p>
                  <p className="text-3xl font-black tabular-nums text-white">{alertasGestion.length}</p>
                  <p className="text-[10px] text-rose-300">{totalAlertasAltas} de prioridad alta</p>
                </div>
              </div>
            </div>

            {alertasPorBolo.length === 0 ? (
              <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/5 p-8 text-center">
                <Check className="mx-auto h-9 w-9 text-emerald-300" />
                <h3 className="mt-3 text-lg font-black text-white">Todo bajo control</h3>
                <p className="mt-1 text-xs text-zinc-400">No se han detectado incidencias en las próximas actuaciones.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertasPorBolo.map(({ bolo, alertas }) => {
                  const altasBolo = alertas.filter(alerta => alerta.nivel === 'alto').length;
                  const tareasBolo = alertas.find(alerta => alerta.tipo === 'Tareas sin completar');
                  return (
                    <article key={bolo.id} className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/25 p-4 sm:px-5">
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">Actuación · {bolo.fecha}</p>
                          <h3 className="mt-1 truncate text-lg font-black text-white">{bolo.lugar || 'Bolo sin nombre'}</h3>
                          <p className="mt-0.5 text-[10px] text-zinc-500">{alertas.length} incidencias · {tareasBolo ? tareasBolo.detalle : 'Sin tareas pendientes detectadas'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[9px] font-black text-rose-300">{altasBolo} prioridad alta</span>
                          <button type="button" onClick={() => seleccionarBolo(bolo.id)} className="shrink-0 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[10px] font-black text-emerald-200 hover:bg-emerald-400/20">Ver bolo</button>
                        </div>
                      </div>
                      <div className="divide-y divide-white/5 px-4 sm:px-5">
                        {alertas.map((alerta, index) => (
                          <div key={`${bolo.id}-${alerta.tipo}-${index}`} className="flex items-start gap-3 py-3">
                            <span className={`mt-0.5 rounded-xl p-2 ${alerta.nivel === 'alto' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'}`}>
                              <AlertCircle className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-xs font-black text-white">{alerta.tipo}</h4>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${alerta.nivel === 'alto' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'}`}>{alerta.nivel === 'alto' ? 'Prioridad alta' : 'Revisar'}</span>
                              </div>
                              <p className="mt-1 text-xs text-zinc-400">{alerta.detalle}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <p className="text-[10px] leading-relaxed text-zinc-500">Las alertas se calculan automáticamente con los datos guardados. No modifican actuaciones ni envían notificaciones por sí solas.</p>
          </section>
        )}

        {/* CRM · BASE DE DATOS DE CLIENTES */}
        {pestañaActiva === 'admin' && esAdmin && seccionAdminActiva === 'clientes' && (
          <section className="mx-auto max-w-5xl space-y-5" data-sarao-section="clientes">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-[#0b1711] via-zinc-950 to-[#101713] p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="relative flex flex-wrap items-start justify-between gap-4"><div><span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">Centro comercial · Sarao</span><h2 className="mt-2 text-3xl text-white sm:text-4xl" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Cartera de clientes</h2><p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">Contactos, entidades y oportunidades para mantener las contrataciones organizadas.</p></div><button onClick={() => { setClienteEditandoId(null); setFormCliente({ nombre: '', tipo: 'Ayuntamiento', contacto: '', telefono: '', email: '', localidad: '', notas: '' }); setMostrarFormularioCliente(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-xs font-black text-black hover:bg-emerald-300"><Plus className="h-4 w-4"/> Nuevo cliente</button></div>
              <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-black/30 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Clientes registrados</p><p className="mt-1 text-2xl font-black text-white">{clientes.length}</p></div><div className="rounded-2xl border border-white/10 bg-black/30 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Ayuntamientos</p><p className="mt-1 text-2xl font-black text-white">{clientes.filter(c => c.tipo === 'Ayuntamiento').length}</p></div><div className="col-span-2 rounded-2xl border border-white/10 bg-black/30 p-3 sm:col-span-1"><p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Otros contactos</p><p className="mt-1 text-2xl font-black text-white">{clientes.filter(c => c.tipo !== 'Ayuntamiento').length}</p></div></div>
            </div>
            {mostrarFormularioCliente && <form onSubmit={async e => { e.preventDefault(); const limpio = { ...formCliente, nombre: formCliente.nombre.trim(), contacto: formCliente.contacto.trim(), telefono: formCliente.telefono.trim(), email: formCliente.email.trim(), localidad: formCliente.localidad.trim(), notas: formCliente.notas.trim() }; if (!limpio.nombre) return; const ahora = new Date().toISOString(); const lista = clienteEditandoId ? clientes.map(c => String(c.id) === String(clienteEditandoId) ? { ...c, ...limpio, actualizadoEn: ahora } : c) : [...clientes, { id: 'cliente-' + Date.now(), ...limpio, creadoEn: ahora, creadoPor: usuarioActual?.nombre || '' }]; if (await guardarClientesEnNube(lista)) { setMostrarFormularioCliente(false); setClienteEditandoId(null); setFormCliente({ nombre: '', tipo: 'Ayuntamiento', contacto: '', telefono: '', email: '', localidad: '', notas: '' }); } }} className="rounded-3xl border border-emerald-400/20 bg-zinc-950 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between"><h3 className="text-sm font-black text-white">{clienteEditandoId ? 'Editar cliente' : 'Registrar cliente'}</h3><button type="button" onClick={() => setMostrarFormularioCliente(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/5"><XCircle className="h-4 w-4"/></button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[10px] font-bold text-zinc-400">Nombre de entidad o cliente *<input required maxLength={100} value={formCliente.nombre} onChange={e => setFormCliente(v => ({ ...v, nombre: e.target.value }))} placeholder="Ej. Ayuntamiento de Cuéllar" className="mt-1 min-h-11 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs text-white outline-none focus:border-emerald-400"/></label>
                <label className="text-[10px] font-bold text-zinc-400">Tipo de cliente<select value={formCliente.tipo} onChange={e => setFormCliente(v => ({ ...v, tipo: e.target.value }))} className="mt-1 min-h-11 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs text-white outline-none focus:border-emerald-400">{['Ayuntamiento','Peña','Comisión de fiestas','Empresa','Particular','Otro'].map(t => <option key={t}>{t}</option>)}</select></label>
                <label className="text-[10px] font-bold text-zinc-400">Persona de contacto<input maxLength={80} value={formCliente.contacto} onChange={e => setFormCliente(v => ({ ...v, contacto: e.target.value }))} placeholder="Nombre y apellidos" className="mt-1 min-h-11 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs text-white outline-none focus:border-emerald-400"/></label>
                <label className="text-[10px] font-bold text-zinc-400">Teléfono<input type="tel" maxLength={30} value={formCliente.telefono} onChange={e => setFormCliente(v => ({ ...v, telefono: e.target.value }))} placeholder="Teléfono de contacto" className="mt-1 min-h-11 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs text-white outline-none focus:border-emerald-400"/></label>
                <label className="text-[10px] font-bold text-zinc-400">Correo electrónico<input type="email" maxLength={120} value={formCliente.email} onChange={e => setFormCliente(v => ({ ...v, email: e.target.value }))} placeholder="contacto@ejemplo.es" className="mt-1 min-h-11 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs text-white outline-none focus:border-emerald-400"/></label>
                <label className="text-[10px] font-bold text-zinc-400">Localidad<input maxLength={80} value={formCliente.localidad} onChange={e => setFormCliente(v => ({ ...v, localidad: e.target.value }))} placeholder="Municipio" className="mt-1 min-h-11 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs text-white outline-none focus:border-emerald-400"/></label>
                <label className="text-[10px] font-bold text-zinc-400 sm:col-span-2">Notas e historial de contacto<textarea rows={3} maxLength={1000} value={formCliente.notas} onChange={e => setFormCliente(v => ({ ...v, notas: e.target.value }))} placeholder="Preferencias, fiestas habituales, presupuesto orientativo, última conversación..." className="mt-1 w-full rounded-xl border border-zinc-800 bg-black px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-400"/></label>
              </div><div className="flex gap-2"><button type="submit" className="min-h-10 flex-1 rounded-xl bg-emerald-400 px-4 text-xs font-black text-black">{clienteEditandoId ? 'Guardar cambios' : 'Guardar cliente'}</button><button type="button" onClick={() => setMostrarFormularioCliente(false)} className="rounded-xl border border-zinc-700 px-4 text-xs font-bold text-zinc-300">Cancelar</button></div>
            </form>}
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"/><input value={busquedaClientes} onChange={e => setBusquedaClientes(e.target.value)} placeholder="Buscar por entidad, persona, localidad o teléfono..." className="min-h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-xs text-white outline-none focus:border-emerald-400"/></div>
            {clientes.length === 0 ? <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950/70 px-5 py-12 text-center"><Users className="mx-auto h-8 w-8 text-zinc-600"/><p className="mt-3 text-sm font-black text-white">Todavía no hay clientes</p><p className="mt-1 text-xs text-zinc-500">Añade el primer contacto para empezar a construir la cartera de Sarao.</p></div> : <div className="grid gap-3 md:grid-cols-2">{clientes.filter(c => [c.nombre,c.tipo,c.contacto,c.telefono,c.email,c.localidad].some(v => String(v || '').toLowerCase().includes(busquedaClientes.toLowerCase()))).sort((a,b) => a.nombre.localeCompare(b.nombre,'es')).map(cliente => (
              <article key={cliente.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-4 transition hover:border-emerald-400/30"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-300">{cliente.tipo || 'Cliente'}</span><h3 className="mt-2 break-words text-base font-black text-white">{cliente.nombre}</h3>{cliente.contacto && <p className="mt-0.5 text-xs text-zinc-400">{cliente.contacto}</p>}</div><div className="flex shrink-0 gap-1"><button aria-label="Editar cliente" onClick={() => { setClienteEditandoId(cliente.id); setFormCliente({ nombre: cliente.nombre || '', tipo: cliente.tipo || 'Ayuntamiento', contacto: cliente.contacto || '', telefono: cliente.telefono || '', email: cliente.email || '', localidad: cliente.localidad || '', notas: cliente.notas || '' }); setMostrarFormularioCliente(true); }} className="rounded-lg p-2 text-zinc-400 hover:bg-emerald-400/10 hover:text-emerald-300"><Edit3 className="h-4 w-4"/></button><button aria-label="Eliminar cliente" onClick={async () => { if (confirm('¿Eliminar a ' + cliente.nombre + ' de la cartera de clientes?')) await guardarClientesEnNube(clientes.filter(c => String(c.id) !== String(cliente.id))); }} className="rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4"/></button></div></div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-zinc-400">{cliente.telefono && <a href={'tel:' + cliente.telefono} className="inline-flex items-center gap-1.5 hover:text-emerald-300"><Phone className="h-3.5 w-3.5"/>{cliente.telefono}</a>}{cliente.email && <a href={'mailto:' + cliente.email} className="inline-flex min-w-0 items-center gap-1.5 break-all hover:text-emerald-300"><Mail className="h-3.5 w-3.5 shrink-0"/>{cliente.email}</a>}{cliente.localidad && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5"/>{cliente.localidad}</span>}</div>{cliente.notas && <p className="mt-3 whitespace-pre-wrap border-t border-white/5 pt-3 text-[11px] leading-relaxed text-zinc-400">{cliente.notas}</p>}</article>
            ))}</div>}
            {clientes.length > 0 && clientes.filter(c => [c.nombre,c.tipo,c.contacto,c.telefono,c.email,c.localidad].some(v => String(v || '').toLowerCase().includes(busquedaClientes.toLowerCase()))).length === 0 && <p className="py-8 text-center text-xs text-zinc-500">No hay clientes que coincidan con la búsqueda.</p>}
          </section>
        )}

        {/* CALENDARIO GENERAL (VERDE = CONFIRMADO, AMARILLO = PRESUPUESTADO, AZUL TURQUESA = ENSAYO) */}
        {pestañaActiva === 'bolos' && (
          <div data-sarao-section="bolos" className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3.5 sm:p-6">
              
              <div className="flex justify-between items-start flex-wrap gap-3 border-b border-zinc-800 pb-4 mb-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    CALENDARIO DE BOLOS Y ENSAYOS
                  </h2>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span> Bolo Confirmado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Presupuestado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Ensayo (Azul Turquesa)
                    </span>
                  </div>
                </div>

                {esGestorBolos && (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
                    <button 
                      onClick={() => {
                        setTipoCreacionEvento('confirmado');
                        setShowModalBolo(true);
                      }} 
                      className="flex-1 sm:flex-none justify-center bg-green-500 hover:bg-green-400 text-black font-black text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 shadow transition"
                    >
                      <Plus className="w-3.5 h-3.5"/> + Añadir
                    </button>
                    <button 
                      onClick={() => {
                        setBoloEditandoId(null);
                        setShowModalEditarBolos(true);
                      }} 
                      className="flex-1 sm:flex-none justify-center bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 shadow transition"
                    >
                      <Edit3 className="w-3.5 h-3.5"/> ✎ Editar
                    </button>
                    <button 
                      onClick={() => setShowModalEliminarBolos(true)} 
                      className="flex-1 sm:flex-none justify-center bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-black text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 shadow transition"
                    >
                      <Trash2 className="w-3.5 h-3.5"/> - Borrar
                    </button>
                  </div>
                )}
              </div>

              {/* CONTENEDOR DEL CALENDARIO SCROLLEABLE CON CELDAS GRANDES */}
              <div className="bg-black/60 border border-zinc-800 rounded-2xl p-3 sm:p-4 mb-5">
                
                <div className="flex items-center justify-start mb-3 gap-3 min-w-0">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setMesIndexActivo(prev => Math.max(0, prev - 1))}
                      disabled={mesIndexActivo === 0}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl text-white"
                      title="Mes anterior"
                      aria-label="Mes anterior"
                    >
                      <ChevronLeft className="w-4 h-4"/>
                    </button>
                    <button
                      onClick={() => setMesIndexActivo(prev => Math.min(MESES_PERMITIDOS.length - 1, prev + 1))}
                      disabled={mesIndexActivo === MESES_PERMITIDOS.length - 1}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl text-white"
                      title="Mes siguiente"
                      aria-label="Mes siguiente"
                    >
                      <ChevronRight className="w-4 h-4"/>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <select
                      value={mesIndexActivo}
                      onChange={e => setMesIndexActivo(parseInt(e.target.value))}
                      aria-label="Seleccionar mes y año"
                      className="flex-1 min-w-[145px] sm:min-w-[190px] bg-zinc-900 border border-zinc-700 text-[10px] sm:text-xs text-green-300 font-bold rounded-xl px-2.5 py-2 outline-none focus:border-green-500"
                    >
                      {MESES_PERMITIDOS.map((m, idx) => (
                        <option key={idx} value={idx}>{m.label}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setCalendarZoom(z => Math.max(0.65, +(z - 0.1).toFixed(2)))} className="w-7 h-8 sm:w-8 sm:h-9 shrink-0 rounded-lg bg-zinc-800 text-white font-black" aria-label="Alejar calendario">−</button>
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 tabular-nums w-7 sm:w-9 text-center shrink-0">{Math.round(calendarZoom * 100)}%</span>
                    <button type="button" onClick={() => setCalendarZoom(z => Math.min(1.45, +(z + 0.1).toFixed(2)))} className="w-7 h-8 sm:w-8 sm:h-9 shrink-0 rounded-lg bg-zinc-800 text-white font-black" aria-label="Acercar calendario">+</button>
                    <button type="button" onClick={() => setCalendarZoom(1)} className="text-[9px] sm:text-[10px] text-green-300 font-bold px-1 shrink-0">Reset</button>
                  </div>
                </div>

                <div
                  className="max-h-[420px] overflow-auto rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-2 scrollbar-thin scrollbar-thumb-zinc-700"
                  onTouchStart={e => {
                    if (e.touches.length === 2) {
                      const dx = e.touches[0].clientX - e.touches[1].clientX;
                      const dy = e.touches[0].clientY - e.touches[1].clientY;
                      calendarPinchRef.current = { distance: Math.hypot(dx, dy), zoom: calendarZoom };
                    }
                  }}
                  onTouchMove={e => {
                    if (e.touches.length === 2 && calendarPinchRef.current) {
                      e.preventDefault();
                      const dx = e.touches[0].clientX - e.touches[1].clientX;
                      const dy = e.touches[0].clientY - e.touches[1].clientY;
                      const distance = Math.hypot(dx, dy);
                      setCalendarZoom(Math.min(1.65, Math.max(0.55, calendarPinchRef.current.zoom * distance / calendarPinchRef.current.distance)));
                    }
                  }}
                  style={{ touchAction: 'pan-x pan-y' }}
                  onTouchEnd={e => { if (e.touches.length < 2) calendarPinchRef.current = null; }}
                >
                  <div style={{ zoom: calendarZoom }} className="min-w-[680px]">
                    
                    <div className="grid grid-cols-7 gap-2 text-center text-xs sticky top-0 bg-zinc-950/95 backdrop-blur-md z-20 py-2 border-b border-zinc-800 mb-2">
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                        <div key={d} className="font-black text-zinc-400 uppercase tracking-wider text-[11px]">
                          {d.slice(0, 3)}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: diaSemanaInicio }, (_, i) => (
                        <div key={`empty-${i}`} className="min-h-[115px] rounded-2xl bg-zinc-900/20 border border-zinc-900/40"></div>
                      ))}

                      {Array.from({ length: totalDiasMes }, (_, i) => {
                        const diaNum = i + 1;
                        const mesFormateado = String(mesSeleccionado.mes + 1).padStart(2, '0');
                        const diaFormateado = String(diaNum).padStart(2, '0');
                        const fechaStr = `${mesSeleccionado.anio}-${mesFormateado}-${diaFormateado}`;
                        const bolosDelDia = bolos
                  .filter(b => b.fecha === fechaStr)
                  .sort((a, b) => (a.horaInicio || '99:99').localeCompare(b.horaInicio || '99:99'));
                        const tieneConfirmado = bolosDelDia.some(b => b.estadoBolo !== 'presupuestado' && b.estadoBolo !== 'ensayo');
                        const tienePresupuestado = bolosDelDia.some(b => b.estadoBolo === 'presupuestado');
                        const tieneEnsayo = bolosDelDia.some(b => b.estadoBolo === 'ensayo');
                        const estaSeleccionadoHoy = bolosDelDia.some(b => b.id === boloSeleccionadoId);
                        const vacacionesDelDia = vacacionesVisibles.filter(v => v.fechaInicio <= fechaStr && v.fechaFin >= fechaStr);

                        return (
                          <div
                            key={diaNum}
                            onClick={() => {
                              if (bolosDelDia.length > 0) {
                                seleccionarBolo(bolosDelDia[0].id);
                              } else if (esGestorBolos) {
                                abrirModalParaFecha(fechaStr);
                              }
                            }}
                            className={`min-h-[115px] p-2.5 rounded-2xl border flex flex-col justify-between transition group relative cursor-pointer ${
                              tieneConfirmado 
                                ? 'bg-green-500/15 border-green-500/80 hover:bg-green-500/25' 
                                : tienePresupuestado
                                  ? 'bg-amber-500/15 border-amber-400/80 hover:bg-amber-500/25'
                                  : tieneEnsayo
                                    ? 'bg-cyan-500/15 border-cyan-400/80 hover:bg-cyan-500/25'
                                    : 'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700'
                            } ${estaSeleccionadoHoy ? 'ring-2 ring-white scale-[1.01] z-10' : ''}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`font-black text-base leading-none ${
                                tieneConfirmado ? 'text-green-300' : tienePresupuestado ? 'text-amber-300' : tieneEnsayo ? 'text-cyan-300' : 'text-zinc-400'
                              }`}>
                                {diaNum}
                              </span>
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={(e) => { e.stopPropagation(); abrirModalVacaciones(fechaStr); }} className="text-[10px] text-red-300 bg-red-500/15 hover:bg-red-500 hover:text-white rounded-lg px-1.5 py-0.5 transition font-black" title="Añadir vacaciones">V</button>
                              {esGestorBolos && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirModalParaFecha(fechaStr);
                                  }}
                                  className="text-[11px] text-green-400 bg-green-500/20 hover:bg-green-500 hover:text-black rounded-lg px-1.5 py-0.5 transition font-black"
                                  title="Añadir en este día"
                                >
                                  +
                                </button>
                              )}
                              </div>
                            </div>

                            <div className="space-y-1 mt-1">
                              {vacacionesDelDia.map(v => (
                                <div key={v.id} className="px-1.5 py-1 rounded-md bg-red-600 text-white shadow text-left min-w-0">
                                  <p className="text-[10px] font-black leading-tight break-words">Vacaciones</p>
                                  <p className="text-[9px] font-bold leading-tight mt-0.5 break-words">{v.nombre}</p>
                                  {(String(v.usuarioId) === String(usuarioActual?.id) || esAdmin) && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); eliminarVacaciones(v.id); }} className="text-[9px] underline font-bold mt-0.5">Eliminar</button>
                                  )}
                                </div>
                              ))}
                              {bolosDelDia.map(b => {
                                const esPres = b.estadoBolo === 'presupuestado';
                                const esEns = b.estadoBolo === 'ensayo';
                                return (
                                  <div
                                    key={b.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      seleccionarBolo(b.id);
                                    }}
                                    className={`px-1.5 py-1 rounded-md cursor-pointer shadow transition text-left min-w-0 ${
                                      esEns
                                        ? 'bg-cyan-400 text-black hover:bg-cyan-300'
                                        : esPres
                                          ? 'bg-amber-400 text-black hover:bg-amber-300'
                                          : 'bg-green-500 text-black hover:bg-green-400'
                                    }`}
                                  >
                                    {esEns ? (
                                      <>
                                        <p className="text-xs font-black leading-tight break-words">
                                          Ensayo
                                        </p>
                                        <p className="text-[10px] font-bold opacity-90 leading-tight mt-0.5 break-words">
                                          {b.lugar}
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-xs font-black leading-tight break-words">
                                          {b.lugar}
                                        </p>
                                      </>
                                    )}
                                    <p className="text-[9px] font-semibold mt-0.5 leading-tight tabular-nums">
                                      {b.horaInicio || 'Hora por definir'}{b.horaFin ? ` – ${b.horaFin}` : ''}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
              </div>

              {/* ESTADO DE COBRO DE LOS BOLOS */}
              <section className="bg-black/40 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-2xl text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                      ESTADO DE COBRO DE LOS BOLOS
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Consulta qué actuaciones están cobradas y cuáles siguen pendientes.</p>
                  </div>
                  <span className="text-xs text-zinc-500">{bolosConfirmados.length} bolos</span>
                </div>
                {bolosConfirmados.length > 0 ? (
                  <div className="divide-y divide-zinc-800">
                    {[...bolosConfirmados]
                      .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')))
                      .map(b => {
                        const cobrado = idsBolosCobrados.has(String(b.id));
                        return (
                          <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">{b.titulo || b.lugar}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{b.fecha || 'Fecha sin definir'}{Number(b.presupuesto) > 0 ? ` · ${Number(b.presupuesto).toFixed(2)} €` : ''}</p>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${cobrado ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}`}>
                              {cobrado ? 'Cobrado' : 'Pendiente de cobrar'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 py-3 text-center">Todavía no hay bolos confirmados.</p>
                )}
              </section>

              {/* CENTRO DE ORGANIZACIÓN DE LA ACTUACIÓN */}
              {boloActual && boloActual.estadoBolo !== 'ensayo' && (
                <section className="overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-[#0b1711] via-zinc-950 to-[#101713] shadow-[0_18px_55px_rgba(16,185,129,0.08)]">
                  {(() => {
                    const tareas = boloActual.tareasGestion || [];
                    const tareasCompletadas = tareas.filter(t => t.completada).length;
                    const disponibles = miembros.filter(m =>
                      m.disponibilidadBolos?.[boloActual.id]?.estado === 'puedo' &&
                      !(boloActual.desconvocados || []).map(String).includes(String(m.id))
                    ).length + (boloActual.musicosExtras || []).length;
                    const sinRespuesta = miembros.filter(m =>
                      !m.disponibilidadBolos?.[boloActual.id]?.estado &&
                      !(boloActual.desconvocados || []).map(String).includes(String(m.id))
                    ).length;
                    const plazasCoche = (boloActual.cochesAsignados || []).reduce((total, coche) =>
                      total + Math.max(0, (typeof coche.plazasTotales === 'number' ? coche.plazasTotales : 4) - (coche.pasajeros || []).length), 0);
                    const porcentajeTareas = tareas.length ? Math.round((tareasCompletadas / tareas.length) * 100) : 0;
                    const guardarTareas = async (nuevasTareas) => {
                      registrarSnapshot();
                      const nuevosBolos = bolos.map(b => String(b.id) === String(boloActual.id)
                        ? { ...b, tareasGestion: nuevasTareas }
                        : b
                      );
                      setBolos(nuevosBolos);
                      await guardarEnNube(null, nuevosBolos, null);
                    };
                    return (
                      <div className="space-y-5 p-4 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Centro de organización
                            </span>
                            <h3 className="mt-2 text-2xl text-white sm:text-3xl" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                              Preparación de la actuación
                            </h3>
                            <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">
                              Toda la información operativa de este bolo, reunida en un mismo sitio.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-right">
                            <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Preparación</p>
                            <p className="text-2xl font-black tabular-nums text-emerald-300">{porcentajeTareas}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-200/70">Músicos disponibles</p>
                            <p className="mt-1 text-2xl font-black text-white">{disponibles}</p>
                            <p className="text-[9px] text-zinc-500">{sinRespuesta} sin responder</p>
                          </div>
                          <div className="rounded-2xl border border-blue-400/15 bg-blue-400/5 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-200/70">Transporte</p>
                            <p className="mt-1 text-2xl font-black text-white">{(boloActual.cochesAsignados || []).length}</p>
                            <p className="text-[9px] text-zinc-500">{plazasCoche} plazas libres aprox.</p>
                          </div>
                          <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-200/70">Vestuario</p>
                            <p className="mt-2 truncate text-sm font-black text-white">{boloActual.vestuario || 'Por definir'}</p>
                            <p className="text-[9px] text-zinc-500">Indumentaria del bolo</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Tareas</p>
                            <p className="mt-1 text-2xl font-black text-white">{tareasCompletadas}<span className="text-sm text-zinc-500">/{tareas.length}</span></p>
                            <p className="text-[9px] text-zinc-500">Completadas</p>
                          </div>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-300 transition-all" style={{ width: `${porcentajeTareas}%` }} />
                        </div>

                        <div className="space-y-3 border-t border-white/10 pt-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-black text-white">Tareas de esta actuación</h4>
                              <p className="text-[10px] text-zinc-500">Reparte el trabajo y comprueba qué queda por hacer.</p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[9px] font-bold text-zinc-400">
                              {tareas.length - tareasCompletadas} pendientes
                            </span>
                          </div>

                          {esGestorBolos && (
                            <form
                              className="grid gap-2 rounded-2xl border border-emerald-400/15 bg-black/25 p-3 sm:grid-cols-2"
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const texto = nuevaTareaBolo.trim();
                                if (!texto) return;
                                const responsable = miembros.find(m => String(m.id) === String(responsableTareaBolo));
                                const nueva = {
                                  id: `tarea-${Date.now()}`,
                                  texto,
                                  responsableId: responsable?.id || '',
                                  responsableNombre: responsable?.nombre || '',
                                  completada: false,
                                  creadaPor: usuarioActual.nombre,
                                  creadaEn: new Date().toISOString()
                                };
                                await guardarTareas([...tareas, nueva]);
                                if (responsable?.id) {
                                  await notificarTareaAsignada({
                                    miembroId: responsable.id,
                                    tarea: texto,
                                    bolo: boloActual
                                  });
                                }
                                setNuevaTareaBolo('');
                                setResponsableTareaBolo('');
                              }}
                            >
                              <input
                                value={nuevaTareaBolo}
                                onChange={e => setNuevaTareaBolo(e.target.value)}
                                placeholder="Ej. Confirmar hora con el ayuntamiento"
                                aria-label="Nueva tarea"
                                className="min-h-11 min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400 sm:col-span-2"
                                maxLength={120}
                                required
                              />
                              <select
                                value={responsableTareaBolo}
                                onChange={e => setResponsableTareaBolo(e.target.value)}
                                aria-label="Responsable de la tarea"
                                className="min-h-11 min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-xs text-white outline-none focus:border-emerald-400"
                              >
                                <option value="">Sin responsable asignado</option>
                                {miembros.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                              </select>
                              <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-4 text-xs font-black text-black transition hover:bg-emerald-300">
                                <Plus className="h-4 w-4" /> Añadir tarea
                              </button>
                            </form>
                          )}

                          {tareas.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-zinc-700 bg-black/20 px-4 py-5 text-center">
                              <p className="text-xs font-bold text-zinc-300">Todavía no hay tareas para este bolo.</p>
                              <p className="mt-1 text-[10px] text-zinc-500">{esGestorBolos ? 'Añade la primera tarea para empezar a organizarlo.' : 'Cuando administración añada tareas, aparecerán aquí.'}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {tareas.map(tarea => (
                                <div key={tarea.id} className={`flex items-start gap-3 rounded-2xl border p-3 transition ${tarea.completada ? 'border-emerald-500/15 bg-emerald-500/[0.04]' : 'border-white/10 bg-black/25'}`}>
                                  <button
                                    type="button"
                                    disabled={!esGestorBolos}
                                    onClick={() => guardarTareas(tareas.map(t => t.id === tarea.id ? {
                                      ...t,
                                      completada: !t.completada,
                                      completadaPor: !t.completada ? usuarioActual.nombre : '',
                                      completadaEn: !t.completada ? new Date().toISOString() : ''
                                    } : t))}
                                    aria-label={tarea.completada ? 'Marcar tarea como pendiente' : 'Marcar tarea como completada'}
                                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${tarea.completada ? 'border-emerald-400 bg-emerald-400 text-black' : 'border-zinc-600 text-transparent'} ${esGestorBolos ? 'cursor-pointer hover:border-emerald-400' : 'cursor-default'}`}
                                  >
                                    {tarea.completada ? '✓' : ''}
                                  </button>
                                  <div className="min-w-0 flex-1">
                                    <p className={`break-words text-xs font-bold ${tarea.completada ? 'text-zinc-500 line-through' : 'text-white'}`}>{tarea.texto}</p>
                                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-zinc-500">
                                      {tarea.responsableNombre && <span>Responsable: <strong className="text-zinc-300">{tarea.responsableNombre}</strong></span>}
                                      {tarea.completada && tarea.completadaPor && <span>Completada por {tarea.completadaPor}</span>}
                                    </div>
                                  </div>
                                  {esGestorBolos && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`¿Eliminar la tarea "${tarea.texto}"?`)) guardarTareas(tareas.filter(t => t.id !== tarea.id));
                                      }}
                                      aria-label="Eliminar tarea"
                                      className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-rose-500/10 hover:text-rose-400"
                                    >×</button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </section>
              )}

              {/* DETALLES DEL EVENTO SELECCIONADO */}
              {boloActual ? (
                (() => {
                  const esEnsayoActual = boloActual.estadoBolo === 'ensayo';

                  if (boloActual.estadoBolo === 'presupuestado') {
                    return (
                      <div className="bg-amber-500/10 border border-amber-400/50 rounded-2xl p-5 sm:p-6 space-y-4">
                        <div className="flex justify-between items-start flex-wrap gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase bg-amber-400 text-black px-2.5 py-1 rounded-full">
                              ⏳ Bolo Presupuestado (Pendiente de confirmación)
                            </span>
                            <h3 className="text-4xl tracking-wide text-white mt-2" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                              📍 {boloActual.lugar}
                            </h3>
                            {boloActual.titulo && (
                              <p className="text-sm font-bold text-amber-300 mt-0.5">
                                {boloActual.titulo}
                              </p>
                            )}
                            <p className="text-xs text-zinc-300 mt-2">
                              📅 Fecha: <strong>{boloActual.fecha}</strong> • ⏰ Horario previsto: <strong>{boloActual.horaInicio || 'Por definir'} a {boloActual.horaFin || 'Por definir'}</strong>
                            </p>
                            {esGestorBolos && (
                              <p className="text-xs text-amber-200 font-bold mt-1">
                                💰 Presupuesto: {boloActual.presupuesto ? `${boloActual.presupuesto} €` : 'No indicado'} • {boloActual.conFactura ? 'Con Factura' : 'Sin Factura'}
                              </p>
                            )}
                          </div>

                          {esGestorBolos && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => abrirModalConfirmarPresupuesto(boloActual)}
                                className="flex-1 sm:flex-none justify-center bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                              >
                                <Check className="w-4 h-4"/> ✓ {boloActual.presupuestacionConfirmada ? 'Confirmar Bolo' : 'Confirmar Presupuestación'}
                              </button>
                              <button
                                onClick={() => rechazarBoloPresupuestado(boloActual.id, boloActual.lugar)}
                                className="flex-1 sm:flex-none justify-center bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-black border border-rose-500/40 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <XCircle className="w-4 h-4"/> ✕ Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 border-t border-amber-500/20 pt-3">
                          Este bolo aún está pendiente de aceptación. Ya puedes indicar tu disponibilidad; tu respuesta se conservará si el bolo se confirma. Cuando pase a verde, se habilitarán también la gestión de coches y el vestuario.
                        </p>
                      </div>
                    );
                  }

                  const miDispo = usuarioActual.disponibilidadBolos?.[boloActual.id];

                  if (!miDispo && !esAdmin && boloDisponibilidadAbiertoId !== boloActual.id) {
                    return (
                      <div className={`bg-black/90 border rounded-2xl p-5 sm:p-6 text-center space-y-4 ${
                        esEnsayoActual ? 'border-cyan-400/50' : 'border-amber-500/50'
                      }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                          esEnsayoActual ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {esEnsayoActual ? <Music className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${esEnsayoActual ? 'text-cyan-400' : 'text-amber-400'}`}>
                            {esEnsayoActual ? 'Confirmación de asistencia al Ensayo' : 'Confirmación de asistencia'}
                          </p>
                          <h3 className="text-3xl tracking-wide text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                            {esEnsayoActual ? `Ensayo — ${boloActual.lugar}` : boloActual.lugar}
                          </h3>
                          {!esEnsayoActual && boloActual.titulo && (
                            <p className="text-xs text-green-300 font-bold mt-0.5">
                              {boloActual.titulo}
                            </p>
                          )}
                          <p className="text-xs text-zinc-400 mt-1">
                            ⏰ Hora: {boloActual.horaInicio || '19:00h'}{!esEnsayoActual && boloActual.horaFin ? ` a ${boloActual.horaFin}` : ''}
                          </p>
                          {esEnsayoActual && boloActual.repertorio && (
                            <p className="text-xs text-cyan-300 font-bold mt-1">
                              🎼 Repertorio: {boloActual.repertorio}
                            </p>
                          )}
                        </div>
                        
                        {usuarioActual.instrumentos?.length > 1 && (
                          <div className="max-w-xs mx-auto text-left">
                            <label className="text-xs text-zinc-400 block mb-1 font-bold">¿Con qué instrumento tocarás?</label>
                            <select
                              value={instrumentoElegidoBolo || usuarioActual.instrumentos[0]}
                              onChange={e => setInstrumentoElegidoBolo(e.target.value)}
                              className="w-full bg-black border border-green-500 text-green-300 rounded-xl p-2.5 text-xs font-bold"
                            >
                              {usuarioActual.instrumentos.map(inst => (
                                <option key={inst} value={inst}>{inst}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex justify-center gap-2 sm:gap-3 pt-2">
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'puedo', instrumentoElegidoBolo || usuarioActual.instrumentos[0])} className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs cursor-pointer transition">🟢 Puedo</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'tal_vez')} className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs cursor-pointer transition">🟡 Tal vez</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'no')} className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-xl text-xs cursor-pointer transition">🔴 No puedo</button>
                        </div>
                      </div>
                    );
                  }

                  const idsDesconvocados = (boloActual.desconvocados || []).map(String);
                  const bajasUrgencia = boloActual.bajasUrgencia || [];
                  const idsBajaUrgencia = bajasUrgencia.map(b => String(b.miembroId));
                  const dispoPuedo = miembros.filter(m =>
                    m.disponibilidadBolos?.[boloActual.id]?.estado === 'puedo' &&
                    !idsDesconvocados.includes(String(m.id)) &&
                    !idsBajaUrgencia.includes(String(m.id))
                  );
                  const listaDesconvocados = miembros.filter(m =>
                    idsDesconvocados.includes(String(m.id)) &&
                    (esAdmin || (esJefeCuerda && m.cuerda === usuarioActual.cuerda))
                  );
                  const dispoTalVez = miembros.filter(m =>
                    m.disponibilidadBolos?.[boloActual.id]?.estado === 'tal_vez' &&
                    !idsDesconvocados.includes(String(m.id)) &&
                    !idsBajaUrgencia.includes(String(m.id))
                  );
                  const dispoNo = miembros.filter(m =>
                    m.disponibilidadBolos?.[boloActual.id]?.estado === 'no' &&
                    !idsDesconvocados.includes(String(m.id)) &&
                    !idsBajaUrgencia.includes(String(m.id))
                  );
                  const musicosExtras = boloActual.musicosExtras || [];
                  const vestuarioActual = OPCIONES_VESTUARIO.find(v => v.id === boloActual.vestuario) || OPCIONES_VESTUARIO[0];

                  return (
                    <div className="space-y-6 pt-4 border-t border-zinc-800">
                      
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {esEnsayoActual && (
                              <span className="text-[10px] font-black uppercase bg-cyan-400 text-black px-2.5 py-1 rounded-full">
                                🎵 Ensayo Oficial
                              </span>
                            )}
                            {miDispo ? (
                              <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full uppercase">
                                Tu estado: <strong className="uppercase">{miDispo.estado.replace('_', ' ')}</strong> {miDispo.instrumento && `(${miDispo.instrumento})`}
                              </span>
                            ) : <span className="text-xs font-bold text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full uppercase">Vista de administración</span>}
                          </div>

                          <h3 className="text-4xl tracking-wide text-white mt-2" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                            {esEnsayoActual ? `Ensayo — 📍 ${boloActual.lugar}` : boloActual.lugar}
                          </h3>
                          {!esEnsayoActual && boloActual.titulo && (
                            <p className="text-sm font-black text-green-400 tracking-wide mt-0.5">
                              {boloActual.titulo}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 mt-2">
                            <span>📅 <strong>{boloActual.fecha}</strong></span>
                            <span>⏰ Hora: <strong>{boloActual.horaInicio || '13:00h'}{!esEnsayoActual && boloActual.horaFin ? ` - ${boloActual.horaFin}` : ''}</strong></span>
                            {!esEnsayoActual && esGestorBolos && (
                              <span className="text-[11px] font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                                💰 {boloActual.presupuesto ? `${boloActual.presupuesto} €` : 'Sin presupuesto'} • {boloActual.conFactura ? 'Factura Sí' : 'Sin factura'}
                              </span>
                            )}
                          </div>

                          {esEnsayoActual && (
                            <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-200">
                              🎼 <strong>Repertorio del ensayo:</strong> {boloActual.repertorio ? boloActual.repertorio : 'General / Sin especificar'}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {esEnsayoActual && esGestorBolos && (
                            <>
                              <button
                                onClick={() => abrirModalEditarEnsayo(boloActual)}
                                className="text-xs bg-cyan-500/20 hover:bg-cyan-400 text-cyan-300 hover:text-black border border-cyan-500/40 font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5"/> Editar Ensayo
                              </button>
                              <button
                                onClick={() => eliminarEnsayo(boloActual.id, boloActual.lugar, boloActual.fecha)}
                                className="text-xs bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-black border border-rose-500/40 font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5"/> Quitar Ensayo
                              </button>
                            </>
                          )}
                          {miDispo && !esAdmin && !esPerfilExtra && (
                            <button
                              onClick={() => {
                                setInstrumentoElegidoBolo(miDispo.instrumento || usuarioActual.instrumentos?.[0] || '');
                                setBoloDisponibilidadAbiertoId(boloActual.id);
                              }}
                              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl transition"
                            >
                              🔄 Cambiar asistencia
                            </button>
                          )}

                        </div>
                      </div>

                      {!esEnsayoActual && puedeGestionarExtras && (
                        <div className="bg-gradient-to-r from-amber-500/10 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                          <div>
                            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <UserPlus className="w-4 h-4"/> Refuerzos y Músicos Extras
                            </h4>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {esAdmin 
                                ? 'Puedes añadir músicos extras de cualquier instrumento para reforzar este bolo.' 
                                : usuarioActual.nombre?.trim().toLocaleLowerCase('es') === 'edgar'
                                  ? 'Puedes añadir extras de tu cuerda, Saxos o Tuba.'
                                  : `Puedes añadir músicos extras de refuerzo para tu cuerda (${usuarioActual.cuerda}).`}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setExtraCatalogoSeleccionadoId(instrumentosParaExtra[0]?.id || '');
                              setShowModalExtra(true);
                            }}
                            className="w-full sm:w-auto justify-center bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 shrink-0 transition"
                          >
                            <Plus className="w-4 h-4"/> + Añadir Músico Extra
                          </button>
                        </div>
                      )}

                      {!esEnsayoActual && (
                        <>
                          {/* CARAVANA DE COCHES Y RUTAS CON HUECOS LIBRES Y BOTÓN DE UNIRSE */}
                          <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <div>
                                <h4 className="font-bold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                  <Car className="w-4 h-4 text-blue-400"/> Caravana de Coches y Plazas Libres
                                </h4>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                  Únete al coche de cualquier conductor que tenga plazas libres.
                                </p>
                              </div>
                              {esConductor && (
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() => {
                                      setExtraAsignadoTrayectoId('');
                                      setPlazasTrayecto('4');
                                      setShowModalTrayectoBolo(true);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-400 text-black font-black text-[11px] px-3 py-2 rounded-xl shadow cursor-pointer"
                                  >
                                    + Añadir mi Coche y Plazas
                                  </button>
                                  {musicosExtras.length > 0 && (
                                    <button
                                      onClick={() => {
                                        setExtraAsignadoTrayectoId(String(musicosExtras[0].id));
                                        setPlazasTrayecto('4');
                                        setShowModalTrayectoBolo(true);
                                      }}
                                      className="bg-amber-400 hover:bg-amber-300 text-black font-black text-[11px] px-3 py-2 rounded-xl shadow cursor-pointer"
                                    >
                                      + Añadir ruta para un extra
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              {boloActual.cochesAsignados && boloActual.cochesAsignados.length > 0 ? (
                                boloActual.cochesAsignados.map(car => {
                                  const pasajeros = car.pasajeros || [];
                                  const plazasTotales = typeof car.plazasTotales === 'number' ? car.plazasTotales : 4;
                                  const huecosLibres = Math.max(0, plazasTotales - pasajeros.length);
                                  const soyConductorDeEsteCoche = car.conductor?.trim().toLowerCase() === usuarioActual.nombre?.trim().toLowerCase();
                                  const soyCreadorDeEstaRuta = car.creadoPorId === usuarioActual.id ||
                                    car.creadoPor?.trim().toLowerCase() === usuarioActual.nombre?.trim().toLowerCase();
                                  const puedoGestionarEsteCoche = esGestorBolos || soyConductorDeEsteCoche || soyCreadorDeEstaRuta;
                                  const estoyUnidoAEsteCoche = pasajeros.some(
                                    p => p.trim().toLocaleLowerCase('es') === usuarioActual.nombre?.trim().toLocaleLowerCase('es')
                                  );
                                  const puntoRecogidaSeleccionado = puntosRecogidaSeleccionados[car.id] || car.origen || '';
                                  const claveMiembro = usuarioActual.nombre?.trim().toLocaleLowerCase('es');
                                  const miPuntoRecogida = car.recogidasPasajeros?.[claveMiembro];

                                  return (
                                    <div key={car.id} className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3 text-xs">
                                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-blue-400 text-sm">🚗 {car.conductor}</span>
                                            {car.extraId && (
                                              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                                                Ruta de extra
                                              </span>
                                            )}
                                            <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                                              {car.vehiculo}
                                            </span>
                                            {/* Indicador de huecos libres */}
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                              huecosLibres > 0
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                            }`}>
                                              {huecosLibres > 0 
                                                ? `${huecosLibres} ${huecosLibres === 1 ? 'hueco libre' : 'huecos libres'} (de ${plazasTotales})` 
                                                : 'Completo (0 huecos)'}
                                            </span>
                                          </div>

                                          <div className="text-zinc-300 text-[11px] space-y-0.5 pt-1">
                                            <p>🚩 Salida: <strong className="text-white">{car.origen}</strong> {car.horaSalida && <span className="text-blue-300 font-semibold">({car.horaSalida})</span>}</p>
                                            {car.paradas && car.paradas.length > 0 && (
                                              <div className="pl-3 border-l border-zinc-700 space-y-0.5 my-1">
                                                {car.paradas.map((p, pIdx) => (
                                                  <p key={pIdx} className="text-zinc-400">
                                                    ↳ Parada: <strong className="text-zinc-200">{p.lugar}</strong> {p.hora && <span className="text-amber-300 font-semibold">({p.hora})</span>}
                                                  </p>
                                                ))}
                                              </div>
                                            )}
                                            <p>🏁 Llegada: <strong className="text-white">{car.destino}</strong> {car.horaLlegada && <span className="text-emerald-300 font-semibold">({car.horaLlegada})</span>}</p>
                                            {car.creadoPor && <p className="text-zinc-500">Ruta publicada por {car.creadoPor}</p>}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                          {puedoGestionarEsteCoche && (
                                            <button
                                              onClick={async () => {
                                                registrarSnapshot();
                                                const nuevosBolos = bolos.map(b => b.id === boloActual.id ? { ...b, cochesAsignados: b.cochesAsignados.filter(x => x.id !== car.id) } : b);
                                                setBolos(nuevosBolos);
                                                await guardarEnNube(null, nuevosBolos, null);
                                              }}
                                              className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-500/10 rounded-xl"
                                              title="Eliminar coche"
                                            >
                                              <Trash2 className="w-4 h-4"/>
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {!soyConductorDeEsteCoche && (!soyCreadorDeEstaRuta || car.extraId) && (
                                        <div className="w-full space-y-2">
                                          {estoyUnidoAEsteCoche && miPuntoRecogida ? (
                                            <p className="text-[11px] text-zinc-300">
                                              Te recogemos en: <strong className="text-emerald-300">{miPuntoRecogida}</strong>
                                            </p>
                                          ) : !estoyUnidoAEsteCoche && huecosLibres > 0 && (car.paradas || []).length > 0 ? (
                                            <label className="block text-[11px] font-bold text-zinc-300">
                                              ¿Dónde te sumas a la ruta?
                                              <select
                                                value={puntoRecogidaSeleccionado}
                                                onChange={e => setPuntosRecogidaSeleccionados(prev => ({
                                                  ...prev,
                                                  [car.id]: e.target.value
                                                }))}
                                                className="mt-1.5 min-h-11 w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                                              >
                                                <option value={car.origen}>{`Salida: ${car.origen}`}</option>
                                                {(car.paradas || []).map((parada, index) => (
                                                  <option key={`${car.id}-${index}`} value={parada.lugar}>
                                                    {`Parada: ${parada.lugar}${parada.hora ? ` · ${parada.hora}` : ''}`}
                                                  </option>
                                                ))}
                                              </select>
                                            </label>
                                          ) : null}

                                          {estoyUnidoAEsteCoche ? (
                                            <button
                                              type="button"
                                              onClick={() => toggleUnirseRutaCoche(boloActual.id, car.id)}
                                              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/20 px-4 py-3 text-sm font-black text-rose-200 transition hover:bg-rose-500 hover:text-black touch-manipulation"
                                            >
                                              <LogOut className="h-4 w-4"/> Salir del coche
                                            </button>
                                          ) : huecosLibres > 0 ? (
                                            <button
                                              type="button"
                                              onClick={() => toggleUnirseRutaCoche(boloActual.id, car.id, puntoRecogidaSeleccionado)}
                                              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-black shadow transition hover:bg-emerald-400 touch-manipulation"
                                            >
                                              <UserCheck className="h-4 w-4"/> Unirse a esta ruta
                                            </button>
                                          ) : (
                                            <p className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-center text-xs font-bold text-zinc-500">
                                              Esta ruta ya no tiene plazas libres
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      {/* Listado de personas que se han unido a la ruta de este conductor */}
                                      <div className="pt-2.5 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                                        <span className="text-[11px] font-bold text-zinc-400">
                                          👥 Pasajeros unidos ({pasajeros.length}/{plazasTotales}):
                                        </span>
                                        {pasajeros.length === 0 ? (
                                          <span className="text-[11px] text-zinc-500 italic">Nadie se ha unido aún</span>
                                        ) : (
                                          pasajeros.map((nombrePas, idxP) => (
                                            <span
                                              key={idxP}
                                              className="bg-blue-500/20 border border-blue-500/40 text-blue-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5"
                                            >
                                              {nombrePas}
                                              {car.recogidasPasajeros?.[nombrePas.trim().toLocaleLowerCase('es')] && (
                                                <span className="font-normal text-blue-100/70">
                                                  · {car.recogidasPasajeros[nombrePas.trim().toLocaleLowerCase('es')]}
                                                </span>
                                              )}
                                              {puedoGestionarEsteCoche && (
                                                <button
                                                  type="button"
                                                  onClick={() => quitarPasajeroDeCoche(boloActual.id, car.id, nombrePas)}
                                                  className="text-rose-400 hover:text-rose-200 font-black ml-0.5"
                                                  title={`Quitar a ${nombrePas} del coche`}
                                                >
                                                  ✕
                                                </button>
                                              )}
                                            </span>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-xs text-zinc-500">Ningún conductor ha publicado trayecto para este bolo todavía.</p>
                              )}
                            </div>
                          </div>

                          {/* VESTUARIO OFICIAL */}
                          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2.5 bg-green-500/20 text-green-400 rounded-xl">
                                <Shirt className="w-5 h-5"/>
                              </div>
                              <div>
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Vestuario Oficial</span>
                                <span className="text-sm font-black text-white">{vestuarioActual.label}</span>
                              </div>
                            </div>

                            {esGestorBolos ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">Elegir ropa:</span>
                                {OPCIONES_VESTUARIO.map(opt => {
                                  const seleccionado = (boloActual.vestuario || 'Por definir') === opt.id;
                                  return (
                                    <button
                                      key={opt.id}
                                      onClick={() => cambiarVestuarioBolo(boloActual.id, opt.id)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                        seleccionado 
                                          ? opt.color + ' ring-2 ring-green-500' 
                                          : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
                                      }`}
                                    >
                                      {opt.label} {seleccionado && '✓'}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border w-fit ${vestuarioActual.color}`}>
                                {vestuarioActual.label}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {bajasUrgencia.length > 0 && (
                        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
                          <h4 className="font-bold text-rose-300 text-xs uppercase tracking-wider mb-2">
                            🚨 Bajas por urgencia ({bajasUrgencia.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {bajasUrgencia.map(baja => (
                              <span key={String(baja.miembroId)} className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-200">
                                {baja.nombre} · {baja.cuerda}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PARTICIPANTES: CONFIRMADOS */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                              🟢 Confirmados ({dispoPuedo.length + musicosExtras.length})
                            </h4>
                            {esJefeCuerda && !esAdmin && (
                              <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                                Puedes gestionar la cuerda de: <strong className="text-emerald-400">{usuarioActual.cuerda}</strong>
                              </span>
                            )}
                          </div>

                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {dispoPuedo.map(m => {
                              const conf = CONFIG_CUERDAS[m.cuerda] || CONFIG_CUERDAS['Saxos'];
                              const dispM = m.disponibilidadBolos?.[boloActual.id];
                              const puedeGestionarEste = puedeEliminarAsistencia(m.cuerda);

                              return (
                                <div key={m.id} className={`p-3 rounded-2xl border ${conf.bg} ${conf.border}`}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded" style={{ backgroundColor: conf.dot + '22', color: conf.dot }}>
                                        {m.cuerda}
                                      </span>
                                      <p className="font-bold text-sm text-zinc-100 mt-0.5">{m.nombre}</p>
                                      <p className="text-xs text-emerald-300 font-bold">Toca: {dispM?.instrumento || m.instrumentos[0]}</p>
                                      {String(m.id) === String(usuarioActual.id) && boloActual.estadoBolo === 'confirmado' && !esPerfilExtra && !idsBajaUrgencia.includes(String(usuarioActual.id)) && (
                                        <button
                                          onClick={() => registrarBajaUrgencia(boloActual.id)}
                                          className="mt-2 inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 border border-rose-300/70 text-white font-black text-[11px] px-3.5 py-2 rounded-xl shadow-[0_4px_16px_rgba(225,29,72,0.3)] transition"
                                        >
                                          No disponibilidad
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {puedeDesconvocarMiembro(m.cuerda) && (
                                        <button
                                          onClick={() => actualizarDesconvocatoria(m.id, m.cuerda, m.nombre, true)}
                                          className="text-amber-300 hover:bg-amber-500/20 p-1.5 rounded-xl transition text-[10px] font-black"
                                          title={`Desconvocar a ${m.nombre}`}
                                        >
                                          Desconvocar
                                        </button>
                                      )}
                                      {puedeGestionarEste && (
                                        <button
                                          onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)}
                                          className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-xl transition"
                                          title={`Borrar respuesta de ${m.nombre}`}
                                        >
                                          <Trash2 className="w-4 h-4"/>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {renderDetallePago(m, 'miembro')}
                                </div>
                              );
                            })}

                            {musicosExtras.map(ex => {
                              const conf = CONFIG_CUERDAS[ex.cuerda] || CONFIG_CUERDAS['Saxos'];
                              const puedeGestionarEste = puedeEliminarAsistencia(ex.cuerda);

                              return (
                                <div key={ex.id} className={`p-3 rounded-2xl border ${conf.bg} border-amber-500/50 shadow-sm relative overflow-hidden`}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded" style={{ backgroundColor: conf.dot + '22', color: conf.dot }}>
                                          {ex.cuerda}
                                        </span>
                                        <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
                                          Refuerzo
                                        </span>
                                      </div>
                                      <p className="font-bold text-sm text-zinc-100 mt-0.5">{ex.nombre}</p>
                                      <p className="text-xs text-emerald-300 font-bold">Toca: {ex.instrumento}</p>
                                      <p className="text-[10px] text-zinc-400 font-medium">De: {ex.charanga}</p>
                                    </div>
                                    {puedeGestionarEste && (
                                      <button 
                                        onClick={() => eliminarMusicoExtra(ex.id, ex.cuerda, ex.nombre)} 
                                        className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-xl transition"
                                        title={`Retirar a ${ex.nombre} (${ex.charanga})`}
                                      >
                                        <Trash2 className="w-4 h-4"/>
                                      </button>
                                    )}
                                  </div>
                                  {renderDetallePago(ex, 'extra')}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {dispoTalVez.length > 0 && (
                          <div>
                            <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">🟡 Tal vez ({dispoTalVez.length})</h4>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {dispoTalVez.map(m => {
                                const puedeGestionarEste = puedeEliminarAsistencia(m.cuerda);
                                return (
                                  <div key={m.id} className="p-3 rounded-2xl border bg-amber-500/10 border-amber-500/30 flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-amber-300">{m.cuerda}</span>
                                      <p className="font-bold text-sm text-zinc-100">{m.nombre}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {puedeDesconvocarMiembro(m.cuerda) && (
                                        <button onClick={() => actualizarDesconvocatoria(m.id, m.cuerda, m.nombre, true)} className="text-amber-300 text-[10px] font-black px-1.5 py-1 rounded-lg hover:bg-amber-500/20">
                                          Desconvocar
                                        </button>
                                      )}
                                      {puedeGestionarEste && (
                                        <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)} className="text-rose-400 p-1.5" title="Borrar respuesta">
                                          <Trash2 className="w-4 h-4"/>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {dispoNo.length > 0 && (
                          <div>
                            <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider mb-2">🔴 No pueden ({dispoNo.length})</h4>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {dispoNo.map(m => {
                                const puedeGestionarEste = puedeEliminarAsistencia(m.cuerda);
                                return (
                                  <div key={m.id} className="p-3 rounded-2xl border bg-rose-500/10 border-rose-500/30 flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-rose-300">{m.cuerda}</span>
                                      <p className="font-bold text-sm text-rose-200 line-through decoration-rose-400/70 decoration-1">{m.nombre}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {puedeDesconvocarMiembro(m.cuerda) && (
                                        <button onClick={() => actualizarDesconvocatoria(m.id, m.cuerda, m.nombre, true)} className="text-amber-300 text-[10px] font-black px-1.5 py-1 rounded-lg hover:bg-amber-500/20">
                                          Desconvocar
                                        </button>
                                      )}
                                      {puedeGestionarEste && (
                                        <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)} className="text-rose-400 p-1.5" title="Borrar respuesta">
                                          <Trash2 className="w-4 h-4"/>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {(esAdmin || esJefeCuerda) && listaDesconvocados.length > 0 && (
                          <div className="pt-3 border-t border-amber-500/20">
                            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-2">
                              🟠 Desconvocados ({listaDesconvocados.length})
                            </h4>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {listaDesconvocados
                                .filter(m => esAdmin || (esJefeCuerda && m.cuerda === usuarioActual.cuerda))
                                .map(m => (
                                  <div key={m.id} className="p-3 rounded-2xl border bg-amber-500/10 border-amber-500/30 flex items-center justify-between gap-2">
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-amber-300">{m.cuerda}</span>
                                      <p className="font-bold text-sm text-zinc-100">{m.nombre}</p>
                                      <p className="text-[10px] text-zinc-400">
                                        Disponibilidad original: {m.disponibilidadBolos?.[boloActual.id]?.estado === 'puedo'
                                          ? 'Puedo'
                                          : m.disponibilidadBolos?.[boloActual.id]?.estado === 'tal_vez'
                                            ? 'Tal vez'
                                            : m.disponibilidadBolos?.[boloActual.id]?.estado === 'no'
                                              ? 'No puedo'
                                              : 'Sin respuesta'}
                                      </p>
                                    </div>
                                    {puedeDesconvocarMiembro(m.cuerda) && (
                                      <button
                                        onClick={() => actualizarDesconvocatoria(m.id, m.cuerda, m.nombre, false)}
                                        className="text-emerald-300 hover:bg-emerald-500/20 p-2 rounded-xl text-[10px] font-black"
                                        title={`Volver a convocar a ${m.nombre}`}
                                      >
                                        Reactivar
                                      </button>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })()
              ) : (
                <p className="text-xs text-zinc-500 text-center py-6">Pincha en cualquier bolo o ensayo dentro del calendario scrolleable para abrir su ficha completa.</p>
              )}

            </div>
          </div>
        )}

        {/* MODAL PARA EDITAR BOLOS O ENSAYOS */}
        {showModalEditarBolos && esGestorBolos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="w-5 h-5 text-amber-400"/>
                <h3 className="text-lg font-black text-white">
                  {boloEditandoId ? 'Modificar Datos' : 'Selecciona un Evento para Editar'}
                </h3>
              </div>

              {!boloEditandoId ? (
                <>
                  <p className="text-xs text-zinc-400 mb-4">Elige qué bolo o ensayo quieres modificar:</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                    {bolos.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-4">No hay eventos creados actualmente.</p>
                    ) : (
                      bolos.map(b => (
                        <div key={b.id} className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-black text-white text-base" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                              📍 {b.lugar}{' '}
                              {b.estadoBolo === 'presupuestado' && <span className="text-amber-400 text-[10px] font-sans">(Presupuesto)</span>}
                              {b.estadoBolo === 'ensayo' && <span className="text-cyan-400 text-[10px] font-sans">(Ensayo)</span>}
                            </p>
                            <p className="text-green-300 text-[11px]">{b.estadoBolo === 'ensayo' ? 'Ensayo' : b.titulo}</p>
                            <p className="text-zinc-500 text-[10px] mt-0.5">📅 {b.fecha} • ⏰ {b.horaInicio || '--'}</p>
                          </div>
                          <button
                            onClick={() => seleccionarBoloParaEditar(b)}
                            className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold px-3 py-1.5 rounded-xl transition text-xs flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5"/> Editar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModalEditarBolos(false)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-xl text-sm"
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                (() => {
                  const objetoEditando = bolos.find(x => x.id === boloEditandoId);
                  const esEns = objetoEditando?.estadoBolo === 'ensayo';

                  return (
                    <form onSubmit={guardarEdicionBolo} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-amber-400 block mb-1">Lugar:</label>
                        <input
                          type="text"
                          value={editLugarBolo}
                          onChange={e => setEditLugarBolo(e.target.value)}
                          className="w-full bg-black border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-amber-400"
                          required
                        />
                      </div>

                      {!esEns ? (
                        <div>
                          <label className="text-[11px] font-bold text-zinc-400 block mb-1">Tipo de Bolo / Descripción:</label>
                          <input
                            type="text"
                            value={editTituloBolo}
                            onChange={e => setEditTituloBolo(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-[11px] font-bold text-cyan-400 block mb-1">Repertorio (Opcional):</label>
                          <input
                            type="text"
                            value={editRepertorioBolo}
                            onChange={e => setEditRepertorioBolo(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">Fecha:</label>
                        <input
                          type="date"
                          value={editFechaBolo}
                          onChange={e => setEditFechaBolo(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800">
                        <div>
                          <label className="text-[11px] font-bold text-green-400 block mb-1">Hora Inicio:</label>
                          <input
                            type="text"
                            placeholder="Ej: 13:00h"
                            value={editHoraInicioBolo}
                            onChange={e => setEditHoraInicioBolo(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        {!esEns && (
                          <div>
                            <label className="text-[11px] font-bold text-green-400 block mb-1">Hora Fin:</label>
                            <input
                              type="text"
                              placeholder="Ej: 17:00h"
                              value={editHoraFinBolo}
                              onChange={e => setEditHoraFinBolo(e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                        )}
                      </div>

                      {!esEns && (
                        <div className="pt-2 border-t border-zinc-800 space-y-2">
                          <div>
                            <label className="text-[11px] font-bold text-amber-400 block mb-1">Presupuesto acordado (€):</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editPresupuestoBolo}
                              onChange={e => setEditPresupuestoBolo(e.target.value)}
                              className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="editFacturaCheck"
                              checked={editConFacturaBolo}
                              onChange={e => setEditConFacturaBolo(e.target.checked)}
                              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                            <label htmlFor="editFacturaCheck" className="text-xs text-zinc-300 font-bold cursor-pointer flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-zinc-400"/> Se cobra con Factura oficial
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-3">
                        <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-sm">
                          Guardar Cambios
                        </button>
                        <button
                          type="button"
                          onClick={() => setBoloEditandoId(null)}
                          className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold"
                        >
                          Volver
                        </button>
                      </div>
                    </form>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {/* MODAL PARA AÑADIR MÚSICO EXTRA */}
        {showModalExtra && boloActual && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-5 h-5 text-amber-400"/>
                <h3 className="text-lg font-black text-white">Añadir Músico Extra (Refuerzo)</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                {esAdmin
                  ? <>Elige un músico extra para el bolo en <strong>{boloActual.lugar}</strong>.</>
                  : <>Elige un músico de tu cuerda para el bolo en <strong>{boloActual.lugar}</strong>.</>}
              </p>

              <form onSubmit={agregarMusicoExtra} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Músico extra (ordenado por charanga):</label>
                  <select
                    value={extraCatalogoSeleccionadoId}
                    onChange={e => setExtraCatalogoSeleccionadoId(e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-white rounded-xl p-2.5 text-xs font-bold outline-none focus:border-amber-400"
                    required
                  >
                    <option value="" disabled>Selecciona un músico</option>
                    {ORDEN_CUERDAS_EXTRAS.map(cuerda => {
                      const extrasDeCuerda = instrumentosParaExtra.filter(extra => extra.cuerda === cuerda);
                      return extrasDeCuerda.length > 0 ? (
                        <optgroup key={cuerda} label={cuerda}>
                          {extrasDeCuerda.map(extra => (
                            <option key={extra.id} value={extra.id}>
                              {extra.nombre} — {extra.charanga}
                            </option>
                          ))}
                        </optgroup>
                      ) : null;
                    })}
                  </select>
                </div>

                <div className="flex gap-2 pt-3">
                  <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-sm transition">
                    Guardar Músico Extra
                  </button>
                  <button type="button" onClick={() => setShowModalExtra(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR BOLOS O ENSAYOS */}
        {showModalEliminarBolos && esGestorBolos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="w-5 h-5 text-rose-400"/>
                <h3 className="text-lg font-black text-white">Eliminar Evento del Calendario</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">Selecciona el bolo o ensayo que deseas retirar.</p>

              <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                {bolos.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">No hay eventos creados actualmente.</p>
                ) : (
                  bolos.map(b => (
                    <div key={b.id} className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-black text-white text-base" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                          📍 {b.lugar}{' '}
                          {b.estadoBolo === 'ensayo' && <span className="text-cyan-400 text-[10px] font-sans">(Ensayo)</span>}
                        </p>
                        <p className="text-green-300 text-[11px]">{b.estadoBolo === 'ensayo' ? 'Ensayo' : b.titulo}</p>
                        <p className="text-zinc-500 text-[10px] mt-0.5">📅 {b.fecha}</p>
                      </div>
                      <button
                        onClick={() => eliminarBolo(b.id, b.lugar)}
                        className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-black font-bold px-3 py-1.5 rounded-xl transition text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5"/> Borrar
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalEliminarBolos(false)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-xl text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TRAYECTO CONDUCTOR CON SELECTOR DE PLAZAS LIBRES */}
        {showModalTrayectoBolo && boloActual && esConductor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-5 h-5 text-blue-400"/>
                <h3 className="text-lg font-black text-white">
                  {extraAsignadoTrayectoId ? 'Publicar ruta para músico extra' : 'Publicar Coche y Huecos Libres'}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                {extraAsignadoTrayectoId
                  ? 'Publica la ruta del extra y los huecos disponibles para que los compañeros puedan unirse.'
                  : 'Indica cuántos huecos libres tienes en tu coche, la salida y las paradas para que los compañeros puedan unirse.'}
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!origenTrayecto || !destinoTrayecto) return;
                if (!esConductor) {
                  alert('Solo un conductor o el administrador puede publicar rutas.');
                  return;
                }
                const numPlazas = parseInt(plazasTrayecto, 10);
                if (isNaN(numPlazas) || numPlazas < 1) {
                  alert('Indica al menos 1 hueco libre.');
                  return;
                }
                const extraAsignado = extraAsignadoTrayectoId
                  ? (boloActual.musicosExtras || []).find(extra => String(extra.id) === extraAsignadoTrayectoId)
                  : null;
                if (extraAsignadoTrayectoId && !extraAsignado) {
                  alert('El músico extra seleccionado ya no está asignado a este bolo.');
                  return;
                }
                registrarSnapshot();
                const nuevoCar = {
                  id: Date.now(),
                  conductor: extraAsignado?.nombre || usuarioActual.nombre,
                  ...(extraAsignado ? {
                    extraId: extraAsignado.id,
                    creadoPorId: usuarioActual.id,
                    creadoPor: usuarioActual.nombre
                  } : {}),
                  vehiculo: vehiculoTrayecto || 'Coche',
                  plazasTotales: numPlazas,
                  pasajeros: [],
                  origen: origenTrayecto,
                  horaSalida: horaSalidaOrigen,
                  paradas: paradasIntermedias.filter(p => p.lugar.trim() !== ''),
                  destino: destinoTrayecto,
                  horaLlegada: horaLlegadaDestino
                };
                const nuevosBolos = bolos.map(b => b.id === boloActual.id ? { ...b, cochesAsignados: [...(b.cochesAsignados || []), nuevoCar] } : b);
                setBolos(nuevosBolos);
                setOrigenTrayecto(''); setHoraSalidaOrigen('');
                setParadasIntermedias([{ lugar: '', hora: '' }]);
                setDestinoTrayecto(''); setHoraLlegadaDestino(''); setVehiculoTrayecto('');
                setPlazasTrayecto('4');
                setExtraAsignadoTrayectoId('');
                setShowModalTrayectoBolo(false);
                const guardadoEnNube = await guardarEnNube(null, nuevosBolos, null);
                if (guardadoEnNube) {
                  await enviarNotificacionAUsuarios({
                    titulo: 'Nueva ruta publicada',
                    mensaje: `${usuarioActual.nombre || nuevoCar.conductor} ha puesto su putivuelta para este bolo: ${boloActual.lugar}`
                  });
                }
              }} className="space-y-3 sarao-bolo-form">

                {(boloActual.musicosExtras || []).length > 0 && (
                  <div>
                    <label className="text-[11px] font-bold text-amber-400 block mb-1">Asignar ruta a músico extra (opcional):</label>
                    <select
                      value={extraAsignadoTrayectoId}
                      onChange={e => setExtraAsignadoTrayectoId(e.target.value)}
                      className="w-full bg-black border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="">Mi coche (conductor actual)</option>
                      {(boloActual.musicosExtras || []).map(extra => (
                        <option key={extra.id} value={String(extra.id)}>
                          {extra.nombre} — {extra.charanga}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Vehículo:</label>
                    <input type="text" placeholder="Ej: Seat León / Furgoneta" value={vehiculoTrayecto} onChange={e => setVehiculoTrayecto(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-emerald-400 block mb-1">Huecos libres:</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={plazasTrayecto}
                      onChange={e => setPlazasTrayecto(e.target.value)}
                      className="w-full bg-black border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white font-black outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Lugar de Salida:</label>
                    <input type="text" placeholder="Ej: Segovia" value={origenTrayecto} onChange={e => setOrigenTrayecto(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Hora Salida:</label>
                    <input type="text" placeholder="Ej: 11:30h" value={horaSalidaOrigen} onChange={e => setHoraSalidaOrigen(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-zinc-800">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-amber-400">Puntos Intermedios de recogida:</label>
                    <button
                      type="button"
                      onClick={() => setParadasIntermedias([...paradasIntermedias, { lugar: '', hora: '' }])}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold"
                    >
                      + Añadir parada
                    </button>
                  </div>

                  {paradasIntermedias.map((parada, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder={`Parada #${idx + 1}`}
                        value={parada.lugar}
                        onChange={e => {
                          const nuevas = [...paradasIntermedias];
                          nuevas[idx].lugar = e.target.value;
                          setParadasIntermedias(nuevas);
                        }}
                        className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Hora"
                        value={parada.hora}
                        onChange={e => {
                          const nuevas = [...paradasIntermedias];
                          nuevas[idx].hora = e.target.value;
                          setParadasIntermedias(nuevas);
                        }}
                        className="w-20 bg-black border border-zinc-800 rounded-xl px-2 py-2 text-xs text-white"
                      />
                      {paradasIntermedias.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setParadasIntermedias(paradasIntermedias.filter((_, i) => i !== idx))}
                          className="text-rose-400 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-800">
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Destino final:</label>
                    <input type="text" placeholder="Ej: Cuéllar" value={destinoTrayecto} onChange={e => setDestinoTrayecto(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Hora Llegada:</label>
                    <input type="text" placeholder="Ej: 12:30h" value={horaLlegadaDestino} onChange={e => setHoraLlegadaDestino(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-400 text-black font-black py-2.5 rounded-xl text-sm">
                    Publicar Trayecto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExtraAsignadoTrayectoId('');
                      setShowModalTrayectoBolo(false);
                    }}
                    className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL AÑADIR DESDE EL CALENDARIO */}
        {showModalBolo && esGestorBolos && (
          <div className="sarao-bolo-modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`sarao-bolo-modal bg-zinc-900 border rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto ${
              tipoCreacionEvento === 'ensayo' 
                ? 'border-cyan-400/50' 
                : tipoCreacionEvento === 'presupuestado' 
                  ? 'border-amber-500/50' 
                  : 'border-green-500/40'
            }`}>
              <h3 className="sarao-bolo-modal-title text-lg font-black text-white mb-1">
                {tipoCreacionEvento === 'ensayo'
                  ? 'Añadir Nuevo Ensayo'
                  : tipoCreacionEvento === 'presupuestado'
                    ? 'Añadir Nuevo Presupuesto de Bolo'
                    : 'Añadir Nuevo Bolo'}
              </h3>
              <p className="sarao-bolo-modal-description text-xs text-zinc-400 mb-3">
                {tipoCreacionEvento === 'ensayo'
                  ? 'El título será siempre "Ensayo" y se mostrará en azul turquesa.'
                  : tipoCreacionEvento === 'presupuestado' 
                    ? 'Aparecerá en color amarillo hasta que sea confirmado o rechazado.' 
                    : 'Se añadirá en color verde como bolo confirmado.'}
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!nuevoLugarBolo.trim() || !nuevaFechaBolo) return;
                registrarSnapshot();
                const esEns = tipoCreacionEvento === 'ensayo';
                const nuevoBolo = {
                  id: Date.now(),
                  lugar: nuevoLugarBolo.trim(),
                  titulo: esEns ? 'Ensayo' : (nuevoTituloBolo.trim() || ''),
                  fecha: nuevaFechaBolo,
                  horaInicio: nuevaHoraInicioBolo,
                  horaFin: esEns ? '' : nuevaHoraFinBolo,
                  repertorio: esEns ? nuevoRepertorioEnsayo.trim() : '',
                  presupuesto: esEns ? 0 : (parseFloat(nuevoPresupuestoBolo) || 0),
                  conFactura: esEns ? false : nuevoConFacturaBolo,
                  vestuario: 'Por definir',
                  estadoBolo: tipoCreacionEvento,
                  cochesAsignados: [],
                  musicosExtras: []
                };
                const nuevosBolos = [...bolos, nuevoBolo];
                setBolos(nuevosBolos);
                setNuevoLugarBolo(''); setNuevoTituloBolo(''); setNuevaFechaBolo('');
                setNuevaHoraInicioBolo(''); setNuevaHoraFinBolo('');
                setNuevoPresupuestoBolo(''); setNuevoConFacturaBolo(false);
                setNuevoRepertorioEnsayo('');
                setShowModalBolo(false);
                const guardadoEnNube = await guardarEnNube(null, nuevosBolos, null);
                if (guardadoEnNube) {
                  if (tipoCreacionEvento === 'presupuestado') {
                    await enviarNotificacionBoloConEnlace({
                      titulo: 'Solicitud de presupuesto',
                      mensaje: `Nos han solicitado presupuesto para este bolo: ${nuevoBolo.lugar}`,
                      url: `/?evento=${encodeURIComponent(String(nuevoBolo.id))}`
                    });
                  } else {
                    await enviarNotificacionAUsuarios({
                      titulo: esEns ? 'Nuevo ensayo en el calendario' : 'Nuevo bolo en el calendario',
                      mensaje: esEns
                        ? `Tenemos nuevo ENSAYO fijado panzabucheeee: ${nuevoBolo.lugar}`
                        : `Tenemos nuevo BOLO croquetoooooo: ${nuevoBolo.titulo || nuevoBolo.lugar}`
                    });
                  }
                }
              }} className="space-y-3 sarao-bolo-form">

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-black rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setTipoCreacionEvento('confirmado')}
                    className={`py-1.5 rounded-lg text-[11px] font-black transition ${
                      tipoCreacionEvento === 'confirmado' ? 'bg-green-500 text-black' : 'text-zinc-400'
                    }`}
                  >
                    🟢 Bolo
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoCreacionEvento('presupuestado')}
                    className={`py-1.5 rounded-lg text-[11px] font-black transition ${
                      tipoCreacionEvento === 'presupuestado' ? 'bg-amber-400 text-black' : 'text-zinc-400'
                    }`}
                  >
                    🟡 Presupuesto
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoCreacionEvento('ensayo')}
                    className={`py-1.5 rounded-lg text-[11px] font-black transition ${
                      tipoCreacionEvento === 'ensayo' ? 'bg-cyan-400 text-black' : 'text-zinc-400'
                    }`}
                  >
                    🔵 Ensayo
                  </button>
                </div>
                
                <div>
                  <label className="text-[11px] font-bold text-green-400 block mb-1">
                    {tipoCreacionEvento === 'ensayo' ? 'Lugar del Ensayo:' : 'Lugar del Bolo (Titular principal):'}
                  </label>
                  <input type="text" placeholder="Ej: Local de ensayo, Cuéllar, Segovia..." value={nuevoLugarBolo} onChange={e => setNuevoLugarBolo(e.target.value)} className="w-full bg-black border border-green-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-green-400" required />
                </div>

                {tipoCreacionEvento === 'ensayo' ? (
                  <div>
                    <label className="text-[11px] font-bold text-cyan-400 block mb-1">Repertorio (Opcional):</label>
                    <input type="text" placeholder="Ej: Temas nuevos, pasodobles..." value={nuevoRepertorioEnsayo} onChange={e => setNuevoRepertorioEnsayo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Tipo de Bolo (Opcional):</label>
                    <input type="text" placeholder="Ej: Pasacalles y Vermú, Diana floreada..." value={nuevoTituloBolo} onChange={e => setNuevoTituloBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Día (Fecha):</label>
                  <input type="date" value={nuevaFechaBolo} onChange={e => setNuevaFechaBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800">
                  <div className={tipoCreacionEvento === 'ensayo' ? 'col-span-2' : ''}>
                    <label className="text-[11px] font-bold text-green-400 block mb-1">
                      {tipoCreacionEvento === 'ensayo' ? 'Hora del Ensayo:' : 'A qué hora empieza:'}
                    </label>
                    <input type="text" placeholder="Ej: 19:30h" value={nuevaHoraInicioBolo} onChange={e => setNuevaHoraInicioBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required={tipoCreacionEvento === 'ensayo'} />
                  </div>
                  {tipoCreacionEvento !== 'ensayo' && (
                    <div>
                      <label className="text-[11px] font-bold text-green-400 block mb-1">A qué hora acaba:</label>
                      <input type="text" placeholder="Ej: 17:00h" value={nuevaHoraFinBolo} onChange={e => setNuevaHoraFinBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                    </div>
                  )}
                </div>

                {tipoCreacionEvento !== 'ensayo' && (
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-amber-400 block mb-1">Presupuesto en euros (€):</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 1200"
                        value={nuevoPresupuestoBolo}
                        onChange={e => setNuevoPresupuestoBolo(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="facturaCheck"
                        checked={nuevoConFacturaBolo}
                        onChange={e => setNuevoConFacturaBolo(e.target.checked)}
                        className="w-4 h-4 accent-green-500 rounded cursor-pointer"
                      />
                      <label htmlFor="facturaCheck" className="text-xs text-zinc-300 font-bold cursor-pointer flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-zinc-400"/> Va con Factura oficial
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3">
                  <button
                    type="submit"
                    className={`flex-1 text-black font-black py-2.5 rounded-xl text-sm ${
                      tipoCreacionEvento === 'ensayo'
                        ? 'bg-cyan-400 hover:bg-cyan-300'
                        : tipoCreacionEvento === 'presupuestado'
                          ? 'bg-amber-400 hover:bg-amber-300'
                          : 'bg-green-500 hover:bg-green-400'
                    }`}
                  >
                    {tipoCreacionEvento === 'ensayo'
                      ? 'Guardar Ensayo (Azul)'
                      : tipoCreacionEvento === 'presupuestado'
                        ? 'Guardar Presupuesto (Amarillo)'
                        : 'Guardar Bolo Confirmado'}
                  </button>
                  <button type="button" onClick={() => setShowModalBolo(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BOTE / TESORERÍA */}
        {pestañaActiva === 'bote' && (
          <div data-sarao-section="bote" className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
              
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-800 pb-5 mb-5">
                <div>
                  <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    BOTE Y FINANZAS SARAO
                  </h2>
                  <p className="text-xs text-zinc-400">
                    La gasolina queda apuntada y solo se resta del bote cuando se pulsa el tick de verificación (✓).
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {esConductor && (
                    <button
                      onClick={() => {
                        setConductorGasolinaNombre(tieneRolConductor ? usuarioActual.nombre : '');
                        setShowModalGasolina(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-400 text-black font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Fuel className="w-4 h-4"/> Añadir Kilometraje (0,20€/km)
                    </button>
                  )}

                  {esTesorero && (
                    <button
                      onClick={() => setShowModalMovimientoBote(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4"/> Añadir Movimiento
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Saldo Real Bote</span>
                  <p className={`text-2xl font-black mt-1 ${saldoTotal >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                    {saldoTotal.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Ingresos</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    +{totalIngresos.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Gastos Pagados (✓)</span>
                  <p className="text-2xl font-black text-rose-400 mt-1">
                    -{totalGastos.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-amber-300 uppercase">Gasolina sin Verificar</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    {totalPendienteGasolina.toFixed(2)} €
                  </p>
                </div>
              </div>

              {/* DASHBOARD FINANCIERO VISUAL */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-[10px] uppercase tracking-[.18em] font-black text-emerald-400">Panel de control</p>
                    <h3 className="text-xl text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Resumen financiero</h3>
                  </div>
                  <select value={anioFinanzasSeleccionado} onChange={e => setAnioFinanzasSeleccionado(e.target.value)} className="bg-zinc-950 border border-emerald-500/30 text-white rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-400" aria-label="Filtrar estadísticas por año">
                    <option value="todos">Todo el histórico</option>
                    {aniosFinanzas.map(anio => <option key={anio} value={anio}>{anio}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                  <div className="xl:col-span-2 bg-black/50 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                      <div><p className="text-[10px] uppercase tracking-[.18em] font-black text-emerald-400">Evolución</p><h3 className="text-xl text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Ingresos y gastos por mes</h3></div>
                      <span className="text-[10px] text-zinc-500">Importes en €</span>
                    </div>
                    <div className="flex gap-4 text-[10px] text-zinc-400 mb-4">
                      <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-emerald-400"/>Ingresos</span>
                      <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-rose-400"/>Gastos</span>
                    </div>
                    <div className="space-y-3">
                      {datosMensualesFinanzas.map((mes, index) => (
                        <div key={mes.mes + index} className="grid grid-cols-[34px_1fr] sm:grid-cols-[42px_1fr_100px] gap-2 items-center">
                          <span className="text-[10px] font-black text-zinc-400">{mes.mes}</span>
                          <div className="space-y-1.5">
                            <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: (mes.ingresos / maximoMensualFinanzas * 100) + '%' }}/></div>
                            <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full rounded-full bg-rose-400 transition-all" style={{ width: (mes.gastos / maximoMensualFinanzas * 100) + '%' }}/></div>
                          </div>
                          <span className="hidden sm:block text-right text-[10px] text-zinc-500 tabular-nums">{mes.ingresos.toFixed(0)} / {mes.gastos.toFixed(0)} €</span>
                        </div>
                      ))}
                    </div>
                    {movimientosContabilizadosPeriodo.length === 0 && <p className="text-xs text-zinc-500 mt-4">No hay movimientos contabilizados para este periodo.</p>}
                    {anioFinanzasSeleccionado !== 'todos' && movimientosBote.some(m => !m.fechaISO) && <p className="text-[10px] text-amber-300 mt-3">Los movimientos antiguos sin fecha completa se mantienen en el histórico global y no se asignan a un año por aproximación.</p>}
                  </div>
                  <div className="bg-black/50 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
                    <p className="text-[10px] uppercase tracking-[.18em] font-black text-emerald-400">Desglose</p>
                    <h3 className="text-xl text-white mt-1 mb-4" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Gastos por categoría</h3>
                    {gastosPorCategoriaFinanzas.length ? (
                      <div className="space-y-3">
                        {gastosPorCategoriaFinanzas.map(categoria => (
                          <div key={categoria.nombre} className="space-y-1.5">
                            <div className="flex justify-between gap-2 text-xs"><span className="text-zinc-300 truncate">{categoria.nombre}</span><strong className="text-white tabular-nums shrink-0">{categoria.importe.toFixed(2)} €</strong></div>
                            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full rounded-full bg-emerald-400" style={{ width: (categoria.importe / maximoCategoriaFinanzas * 100) + '%' }}/></div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-zinc-500 py-5 text-center">Todavía no hay gastos contabilizados.</p>}
                    <p className="text-[10px] text-zinc-500 mt-4">Solo cuentan los gastos verificados.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div><p className="text-[10px] uppercase tracking-[.18em] font-black text-amber-300">Previsión de cobros</p><h3 className="text-xl text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Pendiente de cobrar</h3></div>
                      <Wallet className="w-5 h-5 text-amber-300"/>
                    </div>
                    <p className="text-3xl font-black text-amber-300 tabular-nums">{totalPendienteCobroFinanzas.toFixed(2)} €</p>
                    <p className="text-xs text-zinc-400 mt-1">{numeroBolosPendientesFinanzas} {numeroBolosPendientesFinanzas === 1 ? 'actuación pendiente' : 'actuaciones pendientes'} de cobro</p>
                    <p className="text-[10px] text-zinc-500 mt-3">Presupuestos confirmados que todavía no tienen un ingreso vinculado.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Historial de Movimientos y Gasolinas</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto bg-black/60 p-3 rounded-2xl border border-zinc-800">
                  {movimientosBote.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">No hay movimientos registrados.</p>
                  ) : (
                    movimientosBote.map(m => {
                      const estaVerificado = m.verificado !== false;

                      return (
                        <div 
                          key={m.id} 
                          className={`flex justify-between items-center text-xs p-3 rounded-xl border transition ${
                            estaVerificado 
                              ? 'bg-zinc-900/80 border-zinc-800' 
                              : 'bg-amber-500/10 border-amber-500/40'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-bold text-sm ${estaVerificado ? 'text-white' : 'text-amber-200'}`}>
                                {m.concepto}
                              </p>
                              {!estaVerificado ? (
                                <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                                  ⏳ Pendiente de verificar pago (No restado)
                                </span>
                              ) : m.esGasolina && (
                                <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                                  ✓ Pago verificado
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] text-zinc-400 block">
                              {m.fecha} • {m.conductorGasto ? (
                                <>Pertenece a: <strong className="text-blue-300">{m.conductorGasto}</strong> (Apuntado por {m.autor})</>
                              ) : (
                                <>Registrado por: <strong className="text-zinc-300">{m.autor || 'Admin'}</strong></>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className={`font-black text-sm ${
                              !estaVerificado 
                                ? 'text-amber-400 line-through opacity-80' 
                                : m.cantidad >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {m.cantidad >= 0 ? `+${m.cantidad.toFixed(2)}` : m.cantidad.toFixed(2)} €
                            </span>

                            {m.cantidad < 0 && esTesorero && (
                              <button
                                onClick={() => toggleVerificarMovimientoBote(m.id)}
                                className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 transition cursor-pointer border ${
                                  estaVerificado
                                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                                    : 'bg-zinc-900 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 border-zinc-700'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5"/>
                                {estaVerificado ? 'Pagado' : 'Verificar'}
                              </button>
                            )}

                            {esTesorero && (
                              <button onClick={() => eliminarMovimientoBote(m.id)} className="text-rose-400 hover:text-rose-300 p-1">
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL GASOLINA */}
        {showModalGasolina && esConductor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="w-5 h-5 text-blue-400"/>
                <h3 className="text-lg font-black text-white">Apuntar Gasolina (0,20 € / km)</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                El gasto quedará apuntado en la lista y se descontará del bote en cuanto se pulse el tick de verificación (✓).
              </p>

              <form onSubmit={agregarGasolinaConductor} className="space-y-3">
                {esAdmin && (
                  <div className="p-3 bg-black/60 border border-blue-500/30 rounded-2xl space-y-2">
                    <label className="text-xs text-blue-300 block font-bold">
                      ¿A qué conductor pertenece este gasto?
                    </label>
                    {listaConductoresPlantilla.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-1">
                        {listaConductoresPlantilla.map(c => (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => setConductorGasolinaNombre(c.nombre)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              conductorGasolinaNombre === c.nombre
                                ? 'bg-blue-500 text-black border-blue-400'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                            }`}
                          >
                            {c.nombre}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Escribe o selecciona el nombre del conductor..."
                      value={conductorGasolinaNombre}
                      onChange={e => setConductorGasolinaNombre(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">Kilómetros realizados:</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 110"
                    value={kmGasolina}
                    onChange={e => setKmGasolina(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">Bolo / Destino (Opcional):</label>
                  <input
                    type="text"
                    placeholder="Ej: Cuéllar"
                    value={destinoGasolina}
                    onChange={e => setDestinoGasolina(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                {kmGasolina && !isNaN(parseFloat(kmGasolina)) && parseFloat(kmGasolina) > 0 && (
                  <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
                    <span className="text-xs text-zinc-300 block">
                      Importe para <strong>{esAdmin ? (conductorGasolinaNombre || '...') : usuarioActual.nombre}</strong> ({parseFloat(kmGasolina)} km × 0,20 €):
                    </span>
                    <span className="text-lg text-blue-400 font-black">
                      {(parseFloat(kmGasolina) * TARIFA_KM).toFixed(2)} €
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-400 text-black font-black py-2.5 rounded-xl text-sm">
                    Apuntar Gasto de Gasolina
                  </button>
                  <button type="button" onClick={() => setShowModalGasolina(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL INGRESOS Y GASTOS */}
        {showModalMovimientoBote && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5 text-amber-400"/>
                <h3 className="text-lg font-black text-white">Nuevo Movimiento en el Bote</h3>
              </div>

              <form onSubmit={agregarMovimientoGeneralBote} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">Tipo de Movimiento:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setTipoMovimientoBote('ingreso'); setConceptoBote(''); setBoloSeleccionadoIngreso(''); setImporteBote(''); }}
                      className={`py-2 text-xs font-bold rounded-xl border ${tipoMovimientoBote === 'ingreso' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-black border-zinc-800 text-zinc-400'}`}
                    >
                      + Ingreso (Cobro)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTipoMovimientoBote('gasto'); setConceptoBote('Otros gastos'); setBoloSeleccionadoIngreso(''); setImporteBote(''); }}
                      className={`py-2 text-xs font-bold rounded-xl border ${tipoMovimientoBote === 'gasto' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-black border-zinc-800 text-zinc-400'}`}
                    >
                      - Gasto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">Concepto:</label>
                  {tipoMovimientoBote === 'ingreso' ? (
                    <select
                      value={boloSeleccionadoIngreso}
                      onChange={e => {
                        const elegido = bolosPendientesDeCobro.find(b => String(b.id) === e.target.value);
                        setBoloSeleccionadoIngreso(e.target.value);
                        setConceptoBote(elegido ? (elegido.titulo || elegido.lugar) : '');
                        setImporteBote(elegido ? String(elegido.presupuesto) : '');
                      }}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                      required
                    >
                      <option value="">Selecciona un bolo pendiente de cobro</option>
                      {bolosPendientesDeCobro.map(b => (
                        <option key={b.id} value={String(b.id)}>
                          {b.lugar} · {b.fecha} · {Number(b.presupuesto).toFixed(2)} €
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={conceptoBote || 'Otros gastos'}
                      onChange={e => setConceptoBote(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                      required
                    >
                      <option value="Ropa">Ropa</option>
                      <option value="Pegatinas">Pegatinas</option>
                      <option value="Material">Material</option>
                      <option value="Otros gastos">Otros gastos</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">Importe en Euros (€):</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 1200"
                    value={importeBote}
                    onChange={e => setImporteBote(e.target.value)}
                    readOnly={tipoMovimientoBote === 'ingreso'}
                    className={`w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500 ${tipoMovimientoBote === 'ingreso' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-sm">
                    Guardar Movimiento
                  </button>
                  <button type="button" onClick={() => setShowModalMovimientoBote(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {boloDisponibilidadAbiertoId === boloActual?.id && !esPerfilExtra && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className={`bg-zinc-900 border ${boloActual.estadoBolo === 'ensayo' ? 'border-cyan-400/50' : 'border-amber-500/50'} rounded-3xl p-6 max-w-md w-full shadow-2xl`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${boloActual.estadoBolo === 'ensayo' ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {boloActual.estadoBolo === 'ensayo' ? 'Asistencia al ensayo' : 'Confirma tu asistencia'}
                  </p>
                  <h3 className="text-2xl font-black text-white mt-1">{boloActual.lugar}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{boloActual.fecha} · {boloActual.horaInicio || 'Hora por definir'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBoloDisponibilidadAbiertoId(null)}
                  className="text-zinc-400 hover:text-white p-1"
                  aria-label="Cerrar confirmación de asistencia"
                >
                  <XCircle className="w-5 h-5"/>
                </button>
              </div>

              {usuarioActual.instrumentos?.length > 1 && (
                <div className="mb-4">
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">¿Con qué instrumento tocarás?</label>
                  <select
                    value={instrumentoElegidoBolo || usuarioActual.instrumentos[0]}
                    onChange={e => setInstrumentoElegidoBolo(e.target.value)}
                    className="w-full bg-black border border-zinc-700 text-white rounded-xl p-2.5 text-xs font-bold"
                  >
                    {usuarioActual.instrumentos.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                  </select>
                </div>
              )}

              <p className="text-xs text-zinc-400 mb-3">Indica tu disponibilidad para este evento:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDisponibilidadBolo(boloActual.id, 'puedo', instrumentoElegidoBolo || usuarioActual.instrumentos?.[0])}
                  className="px-3 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs transition"
                >
                  🟢 Puedo
                </button>
                <button
                  type="button"
                  onClick={() => setDisponibilidadBolo(boloActual.id, 'tal_vez')}
                  className="px-3 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs transition"
                >
                  🟡 Tal vez
                </button>
                <button
                  type="button"
                  onClick={() => setDisponibilidadBolo(boloActual.id, 'no')}
                  className="px-3 py-3 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-xl text-xs transition"
                >
                  🔴 No puedo
                </button>
              </div>
            </div>
          </div>
        )}

        {showModalVacaciones && (
          <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModalVacaciones(false)}>
            <div className="w-full max-w-md bg-zinc-950 border border-red-500/40 rounded-3xl p-5 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white">Mis vacaciones</h2>
                  <p className="text-xs text-zinc-400">Selecciona el primer y el último día</p>
                </div>
                <button type="button" onClick={() => setShowModalVacaciones(false)} className="text-zinc-400 hover:text-white text-xl">×</button>
              </div>
              <form onSubmit={guardarVacaciones} className="space-y-3">
                <label className="block text-xs font-bold text-zinc-300">Desde
                  <input type="date" value={fechaInicioVacaciones} onChange={e => setFechaInicioVacaciones(e.target.value)} required className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-3 text-white" />
                </label>
                <label className="block text-xs font-bold text-zinc-300">Hasta
                  <input type="date" min={fechaInicioVacaciones} value={fechaFinVacaciones} onChange={e => setFechaFinVacaciones(e.target.value)} required className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-3 text-white" />
                </label>
                <p className="text-[11px] text-zinc-500">Tus vacaciones aparecerán en rojo para ti, tus compañeros de cuerda y los usuarios con rol Bolos o administrador.</p>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black rounded-xl py-3">Guardar vacaciones</button>
              </form>
              <div className="border-t border-zinc-800 pt-3 space-y-2">
                <h3 className="text-xs font-black uppercase text-zinc-300">Mis periodos registrados</h3>
                {vacaciones.filter(v => String(v.usuarioId) === String(usuarioActual?.id)).length === 0 ? (
                  <p className="text-xs text-zinc-500">Todavía no has añadido vacaciones.</p>
                ) : vacaciones.filter(v => String(v.usuarioId) === String(usuarioActual?.id)).map(v => (
                  <div key={v.id} className="flex items-center justify-between gap-2 text-xs bg-zinc-900 rounded-xl p-2">
                    <span className="text-zinc-300">{v.fechaInicio} – {v.fechaFin}</span>
                    <button type="button" onClick={() => eliminarVacaciones(v.id)} className="text-red-300 font-bold">Eliminar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BARRA INFERIOR */}
      <nav
        className="fixed bottom-3 left-1/2 -translate-x-1/2 bg-white/12 border border-white/35 px-2 py-2 rounded-[2.2rem] shadow-[0_14px_42px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.58),inset_0_-1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl flex items-center gap-1 z-40 max-w-[96vw] overflow-x-auto scrollbar-none select-none"
        style={{ WebkitBackdropFilter: 'blur(32px) saturate(230%)', scrollbarWidth: 'none', touchAction: 'none', backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.24), rgba(255,255,255,0.045) 52%, rgba(255,255,255,0.14))' }}
        onTouchStart={e => {
          if (e.touches.length !== 1) return;
          const t = e.touches[0];
          const id = detectarPestanaBajoDedo(e.currentTarget, t.clientX, t.clientY);
          navGestureRef.current = { id, x: t.clientX, y: t.clientY, moved: false };
        }}
        onTouchMove={e => {
          if (!navGestureRef.current || e.touches.length !== 1) return;
          const t = e.touches[0];
          const nav = e.currentTarget;
          if (Math.abs(t.clientX - navGestureRef.current.x) > 7 || Math.abs(t.clientY - navGestureRef.current.y) > 7) navGestureRef.current.moved = true;
          const id = detectarPestanaBajoDedo(nav, t.clientX, t.clientY);
          navGestureRef.current.id = id;
          setNavGestureTab(id);
          if (id && id !== pestañaActiva) seleccionarPestanaInferior(id);
          const rect = nav.getBoundingClientRect();
          if (t.clientX > rect.right - 24) nav.scrollLeft += 12;
          else if (t.clientX < rect.left + 24) nav.scrollLeft -= 12;
        }}
        onTouchEnd={() => {
          const gesto = navGestureRef.current;
          navGestureRef.current = null;
          setNavGestureTab(null);
          if (gesto?.moved && gesto.id) seleccionarPestanaInferior(gesto.id);
        }}
        onTouchCancel={() => { navGestureRef.current = null; setNavGestureTab(null); }}
      >
        {[
          { id: 'landing', label: 'Inicio', icon: Home },
          { id: 'bolos', label: 'Bolos', icon: CalendarIcon },
          { id: 'perfil', label: 'Mi ficha', icon: Wallet },
          { id: 'ensayos', label: 'Ensayos', icon: Music },
          { id: 'letras', label: 'Letras de canciones', icon: FileText },
          { id: 'bote', label: 'Bote', icon: Wallet },
          { id: 'facturas', label: 'Facturas', icon: FileText },
          ...(esAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
        ].map(tab => {
          const Icon = tab.icon;
          const activa = pestañaActiva === tab.id;
          return (
            <button key={tab.id} data-nav-tab={tab.id} aria-label={tab.label} aria-current={activa ? 'page' : undefined} onClick={() => seleccionarPestanaInferior(tab.id)} onMouseEnter={() => setNavGestureTab(tab.id)}
              onMouseLeave={() => setNavGestureTab(null)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-black transition-all duration-200 shrink-0 snap-center ${(navGestureTab || pestañaActiva) === tab.id ? 'bg-emerald-300/90 text-emerald-950 shadow-[0_2px_16px_rgba(52,211,153,0.48)] scale-110' : 'text-white/80 hover:text-white hover:bg-emerald-300/15'}`}>
              <Icon className="w-4 h-4"/>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
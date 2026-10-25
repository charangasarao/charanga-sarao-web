"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Car, Users, Wallet, Shield, MapPin, 
  Plus, Navigation, Music, Fuel, Settings, Calculator, Check, Key, 
  UserPlus, Trash2, Shirt, ArrowRight, Home, Clock, AlertCircle, 
  ChevronLeft, ChevronRight, BarChart3, Download, Undo2, FileText, 
  Edit3, Upload, Mail, Eye, Loader2, ClipboardList, XCircle, UserCheck, LogOut
} from 'lucide-react';

import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const CONFIG_CUERDAS = {
  'Saxos': { label: 'Saxos', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: '#34d399' },
  'Trompetas': { label: 'Trompetas', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: '#fbbf24' },
  'Trombones': { label: 'Trombones', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: '#60a5fa' },
  'Tuba': { label: 'Tuba', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: '#22d3ee' },
  'Percusión': { label: 'Percusión', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', dot: '#e879f9' }
};

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
  const PASSWORD_CHARANGA = 'sarao2027';
  const PASSWORD_ADMIN = 'admin2027';

  // Estados globales sincronizados con Firebase
  const [miembros, setMiembros] = useState([]);
  const [bolos, setBolos] = useState([]);
  const [movimientosBote, setMovimientosBote] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [correoFacturacion, setCorreoFacturacion] = useState('');
  const [inputCorreoAdmin, setInputCorreoAdmin] = useState('');

  const [historialEstados, setHistorialEstados] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [pestañaActiva, setPestañaActiva] = useState('landing');
  const [boloSeleccionadoId, setBoloSeleccionadoId] = useState(null);
  const [boloDisponibilidadAbiertoId, setBoloDisponibilidadAbiertoId] = useState(null);
  const [mesIndexActivo, setMesIndexActivo] = useState(0);

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

  const [showModalGasolina, setShowModalGasolina] = useState(false);
  const [kmGasolina, setKmGasolina] = useState('');
  const [destinoGasolina, setDestinoGasolina] = useState('');
  const [conductorGasolinaNombre, setConductorGasolinaNombre] = useState('');
  const TARIFA_KM = 0.2;

  // Estados de Facturas
  const [showModalSubirFactura, setShowModalSubirFactura] = useState(false);
  const [archivoFactura, setArchivoFactura] = useState(null);
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
        if (data.bolos) setBolos(data.bolos);
        if (data.movimientosBote) setMovimientosBote(data.movimientosBote);
        if (data.facturas) setFacturas(data.facturas);
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

  const guardarEnNube = async (nuevosMiembros, nuevosBolos, nuevoBote, nuevasFacturas = null, nuevoCorreo = null) => {
    try {
      await setDoc(doc(db, 'charanga', 'datos_generales'), {
        miembros: nuevosMiembros ?? miembros,
        bolos: nuevosBolos ?? bolos,
        movimientosBote: nuevoBote ?? movimientosBote,
        facturas: nuevasFacturas ?? facturas,
        correoFacturacion: nuevoCorreo !== null ? nuevoCorreo : correoFacturacion
      }, { merge: true });
    } catch (e) {
      console.error("Error guardando en la nube:", e);
      alert("No se pudo sincronizar con Firebase. Revisa tu conexión.");
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
    await guardarEnNube(listaActualizada, null, null);
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
            ...(campo === 'asistio' ? { asistenciaRegistrada: true } : {})
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
    const nuevosBolos = bolos.map(b => b.id === boloId ? { ...b, vestuario: nuevoVestuario } : b);
    setBolos(nuevosBolos);
    await guardarEnNube(null, nuevosBolos, null);
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
    await guardarEnNube(null, nuevosBolos, null);
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
    await guardarEnNube(null, nuevosBolos, null);
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

  const confirmarBoloPresupuestadoDefinitivo = async (e) => {
    e.preventDefault();
    if (!esGestorBolos || !presupuestoAConfirmarId) return;
    if (!editLugarBolo.trim() || !editFechaBolo) {
      alert('El lugar y la fecha son obligatorios.');
      return;
    }

    registrarSnapshot();
    const nuevosBolos = bolos.map(b => {
      if (b.id === presupuestoAConfirmarId) {
        return {
          ...b,
          lugar: editLugarBolo.trim(),
          titulo: editTituloBolo.trim() || 'Actuación',
          fecha: editFechaBolo,
          horaInicio: editHoraInicioBolo,
          horaFin: editHoraFinBolo,
          presupuesto: parseFloat(editPresupuestoBolo) || 0,
          conFactura: editConFacturaBolo,
          estadoBolo: 'confirmado'
        };
      }
      return b;
    });

    setBolos(nuevosBolos);
    setShowModalConfirmarPresupuesto(false);
    setPresupuestoAConfirmarId(null);
    await guardarEnNube(null, nuevosBolos, null);
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
      const nuevosBolos = bolos.filter(b => b.id !== boloId);
      const nuevosMiembros = miembros.map(m => {
        const disp = { ...m.disponibilidadBolos };
        delete disp[boloId];
        return { ...m, disponibilidadBolos: disp };
      });
      if (boloSeleccionadoId === boloId) setBoloSeleccionadoId(null);
      setBolos(nuevosBolos);
      setMiembros(nuevosMiembros);
      await guardarEnNube(nuevosMiembros, nuevosBolos, null);
    }
  };

  const puedeEliminarAsistencia = (cuerdaMiembro) => {
    if (esAdmin || esGestorBolos) return true;
    if (esJefeCuerda && usuarioActual.cuerda === cuerdaMiembro) return true;
    return false;
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
    const imp = parseFloat(importeBote);
    if (isNaN(imp) || imp <= 0 || !conceptoBote.trim()) {
      alert('Introduce un concepto e importe válidos.');
      return;
    }
    registrarSnapshot();
    const cantidadReal = tipoMovimientoBote === 'ingreso' ? imp : -imp;
    const nuevoMov = {
      id: Date.now(),
      concepto: conceptoBote.trim(),
      cantidad: cantidadReal,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      tipo: tipoMovimientoBote,
      autor: usuarioActual.nombre,
      verificado: true
    };
    const nuevoBote = [nuevoMov, ...movimientosBote];
    setMovimientosBote(nuevoBote);
    setConceptoBote('');
    setImporteBote('');
    setShowModalMovimientoBote(false);
    await guardarEnNube(null, null, nuevoBote);
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

  const extraerImporteDeTexto = (texto) => {
    if (!texto) return null;
    let candidatos = [];

    const regexClave = /(?:total|importe|pagar|base|cuota|neto|factura|eur|€)[^0-9]*([0-9]{1,5}(?:[.,][0-9]{1,2})?)/gi;
    let match;
    while ((match = regexClave.exec(texto)) !== null) {
      const val = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(val) && val > 0 && val < 50000) candidatos.push(val);
    }

    if (candidatos.length === 0) {
      const regexMoneda = /\b([0-9]{1,4}[.,][0-9]{2})\b/g;
      while ((match = regexMoneda.exec(texto)) !== null) {
        const val = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(val) && val > 0.5 && val < 25000 && val !== 20.26 && val !== 20.27) {
          candidatos.push(val);
        }
      }
    }

    if (candidatos.length > 0) {
      return Math.max(...candidatos).toFixed(2);
    }
    return null;
  };

  const manejarSeleccionArchivoFactura = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('iso-8859-1');
        const rawText = decoder.decode(arrayBuffer);
        const bloquesTexto = (rawText.match(/\(([^()]+)\)/g) || []).map(s => s.slice(1, -1)).join(' ');
        const detectado = extraerImporteDeTexto(bloquesTexto) || extraerImporteDeTexto(rawText) || importeEnNombre;

        if (detectado) {
          setImporteFacturaDetectado(String(detectado));
          setMensajeAnalisis(`✓ Importe detectado automáticamente del PDF: ${detectado} € (puedes corregirlo si es necesario).`);
        } else {
          setMensajeAnalisis('ℹ️ PDF cargado. Confirma o escribe el importe abajo.');
        }
      } else if (file.type.startsWith('image/')) {
        if (!window.Tesseract) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (window.Tesseract) {
          const { data: { text } } = await window.Tesseract.recognize(file, 'spa');
          const detectado = extraerImporteDeTexto(text) || importeEnNombre;
          if (detectado) {
            setImporteFacturaDetectado(String(detectado));
            setMensajeAnalisis(`✓ Importe detectado por escáner óptico (OCR): ${detectado} € (revísalo antes de confirmar).`);
          } else {
            setMensajeAnalisis('ℹ️ Imagen analizada. Por favor introduce o verifica el importe manualmente.');
          }
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
    const imp = parseFloat(String(importeFacturaDetectado).replace(',', '.'));
    if (isNaN(imp) || imp <= 0) {
      alert('Por favor introduce un importe de factura válido mayor que 0.');
      return;
    }
    if (!conceptoFactura.trim()) {
      alert('Indica un concepto o proveedor para la factura.');
      return;
    }

    setEnviandoFactura(true);
    registrarSnapshot();

    const nuevaFactura = {
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
      enviadaACorreo: correoFacturacion || 'Sin correo configurado'
    };

    const nuevasFacturas = [nuevaFactura, ...facturas];
    setFacturas(nuevasFacturas);
    await guardarEnNube(null, null, null, nuevasFacturas);

    if (correoFacturacion && correoFacturacion.includes('@')) {
      try {
        const formData = new FormData();
        formData.append('_subject', `Nueva Factura Charanga Sarao - ${usuarioActual.nombre} (${imp.toFixed(2)} €)`);
        formData.append('Músico', usuarioActual.nombre);
        formData.append('Cuerda', usuarioActual.cuerda);
        formData.append('Concepto_Factura', conceptoFactura.trim());
        formData.append('Importe_Facturado', `${imp.toFixed(2)} €`);
        formData.append('Fecha_Subida', nuevaFactura.fecha);
        formData.append('_captcha', 'false');
        if (archivoFactura) {
          formData.append('attachment', archivoFactura, archivoFactura.name);
        }

        await fetch(`https://formsubmit.co/${correoFacturacion.trim()}`, {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.error("Error enviando email automático:", err);
      }
    }

    setEnviandoFactura(false);
    setArchivoFactura(null);
    setPreviewArchivoUrl('');
    setNombreArchivoFactura('');
    setConceptoFactura('');
    setImporteFacturaDetectado('');
    setMensajeAnalisis('');
    setShowModalSubirFactura(false);

    if (correoFacturacion) {
      alert(`Factura de ${imp.toFixed(2)} € registrada y enviada automáticamente a ${correoFacturacion}.`);
    } else {
      alert(`Factura de ${imp.toFixed(2)} € registrada correctamente.`);
    }
  };

  const eliminarFactura = async (factura) => {
    const esMia = factura.usuarioId === usuarioActual.id || factura.usuarioNombre?.toLowerCase() === usuarioActual.nombre?.toLowerCase();
    if (!esMia && !esFacturador && !esAdmin) {
      alert('Solo puedes borrar tus propias facturas.');
      return;
    }

    if (confirm(`¿Seguro que deseas eliminar la factura "${factura.concepto}" (${factura.importe.toFixed(2)} €)?`)) {
      registrarSnapshot();
      const nuevasFacturas = facturas.filter(f => f.id !== factura.id);
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

  // CÁLCULO DE TOTALES BOTE
  const movimientosContabilizados = movimientosBote.filter(m => m.verificado !== false);
  const totalIngresos = movimientosContabilizados.filter(m => m.cantidad > 0).reduce((acc, m) => acc + m.cantidad, 0);
  const totalGastos = movimientosContabilizados.filter(m => m.cantidad < 0).reduce((acc, m) => acc + Math.abs(m.cantidad), 0);
  const totalPendienteGasolina = movimientosBote.filter(m => m.verificado === false && m.cantidad < 0).reduce((acc, m) => acc + Math.abs(m.cantidad), 0);
  const saldoTotal = totalIngresos - totalGastos;

  // CÁLCULO DE TOTALES DE FACTURAS
  const misFacturas = facturas.filter(
    f => f.usuarioId === usuarioActual?.id || f.usuarioNombre?.trim().toLowerCase() === usuarioActual?.nombre?.trim().toLowerCase()
  );
  const miTotalFacturado = misFacturas.reduce((acc, f) => acc + (parseFloat(f.importe) || 0), 0);
  const totalGeneralFacturado = facturas.reduce((acc, f) => acc + (parseFloat(f.importe) || 0), 0);

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

  const proximosBolosConfirmados = bolos
    .filter(b => b.estadoBolo !== 'presupuestado' && b.estadoBolo !== 'ensayo' && esBoloVigente(b.fecha))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

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
        .reduce((acc, f) => acc + (parseFloat(f.importe) || 0), 0);
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
                placeholder="sarao2027 o clave admin"
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
      !disponibilidad?.estado
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
          <span>Asistencia: <strong className={pago.asistenciaRegistrada ? (pago.asistio ? 'text-emerald-300' : 'text-rose-300') : 'text-zinc-400'}>
            {pago.asistenciaRegistrada ? (pago.asistio ? 'Realizado' : 'No asistió') : 'Sin confirmar'}
          </strong></span>
          <span className={pago.pagado ? 'text-emerald-300' : 'text-zinc-400'}>{pago.pagado ? 'Pagado' : 'Pendiente de pago'}</span>
        </div>
        {esAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <label className="flex items-center gap-1.5 text-zinc-300">
              <input type="checkbox" checked={pago.asistio === true} onChange={e => guardarPagoMiembro(boloActual.id, persona, tipo, 'asistio', e.target.checked)} />
              Asistió
            </label>
            <label className="flex items-center gap-1.5 text-zinc-300">
              <input type="checkbox" checked={pago.pagado === true} onChange={e => guardarPagoMiembro(boloActual.id, persona, tipo, 'pagado', e.target.checked)} />
              Pagado
            </label>
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
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans pb-32 selection:bg-green-500 selection:text-black">
      
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
            <button onClick={() => { setPestañaActiva('landing'); setBoloSeleccionadoId(null); }} className={`p-2.5 rounded-xl border transition ${pestañaActiva === 'landing' ? 'bg-green-500 text-black border-green-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
              <Home className="w-4 h-4"/>
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
            <div className="bg-gradient-to-r from-green-950/60 via-zinc-900 to-black border border-green-500/30 rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <span className="bg-green-500/20 text-green-400 text-xs font-black px-3 py-1 rounded-full uppercase border border-green-500/30">
                  En directo en la nube ☁️
                </span>
                <h2 className="text-3xl sm:text-4xl tracking-wide text-white mt-3" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                  Bienvenido a la app de gestión de Sarao
                </h2>
                <p className="text-zinc-300 text-sm mt-1 max-w-xl">
                  {esAdmin 
                    ? 'Modo Administrador: control de bolos, ensayos, presupuestos en curso, bote, plantilla y facturación.' 
                    : esGestorBolos
                      ? 'Rol Bolos activo: puedes gestionar el calendario, ensayos, vestuario y bolos presupuestados.'
                      : 'Calendario de bolos, ensayos, confirmación de asistencia, plazas en coches, bote y facturas.'}
                </p>
              </div>
            </div>

            {/* CARRUSEL DESLIZABLE HORIZONTAL: SOLO PRÓXIMOS BOLOS CONFIRMADOS Y VIGENTES */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-green-400"/> Próximos Bolos
                </h3>
                <span className="text-xs text-zinc-500">Desliza &rarr;</span>
              </div>

              {proximosBolosConfirmados.length === 0 ? (
                <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 text-center text-xs text-zinc-500">
                  No hay próximos bolos confirmados pendientes a partir de hoy.
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-zinc-700">
                  {proximosBolosConfirmados.map(b => {
                    const dispMiembro = usuarioActual.disponibilidadBolos?.[b.id]?.estado;
                    const vest = OPCIONES_VESTUARIO.find(v => v.id === b.vestuario) || OPCIONES_VESTUARIO[0];
                    const numConfirmados = miembros.filter(m => m.disponibilidadBolos?.[b.id]?.estado === 'puedo').length + (b.musicosExtras?.length || 0);

                    return (
                      <div
                        key={b.id}
                        onClick={() => seleccionarBolo(b.id)}
                        className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-zinc-900 border border-zinc-800 hover:border-green-500/70 rounded-3xl p-5 cursor-pointer transition shadow-xl hover:scale-[1.02] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-xs font-black px-3 py-1 rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
                              📅 {b.fecha}
                            </span>

                            {dispMiembro && (
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                dispMiembro === 'puedo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                                dispMiembro === 'tal_vez' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                                'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              }`}>
                                {dispMiembro === 'puedo' ? 'Confirmado' : dispMiembro === 'tal_vez' ? 'En duda' : 'No vas'}
                              </span>
                            )}
                          </div>

                          <h4 className="text-2xl font-black text-white tracking-wide mt-1 line-clamp-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                            {b.lugar}
                          </h4>
                          {b.titulo && (
                            <p className="text-xs font-semibold mt-0.5 text-green-300">
                              {b.titulo}
                            </p>
                          )}

                          <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
                            <p className="flex items-center gap-1.5 text-zinc-400">
                              <Clock className="w-3.5 h-3.5 text-green-400"/> Horario: <strong className="text-white">{b.horaInicio || '13:00h'} - {b.horaFin || '17:00h'}</strong>
                            </p>
                            <p className="flex items-center gap-1.5 text-zinc-400">
                              <Shirt className="w-3.5 h-3.5 text-amber-400"/> Ropa: <strong className="text-zinc-200">{vest.label}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between items-center">
                          <span className="text-[11px] font-bold text-zinc-400">
                            👥 <strong className="text-emerald-400">{numConfirmados}</strong> en plantilla
                          </span>
                          <span className="text-xs font-bold flex items-center gap-1 text-green-400">
                            Ver detalles &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ACCESOS DIRECTOS */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div onClick={() => setPestañaActiva('bolos')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-green-500/20 text-green-400 rounded-2xl w-fit mb-3"><CalendarIcon className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Calendario General</h3>
                  <p className="text-xs text-zinc-400 mt-1">Confirmados (verde), presupuestos (amarillo) y ensayos (azul).</p>
                </div>
                <span className="text-xs font-bold text-green-400 mt-4 block">&rarr; Ver calendario</span>
              </div>

              <div onClick={() => setPestañaActiva('ensayos')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-cyan-500/30 hover:border-cyan-400 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl w-fit mb-3"><Music className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Ensayos</h3>
                  <p className="text-xs text-zinc-400 mt-1">Lugar, horario y repertorio de los ensayos fijados.</p>
                </div>
                <span className="text-xs font-bold text-cyan-400 mt-4 block">&rarr; Ver ensayos ({listaEnsayos.length})</span>
              </div>

              <div onClick={() => setPestañaActiva('presupuestos')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-amber-500/30 hover:border-amber-400 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl w-fit mb-3"><ClipboardList className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Bolos Presupuestados</h3>
                  <p className="text-xs text-zinc-400 mt-1">Presupuestos enviados pendientes de confirmar o rechazar.</p>
                </div>
                <span className="text-xs font-bold text-amber-400 mt-4 block">&rarr; Pendientes ({bolosPresupuestados.length})</span>
              </div>

              <div onClick={() => setPestañaActiva('miembros')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 rounded-2xl w-fit mb-3"><Users className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Plantilla</h3>
                  <p className="text-xs text-zinc-400 mt-1">Integrantes y asignación de roles.</p>
                </div>
                <span className="text-xs font-bold text-fuchsia-400 mt-4 block">&rarr; Ver plantilla ({miembros.length})</span>
              </div>

              <button type="button" onClick={() => setPestañaActiva('perfil')} className="text-left bg-zinc-900/90 hover:bg-zinc-900 border border-emerald-500/30 hover:border-emerald-400 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit mb-3"><Wallet className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Ficha Personal</h3>
                  <p className="text-xs text-zinc-400 mt-1">Tus bolos realizados, pagos, gasolina y kilómetros.</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 mt-4 block">&rarr; Ver resumen</span>
              </button>

              <div onClick={() => setPestañaActiva('bote')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit mb-3"><Wallet className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Bote</h3>
                  <p className="text-xs text-zinc-400 mt-1">Tesorería y kilometraje (0,20€/km).</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 mt-4 block">&rarr; Saldo ({saldoTotal.toFixed(2)} €)</span>
              </div>

              <div onClick={() => setPestañaActiva('facturas')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-cyan-500/30 hover:border-cyan-400 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl w-fit mb-3"><FileText className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Facturas</h3>
                  <p className="text-xs text-zinc-400 mt-1">Subir PDFs/fotos y control de facturación.</p>
                </div>
                <span className="text-xs font-bold text-cyan-400 mt-4 block">&rarr; Mi total: {miTotalFacturado.toFixed(2)} €</span>
              </div>

              {esAdmin && (
                <div onClick={() => setPestañaActiva('admin')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-rose-500/40 hover:border-rose-500 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl w-fit mb-3"><Shield className="w-6 h-6"/></div>
                    <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Panel Admin</h3>
                    <p className="text-xs text-zinc-400 mt-1">Estadísticas, roles y correo de facturas.</p>
                  </div>
                  <span className="text-xs font-bold text-rose-400 mt-4 block">&rarr; Gestionar</span>
                </div>
              )}
            </div>
          </div>
        )}

        {pestañaActiva === 'perfil' && (
          <section className="space-y-5">
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
                    const perdido = pago.asistenciaRegistrada && pago.asistio === false;
                    const pagado = pago.asistio === true && pago.pagado === true;
                    return (
                      <button key={bolo.id} onClick={() => seleccionarBolo(bolo.id)} className={`snap-start shrink-0 w-48 text-left p-3.5 rounded-xl border transition ${perdido ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' : pagado ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-black/50 border-zinc-700 text-zinc-100'}`}>
                        <span className={`block text-[10px] font-bold ${perdido ? 'line-through decoration-rose-400/70' : ''}`}>{bolo.fecha}</span>
                        <span className={`block mt-1 font-black truncate ${perdido ? 'line-through decoration-rose-400/70' : ''}`}>{bolo.lugar}</span>
                        <span className={`block mt-2 text-[10px] font-bold ${perdido ? 'text-rose-300' : pagado ? 'text-emerald-300' : 'text-zinc-400'}`}>
                          {perdido ? 'No asistió' : pagado ? 'Pagado' : pago.asistio === true ? 'Realizado · pendiente' : 'Sin confirmar'}
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

              <div className={`grid grid-cols-2 ${esPerfilExtra ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} border-t border-zinc-800 pt-4 gap-y-4`}>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Bolos realizados</p><p className="text-xl font-black text-white">{resumenPerfil.bolos}</p></div>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Música</p><p className="text-xl font-black text-emerald-300">{resumenPerfil.musica.toFixed(2)} €</p></div>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Gasolina</p><p className="text-xl font-black text-amber-300">{resumenPerfil.gasolina.toFixed(2)} €</p></div>
                <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Kilómetros</p><p className="text-xl font-black text-white">{resumenPerfil.kilometros} km</p></div>
                {esPerfilExtra && (
                  <>
                    <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Total generado</p><p className="text-xl font-black text-white">{(resumenPerfil.musica + resumenPerfil.gasolina).toFixed(2)} €</p></div>
                    <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Pagado</p><p className="text-xl font-black text-emerald-300">{resumenPerfil.pagado.toFixed(2)} €</p></div>
                    <div><p className="text-[10px] uppercase text-zinc-500 font-bold">Pendiente</p><p className="text-xl font-black text-amber-300">{resumenPerfil.pendiente.toFixed(2)} €</p></div>
                  </>
                )}
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

        {/* SECCIÓN: ENSAYOS */}
        {pestañaActiva === 'ensayos' && (
          <div className="space-y-6">
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
        {pestañaActiva === 'presupuestos' && (
          <div className="space-y-6">
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
                      </div>

                      {esGestorBolos ? (
                        <div className="pt-3 border-t border-amber-500/20 flex items-center gap-2">
                          <button
                            onClick={() => abrirModalConfirmarPresupuesto(b)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                            title="Revisar datos y confirmar bolo"
                          >
                            <Check className="w-4 h-4"/> ✓ Confirmar Bolo
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
                <h3 className="text-lg font-black text-white">Confirmar Bolo Presupuestado</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Revisa o modifica cualquier dato (horario, precio final, fecha...) antes de confirmar. Al confirmar, pasará a color <strong>verde</strong> en el calendario y se abrirán las asistencias.
              </p>

              <form onSubmit={confirmarBoloPresupuestadoDefinitivo} className="space-y-3">
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
                    ✓ Confirmar Bolo
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

        {/* PLANTILLA */}
        {pestañaActiva === 'miembros' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                  PLANTILLA DE MÚSICOS ({miembros.length})
                </h2>
                {esAdmin && (
                  <button onClick={() => setPestañaActiva('admin')} className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
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
          <div className="space-y-6">
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
                          const sumaMiembro = facturasMiembro.reduce((acc, f) => acc + (parseFloat(f.importe) || 0), 0);

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
                            📅 {f.fecha} • Enviada a: <strong className="text-zinc-300">{f.enviadaACorreo}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-base font-black text-cyan-400">
                            {parseFloat(f.importe).toFixed(2)} €
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
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={manejarSeleccionArchivoFactura}
                    className="w-full text-xs text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-cyan-500 file:text-black hover:file:bg-cyan-400 bg-black border border-zinc-800 rounded-2xl p-2 cursor-pointer"
                    required
                  />
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

        {/* PANEL ADMIN */}
        {pestañaActiva === 'admin' && esAdmin && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-6">
              
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-3xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    PANEL DE ADMINISTRACIÓN
                  </h2>
                  <p className="text-xs text-zinc-400">Correo de facturación, estadísticas acumuladas y control de deshacer.</p>
                </div>
                <div className="flex items-center gap-2">
                  {historialEstados.length > 0 && (
                    <button
                      onClick={deshacerUltimoCambio}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Undo2 className="w-4 h-4"/> Deshacer ({historialEstados.length})
                    </button>
                  )}
                  <button
                    onClick={exportarEstadisticasExcel}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-4 h-4"/> Exportar CSV
                  </button>
                </div>
              </div>

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
                            .reduce((acc, f) => acc + (parseFloat(f.importe) || 0), 0);

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
          </div>
        )}

        {/* CALENDARIO GENERAL (VERDE = CONFIRMADO, AMARILLO = PRESUPUESTADO, AZUL TURQUESA = ENSAYO) */}
        {pestañaActiva === 'bolos' && (
          <div className="space-y-6">
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
                
                <div className="flex justify-between items-center mb-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setMesIndexActivo(prev => Math.max(0, prev - 1))}
                      disabled={mesIndexActivo === 0}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl text-white"
                      title="Mes anterior"
                    >
                      <ChevronLeft className="w-4 h-4"/>
                    </button>
                    <button
                      onClick={() => setMesIndexActivo(prev => Math.min(MESES_PERMITIDOS.length - 1, prev + 1))}
                      disabled={mesIndexActivo === MESES_PERMITIDOS.length - 1}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-xl text-white"
                      title="Mes siguiente"
                    >
                      <ChevronRight className="w-4 h-4"/>
                    </button>
                    <h3 className="text-base sm:text-lg font-black text-white ml-1">
                      {mesSeleccionado.label}
                    </h3>
                  </div>

                  <select
                    value={mesIndexActivo}
                    onChange={e => setMesIndexActivo(parseInt(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 text-xs text-green-300 font-bold rounded-xl px-2.5 py-2 outline-none focus:border-green-500"
                  >
                    {MESES_PERMITIDOS.map((m, idx) => (
                      <option key={idx} value={idx}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="max-h-[420px] overflow-auto rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-2 scrollbar-thin scrollbar-thumb-zinc-700">
                  <div className="min-w-[680px]">
                    
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
                        const bolosDelDia = bolos.filter(b => b.fecha === fechaStr);
                        const tieneConfirmado = bolosDelDia.some(b => b.estadoBolo !== 'presupuestado' && b.estadoBolo !== 'ensayo');
                        const tienePresupuestado = bolosDelDia.some(b => b.estadoBolo === 'presupuestado');
                        const tieneEnsayo = bolosDelDia.some(b => b.estadoBolo === 'ensayo');
                        const estaSeleccionadoHoy = bolosDelDia.some(b => b.id === boloSeleccionadoId);

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

                            <div className="space-y-1.5 mt-2">
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
                                    className={`p-2 rounded-xl cursor-pointer shadow transition text-left ${
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
                                          🎵 Ensayo
                                        </p>
                                        <p className="text-[10px] font-bold opacity-90 leading-tight mt-0.5 break-words">
                                          📍 {b.lugar}
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-xs font-black leading-tight break-words">
                                          📍 {b.lugar}
                                        </p>
                                        {b.titulo && (
                                          <p className="text-[10px] font-bold opacity-85 leading-tight mt-0.5 break-words">
                                            {b.titulo}
                                          </p>
                                        )}
                                      </>
                                    )}
                                    <p className="text-[10px] font-extrabold mt-1 flex items-center gap-1 bg-black/15 px-1.5 py-0.5 rounded w-fit">
                                      ⏰ {b.horaInicio || '13:00h'}{!esEns && b.horaFin ? ` - ${b.horaFin}` : ''}
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
                                <Check className="w-4 h-4"/> ✓ Confirmar Bolo
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
                          Este bolo aún no ha sido aceptado. En cuanto se confirme con el tick (✓), pasará a color verde y se habilitará la votación de asistencia, coches y vestuario.
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

                  const dispoPuedo = miembros.filter(m => m.disponibilidadBolos?.[boloActual.id]?.estado === 'puedo');
                  const dispoTalVez = miembros.filter(m => m.disponibilidadBolos?.[boloActual.id]?.estado === 'tal_vez');
                  const dispoNo = miembros.filter(m => m.disponibilidadBolos?.[boloActual.id]?.estado === 'no');
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
                                    </div>
                                    {puedeGestionarEste && (
                                      <button 
                                        onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)} 
                                        className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-xl transition"
                                        title={`Descartar a ${m.nombre}`}
                                      >
                                        <Trash2 className="w-4 h-4"/>
                                      </button>
                                    )}
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
                                    {puedeGestionarEste && (
                                      <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)} className="text-rose-400 p-1.5"><Trash2 className="w-4 h-4"/></button>
                                    )}
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
                                      <p className="font-bold text-sm text-zinc-100">{m.nombre}</p>
                                    </div>
                                    {puedeGestionarEste && (
                                      <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)} className="text-rose-400 p-1.5"><Trash2 className="w-4 h-4"/></button>
                                    )}
                                  </div>
                                );
                              })}
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
                await guardarEnNube(null, nuevosBolos, null);
              }} className="space-y-3">

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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`bg-zinc-900 border rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto ${
              tipoCreacionEvento === 'ensayo' 
                ? 'border-cyan-400/50' 
                : tipoCreacionEvento === 'presupuestado' 
                  ? 'border-amber-500/50' 
                  : 'border-green-500/40'
            }`}>
              <h3 className="text-lg font-black text-white mb-1">
                {tipoCreacionEvento === 'ensayo'
                  ? 'Añadir Nuevo Ensayo'
                  : tipoCreacionEvento === 'presupuestado'
                    ? 'Añadir Nuevo Presupuesto de Bolo'
                    : 'Añadir Nuevo Bolo'}
              </h3>
              <p className="text-xs text-zinc-400 mb-3">
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
                await guardarEnNube(null, nuevosBolos, null);
              }} className="space-y-3">

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
          <div className="space-y-6">
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
                      onClick={() => setTipoMovimientoBote('ingreso')}
                      className={`py-2 text-xs font-bold rounded-xl border ${tipoMovimientoBote === 'ingreso' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-black border-zinc-800 text-zinc-400'}`}
                    >
                      + Ingreso (Cobro)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoMovimientoBote('gasto')}
                      className={`py-2 text-xs font-bold rounded-xl border ${tipoMovimientoBote === 'gasto' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-black border-zinc-800 text-zinc-400'}`}
                    >
                      - Gasto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">Concepto:</label>
                  <input
                    type="text"
                    placeholder="Ej: Cobro Pasacalles o Compra Repuestos"
                    value={conceptoBote}
                    onChange={e => setConceptoBote(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">Importe en Euros (€):</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 1200"
                    value={importeBote}
                    onChange={e => setImporteBote(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
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

      </main>

      {/* BARRA INFERIOR */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/95 border border-green-500/30 px-2.5 py-2 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-1 z-40 max-w-[96vw] overflow-x-auto">
        {[
          { id: 'landing', label: 'Inicio', icon: Home },
          { id: 'bolos', label: 'Bolos', icon: CalendarIcon },
          { id: 'perfil', label: 'Mi ficha', icon: Wallet },
          { id: 'ensayos', label: 'Ensayos', icon: Music },
          { id: 'presupuestos', label: 'Presupuestos', icon: ClipboardList },
          { id: 'miembros', label: 'Plantilla', icon: Users },
          { id: 'bote', label: 'Bote', icon: Wallet },
          { id: 'facturas', label: 'Facturas', icon: FileText },
          ...(esAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
        ].map(tab => {
          const Icon = tab.icon;
          const activa = pestañaActiva === tab.id;
          return (
            <button key={tab.id} onClick={() => { setPestañaActiva(tab.id); if (tab.id !== 'bolos') setBoloSeleccionadoId(null); }} className={`flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl text-xs font-black transition shrink-0 ${activa ? 'bg-green-500 text-black shadow-lg scale-105' : 'text-zinc-400 hover:text-white'}`}>
              <Icon className="w-4 h-4"/>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
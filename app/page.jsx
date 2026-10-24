"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Car, Users, Wallet, Shield, MapPin, 
  Plus, Music, Fuel, Check, Key, UserPlus, Trash2, Shirt, Home, 
  Clock, AlertCircle, ChevronLeft, ChevronRight, BarChart3, Download, 
  Undo2, FileText, Edit3, Upload, Mail, Eye, Loader2, ClipboardList, 
  XCircle, UserCheck, LogOut, Award
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

const MESES_PERMITIDOS = [];
for (let anio = 2026; anio <= 2028; anio++) {
  const mesInicio = anio === 2026 ? 8 : 0;
  for (let mes = mesInicio; mes <= 11; mes++) {
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
  const [mesIndexActivo, setMesIndexActivo] = useState(0);

  // Modales Bolos
  const [showModalBolo, setShowModalBolo] = useState(false);
  const [tipoCreacionEvento, setTipoCreacionEvento] = useState('confirmado');
  const [showModalEditarBolos, setShowModalEditarBolos] = useState(false);
  const [boloEditandoId, setBoloEditandoId] = useState(null);
  const [showModalEliminarBolos, setShowModalEliminarBolos] = useState(false);

  // Modal Ensayos
  const [showModalEnsayo, setShowModalEnsayo] = useState(false);
  const [ensayoEditandoId, setEnsayoEditandoId] = useState(null);
  const [lugarEnsayo, setLugarEnsayo] = useState('');
  const [fechaEnsayo, setFechaEnsayo] = useState('');
  const [horaEnsayo, setHoraEnsayo] = useState('');
  const [repertorioEnsayo, setRepertorioEnsayo] = useState('');

  // Modal Confirmación Presupuesto
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

  // Estados Edición
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
  const [nombreExtra, setNombreExtra] = useState('');
  const [charangaExtra, setCharangaExtra] = useState('');
  const [instrumentoExtra, setInstrumentoExtra] = useState('');

  // Trayectos y Plazas de Coches
  const [showModalTrayectoBolo, setShowModalTrayectoBolo] = useState(false);
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

  useEffect(() => {
    const hoy = new Date();
    const idxActual = MESES_PERMITIDOS.findIndex(m => m.anio === hoy.getFullYear() && m.mes === hoy.getMonth());
    if (idxActual !== -1) setMesIndexActivo(idxActual);

    let usuarioLocal = null;
    try {
      const uGuardado = localStorage.getItem('sarao_usuario_actual');
      if (uGuardado) {
        usuarioLocal = JSON.parse(uGuardado);
        setUsuarioActual(usuarioLocal);
        setAutenticado(true);
      }
    } catch (e) { console.error(e); }

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
            musicosExtras: [],
            pagosMiembros: {}
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
    if (historialEstados.length === 0) return;
    const anterior = historialEstados[historialEstados.length - 1];
    setHistorialEstados(prev => prev.slice(0, -1));
    await guardarEnNube(anterior.miembros, anterior.bolos, anterior.movimientosBote, anterior.facturas);
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
  const puedeEditarPagosBolo = esAdmin || esTesorero || esGestorBolos;

  const handleLogin = async (e) => {
    e.preventDefault();
    const pass = passwordInput.trim();
    if (pass !== PASSWORD_CHARANGA && pass !== PASSWORD_ADMIN) return alert('Contraseña incorrecta.');
    if (!nombreRegistro.trim()) return alert('Introduce tu nombre.');

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
    if (datosDisp) nuevaDispUsuario[boloId] = datosDisp;
    else delete nuevaDispUsuario[boloId];

    const usuarioActualizado = { ...usuarioActual, disponibilidadBolos: nuevaDispUsuario };
    setUsuarioActual(usuarioActualizado);
    localStorage.setItem('sarao_usuario_actual', JSON.stringify(usuarioActualizado));

    let listaActualizada = [...miembros];
    const index = listaActualizada.findIndex(
      m => m.id === usuarioActual.id || m.nombre?.trim().toLowerCase() === usuarioActual.nombre?.trim().toLowerCase()
    );
    if (index !== -1) listaActualizada[index] = usuarioActualizado;
    else listaActualizada.push(usuarioActualizado);

    setMiembros(listaActualizada);
    await guardarEnNube(listaActualizada, null, null);
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
  // GESTIÓN DE PAGOS POR BOLO (MÚSICA, COCHE, KM, GASOLINA Y ESTADO COBRADO)
  // =========================================================================

  const actualizarPagoMiembroEnBolo = async (boloId, miembroId, cambios) => {
    if (!puedeEditarPagosBolo) return;
    const nuevosBolos = bolos.map(b => {
      if (b.id !== boloId) return b;
      const pagosActuales = b.pagosMiembros || {};
      const pagoPrevio = pagosActuales[miembroId] || { musica: 0, llevaCoche: false, km: 0, gasolina: 0, pagado: false };
      const nuevoPago = { ...pagoPrevio, ...cambios };

      // Si cambia km o llevaCoche, recalcular gasolina automáticamente a 0.20 €/km
      if ('km' in cambios || 'llevaCoche' in cambios) {
        const kmNum = parseFloat(nuevoPago.km) || 0;
        nuevoPago.gasolina = nuevoPago.llevaCoche ? parseFloat((kmNum * TARIFA_KM).toFixed(2)) : 0;
      }

      return {
        ...b,
        pagosMiembros: {
          ...pagosActuales,
          [miembroId]: nuevoPago
        }
      };
    });
    setBolos(nuevosBolos);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const actualizarPagoExtraEnBolo = async (boloId, extraId, cambios) => {
    if (!puedeEditarPagosBolo) return;
    const nuevosBolos = bolos.map(b => {
      if (b.id !== boloId) return b;
      const nuevosExtras = (b.musicosExtras || []).map(ex => {
        if (ex.id !== extraId) return ex;
        return { ...ex, ...cambios };
      });
      return { ...b, musicosExtras: nuevosExtras };
    });
    setBolos(nuevosBolos);
    await guardarEnNube(null, nuevosBolos, null);
  };

  // =========================================================================
  // UNIRSE / SALIR DE LA RUTA DE UN CONDUCTOR
  // =========================================================================

  const toggleUnirseRutaCoche = async (boloId, cocheId) => {
    const miNombre = usuarioActual.nombre.trim();
    registrarSnapshot();

    const nuevosBolos = bolos.map(b => {
      if (b.id !== boloId) return b;
      const cocheObjetivo = (b.cochesAsignados || []).find(c => c.id === cocheId);
      if (!cocheObjetivo) return b;

      const pasajerosActuales = cocheObjetivo.pasajeros || [];
      const yaEstoy = pasajerosActuales.some(p => p.trim().toLowerCase() === miNombre.toLowerCase());
      const plazasTotales = typeof cocheObjetivo.plazasTotales === 'number' ? cocheObjetivo.plazasTotales : 4;
      const huecosLibres = plazasTotales - pasajerosActuales.length;

      if (!yaEstoy && huecosLibres <= 0) {
        alert('Este coche ya no tiene plazas libres.');
        return b;
      }

      const nuevosCoches = (b.cochesAsignados || []).map(c => {
        const sinMi = (c.pasajeros || []).filter(p => p.trim().toLowerCase() !== miNombre.toLowerCase());
        if (c.id === cocheId) {
          return { ...c, pasajeros: yaEstoy ? sinMi : [...sinMi, miNombre] };
        }
        return { ...c, pasajeros: sinMi };
      });

      return { ...b, cochesAsignados: nuevosCoches };
    });

    setBolos(nuevosBolos);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const quitarPasajeroDeCoche = async (boloId, cocheId, nombrePasajero) => {
    registrarSnapshot();
    const nuevosBolos = bolos.map(b => {
      if (b.id !== boloId) return b;
      const nuevosCoches = (b.cochesAsignados || []).map(c => {
        if (c.id !== cocheId) return c;
        return { ...c, pasajeros: (c.pasajeros || []).filter(p => p !== nombrePasajero) };
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
    if (!editLugarBolo.trim() || !editFechaBolo) return alert('El lugar y la fecha son obligatorios.');

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
  // FUNCIONES DE ENSAYOS Y PRESUPUESTOS
  // =========================================================================

  const abrirModalNuevoEnsayo = () => {
    if (!esGestorBolos) return;
    setEnsayoEditandoId(null);
    setLugarEnsayo(''); setFechaEnsayo(''); setHoraEnsayo(''); setRepertorioEnsayo('');
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
    if (!lugarEnsayo.trim() || !fechaEnsayo || !horaEnsayo.trim()) return alert('Indica lugar, día y hora.');

    registrarSnapshot();
    const nuevosBolos = ensayoEditandoId
      ? bolos.map(b => b.id === ensayoEditandoId ? {
          ...b, titulo: 'Ensayo', lugar: lugarEnsayo.trim(), fecha: fechaEnsayo,
          horaInicio: horaEnsayo.trim(), repertorio: repertorioEnsayo.trim(), estadoBolo: 'ensayo'
        } : b)
      : [...bolos, {
          id: Date.now(), titulo: 'Ensayo', lugar: lugarEnsayo.trim(), fecha: fechaEnsayo,
          horaInicio: horaEnsayo.trim(), horaFin: '', repertorio: repertorioEnsayo.trim(),
          vestuario: 'Por definir', presupuesto: 0, conFactura: false, estadoBolo: 'ensayo',
          cochesAsignados: [], musicosExtras: [], pagosMiembros: {}
        }];

    setBolos(nuevosBolos);
    setShowModalEnsayo(false);
    setEnsayoEditandoId(null);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const eliminarEnsayo = async (ensayoId, ensayoLugar, ensayoFecha) => {
    if (!esGestorBolos) return;
    if (confirm(`¿Eliminar el ensayo en "${ensayoLugar}" (${ensayoFecha})?`)) {
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
    registrarSnapshot();
    const nuevosBolos = bolos.map(b => b.id === presupuestoAConfirmarId ? {
      ...b,
      lugar: editLugarBolo.trim(),
      titulo: editTituloBolo.trim() || 'Actuación',
      fecha: editFechaBolo,
      horaInicio: editHoraInicioBolo,
      horaFin: editHoraFinBolo,
      presupuesto: parseFloat(editPresupuestoBolo) || 0,
      conFactura: editConFacturaBolo,
      estadoBolo: 'confirmado'
    } : b);

    setBolos(nuevosBolos);
    setShowModalConfirmarPresupuesto(false);
    setPresupuestoAConfirmarId(null);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const rechazarBoloPresupuestado = async (boloId, boloLugar) => {
    if (!esGestorBolos) return;
    if (confirm(`¿Rechazar y descartar el presupuesto de "${boloLugar}"?`)) {
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
    if (!puedeEliminarAsistencia(cuerdaMiembro)) return;
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
    if (!nombreExtra.trim() || !instrumentoExtra) return;
    const instObj = INSTRUMENTOS_DISPONIBLES.find(i => i.nombre === instrumentoExtra);
    const cuerdaExtra = instObj?.cuerda || 'Saxos';

    if (!esAdmin && !esGestorBolos && usuarioActual.cuerda !== cuerdaExtra) {
      return alert(`Solo puedes añadir refuerzos para tu cuerda (${usuarioActual.cuerda}).`);
    }

    registrarSnapshot();
    const nuevoExtra = {
      id: Date.now(),
      nombre: nombreExtra.trim(),
      charanga: charangaExtra.trim() || 'Independiente',
      instrumento: instrumentoExtra,
      cuerda: cuerdaExtra,
      agregadoPor: usuarioActual.nombre,
      musica: 0,
      pagado: false
    };

    const nuevosBolos = bolos.map(b => b.id === boloSeleccionadoId ? {
      ...b, musicosExtras: [...(b.musicosExtras || []), nuevoExtra]
    } : b);

    setBolos(nuevosBolos);
    setNombreExtra(''); setCharangaExtra(''); setInstrumentoExtra('');
    setShowModalExtra(false);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const eliminarMusicoExtra = async (extraId, cuerdaExtra, nombreExtra) => {
    if (!puedeEliminarAsistencia(cuerdaExtra)) return;
    if (confirm(`¿Retirar al refuerzo ${nombreExtra} de este bolo?`)) {
      registrarSnapshot();
      const nuevosBolos = bolos.map(b => b.id === boloSeleccionadoId ? {
        ...b, musicosExtras: (b.musicosExtras || []).filter(ex => ex.id !== extraId)
      } : b);
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

  // =========================================================================
  // BOTE Y FACTURAS
  // =========================================================================

  const agregarMovimientoGeneralBote = async (e) => {
    e.preventDefault();
    if (!esTesorero) return;
    const imp = parseFloat(importeBote);
    if (isNaN(imp) || imp <= 0 || !conceptoBote.trim()) return;
    registrarSnapshot();
    const nuevoMov = {
      id: Date.now(),
      concepto: conceptoBote.trim(),
      cantidad: tipoMovimientoBote === 'ingreso' ? imp : -imp,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      tipo: tipoMovimientoBote,
      autor: usuarioActual.nombre,
      verificado: true
    };
    const nuevoBote = [nuevoMov, ...movimientosBote];
    setMovimientosBote(nuevoBote);
    setConceptoBote(''); setImporteBote('');
    setShowModalMovimientoBote(false);
    await guardarEnNube(null, null, nuevoBote);
  };

  const agregarGasolinaConductor = async (e) => {
    e.preventDefault();
    if (!esConductor) return;
    const km = parseFloat(kmGasolina);
    if (isNaN(km) || km <= 0) return;

    const requiereNombreManual = esAdmin && !tieneRolConductor;
    const personaGasto = requiereNombreManual 
      ? conductorGasolinaNombre.trim() 
      : (conductorGasolinaNombre.trim() || usuarioActual.nombre);

    if (!personaGasto) return alert('Indica el conductor.');

    const gastoCalculado = parseFloat((km * TARIFA_KM).toFixed(2));
    registrarSnapshot();

    const nuevoGasto = {
      id: Date.now(),
      concepto: `Gasolina de ${personaGasto} (${km} km × 0,20€/km${destinoGasolina.trim() ? ` - ${destinoGasolina.trim()}` : ''})`,
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
    setKmGasolina(''); setDestinoGasolina(''); setConductorGasolinaNombre('');
    setShowModalGasolina(false);
    await guardarEnNube(null, null, nuevoBote);
  };

  const toggleVerificarMovimientoBote = async (movId) => {
    if (!esTesorero) return;
    registrarSnapshot();
    const nuevoBote = movimientosBote.map(m => m.id === movId ? { ...m, verificado: !(m.verificado !== false) } : m);
    setMovimientosBote(nuevoBote);
    await guardarEnNube(null, null, nuevoBote);
  };

  const eliminarMovimientoBote = async (movId) => {
    if (!esTesorero) return;
    if (confirm('¿Eliminar este movimiento del bote?')) {
      registrarSnapshot();
      const nuevoBote = movimientosBote.filter(m => m.id !== movId);
      setMovimientosBote(nuevoBote);
      await guardarEnNube(null, null, nuevoBote);
    }
  };

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
        if (!isNaN(val) && val > 0.5 && val < 25000 && val !== 20.26 && val !== 20.27) candidatos.push(val);
      }
    }
    return candidatos.length > 0 ? Math.max(...candidatos).toFixed(2) : null;
  };

  const manejarSeleccionArchivoFactura = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoFactura(file);
    setNombreArchivoFactura(file.name);
    if (!conceptoFactura) setConceptoFactura(file.name.replace(/\.[^/.]+$/, ""));
    setAnalizandoFactura(true);
    setMensajeAnalisis('Analizando documento...');

    const readerDataUrl = new FileReader();
    readerDataUrl.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 900;
            let w = img.width, h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
              else { w = Math.round((w * maxDim) / h); h = maxDim; }
            }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            setPreviewArchivoUrl(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.src = result;
        } else {
          setPreviewArchivoUrl(file.size < 600000 ? result : '');
        }
      }
    };
    readerDataUrl.readAsDataURL(file);

    try {
      const importeEnNombre = extraerImporteDeTexto(file.name);
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const rawText = new TextDecoder('iso-8859-1').decode(arrayBuffer);
        const bloquesTexto = (rawText.match(/\(([^()]+)\)/g) || []).map(s => s.slice(1, -1)).join(' ');
        const detectado = extraerImporteDeTexto(bloquesTexto) || extraerImporteDeTexto(rawText) || importeEnNombre;
        if (detectado) {
          setImporteFacturaDetectado(String(detectado));
          setMensajeAnalisis(`✓ Importe detectado: ${detectado} €`);
        } else setMensajeAnalisis('ℹ️ PDF cargado. Confirma el importe abajo.');
      } else if (file.type.startsWith('image/')) {
        if (!window.Tesseract) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            script.onload = resolve; script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        if (window.Tesseract) {
          const { data: { text } } = await window.Tesseract.recognize(file, 'spa');
          const detectado = extraerImporteDeTexto(text) || importeEnNombre;
          if (detectado) {
            setImporteFacturaDetectado(String(detectado));
            setMensajeAnalisis(`✓ Importe detectado por OCR: ${detectado} €`);
          } else setMensajeAnalisis('ℹ️ Imagen lista. Introduce el importe manualmente.');
        }
      }
    } catch (err) {
      setMensajeAnalisis('ℹ️ Documento listo. Introduce el importe abajo.');
    } finally {
      setAnalizandoFactura(false);
    }
  };

  const guardarYEnviarFactura = async (e) => {
    e.preventDefault();
    const imp = parseFloat(String(importeFacturaDetectado).replace(',', '.'));
    if (isNaN(imp) || imp <= 0 || !conceptoFactura.trim()) return;

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
        formData.append('Concepto_Factura', conceptoFactura.trim());
        formData.append('Importe_Facturado', `${imp.toFixed(2)} €`);
        formData.append('_captcha', 'false');
        if (archivoFactura) formData.append('attachment', archivoFactura, archivoFactura.name);
        await fetch(`https://formsubmit.co/${correoFacturacion.trim()}`, { method: 'POST', body: formData });
      } catch (err) { console.error(err); }
    }

    setEnviandoFactura(false);
    setArchivoFactura(null); setPreviewArchivoUrl(''); setNombreArchivoFactura('');
    setConceptoFactura(''); setImporteFacturaDetectado(''); setMensajeAnalisis('');
    setShowModalSubirFactura(false);
  };

  const eliminarFactura = async (factura) => {
    const esMia = factura.usuarioId === usuarioActual.id || factura.usuarioNombre?.toLowerCase() === usuarioActual.nombre?.toLowerCase();
    if (!esMia && !esFacturador && !esAdmin) return;
    if (confirm(`¿Eliminar la factura "${factura.concepto}"?`)) {
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
    alert(`Correo de facturación actualizado.`);
  };

  const abrirModalParaFecha = (fechaStr) => {
    if (!esGestorBolos) return;
    setTipoCreacionEvento('confirmado');
    setNuevaFechaBolo(fechaStr);
    setShowModalBolo(true);
  };

  // CÁLCULO DE TOTALES
  const movimientosContabilizados = movimientosBote.filter(m => m.verificado !== false);
  const totalIngresos = movimientosContabilizados.filter(m => m.cantidad > 0).reduce((acc, m) => acc + m.cantidad, 0);
  const totalGastos = movimientosContabilizados.filter(m => m.cantidad < 0).reduce((acc, m) => acc + Math.abs(m.cantidad), 0);
  const totalPendienteGasolina = movimientosBote.filter(m => m.verificado === false && m.cantidad < 0).reduce((acc, m) => acc + Math.abs(m.cantidad), 0);
  const saldoTotal = totalIngresos - totalGastos;

  const misFacturas = facturas.filter(
    f => f.usuarioId === usuarioActual?.id || f.usuarioNombre?.trim().toLowerCase() === usuarioActual?.nombre?.trim().toLowerCase()
  );
  const miTotalFacturado = misFacturas.reduce((acc, f) => acc + (parseFloat(f.importe) || 0), 0);
  const totalGeneralFacturado = facturas.reduce((acc, f) => acc + (parseFloat(f.importe) || 0), 0);

  const esBoloVigente = (fechaStr) => {
    if (!fechaStr) return false;
    const partes = String(fechaStr).trim().split('-');
    if (partes.length !== 3) return false;
    const fechaBolo = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
    fechaBolo.setHours(0, 0, 0, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaBolo.getTime() >= hoy.getTime();
  };

  const bolosConfirmados = bolos
    .filter(b => b.estadoBolo !== 'presupuestado' && b.estadoBolo !== 'ensayo')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const proximosBolosConfirmados = bolosConfirmados.filter(b => esBoloVigente(b.fecha));
  const bolosPresupuestados = bolos.filter(b => b.estadoBolo === 'presupuestado').sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const listaEnsayos = bolos.filter(b => b.estadoBolo === 'ensayo').sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // AGRUPACIÓN DE BOLOS HECHOS POR CADA EXTRA (PARA EL ADMIN EN FICHA PERSONAL)
  const resumenExtrasAdmin = {};
  bolosConfirmados.forEach(b => {
    (b.musicosExtras || []).forEach(ex => {
      const clave = ex.nombre.trim().toLowerCase();
      if (!resumenExtrasAdmin[clave]) {
        resumenExtrasAdmin[clave] = {
          nombre: ex.nombre,
          charanga: ex.charanga,
          instrumento: ex.instrumento,
          cuerda: ex.cuerda,
          bolosHechos: []
        };
      }
      resumenExtrasAdmin[clave].bolosHechos.push({
        boloId: b.id,
        extraId: ex.id,
        lugar: b.lugar,
        fecha: b.fecha,
        musica: parseFloat(ex.musica) || 0,
        pagado: Boolean(ex.pagado)
      });
    });
  });

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
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
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
        <div className="max-w-md w-full bg-zinc-900 border border-green-500/30 rounded-3xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-green-500/40 bg-black">
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

  const instrumentosParaExtra = (esAdmin || esGestorBolos) 
    ? INSTRUMENTOS_DISPONIBLES 
    : INSTRUMENTOS_DISPONIBLES.filter(i => i.cuerda === usuarioActual.cuerda);

  const listaConductoresPlantilla = miembros.filter(m => m.roles?.includes('conductor'));

  // CÁLCULO DE SUMATORIOS DE LA FICHA PERSONAL DEL USUARIO ACTUAL
  let sumBolosRealizados = 0;
  let sumMusicaUsuario = 0;
  let sumGasolinaUsuario = 0;
  let sumKmUsuario = 0;

  bolosConfirmados.forEach(b => {
    const estadoAsist = usuarioActual.disponibilidadBolos?.[b.id]?.estado;
    const pagoM = b.pagosMiembros?.[usuarioActual.id] || {};
    if (estadoAsist === 'puedo') sumBolosRealizados += 1;
    if (estadoAsist !== 'no') {
      sumMusicaUsuario += parseFloat(pagoM.musica) || 0;
      sumGasolinaUsuario += parseFloat(pagoM.gasolina) || 0;
      sumKmUsuario += parseFloat(pagoM.km) || 0;
    }
  });

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans pb-32 selection:bg-green-500 selection:text-black">
      
      {esAdmin && historialEstados.length > 0 && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={deshacerUltimoCambio}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black px-3 py-2 rounded-2xl shadow-2xl text-xs border border-black/40 transition active:scale-95 animate-bounce"
          >
            <Undo2 className="w-4 h-4"/> Deshacer ({historialEstados.length})
          </button>
        </div>
      )}

      <header className="bg-gradient-to-b from-zinc-900 to-black border-b border-green-500/20 px-4 sm:px-6 py-4 sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-green-500/40 bg-black shrink-0">
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
            <button onClick={cerrarSesion} className="p-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-rose-400 bg-zinc-900 text-xs font-bold">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-3 sm:p-6">

        {/* INICIO / LANDING PAGE */}
        {pestañaActiva === 'landing' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-950/60 via-zinc-900 to-black border border-green-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl">
              <span className="bg-green-500/20 text-green-400 text-xs font-black px-3 py-1 rounded-full uppercase border border-green-500/30">
                En directo en la nube ☁️
              </span>
              <h2 className="text-3xl sm:text-4xl tracking-wide text-white mt-3" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                Bienvenido a la app de gestión de Sarao
              </h2>
              <p className="text-zinc-300 text-sm mt-1 max-w-xl">
                Consulta tus próximos bolos, apúntate a los coches, revisa los ensayos y lleva al día tus cobros en tu Ficha Personal.
              </p>
            </div>

            {/* CARRUSEL DE PRÓXIMOS BOLOS */}
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
                        onClick={() => { setBoloSeleccionadoId(b.id); setPestañaActiva('bolos'); }}
                        className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-zinc-900 border border-zinc-800 hover:border-green-500/70 rounded-3xl p-5 cursor-pointer transition shadow-xl flex flex-col justify-between"
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
                          <h4 className="text-2xl font-black text-white tracking-wide mt-1 truncate" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                            {b.lugar}
                          </h4>
                          {b.titulo && <p className="text-xs font-semibold mt-0.5 text-green-300">{b.titulo}</p>}
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
                          <span className="text-xs font-bold text-green-400">Ver detalles &rarr;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ACCESOS DIRECTOS */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div onClick={() => setPestañaActiva('bolos')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-green-500/20 text-green-400 rounded-2xl w-fit mb-3"><CalendarIcon className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Calendario</h3>
                  <p className="text-xs text-zinc-400 mt-1">Bolos, presupuestos y ensayos.</p>
                </div>
                <span className="text-xs font-bold text-green-400 mt-4 block">&rarr; Abrir calendario</span>
              </div>

              <div onClick={() => setPestañaActiva('ficha')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit mb-3"><Award className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Ficha Personal</h3>
                  <p className="text-xs text-zinc-400 mt-1">Desglose de tus bolos, música, gasolina y km.</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 mt-4 block">&rarr; Generado: {(sumMusicaUsuario + sumGasolinaUsuario).toFixed(2)} €</span>
              </div>

              <div onClick={() => setPestañaActiva('ensayos')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-cyan-500/30 hover:border-cyan-400 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl w-fit mb-3"><Music className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Ensayos</h3>
                  <p className="text-xs text-zinc-400 mt-1">Lugar, horario y repertorio.</p>
                </div>
                <span className="text-xs font-bold text-cyan-400 mt-4 block">&rarr; Ver ensayos ({listaEnsayos.length})</span>
              </div>

              <div onClick={() => setPestañaActiva('presupuestos')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-amber-500/30 hover:border-amber-400 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl w-fit mb-3"><ClipboardList className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Presupuestos</h3>
                  <p className="text-xs text-zinc-400 mt-1">Bolos pendientes de aceptar.</p>
                </div>
                <span className="text-xs font-bold text-amber-400 mt-4 block">&rarr; Pendientes ({bolosPresupuestados.length})</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NUEVA SECCIÓN: FICHA PERSONAL (TABLA DE BOLOS, COBROS, KM Y EXTRAS ADMIN) */}
        {/* ========================================================================= */}
        {pestañaActiva === 'ficha' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-6">
              
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    FICHA PERSONAL DE {usuarioActual.nombre.toUpperCase()}
                  </h2>
                  <div className="flex items-center gap-4 text-[11px] text-zinc-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Bolo Cobrado (Verde)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 inline-block"></span> Pendiente / Sin confirmar (Normal)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> No asiste (Rojo tachado)
                    </span>
                  </div>
                </div>
              </div>

              {/* TABLA PERSONAL DE BOLOS */}
              {bolosConfirmados.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">No hay bolos confirmados registrados todavía.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/60">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase text-zinc-400 bg-zinc-950 border-b border-zinc-800">
                      <tr>
                        <th className="p-3.5">Bolo / Fecha</th>
                        <th className="p-3.5">Asistencia / Estado</th>
                        <th className="p-3.5">Cantidad Música (€)</th>
                        <th className="p-3.5">¿Lleva Coche?</th>
                        <th className="p-3.5">Kilómetros (Km)</th>
                        <th className="p-3.5">Gasolina Cobrada (€)</th>
                        <th className="p-3.5">Total Bolo (€)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70">
                      {bolosConfirmados.map(b => {
                        const estadoAsist = usuarioActual.disponibilidadBolos?.[b.id]?.estado;
                        const noVa = estadoAsist === 'no';
                        const pago = b.pagosMiembros?.[usuarioActual.id] || { musica: 0, llevaCoche: false, km: 0, gasolina: 0, pagado: false };
                        const estaCobrado = Boolean(pago.pagado) && !noVa;
                        const musicaVal = noVa ? 0 : (parseFloat(pago.musica) || 0);
                        const gasVal = noVa ? 0 : (parseFloat(pago.gasolina) || 0);
                        const kmVal = noVa ? 0 : (parseFloat(pago.km) || 0);

                        return (
                          <tr
                            key={b.id}
                            className={`transition ${
                              noVa
                                ? 'bg-rose-950/30 text-rose-400 line-through decoration-rose-500/80 opacity-75'
                                : estaCobrado
                                  ? 'bg-emerald-500/15 text-emerald-200 font-semibold'
                                  : 'text-zinc-200 hover:bg-zinc-900/60'
                            }`}
                          >
                            <td className="p-3.5">
                              <p className="font-black text-sm">{b.lugar}</p>
                              <span className="text-[10px] opacity-80 block">{b.fecha} • {b.titulo || 'Actuación'}</span>
                            </td>
                            <td className="p-3.5">
                              {noVa ? (
                                <span className="text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40">
                                  No asiste
                                </span>
                              ) : estaCobrado ? (
                                <span className="text-[10px] font-black uppercase bg-emerald-500 text-black px-2.5 py-0.5 rounded-full">
                                  ✓ Cobrado
                                </span>
                              ) : estadoAsist === 'puedo' ? (
                                <span className="text-[10px] font-black uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                                  Asiste (Pendiente cobro)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-zinc-400">
                                  Sin confirmar
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 font-bold">{musicaVal.toFixed(2)} €</td>
                            <td className="p-3.5">{!noVa && pago.llevaCoche ? '🚗 Sí' : 'No'}</td>
                            <td className="p-3.5">{kmVal} km</td>
                            <td className="p-3.5 font-bold">{gasVal.toFixed(2)} €</td>
                            <td className="p-3.5 font-black text-sm">{(musicaVal + gasVal).toFixed(2)} €</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {/* FILA SUMATORIO AL FINAL DE LA LISTA */}
                    <tfoot className="bg-zinc-950 border-t-2 border-green-500/50 text-white font-black text-xs">
                      <tr>
                        <td className="p-4 text-green-400 uppercase">SUMATORIO TOTAL</td>
                        <td className="p-4 text-emerald-400">{sumBolosRealizados} bolo(s) realizados</td>
                        <td className="p-4 text-emerald-300">{sumMusicaUsuario.toFixed(2)} € (Música)</td>
                        <td className="p-4">-</td>
                        <td className="p-4 text-blue-300">{sumKmUsuario.toFixed(1)} km</td>
                        <td className="p-4 text-blue-300">{sumGasolinaUsuario.toFixed(2)} € (Gasolina)</td>
                        <td className="p-4 text-base text-green-400">{(sumMusicaUsuario + sumGasolinaUsuario).toFixed(2)} €</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* TARJETAS RESUMEN DEL SUMATORIO */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Bolos Realizados</span>
                  <p className="text-2xl font-black text-white mt-1">{sumBolosRealizados}</p>
                </div>
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Total Música</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{sumMusicaUsuario.toFixed(2)} €</p>
                </div>
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Total Gasolina</span>
                  <p className="text-2xl font-black text-blue-400 mt-1">{sumGasolinaUsuario.toFixed(2)} €</p>
                </div>
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Km Recorridos</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">{sumKmUsuario.toFixed(1)} km</p>
                </div>
              </div>

              {/* SECCIÓN EXCLUSIVA PARA EL ADMIN DEBAJO DE SU PERFIL: BOLOS HECHOS POR CADA EXTRA */}
              {esAdmin && (
                <div className="pt-6 border-t border-zinc-800 space-y-4">
                  <div>
                    <h3 className="text-2xl tracking-wide text-amber-400" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                      CONTROL DE EXTRAS — BOLOS REALIZADOS Y COBROS (SOLO ADMIN)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Aquí aparece cada músico extra únicamente con los bolos que ha realizado y si los ha cobrado o no.
                    </p>
                  </div>

                  {Object.keys(resumenExtrasAdmin).length === 0 ? (
                    <div className="p-6 bg-black/40 border border-zinc-800 rounded-2xl text-center text-xs text-zinc-500">
                      Todavía no hay músicos extras asignados a ningún bolo confirmado.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {Object.values(resumenExtrasAdmin).map((extraGroup, idx) => {
                        const totalExtra = extraGroup.bolosHechos.reduce((acc, item) => acc + item.musica, 0);
                        return (
                          <div key={idx} className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-start border-b border-zinc-800 pb-2.5">
                              <div>
                                <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                                  Refuerzo • {extraGroup.instrumento}
                                </span>
                                <h4 className="text-base font-black text-white mt-1">{extraGroup.nombre}</h4>
                                <p className="text-[11px] text-zinc-400">Procedencia: {extraGroup.charanga}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 block">Total ({extraGroup.bolosHechos.length} bolos)</span>
                                <span className="text-base font-black text-amber-400">{totalExtra.toFixed(2)} €</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {extraGroup.bolosHechos.map((bh, iBh) => (
                                <div
                                  key={iBh}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                                    bh.pagado
                                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                                      : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                                  }`}
                                >
                                  <div>
                                    <p className="font-bold text-white">📍 {bh.lugar}</p>
                                    <span className="text-[10px] text-zinc-400">📅 {bh.fecha}</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="1"
                                      placeholder="0 €"
                                      value={bh.musica || ''}
                                      onChange={e => actualizarPagoExtraEnBolo(bh.boloId, bh.extraId, { musica: parseFloat(e.target.value) || 0 })}
                                      className="w-16 bg-black border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-bold text-right"
                                      title="Importe del extra en este bolo (€)"
                                    />
                                    <span className="text-xs font-bold">€</span>
                                    <button
                                      type="button"
                                      onClick={() => actualizarPagoExtraEnBolo(bh.boloId, bh.extraId, { pagado: !bh.pagado })}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border transition cursor-pointer ${
                                        bh.pagado
                                          ? 'bg-emerald-500 text-black border-emerald-400'
                                          : 'bg-zinc-800 text-amber-300 border-amber-500/40 hover:bg-emerald-500/20'
                                      }`}
                                    >
                                      {bh.pagado ? '✓ Cobrado' : '⏳ Pendiente'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
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
                    Aparecen automáticamente en el calendario en color <strong>azul turquesa</strong> bajo el título <strong>"Ensayo"</strong>.
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
                              <span>Repertorio: <strong className="text-cyan-200">{ens.repertorio || 'General / Por definir'}</strong></span>
                            </p>
                            <p className="text-[11px] text-zinc-400 pt-1">
                              👥 <strong>{numConfirmados}</strong> confirmado(s)
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-cyan-500/20 flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => { setBoloSeleccionadoId(ens.id); setPestañaActiva('bolos'); }}
                            className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-black py-2 px-3 rounded-xl text-xs text-center transition cursor-pointer"
                          >
                            Ver en Calendario
                          </button>
                          {esGestorBolos && (
                            <>
                              <button onClick={() => abrirModalEditarEnsayo(ens)} className="bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1">
                                <Edit3 className="w-3.5 h-3.5"/> Editar
                              </button>
                              <button onClick={() => eliminarEnsayo(ens.id, ens.lugar, ens.fecha)} className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-black font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1">
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

        {/* MODAL ENSAYO */}
        {showModalEnsayo && esGestorBolos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-cyan-400/50 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-5 h-5 text-cyan-400"/>
                <h3 className="text-lg font-black text-white">{ensayoEditandoId ? 'Editar Ensayo' : 'Añadir Nuevo Ensayo'}</h3>
              </div>
              <form onSubmit={guardarEnsayo} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-cyan-400 block mb-1">Lugar del Ensayo:</label>
                  <input type="text" placeholder="Ej: Local de ensayo..." value={lugarEnsayo} onChange={e => setLugarEnsayo(e.target.value)} className="w-full bg-black border border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Día:</label>
                    <input type="date" value={fechaEnsayo} onChange={e => setFechaEnsayo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Hora:</label>
                    <input type="text" placeholder="Ej: 19:30h" value={horaEnsayo} onChange={e => setHoraEnsayo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Repertorio (Opcional):</label>
                  <textarea rows={3} placeholder="Ej: Temas nuevos..." value={repertorioEnsayo} onChange={e => setRepertorioEnsayo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white" />
                </div>
                <div className="flex gap-2 pt-3">
                  <button type="submit" className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-black font-black py-2.5 rounded-xl text-sm">Guardar Ensayo</button>
                  <button type="button" onClick={() => { setShowModalEnsayo(false); setEnsayoEditandoId(null); }} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
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
                    Bolos a los que se ha enviado presupuesto pero aún no han sido aceptados.
                  </p>
                </div>

                {esGestorBolos && (
                  <button
                    onClick={() => {
                      setTipoCreacionEvento('presupuestado');
                      setNuevoLugarBolo(''); setNuevoTituloBolo(''); setNuevaFechaBolo('');
                      setNuevaHoraInicioBolo(''); setNuevaHoraFinBolo(''); setNuevoPresupuestoBolo('');
                      setNuevoConFacturaBolo(false);
                      setShowModalBolo(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg"
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
                            ⏳ Pendiente
                          </span>
                        </div>
                        <h3 className="text-3xl tracking-wide text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                          📍 {b.lugar}
                        </h3>
                        {b.titulo && <p className="text-xs font-bold text-amber-300 mt-0.5">{b.titulo}</p>}
                        <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-1 text-xs text-zinc-300">
                          <p>⏰ Horario: <strong>{b.horaInicio || 'Por definir'} - {b.horaFin || 'Por definir'}</strong></p>
                          {esGestorBolos && (
                            <p className="text-amber-200 font-bold">
                              💰 Presupuesto: <strong>{b.presupuesto ? `${b.presupuesto} €` : 'Sin especificar'}</strong> ({b.conFactura ? 'Con Factura' : 'Sin Factura'})
                            </p>
                          )}
                        </div>
                      </div>

                      {esGestorBolos && (
                        <div className="pt-3 border-t border-amber-500/20 flex items-center gap-2">
                          <button onClick={() => abrirModalConfirmarPresupuesto(b)} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4"/> ✓ Confirmar Bolo
                          </button>
                          <button onClick={() => rechazarBoloPresupuestado(b.id, b.lugar)} className="flex-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-black border border-rose-500/40 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
                            <XCircle className="w-4 h-4"/> ✕ Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL CONFIRMAR PRESUPUESTO */}
        {showModalConfirmarPresupuesto && esGestorBolos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-emerald-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-2">Confirmar Bolo Presupuestado</h3>
              <form onSubmit={confirmarBoloPresupuestadoDefinitivo} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-emerald-400 block mb-1">Lugar del Bolo:</label>
                  <input type="text" value={editLugarBolo} onChange={e => setEditLugarBolo(e.target.value)} className="w-full bg-black border border-emerald-500/50 rounded-xl px-3.5 py-2 text-sm text-white font-bold" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Tipo de Bolo:</label>
                  <input type="text" value={editTituloBolo} onChange={e => setEditTituloBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Fecha:</label>
                  <input type="date" value={editFechaBolo} onChange={e => setEditFechaBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Inicio (13:00h)" value={editHoraInicioBolo} onChange={e => setEditHoraInicioBolo(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  <input type="text" placeholder="Fin (17:00h)" value={editHoraFinBolo} onChange={e => setEditHoraFinBolo(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-amber-400 block mb-1">Presupuesto final (€):</label>
                  <input type="number" step="0.01" value={editPresupuestoBolo} onChange={e => setEditPresupuestoBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white" />
                </div>
                <div className="flex gap-2 pt-3">
                  <button type="submit" className="flex-1 bg-emerald-500 text-black font-black py-2.5 rounded-xl text-sm">✓ Confirmar Bolo</button>
                  <button type="button" onClick={() => { setShowModalConfirmarPresupuesto(false); setPresupuestoAConfirmarId(null); }} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
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
              </div>

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
                          <button onClick={() => eliminarMiembroPlantilla(m.id)} className="text-rose-400 hover:bg-rose-500/20 p-2 rounded-xl">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        )}
                      </div>

                      {esAdmin && (
                        <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                            <Key className="w-3 h-3"/> Roles:
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
                                  tiene ? 'bg-zinc-100 text-black border-white' : 'bg-black/40 text-zinc-500 border-zinc-800'
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
            </div>
          </div>
        )}

        {/* FACTURAS */}
        {pestañaActiva === 'facturas' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    GESTIÓN DE FACTURAS
                  </h2>
                  <p className="text-xs text-zinc-400">Sube tus facturas en PDF o foto.</p>
                </div>
                <button
                  onClick={() => {
                    setArchivoFactura(null); setPreviewArchivoUrl(''); setNombreArchivoFactura('');
                    setConceptoFactura(''); setImporteFacturaDetectado(''); setMensajeAnalisis('');
                    setShowModalSubirFactura(true);
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <Upload className="w-4 h-4"/> + Subir Factura (PDF / Foto)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/60 border border-cyan-500/30 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-cyan-300 uppercase">Tu Total Facturado ({usuarioActual.nombre})</span>
                  <p className="text-3xl font-black text-white mt-1">{miTotalFacturado.toFixed(2)} €</p>
                </div>
                {(esFacturador || esAdmin) && (
                  <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4">
                    <span className="text-[11px] font-bold text-amber-300 uppercase">Total Global Facturado</span>
                    <p className="text-3xl font-black text-amber-400 mt-1">{totalGeneralFacturado.toFixed(2)} €</p>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {((esFacturador || esAdmin) ? facturas : misFacturas).map(f => (
                  <div key={f.id} className="p-3.5 bg-black/70 border border-zinc-800 rounded-2xl flex justify-between items-center gap-3 text-xs">
                    <div>
                      <span className="font-black text-white text-sm">{f.concepto}</span>
                      <span className="ml-2 bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full text-[10px] font-black">{f.usuarioNombre}</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">📅 {f.fecha} • {f.nombreArchivo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-cyan-400">{parseFloat(f.importe).toFixed(2)} €</span>
                      {f.archivoDataUrl && (
                        <a href={f.archivoDataUrl} download={f.nombreArchivo || 'factura'} target="_blank" rel="noreferrer" className="p-2 bg-zinc-800 text-cyan-300 rounded-xl">
                          <Eye className="w-4 h-4"/>
                        </a>
                      )}
                      <button onClick={() => eliminarFactura(f)} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL SUBIR FACTURA */}
        {showModalSubirFactura && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-2">Subir y Analizar Factura</h3>
              <form onSubmit={guardarYEnviarFactura} className="space-y-4">
                <input type="file" accept="application/pdf,image/*" onChange={manejarSeleccionArchivoFactura} className="w-full text-xs text-zinc-300 bg-black border border-zinc-800 rounded-2xl p-2" required />
                {analizandoFactura && (
                  <div className="p-3 bg-cyan-500/10 rounded-xl flex items-center gap-2 text-xs text-cyan-300">
                    <Loader2 className="w-4 h-4 animate-spin"/> Analizando documento...
                  </div>
                )}
                {!analizandoFactura && mensajeAnalisis && (
                  <div className="p-3 bg-zinc-950 border border-cyan-500/30 rounded-xl text-[11px] text-cyan-300">{mensajeAnalisis}</div>
                )}
                <input type="text" placeholder="Concepto / Proveedor" value={conceptoFactura} onChange={e => setConceptoFactura(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" required />
                <input type="number" step="0.01" placeholder="Importe Total (€)" value={importeFacturaDetectado} onChange={e => setImporteFacturaDetectado(e.target.value)} className="w-full bg-black border border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-base font-black text-white" required />
                <div className="flex gap-2">
                  <button type="submit" disabled={analizandoFactura || enviandoFactura} className="flex-1 bg-cyan-500 text-black font-black py-2.5 rounded-xl text-sm">
                    {enviandoFactura ? 'Enviando...' : 'Registrar y Enviar'}
                  </button>
                  <button type="button" onClick={() => setShowModalSubirFactura(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
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
                <h2 className="text-3xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                  PANEL DE ADMINISTRACIÓN
                </h2>
                <button onClick={exportarEstadisticasExcel} className="bg-emerald-500 text-black font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
                  <Download className="w-4 h-4"/> Exportar CSV
                </button>
              </div>

              <div className="bg-black/60 border border-cyan-500/30 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400"/> Correo de Facturación
                </h3>
                <form onSubmit={guardarCorreoFacturacionAdmin} className="flex flex-col sm:flex-row gap-2">
                  <input type="email" placeholder="ejemplo@charangasarao.com" value={inputCorreoAdmin} onChange={e => setInputCorreoAdmin(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white font-bold" required />
                  <button type="submit" className="bg-cyan-500 text-black font-black text-xs px-5 py-2.5 rounded-xl">Guardar Correo</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CALENDARIO DE BOLOS Y DETALLE DEL BOLO CON APARTADO DE PAGO POR MIEMBRO   */}
        {/* ========================================================================= */}
        {pestañaActiva === 'bolos' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3.5 sm:p-6">
              
              <div className="flex justify-between items-start flex-wrap gap-3 border-b border-zinc-800 pb-4 mb-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    CALENDARIO DE BOLOS Y ENSAYOS
                  </h2>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span> Confirmado</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Presupuestado</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Ensayo</span>
                  </div>
                </div>

                {esGestorBolos && (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
                    <button onClick={() => { setTipoCreacionEvento('confirmado'); setShowModalBolo(true); }} className="flex-1 sm:flex-none justify-center bg-green-500 text-black font-black text-xs px-3 py-2.5 rounded-xl flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5"/> + Añadir
                    </button>
                    <button onClick={() => { setBoloEditandoId(null); setShowModalEditarBolos(true); }} className="flex-1 sm:flex-none justify-center bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs px-3 py-2.5 rounded-xl flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5"/> ✎ Editar
                    </button>
                    <button onClick={() => setShowModalEliminarBolos(true)} className="flex-1 sm:flex-none justify-center bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-xs px-3 py-2.5 rounded-xl flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5"/> - Borrar
                    </button>
                  </div>
                )}
              </div>

              {/* CONTENEDOR DEL CALENDARIO SCROLLEABLE */}
              <div className="bg-black/60 border border-zinc-800 rounded-2xl p-3 sm:p-4 mb-5">
                <div className="flex justify-between items-center mb-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setMesIndexActivo(prev => Math.max(0, prev - 1))} disabled={mesIndexActivo === 0} className="p-2 bg-zinc-800 rounded-xl text-white">
                      <ChevronLeft className="w-4 h-4"/>
                    </button>
                    <button onClick={() => setMesIndexActivo(prev => Math.min(MESES_PERMITIDOS.length - 1, prev + 1))} disabled={mesIndexActivo === MESES_PERMITIDOS.length - 1} className="p-2 bg-zinc-800 rounded-xl text-white">
                      <ChevronRight className="w-4 h-4"/>
                    </button>
                    <h3 className="text-base sm:text-lg font-black text-white ml-1">{mesSeleccionado.label}</h3>
                  </div>

                  <select value={mesIndexActivo} onChange={e => setMesIndexActivo(parseInt(e.target.value))} className="bg-zinc-900 border border-zinc-700 text-xs text-green-300 font-bold rounded-xl px-2.5 py-2">
                    {MESES_PERMITIDOS.map((m, idx) => <option key={idx} value={idx}>{m.label}</option>)}
                  </select>
                </div>

                <div className="max-h-[420px] overflow-auto rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-2">
                  <div className="min-w-[680px]">
                    <div className="grid grid-cols-7 gap-2 text-center text-xs sticky top-0 bg-zinc-950/95 z-20 py-2 border-b border-zinc-800 mb-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                        <div key={d} className="font-black text-zinc-400 uppercase text-[11px]">{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: diaSemanaInicio }, (_, i) => (
                        <div key={`empty-${i}`} className="min-h-[115px] rounded-2xl bg-zinc-900/20 border border-zinc-900/40"></div>
                      ))}

                      {Array.from({ length: totalDiasMes }, (_, i) => {
                        const diaNum = i + 1;
                        const fechaStr = `${mesSeleccionado.anio}-${String(mesSeleccionado.mes + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`;
                        const bolosDelDia = bolos.filter(b => b.fecha === fechaStr);
                        const tieneConfirmado = bolosDelDia.some(b => b.estadoBolo !== 'presupuestado' && b.estadoBolo !== 'ensayo');
                        const tienePresupuestado = bolosDelDia.some(b => b.estadoBolo === 'presupuestado');
                        const tieneEnsayo = bolosDelDia.some(b => b.estadoBolo === 'ensayo');
                        const estaSeleccionadoHoy = bolosDelDia.some(b => b.id === boloSeleccionadoId);

                        return (
                          <div
                            key={diaNum}
                            onClick={() => {
                              if (bolosDelDia.length > 0) setBoloSeleccionadoId(bolosDelDia[0].id);
                              else if (esGestorBolos) abrirModalParaFecha(fechaStr);
                            }}
                            className={`min-h-[115px] p-2.5 rounded-2xl border flex flex-col justify-between transition cursor-pointer ${
                              tieneConfirmado ? 'bg-green-500/15 border-green-500/80' :
                              tienePresupuestado ? 'bg-amber-500/15 border-amber-400/80' :
                              tieneEnsayo ? 'bg-cyan-500/15 border-cyan-400/80' :
                              'bg-zinc-900/70 border-zinc-800/80'
                            } ${estaSeleccionadoHoy ? 'ring-2 ring-white z-10' : ''}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-black text-base text-zinc-200">{diaNum}</span>
                              {esGestorBolos && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); abrirModalParaFecha(fechaStr); }}
                                  className="text-[11px] text-green-400 bg-green-500/20 rounded-lg px-1.5 py-0.5 font-black"
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
                                    onClick={(e) => { e.stopPropagation(); setBoloSeleccionadoId(b.id); }}
                                    className={`p-2 rounded-xl cursor-pointer shadow text-left ${
                                      esEns ? 'bg-cyan-400 text-black' : esPres ? 'bg-amber-400 text-black' : 'bg-green-500 text-black'
                                    }`}
                                  >
                                    <p className="text-xs font-black leading-tight break-words">
                                      {esEns ? '🎵 Ensayo' : `📍 ${b.lugar}`}
                                    </p>
                                    <p className="text-[10px] font-bold opacity-90 leading-tight mt-0.5 break-words">
                                      {esEns ? `📍 ${b.lugar}` : b.titulo}
                                    </p>
                                    <p className="text-[10px] font-extrabold mt-1 bg-black/15 px-1.5 py-0.5 rounded w-fit">
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
                      <div className="bg-amber-500/10 border border-amber-400/50 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-start flex-wrap gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase bg-amber-400 text-black px-2.5 py-1 rounded-full">
                              ⏳ Bolo Presupuestado
                            </span>
                            <h3 className="text-4xl tracking-wide text-white mt-2" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                              📍 {boloActual.lugar}
                            </h3>
                            <p className="text-xs text-zinc-300 mt-2">
                              📅 Fecha: <strong>{boloActual.fecha}</strong> • ⏰ Horario: <strong>{boloActual.horaInicio || 'Por definir'} a {boloActual.horaFin || 'Por definir'}</strong>
                            </p>
                          </div>
                          {esGestorBolos && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => abrirModalConfirmarPresupuesto(boloActual)} className="bg-emerald-500 text-black font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                                <Check className="w-4 h-4"/> ✓ Confirmar Bolo
                              </button>
                              <button onClick={() => rechazarBoloPresupuestado(boloActual.id, boloActual.lugar)} className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                                <XCircle className="w-4 h-4"/> ✕ Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const miDispo = usuarioActual.disponibilidadBolos?.[boloActual.id];

                  if (!miDispo) {
                    return (
                      <div className="bg-black/90 border border-amber-500/50 rounded-2xl p-5 text-center space-y-4">
                        <h3 className="text-3xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                          {esEnsayoActual ? `Ensayo — ${boloActual.lugar}` : boloActual.lugar}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          ⏰ Hora: {boloActual.horaInicio || '13:00h'}{!esEnsayoActual && boloActual.horaFin ? ` a ${boloActual.horaFin}` : ''}
                        </p>
                        {usuarioActual.instrumentos?.length > 1 && (
                          <div className="max-w-xs mx-auto text-left">
                            <label className="text-xs text-zinc-400 block mb-1 font-bold">¿Con qué instrumento tocarás?</label>
                            <select value={instrumentoElegidoBolo || usuarioActual.instrumentos[0]} onChange={e => setInstrumentoElegidoBolo(e.target.value)} className="w-full bg-black border border-green-500 text-green-300 rounded-xl p-2.5 text-xs font-bold">
                              {usuarioActual.instrumentos.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                            </select>
                          </div>
                        )}
                        <div className="flex justify-center gap-2 pt-2">
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'puedo', instrumentoElegidoBolo || usuarioActual.instrumentos[0])} className="px-4 py-2.5 bg-emerald-500 text-black font-black rounded-xl text-xs">🟢 Puedo</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'tal_vez')} className="px-4 py-2.5 bg-amber-500 text-black font-black rounded-xl text-xs">🟡 Tal vez</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'no')} className="px-4 py-2.5 bg-rose-500 text-white font-black rounded-xl text-xs">🔴 No puedo</button>
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
                          <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full uppercase">
                            Tu estado: <strong>{miDispo.estado.replace('_', ' ')}</strong> {miDispo.instrumento && `(${miDispo.instrumento})`}
                          </span>
                          <h3 className="text-4xl tracking-wide text-white mt-2" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                            {esEnsayoActual ? `Ensayo — 📍 ${boloActual.lugar}` : boloActual.lugar}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 mt-2">
                            <span>📅 <strong>{boloActual.fecha}</strong></span>
                            <span>⏰ Hora: <strong>{boloActual.horaInicio || '13:00h'}{!esEnsayoActual && boloActual.horaFin ? ` - ${boloActual.horaFin}` : ''}</strong></span>
                          </div>
                        </div>

                        <button onClick={() => setDisponibilidadBolo(boloActual.id, null)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl">
                          🔄 Cambiar asistencia
                        </button>
                      </div>

                      {!esEnsayoActual && puedeGestionarExtras && (
                        <div className="bg-gradient-to-r from-amber-500/10 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                          <div>
                            <h4 className="text-sm font-black text-amber-400 uppercase flex items-center gap-1.5">
                              <UserPlus className="w-4 h-4"/> Refuerzos y Músicos Extras
                            </h4>
                            <p className="text-xs text-zinc-400 mt-0.5">Añade refuerzos externos para este bolo.</p>
                          </div>
                          <button onClick={() => { setInstrumentoExtra(instrumentosParaExtra[0]?.nombre || 'Saxo alto'); setShowModalExtra(true); }} className="bg-amber-500 text-black font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                            <Plus className="w-4 h-4"/> + Añadir Músico Extra
                          </button>
                        </div>
                      )}

                      {!esEnsayoActual && (
                        <>
                          {/* CARAVANA DE COCHES Y PLAZAS LIBRES */}
                          <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <h4 className="font-bold text-zinc-200 text-xs uppercase flex items-center gap-1.5">
                                <Car className="w-4 h-4 text-blue-400"/> Caravana de Coches y Plazas Libres
                              </h4>
                              {esConductor && (
                                <button onClick={() => { setPlazasTrayecto('4'); setShowModalTrayectoBolo(true); }} className="bg-blue-500 text-black font-black text-[11px] px-3 py-2 rounded-xl">
                                  + Añadir mi Coche y Plazas
                                </button>
                              )}
                            </div>

                            <div className="space-y-3">
                              {boloActual.cochesAsignados && boloActual.cochesAsignados.length > 0 ? (
                                boloActual.cochesAsignados.map(car => {
                                  const pasajeros = car.pasajeros || [];
                                  const plazasTotales = typeof car.plazasTotales === 'number' ? car.plazasTotales : 4;
                                  const huecosLibres = Math.max(0, plazasTotales - pasajeros.length);
                                  const soyConductorDeEsteCoche = car.conductor?.trim().toLowerCase() === usuarioActual.nombre?.trim().toLowerCase();
                                  const estoyUnidoAEsteCoche = pasajeros.some(p => p.trim().toLowerCase() === usuarioActual.nombre?.trim().toLowerCase());

                                  return (
                                    <div key={car.id} className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3 text-xs">
                                      <div className="flex justify-between items-start gap-2 flex-wrap">
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-blue-400 text-sm">🚗 {car.conductor}</span>
                                            <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">{car.vehiculo}</span>
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                              huecosLibres > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                            }`}>
                                              {huecosLibres > 0 ? `${huecosLibres} hueco(s) libre(s)` : 'Completo'}
                                            </span>
                                          </div>
                                          <p className="text-zinc-300 text-[11px] mt-1">
                                            🚩 {car.origen} ({car.horaSalida || '--'}) &rarr; 🏁 {car.destino} ({car.horaLlegada || '--'})
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {!soyConductorDeEsteCoche && (
                                            estoyUnidoAEsteCoche ? (
                                              <button onClick={() => toggleUnirseRutaCoche(boloActual.id, car.id)} className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
                                                <LogOut className="w-3.5 h-3.5"/> Salir
                                              </button>
                                            ) : huecosLibres > 0 && (
                                              <button onClick={() => toggleUnirseRutaCoche(boloActual.id, car.id)} className="bg-emerald-500 text-black font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1">
                                                <UserCheck className="w-3.5 h-3.5"/> + Unirse a ruta
                                              </button>
                                            )
                                          )}
                                          {(esGestorBolos || soyConductorDeEsteCoche) && (
                                            <button onClick={async () => {
                                              registrarSnapshot();
                                              const nuevosBolos = bolos.map(b => b.id === boloActual.id ? { ...b, cochesAsignados: b.cochesAsignados.filter(x => x.id !== car.id) } : b);
                                              setBolos(nuevosBolos);
                                              await guardarEnNube(null, nuevosBolos, null);
                                            }} className="text-rose-400 p-1.5 bg-rose-500/10 rounded-xl">
                                              <Trash2 className="w-4 h-4"/>
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                                        <span className="text-[11px] font-bold text-zinc-400">👥 Pasajeros ({pasajeros.length}/{plazasTotales}):</span>
                                        {pasajeros.length === 0 ? (
                                          <span className="text-[11px] text-zinc-500 italic">Nadie unido aún</span>
                                        ) : (
                                          pasajeros.map((nombrePas, idxP) => (
                                            <span key={idxP} className="bg-blue-500/20 border border-blue-500/40 text-blue-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                                              {nombrePas}
                                              {(esGestorBolos || soyConductorDeEsteCoche) && (
                                                <button type="button" onClick={() => quitarPasajeroDeCoche(boloActual.id, car.id, nombrePas)} className="text-rose-400 font-black ml-1">✕</button>
                                              )}
                                            </span>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-xs text-zinc-500">Ningún conductor ha publicado coche todavía.</p>
                              )}
                            </div>
                          </div>

                          {/* VESTUARIO */}
                          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <Shirt className="w-5 h-5 text-green-400"/>
                              <span className="text-sm font-black text-white">Vestuario: {vestuarioActual.label}</span>
                            </div>
                            {esGestorBolos && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {OPCIONES_VESTUARIO.map(opt => (
                                  <button key={opt.id} onClick={() => cambiarVestuarioBolo(boloActual.id, opt.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${(boloActual.vestuario || 'Por definir') === opt.id ? opt.color + ' ring-2 ring-green-500' : 'bg-black/60 text-zinc-400 border-zinc-800'}`}>
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* ========================================================================= */}
                      {/* LISTA DE CONFIRMADOS CON APARTADO DE PAGO (MÚSICA, COCHE, KM Y GASOLINA)  */}
                      {/* ========================================================================= */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                          🟢 Confirmados y Liquidación del Bolo ({dispoPuedo.length + musicosExtras.length})
                        </h4>

                        <div className="grid sm:grid-cols-2 gap-3">
                          {dispoPuedo.map(m => {
                            const conf = CONFIG_CUERDAS[m.cuerda] || CONFIG_CUERDAS['Saxos'];
                            const dispM = m.disponibilidadBolos?.[boloActual.id];
                            const puedeGestionarEste = puedeEliminarAsistencia(m.cuerda);
                            const pagoM = boloActual.pagosMiembros?.[m.id] || { musica: 0, llevaCoche: false, km: 0, gasolina: 0, pagado: false };

                            return (
                              <div key={m.id} className={`p-4 rounded-2xl border space-y-3 ${pagoM.pagado ? 'bg-emerald-500/15 border-emerald-500/50' : `${conf.bg} ${conf.border}`}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: conf.dot + '22', color: conf.dot }}>
                                      {m.cuerda}
                                    </span>
                                    <p className="font-bold text-sm text-zinc-100 mt-0.5">{m.nombre}</p>
                                    <p className="text-xs text-emerald-300 font-bold">Toca: {dispM?.instrumento || m.instrumentos[0]}</p>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {!esEnsayoActual && (
                                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${pagoM.pagado ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-700'}`}>
                                        {pagoM.pagado ? '✓ Cobrado' : 'Pendiente'}
                                      </span>
                                    )}
                                    {puedeGestionarEste && (
                                      <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)} className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-xl">
                                        <Trash2 className="w-4 h-4"/>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* APARTADO DE PAGO INDIVIDUAL EN EL BOLO */}
                                {!esEnsayoActual && (
                                  <div className="pt-2.5 border-t border-zinc-800/80 space-y-2 text-xs">
                                    {puedeEditarPagosBolo ? (
                                      <>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="text-[10px] text-zinc-400 font-bold block mb-0.5">Cobro Música (€):</label>
                                            <input
                                              type="number"
                                              step="1"
                                              placeholder="0 €"
                                              value={pagoM.musica || ''}
                                              onChange={e => actualizarPagoMiembroEnBolo(boloActual.id, m.id, { musica: parseFloat(e.target.value) || 0 })}
                                              className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[10px] text-zinc-400 font-bold block mb-0.5">Estado del Pago:</label>
                                            <button
                                              type="button"
                                              onClick={() => actualizarPagoMiembroEnBolo(boloActual.id, m.id, { pagado: !pagoM.pagado })}
                                              className={`w-full py-1.5 rounded-lg font-black text-xs border transition cursor-pointer ${
                                                pagoM.pagado
                                                  ? 'bg-emerald-500 text-black border-emerald-400'
                                                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-emerald-400'
                                              }`}
                                            >
                                              {pagoM.pagado ? '✓ Cobrado' : 'Marcar Cobrado'}
                                            </button>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-1">
                                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-blue-300">
                                            <input
                                              type="checkbox"
                                              checked={Boolean(pagoM.llevaCoche)}
                                              onChange={e => actualizarPagoMiembroEnBolo(boloActual.id, m.id, { llevaCoche: e.target.checked })}
                                              className="accent-blue-500 w-3.5 h-3.5"
                                            />
                                            🚗 Llevó coche
                                          </label>

                                          {pagoM.llevaCoche && (
                                            <div className="flex items-center gap-1.5">
                                              <input
                                                type="number"
                                                step="1"
                                                placeholder="Km"
                                                value={pagoM.km || ''}
                                                onChange={e => actualizarPagoMiembroEnBolo(boloActual.id, m.id, { km: parseFloat(e.target.value) || 0 })}
                                                className="w-16 bg-black border border-blue-500/50 rounded-lg px-2 py-1 text-xs text-white font-bold"
                                              />
                                              <span className="text-[10px] text-zinc-400">km =</span>
                                              <span className="text-xs font-black text-blue-400">{(parseFloat(pagoM.gasolina) || 0).toFixed(2)} €</span>
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex justify-between items-center text-[11px] text-zinc-300">
                                        <span>🎵 Música: <strong>{(parseFloat(pagoM.musica) || 0).toFixed(2)} €</strong></span>
                                        {pagoM.llevaCoche && (
                                          <span className="text-blue-300">🚗 Gasolina ({pagoM.km || 0} km): <strong>{(parseFloat(pagoM.gasolina) || 0).toFixed(2)} €</strong></span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* TARJETAS DE MÚSICOS EXTRAS CON SU APARTADO DE PAGO */}
                          {musicosExtras.map(ex => {
                            const conf = CONFIG_CUERDAS[ex.cuerda] || CONFIG_CUERDAS['Saxos'];
                            const puedeGestionarEste = puedeEliminarAsistencia(ex.cuerda);

                            return (
                              <div key={ex.id} className={`p-4 rounded-2xl border space-y-3 ${ex.pagado ? 'bg-emerald-500/15 border-emerald-500/50' : `${conf.bg} border-amber-500/50`}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: conf.dot + '22', color: conf.dot }}>
                                        {ex.cuerda}
                                      </span>
                                      <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                                        Refuerzo
                                      </span>
                                    </div>
                                    <p className="font-bold text-sm text-zinc-100 mt-0.5">{ex.nombre}</p>
                                    <p className="text-xs text-emerald-300 font-bold">Toca: {ex.instrumento} • De: {ex.charanga}</p>
                                  </div>

                                  {puedeGestionarEste && (
                                    <button onClick={() => eliminarMusicoExtra(ex.id, ex.cuerda, ex.nombre)} className="text-rose-400 p-1.5 rounded-xl">
                                      <Trash2 className="w-4 h-4"/>
                                    </button>
                                  )}
                                </div>

                                {!esEnsayoActual && puedeEditarPagosBolo && (
                                  <div className="pt-2.5 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <label className="text-[10px] text-zinc-400 font-bold block mb-0.5">Pago Extra (€):</label>
                                      <input
                                        type="number"
                                        step="1"
                                        placeholder="0 €"
                                        value={ex.musica || ''}
                                        onChange={e => actualizarPagoExtraEnBolo(boloActual.id, ex.id, { musica: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-black border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-zinc-400 font-bold block mb-0.5">Estado:</label>
                                      <button
                                        type="button"
                                        onClick={() => actualizarPagoExtraEnBolo(boloActual.id, ex.id, { pagado: !ex.pagado })}
                                        className={`w-full py-1.5 rounded-lg font-black text-xs border transition cursor-pointer ${
                                          ex.pagado ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                                        }`}
                                      >
                                        {ex.pagado ? '✓ Cobrado' : 'Pendiente'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {dispoTalVez.length > 0 && (
                          <div>
                            <h4 className="font-bold text-amber-400 text-xs uppercase mb-2">🟡 Tal vez ({dispoTalVez.length})</h4>
                            <div className="grid sm:grid-cols-3 gap-2">
                              {dispoTalVez.map(m => (
                                <div key={m.id} className="p-3 rounded-2xl border bg-amber-500/10 border-amber-500/30 flex justify-between">
                                  <span className="font-bold text-xs">{m.nombre} ({m.cuerda})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {dispoNo.length > 0 && (
                          <div>
                            <h4 className="font-bold text-rose-400 text-xs uppercase mb-2">🔴 No pueden ({dispoNo.length})</h4>
                            <div className="grid sm:grid-cols-3 gap-2">
                              {dispoNo.map(m => (
                                <div key={m.id} className="p-3 rounded-2xl border bg-rose-500/10 border-rose-500/30 flex justify-between">
                                  <span className="font-bold text-xs">{m.nombre} ({m.cuerda})</span>
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
                <p className="text-xs text-zinc-500 text-center py-6">Pincha en cualquier bolo o ensayo del calendario para abrir su ficha y pagos.</p>
              )}

            </div>
          </div>
        )}

        {/* MODAL EDITAR BOLOS */}
        {showModalEditarBolos && esGestorBolos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-black text-white mb-3">{boloEditandoId ? 'Modificar Datos' : 'Selecciona un Evento para Editar'}</h3>
              {!boloEditandoId ? (
                <>
                  <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                    {bolos.map(b => (
                      <div key={b.id} className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-black text-white text-base">📍 {b.lugar}</p>
                          <p className="text-zinc-500 text-[10px]">📅 {b.fecha}</p>
                        </div>
                        <button onClick={() => seleccionarBoloParaEditar(b)} className="bg-amber-500/20 text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs">Editar</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowModalEditarBolos(false)} className="w-full bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl text-sm">Cerrar</button>
                </>
              ) : (
                <form onSubmit={guardarEdicionBolo} className="space-y-3">
                  <input type="text" value={editLugarBolo} onChange={e => setEditLugarBolo(e.target.value)} className="w-full bg-black border border-amber-500/50 rounded-xl px-3.5 py-2 text-sm text-white font-bold" required />
                  <input type="text" value={editTituloBolo} onChange={e => setEditTituloBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white" />
                  <input type="date" value={editFechaBolo} onChange={e => setEditFechaBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Inicio" value={editHoraInicioBolo} onChange={e => setEditHoraInicioBolo(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                    <input type="text" placeholder="Fin" value={editHoraFinBolo} onChange={e => setEditHoraFinBolo(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div className="flex gap-2 pt-3">
                    <button type="submit" className="flex-1 bg-amber-500 text-black font-black py-2.5 rounded-xl text-sm">Guardar Cambios</button>
                    <button type="button" onClick={() => setBoloEditandoId(null)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Volver</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL AÑADIR MÚSICO EXTRA */}
        {showModalExtra && boloActual && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-3">Añadir Músico Extra (Refuerzo)</h3>
              <form onSubmit={agregarMusicoExtra} className="space-y-3">
                <input type="text" placeholder="Nombre del Músico" value={nombreExtra} onChange={e => setNombreExtra(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold" required />
                <input type="text" placeholder="Charanga de procedencia" value={charangaExtra} onChange={e => setCharangaExtra(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" required />
                <select value={instrumentoExtra} onChange={e => setInstrumentoExtra(e.target.value)} className="w-full bg-black border border-zinc-800 text-white rounded-xl p-2.5 text-xs font-bold" required>
                  {instrumentosParaExtra.map(inst => <option key={inst.nombre} value={inst.nombre}>{inst.nombre} ({inst.cuerda})</option>)}
                </select>
                <div className="flex gap-2 pt-3">
                  <button type="submit" className="flex-1 bg-amber-500 text-black font-black py-2.5 rounded-xl text-sm">Guardar Extra</button>
                  <button type="button" onClick={() => setShowModalExtra(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR BOLOS */}
        {showModalEliminarBolos && esGestorBolos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-3">Eliminar Evento</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                {bolos.map(b => (
                  <div key={b.id} className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                    <span>📍 {b.lugar} ({b.fecha})</span>
                    <button onClick={() => eliminarBolo(b.id, b.lugar)} className="bg-rose-500/20 text-rose-300 font-bold px-3 py-1.5 rounded-xl">Borrar</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setShowModalEliminarBolos(false)} className="w-full bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl text-sm">Cerrar</button>
            </div>
          </div>
        )}

        {/* MODAL TRAYECTO CONDUCTOR */}
        {showModalTrayectoBolo && boloActual && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-3">Publicar Coche y Huecos Libres</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!origenTrayecto || !destinoTrayecto) return;
                const numPlazas = parseInt(plazasTrayecto, 10) || 4;
                registrarSnapshot();
                const nuevoCar = {
                  id: Date.now(),
                  conductor: usuarioActual.nombre,
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
                setOrigenTrayecto(''); setHoraSalidaOrigen(''); setDestinoTrayecto(''); setHoraLlegadaDestino('');
                setShowModalTrayectoBolo(false);
                await guardarEnNube(null, nuevosBolos, null);
              }} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Vehículo" value={vehiculoTrayecto} onChange={e => setVehiculoTrayecto(e.target.value)} className="col-span-2 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  <input type="number" min="1" max="15" placeholder="Huecos" value={plazasTrayecto} onChange={e => setPlazasTrayecto(e.target.value)} className="bg-black border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white font-black" required />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Lugar Salida" value={origenTrayecto} onChange={e => setOrigenTrayecto(e.target.value)} className="col-span-2 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  <input type="text" placeholder="Hora" value={horaSalidaOrigen} onChange={e => setHoraSalidaOrigen(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Destino Final" value={destinoTrayecto} onChange={e => setDestinoTrayecto(e.target.value)} className="col-span-2 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                  <input type="text" placeholder="Llegada" value={horaLlegadaDestino} onChange={e => setHoraLlegadaDestino(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div className="flex gap-2 pt-3">
                  <button type="submit" className="flex-1 bg-blue-500 text-black font-black py-2.5 rounded-xl text-sm">Publicar Trayecto</button>
                  <button type="button" onClick={() => setShowModalTrayectoBolo(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL AÑADIR EVENTO DESDE CALENDARIO */}
        {showModalBolo && esGestorBolos && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-green-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-3">Añadir Evento al Calendario</h3>
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
                  musicosExtras: [],
                  pagosMiembros: {}
                };
                const nuevosBolos = [...bolos, nuevoBolo];
                setBolos(nuevosBolos);
                setNuevoLugarBolo(''); setNuevoTituloBolo(''); setNuevaFechaBolo('');
                setShowModalBolo(false);
                await guardarEnNube(null, nuevosBolos, null);
              }} className="space-y-3">
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-black rounded-xl border border-zinc-800">
                  <button type="button" onClick={() => setTipoCreacionEvento('confirmado')} className={`py-1.5 rounded-lg text-[11px] font-black ${tipoCreacionEvento === 'confirmado' ? 'bg-green-500 text-black' : 'text-zinc-400'}`}>🟢 Bolo</button>
                  <button type="button" onClick={() => setTipoCreacionEvento('presupuestado')} className={`py-1.5 rounded-lg text-[11px] font-black ${tipoCreacionEvento === 'presupuestado' ? 'bg-amber-400 text-black' : 'text-zinc-400'}`}>🟡 Presupuesto</button>
                  <button type="button" onClick={() => setTipoCreacionEvento('ensayo')} className={`py-1.5 rounded-lg text-[11px] font-black ${tipoCreacionEvento === 'ensayo' ? 'bg-cyan-400 text-black' : 'text-zinc-400'}`}>🔵 Ensayo</button>
                </div>
                <input type="text" placeholder="Lugar" value={nuevoLugarBolo} onChange={e => setNuevoLugarBolo(e.target.value)} className="w-full bg-black border border-green-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold" required />
                {tipoCreacionEvento === 'ensayo' ? (
                  <input type="text" placeholder="Repertorio (Opcional)" value={nuevoRepertorioEnsayo} onChange={e => setNuevoRepertorioEnsayo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                ) : (
                  <input type="text" placeholder="Tipo de Bolo (Opcional)" value={nuevoTituloBolo} onChange={e => setNuevoTituloBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                )}
                <input type="date" value={nuevaFechaBolo} onChange={e => setNuevaFechaBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Hora Inicio (13:00h)" value={nuevaHoraInicioBolo} onChange={e => setNuevaHoraInicioBolo(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  {tipoCreacionEvento !== 'ensayo' && (
                    <input type="text" placeholder="Hora Fin (17:00h)" value={nuevaHoraFinBolo} onChange={e => setNuevaHoraFinBolo(e.target.value)} className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  )}
                </div>
                <div className="flex gap-2 pt-3">
                  <button type="submit" className="flex-1 bg-green-500 text-black font-black py-2.5 rounded-xl text-sm">Guardar</button>
                  <button type="button" onClick={() => setShowModalBolo(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
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
                  <p className="text-xs text-zinc-400">La gasolina queda apuntada y se resta al pulsar el tick de verificación (✓).</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {esConductor && (
                    <button onClick={() => { setConductorGasolinaNombre(tieneRolConductor ? usuarioActual.nombre : ''); setShowModalGasolina(true); }} className="bg-blue-500 text-black font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5">
                      <Fuel className="w-4 h-4"/> Añadir Kilometraje (0,20€/km)
                    </button>
                  )}
                  {esTesorero && (
                    <button onClick={() => setShowModalMovimientoBote(true)} className="bg-amber-500 text-black font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5">
                      <Plus className="w-4 h-4"/> Añadir Movimiento
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Saldo Real Bote</span>
                  <p className={`text-2xl font-black mt-1 ${saldoTotal >= 0 ? 'text-green-400' : 'text-rose-400'}`}>{saldoTotal.toFixed(2)} €</p>
                </div>
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Ingresos</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">+{totalIngresos.toFixed(2)} €</p>
                </div>
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Gastos Pagados (✓)</span>
                  <p className="text-2xl font-black text-rose-400 mt-1">-{totalGastos.toFixed(2)} €</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-amber-300 uppercase">Gasolina Pendiente</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">{totalPendienteGasolina.toFixed(2)} €</p>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto bg-black/60 p-3 rounded-2xl border border-zinc-800">
                {movimientosBote.map(m => {
                  const estaVerificado = m.verificado !== false;
                  return (
                    <div key={m.id} className={`flex justify-between items-center text-xs p-3 rounded-xl border ${estaVerificado ? 'bg-zinc-900/80 border-zinc-800' : 'bg-amber-500/10 border-amber-500/40'}`}>
                      <div>
                        <p className="font-bold text-sm text-white">{m.concepto}</p>
                        <span className="text-[11px] text-zinc-400">{m.fecha} • {m.conductorGasto || m.autor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${!estaVerificado ? 'text-amber-400 line-through' : m.cantidad >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {m.cantidad >= 0 ? `+${m.cantidad.toFixed(2)}` : m.cantidad.toFixed(2)} €
                        </span>
                        {m.cantidad < 0 && esTesorero && (
                          <button onClick={() => toggleVerificarMovimientoBote(m.id)} className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 border ${estaVerificado ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-900 text-zinc-300 border-zinc-700'}`}>
                            <Check className="w-3.5 h-3.5"/> {estaVerificado ? 'Pagado' : 'Verificar'}
                          </button>
                        )}
                        {esTesorero && (
                          <button onClick={() => eliminarMovimientoBote(m.id)} className="text-rose-400 p-1"><Trash2 className="w-4 h-4"/></button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODAL GASOLINA */}
        {showModalGasolina && esConductor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-3">Apuntar Gasolina (0,20 € / km)</h3>
              <form onSubmit={agregarGasolinaConductor} className="space-y-3">
                {esAdmin && (
                  <div className="space-y-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {listaConductoresPlantilla.map(c => (
                        <button type="button" key={c.id} onClick={() => setConductorGasolinaNombre(c.nombre)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${conductorGasolinaNombre === c.nombre ? 'bg-blue-500 text-black' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
                          {c.nombre}
                        </button>
                      ))}
                    </div>
                    <input type="text" placeholder="Nombre del conductor..." value={conductorGasolinaNombre} onChange={e => setConductorGasolinaNombre(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold" required />
                  </div>
                )}
                <input type="number" step="0.1" placeholder="Kilómetros realizados" value={kmGasolina} onChange={e => setKmGasolina(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold" required />
                <input type="text" placeholder="Bolo / Destino (Opcional)" value={destinoGasolina} onChange={e => setDestinoGasolina(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-500 text-black font-black py-2.5 rounded-xl text-sm">Apuntar Gasolina</button>
                  <button type="button" onClick={() => setShowModalGasolina(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL MOVIMIENTO BOTE */}
        {showModalMovimientoBote && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-3">Nuevo Movimiento en el Bote</h3>
              <form onSubmit={agregarMovimientoGeneralBote} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setTipoMovimientoBote('ingreso')} className={`py-2 text-xs font-bold rounded-xl border ${tipoMovimientoBote === 'ingreso' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-black border-zinc-800 text-zinc-400'}`}>+ Ingreso</button>
                  <button type="button" onClick={() => setTipoMovimientoBote('gasto')} className={`py-2 text-xs font-bold rounded-xl border ${tipoMovimientoBote === 'gasto' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-black border-zinc-800 text-zinc-400'}`}>- Gasto</button>
                </div>
                <input type="text" placeholder="Concepto" value={conceptoBote} onChange={e => setConceptoBote(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" required />
                <input type="number" step="0.01" placeholder="Importe (€)" value={importeBote} onChange={e => setImporteBote(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" required />
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-amber-500 text-black font-black py-2.5 rounded-xl text-sm">Guardar</button>
                  <button type="button" onClick={() => setShowModalMovimientoBote(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* BARRA INFERIOR CON LA NUEVA PESTAÑA "FICHA PERSONAL" */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/95 border border-green-500/30 px-2.5 py-2 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-1 z-40 max-w-[96vw] overflow-x-auto">
        {[
          { id: 'landing', label: 'Inicio', icon: Home },
          { id: 'bolos', label: 'Bolos', icon: CalendarIcon },
          { id: 'ficha', label: 'Ficha Personal', icon: Award },
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
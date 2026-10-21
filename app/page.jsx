"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Car, Users, Wallet, Shield, MapPin, 
  Plus, Navigation, Music, Fuel, Settings, Calculator, Check, Key, 
  UserPlus, Trash2, Shirt, ArrowRight, Home, Clock, AlertCircle, 
  ChevronLeft, ChevronRight, BarChart3, Download, Undo2, FileText, Edit3 
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

  const [miembros, setMiembros] = useState([]);
  const [bolos, setBolos] = useState([]);
  const [movimientosBote, setMovimientosBote] = useState([]);

  const [historialEstados, setHistorialEstados] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [pestañaActiva, setPestañaActiva] = useState('landing');
  const [boloSeleccionadoId, setBoloSeleccionadoId] = useState(null);

  // Inicializar en el mes actual del sistema
  const [mesIndexActivo, setMesIndexActivo] = useState(0);

  // Modales Bolos (Añadir, Editar, Eliminar)
  const [showModalBolo, setShowModalBolo] = useState(false);
  const [showModalEditarBolos, setShowModalEditarBolos] = useState(false);
  const [boloEditandoId, setBoloEditandoId] = useState(null);
  const [showModalEliminarBolos, setShowModalEliminarBolos] = useState(false);

  const [nuevoLugarBolo, setNuevoLugarBolo] = useState('');
  const [nuevoTituloBolo, setNuevoTituloBolo] = useState('');
  const [nuevaFechaBolo, setNuevaFechaBolo] = useState('');
  const [nuevaHoraInicioBolo, setNuevaHoraInicioBolo] = useState('');
  const [nuevaHoraFinBolo, setNuevaHoraFinBolo] = useState('');
  const [nuevoPresupuestoBolo, setNuevoPresupuestoBolo] = useState('');
  const [nuevoConFacturaBolo, setNuevoConFacturaBolo] = useState(false);

  // Estados del formulario de Edición de Bolo
  const [editLugarBolo, setEditLugarBolo] = useState('');
  const [editTituloBolo, setEditTituloBolo] = useState('');
  const [editFechaBolo, setEditFechaBolo] = useState('');
  const [editHoraInicioBolo, setEditHoraInicioBolo] = useState('');
  const [editHoraFinBolo, setEditHoraFinBolo] = useState('');
  const [editPresupuestoBolo, setEditPresupuestoBolo] = useState('');
  const [editConFacturaBolo, setEditConFacturaBolo] = useState(false);

  // Modal Músico Extra (Refuerzo)
  const [showModalExtra, setShowModalExtra] = useState(false);
  const [nombreExtra, setNombreExtra] = useState('');
  const [charangaExtra, setCharangaExtra] = useState('');
  const [instrumentoExtra, setInstrumentoExtra] = useState('');

  // Trayectos
  const [showModalTrayectoBolo, setShowModalTrayectoBolo] = useState(false);
  const [vehiculoTrayecto, setVehiculoTrayecto] = useState('');
  const [origenTrayecto, setOrigenTrayecto] = useState('');
  const [horaSalidaOrigen, setHoraSalidaOrigen] = useState('');
  const [paradasIntermedias, setParadasIntermedias] = useState([{ lugar: '', hora: '' }]);
  const [destinoTrayecto, setDestinoTrayecto] = useState('');
  const [horaLlegadaDestino, setHoraLlegadaDestino] = useState('');
  const [instrumentoElegidoBolo, setInstrumentoElegidoBolo] = useState('');

  // Bote y Gasolina (0,20 €/km directo)
  const [showModalMovimientoBote, setShowModalMovimientoBote] = useState(false);
  const [conceptoBote, setConceptoBote] = useState('');
  const [importeBote, setImporteBote] = useState('');
  const [tipoMovimientoBote, setTipoMovimientoBote] = useState('ingreso');

  const [showModalGasolina, setShowModalGasolina] = useState(false);
  const [kmGasolina, setKmGasolina] = useState('');
  const [destinoGasolina, setDestinoGasolina] = useState('');
  const TARIFA_KM = 0.2;

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
        const listaMiembrosRemota = data.miembros || [];
        
        setMiembros(listaMiembrosRemota);
        if (data.bolos) setBolos(data.bolos);
        if (data.movimientosBote) setMovimientosBote(data.movimientosBote);
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
            cochesAsignados: [],
            musicosExtras: []
          }],
          movimientosBote: [{ id: 1, concepto: 'Fondo inicial caja Sarao', cantidad: 0, fecha: 'Inicio', tipo: 'ingreso', autor: 'Admin' }]
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

  const guardarEnNube = async (nuevosMiembros, nuevosBolos, nuevoBote) => {
    try {
      await setDoc(doc(db, 'charanga', 'datos_generales'), {
        miembros: nuevosMiembros ?? miembros,
        bolos: nuevosBolos ?? bolos,
        movimientosBote: nuevoBote ?? movimientosBote
      }, { merge: true });
    } catch (e) {
      console.error("Error guardando en la nube:", e);
      alert("No se pudo sincronizar con Firebase. Asegúrate de haber activado Firestore en 'Modo de prueba' en la consola de Firebase.");
    }
  };

  const registrarSnapshot = () => {
    setHistorialEstados(prev => [
      ...prev.slice(-15),
      {
        miembros: JSON.parse(JSON.stringify(miembros)),
        bolos: JSON.parse(JSON.stringify(bolos)),
        movimientosBote: JSON.parse(JSON.stringify(movimientosBote))
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
    await guardarEnNube(anterior.miembros, anterior.bolos, anterior.movimientosBote);
    alert('Acción revertida correctamente en todos los dispositivos.');
  };

  const esAdmin = usuarioActual?.roles?.includes('admin');
  const esConductor = usuarioActual?.roles?.includes('conductor') || esAdmin;
  const esTesorero = usuarioActual?.roles?.includes('tesorero') || esAdmin;
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
        roles: esAdminAcceso && !existente.roles.includes('admin') ? [...new Set([...existente.roles, 'admin', 'conductor', 'jefe_cuerda'])] : existente.roles
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
      roles: esAdminAcceso ? ['admin', 'conductor', 'jefe_cuerda'] : ['musico'],
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
    if (!esAdmin) return;
    registrarSnapshot();
    const nuevosBolos = bolos.map(b => b.id === boloId ? { ...b, vestuario: nuevoVestuario } : b);
    setBolos(nuevosBolos);
    await guardarEnNube(null, nuevosBolos, null);
  };

  // SELECCIONAR BOLO PARA EDITAR (ADMIN)
  const seleccionarBoloParaEditar = (bolo) => {
    setBoloEditandoId(bolo.id);
    setEditLugarBolo(bolo.lugar || '');
    setEditTituloBolo(bolo.titulo || '');
    setEditFechaBolo(bolo.fecha || '');
    setEditHoraInicioBolo(bolo.horaInicio || '');
    setEditHoraFinBolo(bolo.horaFin || '');
    setEditPresupuestoBolo(bolo.presupuesto ? String(bolo.presupuesto) : '');
    setEditConFacturaBolo(Boolean(bolo.conFactura));
  };

  // GUARDAR CAMBIOS DE EDICIÓN DE BOLO (ADMIN)
  const guardarEdicionBolo = async (e) => {
    e.preventDefault();
    if (!esAdmin || !boloEditandoId) return;
    if (!editLugarBolo.trim() || !editFechaBolo) {
      alert('El lugar y la fecha son obligatorios.');
      return;
    }

    registrarSnapshot();
    const nuevosBolos = bolos.map(b => {
      if (b.id === boloEditandoId) {
        return {
          ...b,
          lugar: editLugarBolo.trim(),
          titulo: editTituloBolo.trim() || 'Actuación',
          fecha: editFechaBolo,
          horaInicio: editHoraInicioBolo,
          horaFin: editHoraFinBolo,
          presupuesto: parseFloat(editPresupuestoBolo) || 0,
          conFactura: editConFacturaBolo
        };
      }
      return b;
    });

    setBolos(nuevosBolos);
    setBoloEditandoId(null);
    setShowModalEditarBolos(false);
    await guardarEnNube(null, nuevosBolos, null);
  };

  const eliminarBolo = async (boloId, boloLugar) => {
    if (!esAdmin) return;
    if (confirm(`¿Eliminar el bolo de "${boloLugar}" definitivamente?`)) {
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
    if (esAdmin) return true;
    if (esJefeCuerda && usuarioActual.cuerda === cuerdaMiembro) return true;
    return false;
  };

  const eliminarDisponibilidadMiembro = async (miembroId, cuerdaMiembro, nombreMiembro) => {
    if (!puedeEliminarAsistencia(cuerdaMiembro)) {
      alert(`Como jefe de cuerda, solo puedes descartar músicos de tu cuerda (${usuarioActual.cuerda}).`);
      return;
    }
    if (confirm(`¿Descartar a ${nombreMiembro} de este bolo?`)) {
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
    if (!nombreExtra.trim() || !instrumentoExtra) {
      alert('Introduce el nombre del músico y su instrumento.');
      return;
    }

    const instObj = INSTRUMENTOS_DISPONIBLES.find(i => i.nombre === instrumentoExtra);
    const cuerdaExtra = instObj?.cuerda || 'Saxos';

    if (!esAdmin && usuarioActual.cuerda !== cuerdaExtra) {
      alert(`Solo puedes añadir refuerzos para tu cuerda (${usuarioActual.cuerda}).`);
      return;
    }

    registrarSnapshot();
    const nuevoExtra = {
      id: Date.now(),
      nombre: nombreExtra.trim(),
      charanga: charangaExtra.trim() || 'Independiente',
      instrumento: instrumentoExtra,
      cuerda: cuerdaExtra,
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
    setNombreExtra('');
    setCharangaExtra('');
    setInstrumentoExtra('');
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
      autor: usuarioActual.nombre
    };
    const nuevoBote = [nuevoMov, ...movimientosBote];
    setMovimientosBote(nuevoBote);
    setConceptoBote('');
    setImporteBote('');
    setShowModalMovimientoBote(false);
    await guardarEnNube(null, null, nuevoBote);
  };

  // NUEVO CÁLCULO DIRECTO DE GASOLINA: KM * 0,20 €
  const agregarGasolinaConductor = async (e) => {
    e.preventDefault();
    if (!esConductor) return;
    const km = parseFloat(kmGasolina);

    if (isNaN(km) || km <= 0) {
      alert('Introduce un número de kilómetros válido.');
      return;
    }

    const gastoCalculado = parseFloat((km * TARIFA_KM).toFixed(2));
    registrarSnapshot();

    const conceptoTexto = `Gasolina ${usuarioActual.nombre} (${km} km x 0,20€/km${destinoGasolina.trim() ? ` - ${destinoGasolina.trim()}` : ''})`;
    const nuevoGasto = {
      id: Date.now(),
      concepto: conceptoTexto,
      cantidad: -gastoCalculado,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      tipo: 'gasto',
      autor: usuarioActual.nombre
    };

    const nuevoBote = [nuevoGasto, ...movimientosBote];
    setMovimientosBote(nuevoBote);
    setKmGasolina('');
    setDestinoGasolina('');
    setShowModalGasolina(false);
    await guardarEnNube(null, null, nuevoBote);
    alert(`Se ha añadido el gasto de gasolina (${gastoCalculado.toFixed(2)} €) al bote.`);
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

  const abrirModalParaFecha = (fechaStr) => {
    if (!esAdmin) return;
    setNuevaFechaBolo(fechaStr);
    setShowModalBolo(true);
  };

  const totalIngresos = movimientosBote.filter(m => m.cantidad > 0).reduce((acc, m) => acc + m.cantidad, 0);
  const totalGastos = movimientosBote.filter(m => m.cantidad < 0).reduce((acc, m) => acc + Math.abs(m.cantidad), 0);
  const saldoTotal = totalIngresos - totalGastos;

  const exportarEstadisticasExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,Músico;Instrumentos;Cuerda;Bolos Confirmados;Total Bolos;Porcentaje (%)\n";
    miembros.forEach(m => {
      const totalBolos = bolos.length;
      const dispoCount = Object.values(m.disponibilidadBolos || {}).filter(v => v?.estado === 'puedo').length;
      const porcentaje = totalBolos > 0 ? Math.round((dispoCount / totalBolos) * 100) : 0;
      csvContent += `${m.nombre};${m.instrumentos.join(', ')};${m.cuerda};${dispoCount};${totalBolos};${porcentaje}%\n`;
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
  const bolosOrdenados = [...bolos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const mesSeleccionado = MESES_PERMITIDOS[mesIndexActivo] || MESES_PERMITIDOS[0];
  const totalDiasMes = new Date(mesSeleccionado.anio, mesSeleccionado.mes + 1, 0).getDate();
  const diaSemanaInicio = (new Date(mesSeleccionado.anio, mesSeleccionado.mes, 1).getDay() + 6) % 7;

  const instrumentosParaExtra = esAdmin 
    ? INSTRUMENTOS_DISPONIBLES 
    : INSTRUMENTOS_DISPONIBLES.filter(i => i.cuerda === usuarioActual.cuerda);

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

      <header className="bg-gradient-to-b from-zinc-900 to-black border-b border-green-500/20 px-6 py-5 sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-green-500/40 bg-black shrink-0">
              <img src="PEGATINAS.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl tracking-wider text-green-400 leading-none" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                  CHARANGA SARAO
                </h1>
                {esAdmin && (
                  <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3"/> Admin
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

      <main className="max-w-5xl mx-auto p-4 sm:p-6">

        {/* INICIO / LANDING PAGE */}
        {pestañaActiva === 'landing' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-950/60 via-zinc-900 to-black border border-green-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <span className="bg-green-500/20 text-green-400 text-xs font-black px-3 py-1 rounded-full uppercase border border-green-500/30">
                  En directo en la nube ☁️
                </span>
                <h2 className="text-3xl sm:text-4xl tracking-wide text-white mt-3" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                  Bienvenido a la app de gestión de Sarao
                </h2>
                <p className="text-zinc-300 text-sm mt-1 max-w-xl">
                  {esAdmin 
                    ? 'Modo Administrador: sincronizado en tiempo real entre ordenadores y teléfonos.' 
                    : esJefeCuerda
                      ? `Jefe de cuerda de ${usuarioActual.cuerda}: gestiona asistencias y añade refuerzos externos.`
                      : 'Calendario de bolos, confirmación de asistencia, coches y bote.'}
                </p>
              </div>
            </div>

            {/* CARRUSEL DESLIZABLE HORIZONTAL */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-green-400"/> Próximos Bolos
                </h3>
                <span className="text-xs text-zinc-500">Desliza para ver más &rarr;</span>
              </div>

              {bolosOrdenados.length === 0 ? (
                <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 text-center text-xs text-zinc-500">
                  No hay bolos programados actualmente.
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-zinc-700">
                  {bolosOrdenados.map(b => {
                    const dispMiembro = usuarioActual.disponibilidadBolos?.[b.id]?.estado;
                    const vest = OPCIONES_VESTUARIO.find(v => v.id === b.vestuario) || OPCIONES_VESTUARIO[0];
                    const numConfirmados = miembros.filter(m => m.disponibilidadBolos?.[b.id]?.estado === 'puedo').length + (b.musicosExtras?.length || 0);

                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setBoloSeleccionadoId(b.id);
                          setPestañaActiva('bolos');
                        }}
                        className="snap-start shrink-0 w-[290px] sm:w-[320px] bg-zinc-900 border border-zinc-800 hover:border-green-500/70 rounded-3xl p-5 cursor-pointer transition shadow-xl hover:scale-[1.02] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-xs font-black bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
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
                            <p className="text-xs text-green-300 font-semibold mt-0.5">
                              {b.titulo}
                            </p>
                          )}

                          <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
                            <p className="flex items-center gap-1.5 text-zinc-400">
                              <Clock className="w-3.5 h-3.5 text-green-400"/> Tocar: <strong className="text-white">{b.horaInicio || '13:00h'} - {b.horaFin || '17:00h'}</strong>
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
                          <span className="text-xs font-bold text-green-400 flex items-center gap-1">
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
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div onClick={() => setPestañaActiva('bolos')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-green-500/20 text-green-400 rounded-2xl w-fit mb-3"><CalendarIcon className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Bolos</h3>
                  <p className="text-xs text-zinc-400 mt-1">Fechas, vestuario, rutas y asistencia.</p>
                </div>
                <span className="text-xs font-bold text-green-400 mt-4 block">&rarr; Ver calendario</span>
              </div>

              <div onClick={() => setPestañaActiva('miembros')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 rounded-2xl w-fit mb-3"><Users className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Plantilla</h3>
                  <p className="text-xs text-zinc-400 mt-1">Integrantes de Sarao.</p>
                </div>
                <span className="text-xs font-bold text-fuchsia-400 mt-4 block">&rarr; Ver plantilla ({miembros.length})</span>
              </div>

              <div onClick={() => setPestañaActiva('bote')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl w-fit mb-3"><Wallet className="w-6 h-6"/></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Bote</h3>
                  <p className="text-xs text-zinc-400 mt-1">Tesorería y kilometraje (0,20€/km).</p>
                </div>
                <span className="text-xs font-bold text-amber-400 mt-4 block">&rarr; Saldo ({saldoTotal.toFixed(2)} €)</span>
              </div>

              {esAdmin && (
                <div onClick={() => setPestañaActiva('admin')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-rose-500/40 hover:border-rose-500 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl w-fit mb-3"><Shield className="w-6 h-6"/></div>
                    <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Panel Admin</h3>
                    <p className="text-xs text-zinc-400 mt-1">Estadísticas y roles.</p>
                  </div>
                  <span className="text-xs font-bold text-rose-400 mt-4 block">&rarr; Gestionar</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PLANTILLA */}
        {pestañaActiva === 'miembros' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
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
                              { id: 'conductor', label: 'Conductor' },
                              { id: 'jefe_cuerda', label: 'Jefe Cuerda' },
                              { id: 'tesorero', label: 'Tesorero' },
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

        {/* PANEL ADMIN */}
        {pestañaActiva === 'admin' && esAdmin && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-3xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    PANEL DE ADMINISTRACIÓN
                  </h2>
                  <p className="text-xs text-zinc-400">Estadísticas acumuladas y control de deshacer acciones.</p>
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

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400"/> Asistencia acumulada de la plantilla
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
                          <th className="p-3">Asistencia</th>
                          <th className="p-3">% Confirmado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
                        {miembros.map(m => {
                          const totalBolos = bolos.length;
                          const siVan = Object.values(m.disponibilidadBolos || {}).filter(v => v?.estado === 'puedo').length;
                          const talVez = Object.values(m.disponibilidadBolos || {}).filter(v => v?.estado === 'tal_vez').length;
                          const pct = totalBolos > 0 ? Math.round((siVan / totalBolos) * 100) : 0;

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

        {/* CALENDARIO DE BOLOS */}
        {pestañaActiva === 'bolos' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              
              {/* CABECERA CON LOS 3 BOTONES SEGUIDOS PARA EL ADMIN: AÑADIR, EDITAR Y ELIMINAR */}
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-800 pb-5 mb-5">
                <div>
                  <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    CALENDARIO DE BOLOS
                  </h2>
                  {esAdmin && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      💡 Consejo: Pincha sobre cualquier día para crear un bolo o usa los botones superiores para editarlos.
                    </p>
                  )}
                </div>
                {esAdmin && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={() => setShowModalBolo(true)} 
                      className="bg-green-500 hover:bg-green-400 text-black font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition"
                    >
                      <Plus className="w-4 h-4"/> + Añadir Bolo
                    </button>
                    <button 
                      onClick={() => {
                        setBoloEditandoId(null);
                        setShowModalEditarBolos(true);
                      }} 
                      className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition"
                    >
                      <Edit3 className="w-4 h-4"/> ✎ Editar Bolo
                    </button>
                    <button 
                      onClick={() => setShowModalEliminarBolos(true)} 
                      className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition"
                    >
                      <Trash2 className="w-4 h-4"/> - Eliminar Bolo
                    </button>
                  </div>
                )}
              </div>

              {/* SELECTOR Y NAVEGACIÓN DE MESES */}
              <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMesIndexActivo(prev => Math.max(0, prev - 1))}
                      disabled={mesIndexActivo === 0}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white"
                      title="Mes anterior"
                    >
                      <ChevronLeft className="w-4 h-4"/>
                    </button>
                    <button
                      onClick={() => setMesIndexActivo(prev => Math.min(MESES_PERMITIDOS.length - 1, prev + 1))}
                      disabled={mesIndexActivo === MESES_PERMITIDOS.length - 1}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white"
                      title="Mes siguiente"
                    >
                      <ChevronRight className="w-4 h-4"/>
                    </button>
                    <h3 className="text-lg font-bold text-white ml-1">
                      {mesSeleccionado.label}
                    </h3>
                  </div>

                  <select
                    value={mesIndexActivo}
                    onChange={e => setMesIndexActivo(parseInt(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 text-xs text-green-300 font-bold rounded-xl px-3 py-1.5 outline-none focus:border-green-500"
                  >
                    {MESES_PERMITIDOS.map((m, idx) => (
                      <option key={idx} value={idx}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Cuadrícula de días */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                    <div key={d} className="font-bold text-zinc-500 py-1">{d}</div>
                  ))}

                  {Array.from({ length: diaSemanaInicio }, (_, i) => (
                    <div key={`empty-${i}`} className="min-h-[80px] rounded-xl bg-zinc-950/20 border border-transparent"></div>
                  ))}

                  {Array.from({ length: totalDiasMes }, (_, i) => {
                    const diaNum = i + 1;
                    const mesFormateado = String(mesSeleccionado.mes + 1).padStart(2, '0');
                    const diaFormateado = String(diaNum).padStart(2, '0');
                    const fechaStr = `${mesSeleccionado.anio}-${mesFormateado}-${diaFormateado}`;
                    const bolosDelDia = bolos.filter(b => b.fecha === fechaStr);

                    return (
                      <div
                        key={diaNum}
                        onClick={() => {
                          if (esAdmin) {
                            abrirModalParaFecha(fechaStr);
                          }
                        }}
                        className={`min-h-[85px] p-1.5 rounded-xl border flex flex-col justify-between transition group relative ${
                          bolosDelDia.length > 0 
                            ? 'bg-green-500/20 border-green-500' 
                            : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                        } ${esAdmin ? 'hover:border-green-400 hover:bg-zinc-900/80 cursor-pointer' : ''}`}
                        title={esAdmin ? `Pincha para añadir un bolo el ${diaNum} de ${mesSeleccionado.label}` : ''}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-bold text-xs ${bolosDelDia.length > 0 ? 'text-green-300' : 'text-zinc-500'}`}>{diaNum}</span>
                          {esAdmin && (
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-green-400 bg-green-500/20 rounded px-1 transition font-bold" title="Añadir bolo">
                              +
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 overflow-y-auto max-h-[55px] mt-1">
                          {bolosDelDia.map(b => (
                            <div
                              key={b.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setBoloSeleccionadoId(b.id);
                              }}
                              className="text-[9px] leading-tight text-green-200 font-black bg-green-500/40 hover:bg-green-500/70 p-1 rounded cursor-pointer truncate shadow-sm transition"
                              title={`${b.lugar}${b.titulo ? ` - ${b.titulo}` : ''}`}
                            >
                              📍 {b.lugar}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DETALLES DEL BOLO SELECCIONADO */}
              {boloActual ? (
                (() => {
                  const miDispo = usuarioActual.disponibilidadBolos?.[boloActual.id];

                  if (!miDispo) {
                    return (
                      <div className="bg-black/90 border border-amber-500/50 rounded-2xl p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                          <AlertCircle className="w-6 h-6"/>
                        </div>
                        <div>
                          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Confirmación de asistencia</p>
                          <h3 className="text-3xl tracking-wide text-white mt-1" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                            {boloActual.lugar}
                          </h3>
                          {boloActual.titulo && (
                            <p className="text-xs text-green-300 font-bold mt-0.5">
                              {boloActual.titulo}
                            </p>
                          )}
                          <p className="text-xs text-zinc-400 mt-1">
                            ⏰ Actuación: {boloActual.horaInicio || '13:00h'} a {boloActual.horaFin || '17:00h'}
                          </p>
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

                        <div className="flex justify-center gap-3 pt-2">
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'puedo', instrumentoElegidoBolo || usuarioActual.instrumentos[0])} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs cursor-pointer transition">🟢 Puedo</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'tal_vez')} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs cursor-pointer transition">🟡 Tal vez</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'no')} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-xl text-xs cursor-pointer transition">🔴 No puedo</button>
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
                      
                      {/* CABECERA DEL BOLO */}
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full uppercase">
                            Tu estado: <strong className="uppercase">{miDispo.estado.replace('_', ' ')}</strong> {miDispo.instrumento && `(${miDispo.instrumento})`}
                          </span>

                          <h3 className="text-4xl tracking-wide text-white mt-2" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                            {boloActual.lugar}
                          </h3>
                          {boloActual.titulo && (
                            <p className="text-sm font-black text-green-400 tracking-wide mt-0.5">
                              {boloActual.titulo}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 mt-2">
                            <span>📅 <strong>{boloActual.fecha}</strong></span>
                            <span>🎺 Actuación: <strong>{boloActual.horaInicio || '13:00h'} - {boloActual.horaFin || '17:00h'}</strong></span>
                            {esAdmin && (
                              <span className="text-[11px] font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                                💰 {boloActual.presupuesto ? `${boloActual.presupuesto} €` : 'Sin presupuesto'} • {boloActual.conFactura ? 'Factura Sí' : 'Sin factura'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, null)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl transition">
                            🔄 Cambiar asistencia
                          </button>
                        </div>
                      </div>

                      {/* AÑADIR MÚSICO EXTRA TRAS CONFIRMAR ASISTENCIA */}
                      {puedeGestionarExtras && (
                        <div className="bg-gradient-to-r from-amber-500/10 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                          <div>
                            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <UserPlus className="w-4 h-4"/> Refuerzos y Músicos Extras
                            </h4>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {esAdmin 
                                ? 'Puedes añadir músicos extras de cualquier instrumento para reforzar este bolo.' 
                                : `Puedes añadir músicos extras de refuerzo para tu cuerda (${usuarioActual.cuerda}).`}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setInstrumentoExtra(instrumentosParaExtra[0]?.nombre || 'Saxo alto');
                              setShowModalExtra(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 shrink-0 transition"
                          >
                            <Plus className="w-4 h-4"/> + Añadir Músico Extra
                          </button>
                        </div>
                      )}

                      {/* Rutas y Caravanas */}
                      <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Car className="w-4 h-4 text-blue-400"/> Caravana de Coches y Rutas
                          </h4>
                          {esConductor && (
                            <button onClick={() => setShowModalTrayectoBolo(true)} className="bg-blue-500 hover:bg-blue-400 text-black font-black text-[11px] px-3 py-1.5 rounded-xl">
                              + Añadir mi Trayecto
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {boloActual.cochesAsignados && boloActual.cochesAsignados.length > 0 ? (
                            boloActual.cochesAsignados.map(car => (
                              <div key={car.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-start text-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-blue-400">{car.conductor}</span>
                                    <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">{car.vehiculo}</span>
                                  </div>
                                  <div className="text-zinc-300 text-[11px] space-y-0.5 pt-1">
                                    <p>🚩 Origen: <strong className="text-white">{car.origen}</strong> {car.horaSalida && <span className="text-blue-300 font-semibold">({car.horaSalida})</span>}</p>
                                    {car.paradas && car.paradas.length > 0 && (
                                      <div className="pl-3 border-l border-zinc-700 space-y-0.5 my-1">
                                        {car.paradas.map((p, pIdx) => (
                                          <p key={pIdx} className="text-zinc-400">
                                            ↳ Parada: <strong className="text-zinc-200">{p.lugar}</strong> {p.hora && <span className="text-amber-300 font-semibold">({p.hora})</span>}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                    <p>🏁 Destino: <strong className="text-white">{car.destino}</strong> {car.horaLlegada && <span className="text-emerald-300 font-semibold">({car.horaLlegada})</span>}</p>
                                  </div>
                                </div>

                                {(esAdmin || car.conductor === usuarioActual.nombre) && (
                                  <button onClick={async () => {
                                    registrarSnapshot();
                                    const nuevosBolos = bolos.map(b => b.id === boloActual.id ? { ...b, cochesAsignados: b.cochesAsignados.filter(x => x.id !== car.id) } : b);
                                    setBolos(nuevosBolos);
                                    await guardarEnNube(null, nuevosBolos, null);
                                  }} className="text-rose-400 hover:text-rose-300 p-1">
                                    <Trash2 className="w-4 h-4"/>
                                  </button>
                                )}
                              </div>
                            ))
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

                        {esAdmin ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">Elegir ropa (Admin):</span>
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
                          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${vestuarioActual.color}`}>
                            {vestuarioActual.label}
                          </div>
                        )}
                      </div>

                      {/* PARTICIPANTES: CONFIRMADOS (MIEMBROS + EXTRAS) */}
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
                                <div key={m.id} className={`p-3 rounded-2xl border flex items-center justify-between ${conf.bg} ${conf.border}`}>
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
                                      title={`Descartar a ${m.nombre} de este bolo`}
                                    >
                                      <Trash2 className="w-4 h-4"/>
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {musicosExtras.map(ex => {
                              const conf = CONFIG_CUERDAS[ex.cuerda] || CONFIG_CUERDAS['Saxos'];
                              const puedeGestionarEste = puedeEliminarAsistencia(ex.cuerda);

                              return (
                                <div key={ex.id} className={`p-3 rounded-2xl border flex items-center justify-between ${conf.bg} border-amber-500/50 shadow-sm relative overflow-hidden`}>
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
                <p className="text-xs text-zinc-500 text-center py-6">Haz clic en un bolo para ver sus detalles o confirmar tu plaza.</p>
              )}

            </div>
          </div>
        )}

        {/* MODAL PARA EDITAR BOLOS (EXCLUSIVO ADMIN) */}
        {showModalEditarBolos && esAdmin && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="w-5 h-5 text-amber-400"/>
                <h3 className="text-lg font-black text-white">
                  {boloEditandoId ? 'Modificar Datos del Bolo' : 'Selecciona un Bolo para Editar'}
                </h3>
              </div>

              {!boloEditandoId ? (
                <>
                  <p className="text-xs text-zinc-400 mb-4">Elige qué bolo quieres modificar (horario, lugar, fecha, presupuesto...):</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                    {bolos.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-4">No hay bolos creados actualmente.</p>
                    ) : (
                      bolos.map(b => (
                        <div key={b.id} className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-black text-white text-base" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>📍 {b.lugar}</p>
                            <p className="text-green-300 text-[11px]">{b.titulo}</p>
                            <p className="text-zinc-500 text-[10px] mt-0.5">📅 {b.fecha} • ⏰ {b.horaInicio || '--'} - {b.horaFin || '--'}</p>
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
                <form onSubmit={guardarEdicionBolo} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-amber-400 block mb-1">Lugar del Bolo (Titular principal):</label>
                    <input
                      type="text"
                      value={editLugarBolo}
                      onChange={e => setEditLugarBolo(e.target.value)}
                      className="w-full bg-black border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">Tipo de Bolo / Descripción:</label>
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
                      <label className="text-[11px] font-bold text-green-400 block mb-1">Hora Inicio Actuación:</label>
                      <input
                        type="text"
                        placeholder="Ej: 13:00h"
                        value={editHoraInicioBolo}
                        onChange={e => setEditHoraInicioBolo(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-green-400 block mb-1">Hora Fin Actuación:</label>
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
                Introduce los datos del músico de refuerzo para el bolo en <strong>{boloActual.lugar}</strong>.
              </p>

              <form onSubmit={agregarMusicoExtra} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Nombre del Músico:</label>
                  <input
                    type="text"
                    placeholder="Ej: Marcos, David..."
                    value={nombreExtra}
                    onChange={e => setNombreExtra(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Charanga / Banda de procedencia:</label>
                  <input
                    type="text"
                    placeholder="Ej: Charanga El Cubata, Banda Municipal..."
                    value={charangaExtra}
                    onChange={e => setCharangaExtra(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Instrumento:</label>
                  <select
                    value={instrumentoExtra}
                    onChange={e => setInstrumentoExtra(e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-white rounded-xl p-2.5 text-xs font-bold outline-none focus:border-amber-400"
                    required
                  >
                    {instrumentosParaExtra.map(inst => (
                      <option key={inst.nombre} value={inst.nombre}>
                        {inst.nombre} ({inst.cuerda})
                      </option>
                    ))}
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

        {/* MODAL ELIMINAR BOLOS (ADMIN) */}
        {showModalEliminarBolos && esAdmin && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="w-5 h-5 text-rose-400"/>
                <h3 className="text-lg font-black text-white">Eliminar Bolo</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">Selecciona el bolo que deseas retirar del calendario.</p>

              <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                {bolos.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">No hay bolos creados actualmente.</p>
                ) : (
                  bolos.map(b => (
                    <div key={b.id} className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-black text-white text-base" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>📍 {b.lugar}</p>
                        <p className="text-green-300 text-[11px]">{b.titulo}</p>
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

        {/* MODAL TRAYECTO CONDUCTOR */}
        {showModalTrayectoBolo && boloActual && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-5 h-5 text-blue-400"/>
                <h3 className="text-lg font-black text-white">Publicar Trayecto en Caravana</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">Indica la salida, paradas intermedias con hora y llegada.</p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!origenTrayecto || !destinoTrayecto) return;
                registrarSnapshot();
                const nuevoCar = {
                  id: Date.now(),
                  conductor: usuarioActual.nombre,
                  vehiculo: vehiculoTrayecto || 'Coche',
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
                setShowModalTrayectoBolo(false);
                await guardarEnNube(null, nuevosBolos, null);
              }} className="space-y-3">
                
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Vehículo:</label>
                  <input type="text" placeholder="Ej: Furgoneta o Coche" value={vehiculoTrayecto} onChange={e => setVehiculoTrayecto(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
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
                    Guardar Trayecto
                  </button>
                  <button type="button" onClick={() => setShowModalTrayectoBolo(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL AÑADIR BOLO */}
        {showModalBolo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-green-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-black text-white mb-3">Añadir Nuevo Bolo</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!nuevoLugarBolo.trim() || !nuevaFechaBolo) return;
                registrarSnapshot();
                const nuevoBolo = {
                  id: Date.now(),
                  lugar: nuevoLugarBolo.trim(),
                  titulo: nuevoTituloBolo.trim() || 'Actuación',
                  fecha: nuevaFechaBolo,
                  horaInicio: nuevaHoraInicioBolo,
                  horaFin: nuevaHoraFinBolo,
                  presupuesto: parseFloat(nuevoPresupuestoBolo) || 0,
                  conFactura: nuevoConFacturaBolo,
                  vestuario: 'Por definir',
                  cochesAsignados: [],
                  musicosExtras: []
                };
                const nuevosBolos = [...bolos, nuevoBolo];
                setBolos(nuevosBolos);
                setNuevoLugarBolo(''); setNuevoTituloBolo(''); setNuevaFechaBolo('');
                setNuevaHoraInicioBolo(''); setNuevaHoraFinBolo('');
                setNuevoPresupuestoBolo(''); setNuevoConFacturaBolo(false);
                setShowModalBolo(false);
                await guardarEnNube(null, nuevosBolos, null);
              }} className="space-y-3">
                
                <div>
                  <label className="text-[11px] font-bold text-green-400 block mb-1">Lugar del Bolo (Titular principal):</label>
                  <input type="text" placeholder="Ej: Cuéllar, Nava de la Asunción, Segovia..." value={nuevoLugarBolo} onChange={e => setNuevoLugarBolo(e.target.value)} className="w-full bg-black border border-green-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none focus:border-green-400" required />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Tipo de Bolo / Descripción (Secundario):</label>
                  <input type="text" placeholder="Ej: Pasacalles y Vermú, Diana floreada, Fiesta de peñas..." value={nuevoTituloBolo} onChange={e => setNuevoTituloBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">Fecha del bolo:</label>
                  <input type="date" value={nuevaFechaBolo} onChange={e => setNuevaFechaBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" required />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800">
                  <div>
                    <label className="text-[11px] font-bold text-green-400 block mb-1">Hora Inicio Actuación:</label>
                    <input type="text" placeholder="Ej: 13:00h" value={nuevaHoraInicioBolo} onChange={e => setNuevaHoraInicioBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-green-400 block mb-1">Hora Fin Actuación:</label>
                    <input type="text" placeholder="Ej: 17:00h" value={nuevaHoraFinBolo} onChange={e => setNuevaHoraFinBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-amber-400 block mb-1">Presupuesto acordado (€):</label>
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
                      <FileText className="w-3.5 h-3.5 text-zinc-400"/> Se cobra con Factura oficial
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button type="submit" className="flex-1 bg-green-500 text-black font-black py-2.5 rounded-xl text-sm">Guardar Bolo</button>
                  <button type="button" onClick={() => setShowModalBolo(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BOTE / TESORERÍA */}
        {pestañaActiva === 'bote' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-800 pb-5 mb-5">
                <div>
                  <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                    BOTE Y FINANZAS SARAO
                  </h2>
                  <p className="text-xs text-zinc-400">Control de ingresos, gastos de eventos y kilometraje (0,20 €/km).</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {esConductor && (
                    <button
                      onClick={() => setShowModalGasolina(true)}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Saldo Actual Bote</span>
                  <p className={`text-2xl font-black mt-1 ${saldoTotal >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                    {saldoTotal.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Ingresos Totales</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    +{totalIngresos.toFixed(2)} €
                  </p>
                </div>
                <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">Gastos Totales</span>
                  <p className="text-2xl font-black text-rose-400 mt-1">
                    -{totalGastos.toFixed(2)} €
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Historial de Movimientos</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto bg-black/60 p-3 rounded-2xl border border-zinc-800">
                  {movimientosBote.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">No hay movimientos registrados.</p>
                  ) : (
                    movimientosBote.map(m => (
                      <div key={m.id} className="flex justify-between items-center text-xs p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800 hover:border-zinc-700">
                        <div>
                          <p className="font-bold text-white text-sm">{m.concepto}</p>
                          <span className="text-[11px] text-zinc-400">
                            {m.fecha} • Por: <strong className="text-zinc-300">{m.autor || 'Desconocido'}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-black text-sm ${m.cantidad >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {m.cantidad >= 0 ? `+${m.cantidad.toFixed(2)}` : m.cantidad.toFixed(2)} €
                          </span>
                          {esTesorero && (
                            <button onClick={() => eliminarMovimientoBote(m.id)} className="text-rose-400 hover:text-rose-300 p-1">
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL GASOLINA SIMPLIFICADO: SOLO KILÓMETROS X 0,20 € */}
        {showModalGasolina && esConductor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="w-5 h-5 text-blue-400"/>
                <h3 className="text-lg font-black text-white">Añadir Gasolina (0,20 € / km)</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Introduce tus kilómetros y la aplicación multiplicará automáticamente por <strong>0,20 €</strong> y lo descontará del bote.
              </p>

              <form onSubmit={agregarGasolinaConductor} className="space-y-3">
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
                    <span className="text-xs text-zinc-300 block">Cálculo automático ({parseFloat(kmGasolina)} km × 0,20 €):</span>
                    <span className="text-lg text-blue-400 font-black">
                      {(parseFloat(kmGasolina) * TARIFA_KM).toFixed(2)} €
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-400 text-black font-black py-2.5 rounded-xl text-sm">
                    Añadir al Bote
                  </button>
                  <button type="button" onClick={() => setShowModalGasolina(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL INGRESOS Y GASTOS (TESORERO Y ADMIN) */}
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

      </main>

      {/* BARRA INFERIOR */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/95 border border-green-500/30 px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-1.5 z-40">
        {[
          { id: 'landing', label: 'Inicio', icon: Home },
          { id: 'bolos', label: 'Bolos', icon: CalendarIcon },
          { id: 'miembros', label: 'Plantilla', icon: Users },
          { id: 'bote', label: 'Bote', icon: Wallet },
          ...(esAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
        ].map(tab => {
          const Icon = tab.icon;
          const activa = pestañaActiva === tab.id;
          return (
            <button key={tab.id} onClick={() => { setPestañaActiva(tab.id); if (tab.id !== 'bolos') setBoloSeleccionadoId(null); }} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black transition ${activa ? 'bg-green-500 text-black shadow-lg scale-105' : 'text-zinc-400 hover:text-white'}`}>
              <Icon className="w-4 h-4"/>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
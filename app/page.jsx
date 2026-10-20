"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Car, Users, Wallet, Shield, MapPin, 
  Plus, Navigation, Music, Fuel, Settings, Calculator, Check, Key, 
  UserPlus, Trash2, Shirt, ArrowRight, Home, Clock, AlertCircle, 
  ChevronLeft, ChevronRight, BarChart3, Download, Undo2 
} from 'lucide-react';

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

export default function CharangaSaraoApp() {
  const [cargado, setCargado] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [nombreRegistro, setNombreRegistro] = useState('');
  const [instrumentosSeleccionados, setInstrumentosSeleccionados] = useState(['Sousafón / Tuba']);
  const PASSWORD_CHARANGA = 'sarao2027';
  const PASSWORD_ADMIN = 'admin2027';

  // Estados persistentes
  const [miembros, setMiembros] = useState([]);
  const [bolos, setBolos] = useState([
    {
      id: 1,
      titulo: 'PASACALLES Y VERMÚ EN CUÉLLAR',
      lugar: 'Plaza Mayor, Cuéllar',
      fecha: '2027-08-15',
      horarioSalida: '11:30h',
      horarioActuacion: '13:00h - 17:00h',
      vestuario: 'Camiseta negra',
      presupuesto: 1200,
      cochesAsignados: []
    }
  ]);
  const [movimientosBote, setMovimientosBote] = useState([
    { id: 1, concepto: 'Fondo inicial caja Sarao', cantidad: 0, fecha: 'Inicio', tipo: 'ingreso', autor: 'Admin' }
  ]);

  // Historial para Deshacer
  const [historialEstados, setHistorialEstados] = useState([]);

  const [usuarioActual, setUsuarioActual] = useState(null);
  const [pestañaActiva, setPestañaActiva] = useState('landing');
  const [boloSeleccionadoId, setBoloSeleccionadoId] = useState(null);

  // Modales
  const [showModalBolo, setShowModalBolo] = useState(false);
  const [nuevoTituloBolo, setNuevoTituloBolo] = useState('');
  const [nuevoLugarBolo, setNuevoLugarBolo] = useState('');
  const [nuevaFechaBolo, setNuevaFechaBolo] = useState('');
  const [nuevaSalidaBolo, setNuevaSalidaBolo] = useState('');

  const [showModalTrayectoBolo, setShowModalTrayectoBolo] = useState(false);
  const [vehiculoTrayecto, setVehiculoTrayecto] = useState('');
  const [origenTrayecto, setOrigenTrayecto] = useState('');
  const [paradasTrayecto, setParadasTrayecto] = useState('');
  const [destinoTrayecto, setDestinoTrayecto] = useState('');
  const [instrumentoElegidoBolo, setInstrumentoElegidoBolo] = useState('');

  // Modales Bote
  const [showModalMovimientoBote, setShowModalMovimientoBote] = useState(false);
  const [conceptoBote, setConceptoBote] = useState('');
  const [importeBote, setImporteBote] = useState('');
  const [tipoMovimientoBote, setTipoMovimientoBote] = useState('ingreso');

  const [showModalGasolina, setShowModalGasolina] = useState(false);
  const [kmGasolina, setKmGasolina] = useState('');
  const [consumoMedio, setConsumoMedio] = useState('6.5');
  const [precioLitro, setPrecioLitro] = useState('1.45');
  const [destinoGasolina, setDestinoGasolina] = useState('');

  useEffect(() => {
    try {
      const miembrosGuardados = localStorage.getItem('sarao_miembros');
      const bolosGuardados = localStorage.getItem('sarao_bolos');
      const boteGuardado = localStorage.getItem('sarao_bote');
      const usuarioGuardado = localStorage.getItem('sarao_usuario_actual');

      if (miembrosGuardados) setMiembros(JSON.parse(miembrosGuardados));
      if (bolosGuardados) setBolos(JSON.parse(bolosGuardados));
      if (boteGuardado) setMovimientosBote(JSON.parse(boteGuardado));
      if (usuarioGuardado) {
        setUsuarioActual(JSON.parse(usuarioGuardado));
        setAutenticado(true);
      }
    } catch (e) {
      console.error(e);
    }
    setCargado(true);

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Bangers&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    localStorage.setItem('sarao_miembros', JSON.stringify(miembros));
    localStorage.setItem('sarao_bolos', JSON.stringify(bolos));
    localStorage.setItem('sarao_bote', JSON.stringify(movimientosBote));
    if (usuarioActual) {
      localStorage.setItem('sarao_usuario_actual', JSON.stringify(usuarioActual));
    }
  }, [miembros, bolos, movimientosBote, usuarioActual, cargado]);

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

  const deshacerUltimoCambio = () => {
    if (historialEstados.length === 0) {
      alert('No hay acciones previas para deshacer.');
      return;
    }
    const anterior = historialEstados[historialEstados.length - 1];
    setMiembros(anterior.miembros);
    setBolos(anterior.bolos);
    setMovimientosBote(anterior.movimientosBote);
    setHistorialEstados(prev => prev.slice(0, -1));

    if (usuarioActual) {
      const uRev = anterior.miembros.find(m => m.id === usuarioActual.id);
      if (uRev) setUsuarioActual(uRev);
    }
    alert('Acción revertida correctamente.');
  };

  // ROLES Y PERMISOS
  const esAdmin = usuarioActual?.roles?.includes('admin');
  const esConductor = usuarioActual?.roles?.includes('conductor') || esAdmin;
  const esTesorero = usuarioActual?.roles?.includes('tesorero') || esAdmin;
  const esJefeCuerda = usuarioActual?.roles?.includes('jefe_cuerda');

  const handleLogin = (e) => {
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
      setAutenticado(true);
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
    setMiembros(nuevaLista);
    setUsuarioActual(nuevoMiembro);
    setAutenticado(true);
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

  const setDisponibilidadBolo = (boloId, estado, instrumentoElegido = null) => {
    registrarSnapshot();
    setMiembros(miembros.map(m => {
      if (m.id === usuarioActual.id) {
        const datosDisp = estado === 'puedo' ? { estado, instrumento: instrumentoElegido || m.instrumentos[0] } : (estado ? { estado } : null);
        const nuevaDisp = { ...m.disponibilidadBolos };
        if (datosDisp) nuevaDisp[boloId] = datosDisp;
        else delete nuevaDisp[boloId];
        
        const actualizado = { ...m, disponibilidadBolos: nuevaDisp };
        setUsuarioActual(actualizado);
        return actualizado;
      }
      return m;
    }));
  };

  // ASIGNAR ROLES: EXCLUSIVO DEL ADMIN
  const toggleRolMiembro = (miembroId, rol) => {
    if (!esAdmin) {
      alert('Solo el Administrador tiene permiso para asignar o cambiar roles.');
      return;
    }
    registrarSnapshot();
    setMiembros(miembros.map(m => {
      if (m.id === miembroId) {
        const tieneRol = m.roles?.includes(rol);
        const nuevosRoles = tieneRol ? m.roles.filter(r => r !== rol) : [...(m.roles || []), rol];
        const actualizado = { ...m, roles: nuevosRoles };
        if (usuarioActual.id === m.id) setUsuarioActual(actualizado);
        return actualizado;
      }
      return m;
    }));
  };

  // ELIMINAR ASISTENCIA DE UN MÚSICO EN UN BOLO:
  // Administrador: puede en cualquiera.
  // Jefe de Cuerda: únicamente en la cuerda a la que pertenece.
  const puedeEliminarAsistencia = (cuerdaMiembro) => {
    if (esAdmin) return true;
    if (esJefeCuerda && usuarioActual.cuerda === cuerdaMiembro) return true;
    return false;
  };

  const eliminarDisponibilidadMiembro = (miembroId, cuerdaMiembro, nombreMiembro) => {
    if (!puedeEliminarAsistencia(cuerdaMiembro)) {
      alert(`Como jefe de cuerda, solo puedes descartar músicos de tu propia cuerda (${usuarioActual.cuerda}).`);
      return;
    }

    if (confirm(`¿Descartar la plaza de ${nombreMiembro} para este bolo?`)) {
      registrarSnapshot();
      setMiembros(miembros.map(m => {
        if (m.id === miembroId) {
          const nuevaDisp = { ...m.disponibilidadBolos };
          delete nuevaDisp[boloSeleccionadoId];
          return { ...m, disponibilidadBolos: nuevaDisp };
        }
        return m;
      }));
    }
  };

  const eliminarMiembroPlantilla = (miembroId) => {
    if (!esAdmin) return;
    if (confirm('¿Seguro que deseas eliminar a este músico de la plantilla?')) {
      registrarSnapshot();
      setMiembros(miembros.filter(m => m.id !== miembroId));
    }
  };

  // Acciones de Bote
  const agregarMovimientoGeneralBote = (e) => {
    e.preventDefault();
    if (!esTesorero) return;
    const imp = parseFloat(importeBote);
    if (isNaN(imp) || imp <= 0 || !conceptoBote.trim()) {
      alert('Introduce un concepto y un importe válido.');
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
    setMovimientosBote([nuevoMov, ...movimientosBote]);
    setConceptoBote('');
    setImporteBote('');
    setShowModalMovimientoBote(false);
  };

  const agregarGasolinaConductor = (e) => {
    e.preventDefault();
    if (!esConductor) return;
    const km = parseFloat(kmGasolina);
    const cons = parseFloat(consumoMedio);
    const precio = parseFloat(precioLitro);

    if (isNaN(km) || km <= 0 || isNaN(cons) || isNaN(precio)) {
      alert('Por favor introduce valores numéricos válidos.');
      return;
    }

    const gastoCalculado = parseFloat(((km * cons / 100) * precio).toFixed(2));
    registrarSnapshot();

    const conceptoTexto = `Gasolina ${usuarioActual.nombre} (${km} km${destinoGasolina ? ` - ${destinoGasolina}` : ''})`;

    const nuevoGasto = {
      id: Date.now(),
      concepto: conceptoTexto,
      cantidad: -gastoCalculado,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      tipo: 'gasto',
      autor: usuarioActual.nombre
    };

    setMovimientosBote([nuevoGasto, ...movimientosBote]);
    setKmGasolina('');
    setDestinoGasolina('');
    setShowModalGasolina(false);
    alert(`Se ha registrado el gasto de gasolina por ${gastoCalculado} € en el bote.`);
  };

  const eliminarMovimientoBote = (movId) => {
    if (!esTesorero) return;
    if (confirm('¿Deseas eliminar este movimiento del bote?')) {
      registrarSnapshot();
      setMovimientosBote(movimientosBote.filter(m => m.id !== movId));
    }
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
    link.setAttribute("download", "estadisticas_sarao_2027.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!cargado) return null;

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
            <p className="text-xs text-zinc-400">Temporada 2027 • Acceso Músicos</p>
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
                      {sel && <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />}
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
              <p className="text-[10px] text-zinc-500 mt-1">Tu nombre "Edgar" o la clave admin2027 otorgan acceso completo de Administrador.</p>
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
            <Undo2 className="w-4 h-4" /> Deshacer acción ({historialEstados.length})
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
                    <Shield className="w-3 h-3" /> Admin
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
              <Home className="w-4 h-4" />
            </button>
            <button onClick={cerrarSesion} className="p-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-rose-400 bg-zinc-900 text-xs font-bold" title="Cerrar sesión">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6">

        {/* INICIO */}
        {pestañaActiva === 'landing' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-950/60 via-zinc-900 to-black border border-green-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <span className="bg-green-500/20 text-green-400 text-xs font-black px-3 py-1 rounded-full uppercase border border-green-500/30">
                  Temporada 2027
                </span>
                <h2 className="text-3xl sm:text-4xl tracking-wide text-white mt-3" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                  Bienvenido a la app de gestión de Sarao
                </h2>
                <p className="text-zinc-300 text-sm mt-1 max-w-xl">
                  {esAdmin 
                    ? 'Modo Administrador activado: control de bolos, estadísticas, roles y finanzas con opción de deshacer cambios.' 
                    : esJefeCuerda
                      ? `Jefe de cuerda de ${usuarioActual.cuerda}: puedes gestionar y filtrar los músicos sobrantes de tu cuerda en cada bolo.`
                      : 'Calendario de bolos, confirmación de asistencia y bote.'}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div onClick={() => setPestañaActiva('bolos')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-green-500/20 text-green-400 rounded-2xl w-fit mb-3"><CalendarIcon className="w-6 h-6" /></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Bolos</h3>
                  <p className="text-xs text-zinc-400 mt-1">Fechas, rutas y asistencia.</p>
                </div>
                <span className="text-xs font-bold text-green-400 mt-4 block">&rarr; Ver calendario</span>
              </div>

              <div onClick={() => setPestañaActiva('miembros')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 rounded-2xl w-fit mb-3"><Users className="w-6 h-6" /></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Plantilla</h3>
                  <p className="text-xs text-zinc-400 mt-1">Integrantes de Sarao.</p>
                </div>
                <span className="text-xs font-bold text-fuchsia-400 mt-4 block">&rarr; Ver plantilla ({miembros.length})</span>
              </div>

              <div onClick={() => setPestañaActiva('bote')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl w-fit mb-3"><Wallet className="w-6 h-6" /></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Bote</h3>
                  <p className="text-xs text-zinc-400 mt-1">Tesorería y gasolinas.</p>
                </div>
                <span className="text-xs font-bold text-amber-400 mt-4 block">&rarr; Saldo ({saldoTotal.toFixed(2)} €)</span>
              </div>

              {esAdmin && (
                <div onClick={() => setPestañaActiva('admin')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-rose-500/40 hover:border-rose-500 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl w-fit mb-3"><Shield className="w-6 h-6" /></div>
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
                  PLANTILLA DE MÚSICOS 2027 ({miembros.length})
                </h2>
                {esAdmin && (
                  <button onClick={() => setPestañaActiva('admin')} className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" /> Estadísticas y Roles
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
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* SECCIÓN ASIGNACIÓN DE ROLES: EXCLUSIVA DEL ADMIN */}
                        {esAdmin && (
                          <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                              <Key className="w-3 h-3 text-rose-400" /> Asignar rol (solo admin):
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

        {/* PANEL ADMIN: EXCLUSIVO ADMIN */}
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
                      <Undo2 className="w-4 h-4" /> Deshacer ({historialEstados.length})
                    </button>
                  )}
                  <button
                    onClick={exportarEstadisticasExcel}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-4 h-4" /> Exportar CSV
                  </button>
                </div>
              </div>

              {/* TABLA DE ASISTENCIA */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" /> Asistencia acumulada de la plantilla
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
              
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-zinc-800 pb-5 mb-5">
                <h2 className="text-3xl sm:text-4xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                  CALENDARIO DE BOLOS
                </h2>
                {esAdmin && (
                  <button onClick={() => setShowModalBolo(true)} className="bg-green-500 hover:bg-green-400 text-black font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> + Añadir Bolo
                  </button>
                )}
              </div>

              {/* Calendario */}
              <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Agosto 2027</h3>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="font-bold text-zinc-500 py-1">{d}</div>)}
                  {Array.from({ length: 31 }, (_, i) => {
                    const diaNum = i + 1;
                    const fechaStr = `2027-08-${diaNum < 10 ? '0' + diaNum : diaNum}`;
                    const bolosDelDia = bolos.filter(b => b.fecha === fechaStr);

                    return (
                      <div
                        key={diaNum}
                        className={`min-h-[80px] p-1 rounded-xl border flex flex-col justify-between ${bolosDelDia.length > 0 ? 'bg-green-500/20 border-green-500' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}
                      >
                        <span className={`font-bold text-xs ${bolosDelDia.length > 0 ? 'text-green-300' : 'text-zinc-500'}`}>{diaNum}</span>
                        <div className="space-y-1 overflow-y-auto max-h-[50px]">
                          {bolosDelDia.map(b => (
                            <div
                              key={b.id}
                              onClick={() => setBoloSeleccionadoId(b.id)}
                              className="text-[9px] leading-tight text-green-200 font-bold bg-green-500/40 p-1 rounded cursor-pointer hover:bg-green-500/60 truncate"
                            >
                              {b.lugar} ({b.horarioSalida})
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {boloActual ? (
                (() => {
                  const miDispo = usuarioActual.disponibilidadBolos?.[boloActual.id];

                  if (!miDispo) {
                    return (
                      <div className="bg-black/90 border border-amber-500/50 rounded-2xl p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                          ¿Vas a asistir a {boloActual.titulo}?
                        </h3>
                        
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
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'puedo', instrumentoElegidoBolo || usuarioActual.instrumentos[0])} className="px-5 py-2.5 bg-emerald-500 text-black font-black rounded-xl text-xs cursor-pointer">🟢 Puedo</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'tal_vez')} className="px-5 py-2.5 bg-amber-500 text-black font-black rounded-xl text-xs cursor-pointer">🟡 Tal vez</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'no')} className="px-5 py-2.5 bg-rose-500 text-white font-black rounded-xl text-xs cursor-pointer">🔴 No puedo</button>
                        </div>
                      </div>
                    );
                  }

                  const dispoPuedo = miembros.filter(m => m.disponibilidadBolos?.[boloActual.id]?.estado === 'puedo');
                  const dispoTalVez = miembros.filter(m => m.disponibilidadBolos?.[boloActual.id]?.estado === 'tal_vez');
                  const dispoNo = miembros.filter(m => m.disponibilidadBolos?.[boloActual.id]?.estado === 'no');

                  return (
                    <div className="space-y-6 pt-4 border-t border-zinc-800">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full uppercase">
                            Tu estado: <strong className="uppercase">{miDispo.estado.replace('_', ' ')}</strong> {miDispo.instrumento && `(${miDispo.instrumento})`}
                          </span>
                          <h3 className="text-3xl tracking-wide text-white mt-2" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                            {boloActual.titulo}
                          </h3>
                          <p className="text-zinc-300 text-xs mt-1">📍 {boloActual.lugar} • 🕚 Salida: {boloActual.horarioSalida}</p>
                        </div>
                        <button onClick={() => setDisponibilidadBolo(boloActual.id, null)} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-xl">🔄 Cambiar asistencia</button>
                      </div>

                      {/* Trayectos y coches */}
                      <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Car className="w-4 h-4 text-blue-400" /> Caravana de Coches y Trayectos
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
                              <div key={car.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-bold text-blue-400">Conductor: {car.conductor} ({car.vehiculo})</span>
                                  <p className="text-zinc-300 mt-0.5">🛞 {car.origen} {car.paradas && `➔ ${car.paradas} ➔`} {car.destino}</p>
                                </div>
                                {(esAdmin || car.conductor === usuarioActual.nombre) && (
                                  <button onClick={() => {
                                    registrarSnapshot();
                                    setBolos(bolos.map(b => b.id === boloActual.id ? { ...b, cochesAsignados: b.cochesAsignados.filter(x => x.id !== car.id) } : b));
                                  }} className="text-rose-400">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-zinc-500">Ningún conductor ha publicado trayecto para este bolo todavía.</p>
                          )}
                        </div>
                      </div>

                      {/* Listas de Asistencia con filtro de Jefe de Cuerda y Admin */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                              🟢 Confirmados ({dispoPuedo.length})
                            </h4>
                            {esJefeCuerda && !esAdmin && (
                              <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                                Puedes descartar sobrantes de tu cuerda: <strong className="text-emerald-400">{usuarioActual.cuerda}</strong>
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
                                  
                                  {/* Botón de descarte: solo si eres Admin O si eres Jefe de Cuerda de ESTA cuerda */}
                                  {puedeGestionarEste && (
                                    <button 
                                      onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)} 
                                      className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-xl transition"
                                      title={`Descartar a ${m.nombre} de este bolo`}
                                    >
                                      <Trash2 className="w-4 h-4" />
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
                                      <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)} className="text-rose-400 p-1.5"><Trash2 className="w-4 h-4" /></button>
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
                                      <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda, m.nombre)} className="text-rose-400 p-1.5"><Trash2 className="w-4 h-4" /></button>
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
                <p className="text-xs text-zinc-500 text-center py-6">Haz clic en un día con bolo para ver los detalles y apuntarte.</p>
              )}

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
                  <p className="text-xs text-zinc-400">Control de ingresos, gastos de eventos y combustible de los conductores.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {esConductor && (
                    <button
                      onClick={() => setShowModalGasolina(true)}
                      className="bg-blue-500 hover:bg-blue-400 text-black font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Fuel className="w-4 h-4" /> Calculador Gasolina
                    </button>
                  )}

                  {esTesorero && (
                    <button
                      onClick={() => setShowModalMovimientoBote(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" /> Añadir Movimiento
                    </button>
                  )}
                </div>
              </div>

              {/* TARJETAS RESUMEN */}
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

              {/* LISTA DE MOVIMIENTOS */}
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
                              <Trash2 className="w-3.5 h-3.5" />
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

        {/* MODAL CALCULADOR GASOLINA */}
        {showModalGasolina && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Fuel className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-black text-white">Calculador de Gasolina Conductor</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">Calcula el combustible según los kilómetros realizados y aplícalo directamente como gasto al bote.</p>

              <form onSubmit={agregarGasolinaConductor} className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">Kilómetros totales (Ida y Vuelta):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 110"
                    value={kmGasolina}
                    onChange={e => setKmGasolina(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-bold">Destino / Bolo (Opcional):</label>
                  <input
                    type="text"
                    placeholder="Ej: Cuéllar"
                    value={destinoGasolina}
                    onChange={e => setDestinoGasolina(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Consumo (L/100km):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={consumoMedio}
                      onChange={e => setConsumoMedio(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Precio Combustible (€/L):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={precioLitro}
                      onChange={e => setPrecioLitro(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                {kmGasolina && !isNaN(parseFloat(kmGasolina)) && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
                    <span className="text-xs text-blue-300 font-bold">
                      Gasto estimado a restar: {((parseFloat(kmGasolina) * parseFloat(consumoMedio) / 100) * parseFloat(precioLitro)).toFixed(2)} €
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-400 text-black font-black py-2.5 rounded-xl text-sm">
                    Añadir gasto al Bote
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
                <Wallet className="w-5 h-5 text-amber-400" />
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

        {/* Modal Trayecto */}
        {showModalTrayectoBolo && boloActual && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-3">Añadir Trayecto para este Bolo</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!origenTrayecto || !destinoTrayecto) return;
                registrarSnapshot();
                const nuevoCar = {
                  id: Date.now(),
                  conductor: usuarioActual.nombre,
                  vehiculo: vehiculoTrayecto || 'Coche',
                  origen: origenTrayecto,
                  paradas: paradasTrayecto,
                  destino: destinoTrayecto
                };
                setBolos(bolos.map(b => b.id === boloActual.id ? { ...b, cochesAsignados: [...(b.cochesAsignados || []), nuevoCar] } : b));
                setOrigenTrayecto(''); setParadasTrayecto(''); setDestinoTrayecto(''); setVehiculoTrayecto('');
                setShowModalTrayectoBolo(false);
              }} className="space-y-3">
                <input type="text" placeholder="Vehículo (ej: Furgoneta / Coche)" value={vehiculoTrayecto} onChange={e => setVehiculoTrayecto(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                <input type="text" placeholder="Origen (ej: Segovia)" value={origenTrayecto} onChange={e => setOrigenTrayecto(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                <input type="text" placeholder="Punto intermedio / paradas" value={paradasTrayecto} onChange={e => setParadasTrayecto(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                <input type="text" placeholder="Destino (ej: Cuéllar)" value={destinoTrayecto} onChange={e => setDestinoTrayecto(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-500 text-black font-black py-2.5 rounded-xl text-sm">Guardar Trayecto</button>
                  <button type="button" onClick={() => setShowModalTrayectoBolo(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Bolo */}
        {showModalBolo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-green-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-black text-white mb-3">Añadir Nuevo Bolo</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!nuevoTituloBolo || !nuevaFechaBolo) return;
                registrarSnapshot();
                setBolos([...bolos, { id: Date.now(), titulo: nuevoTituloBolo, lugar: nuevoLugarBolo, fecha: nuevaFechaBolo, horarioSalida: nuevaSalidaBolo, horarioActuacion: '', vestuario: 'Camiseta negra', presupuesto: 0, cochesAsignados: [] }]);
                setNuevoTituloBolo(''); setNuevaFechaBolo('');
                setShowModalBolo(false);
              }} className="space-y-3">
                <input type="text" placeholder="Título" value={nuevoTituloBolo} onChange={e => setNuevoTituloBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                <input type="text" placeholder="Lugar" value={nuevoLugarBolo} onChange={e => setNuevoLugarBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                <input type="date" value={nuevaFechaBolo} onChange={e => setNuevaFechaBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                <input type="text" placeholder="Hora salida" value={nuevaSalidaBolo} onChange={e => setNuevaSalidaBolo(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-green-500 text-black font-black py-2.5 rounded-xl text-sm">Guardar</button>
                  <button type="button" onClick={() => setShowModalBolo(false)} className="px-4 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold">Cancelar</button>
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
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
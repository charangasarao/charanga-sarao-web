"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Car, Users, Wallet, Shield, MapPin, 
  Plus, Navigation, Music, Fuel, Settings, Calculator, Check, Key, 
  UserPlus, Trash2, Shirt, ArrowRight, Home, Clock, AlertCircle, 
  ChevronLeft, ChevronRight, BarChart3, Download 
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
  { nombre: 'Trompeta', cuerda: 'Trompetas' },
  { nombre: 'Trombón', cuerda: 'Trombones' },
  { nombre: 'Caja', cuerda: 'Percusión' },
  { nombre: 'Bombo', cuerda: 'Percusión' },
  { nombre: 'Tuba', cuerda: 'Tuba' }
];

export default function CharangaSaraoApp() {
  const [autenticado, setAutenticado] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [nombreRegistro, setNombreRegistro] = useState('');
  const [instrumentosSeleccionados, setInstrumentosSeleccionados] = useState(['Saxo alto']);
  const PASSWORD_CHARANGA = 'sarao2027';

  const [miembros, setMiembros] = useState([
    { id: 1, nombre: 'Edgar', instrumentos: ['Tuba'], cuerda: 'Tuba', roles: ['admin', 'conductor'], disponibilidadBolos: {} },
    { id: 2, nombre: 'Carlos', instrumentos: ['Saxo alto', 'Trompeta'], cuerda: 'Saxos', roles: ['jefe_cuerda', 'conductor'], disponibilidadBolos: {} },
    { id: 3, nombre: 'Lucía', instrumentos: ['Trompeta'], cuerda: 'Trompetas', roles: ['tesorero', 'musico'], disponibilidadBolos: {} },
  ]);

  const [usuarioActual, setUsuarioActual] = useState(null);
  const [pestañaActiva, setPestañaActiva] = useState('landing');

  // Listado de Bolos
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
      conFactura: true,
      cochesAsignados: [
        { id: 101, conductor: 'Edgar', vehiculo: 'Furgoneta', origen: 'Segovia', paradas: 'Nava de la Asunción', destino: 'Cuéllar' }
      ]
    }
  ]);
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

  // Bote
  const [movimientosBote, setMovimientosBote] = useState([
    { id: 1, concepto: 'Cobro Fiestas Patronales 2027', cantidad: 1500, fecha: '15 Ago', tipo: 'ingreso' },
    { id: 2, concepto: 'Gasolina Edgar (110 km - Cuéllar)', cantidad: -13.59, fecha: '16 Ago', tipo: 'gasto' },
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput.trim() !== PASSWORD_CHARANGA) {
      alert('Contraseña incorrecta.');
      return;
    }
    if (!nombreRegistro.trim()) {
      alert('Introduce tu nombre.');
      return;
    }

    const instPrincipal = instrumentosSeleccionados[0];
    const matchCuerda = INSTRUMENTOS_DISPONIBLES.find(i => i.nombre === instPrincipal)?.cuerda || 'Saxos';
    const esAdminNombre = nombreRegistro.trim().toLowerCase() === 'edgar';

    const nuevoMiembro = {
      id: Date.now(),
      nombre: nombreRegistro.trim(),
      instrumentos: instrumentosSeleccionados,
      cuerda: matchCuerda,
      roles: esAdminNombre ? ['admin', 'conductor', 'jefe_cuerda'] : ['musico'],
      disponibilidadBolos: {}
    };

    setMiembros([...miembros, nuevoMiembro]);
    setUsuarioActual(nuevoMiembro);
    setAutenticado(true);
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
    setMiembros(miembros.map(m => {
      if (m.id === usuarioActual.id) {
        const datosDisp = estado === 'puedo' ? { estado, instrumento: instrumentoElegido || m.instrumentos[0] } : { estado };
        const nuevaDisp = { ...m.disponibilidadBolos, [boloId]: datosDisp };
        const actualizado = { ...m, disponibilidadBolos: nuevaDisp };
        setUsuarioActual(actualizado);
        return actualizado;
      }
      return m;
    }));
  };

  const eliminarDisponibilidadMiembro = (miembroId, cuerdaMiembro) => {
    if (!esAdmin && usuarioActual.cuerda !== cuerdaMiembro) {
      alert(`Solo puedes gestionar la asistencia de tu cuerda (${usuarioActual.cuerda}).`);
      return;
    }

    setMiembros(miembros.map(m => {
      if (m.id === miembroId) {
        const nuevaDisp = { ...m.disponibilidadBolos };
        delete nuevaDisp[boloSeleccionadoId];
        return { ...m, disponibilidadBolos: nuevaDisp };
      }
      return m;
    }));
  };

  const eliminarMiembroPlantilla = (miembroId) => {
    if (!esAdmin) return;
    if (confirm('¿Seguro que deseas eliminar a este músico de la plantilla?')) {
      setMiembros(miembros.filter(m => m.id !== miembroId));
    }
  };

  const saldoTotal = movimientosBote.reduce((acc, m) => acc + m.cantidad, 0);
  const esAdmin = usuarioActual?.roles.includes('admin');
  const esConductor = usuarioActual?.roles.includes('conductor') || esAdmin;
  const puedeJefeCuerda = usuarioActual?.roles.includes('jefe_cuerda') || esAdmin;

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Bangers&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

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
                placeholder="Ej: Edgar, Carlos..."
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
                      <span>{inst.nombre}</span>
                      {sel && <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1">Contraseña (sarao2027):</label>
              <input
                type="password"
                placeholder="Contraseña"
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

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans pb-28 selection:bg-green-500 selection:text-black">
      
      <header className="bg-gradient-to-b from-zinc-900 to-black border-b border-green-500/20 px-6 py-5 sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-green-500/40 bg-black shrink-0">
              <img src="PEGATINAS.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl tracking-wider text-green-400 leading-none" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                CHARANGA SARAO
              </h1>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {usuarioActual.nombre} • <span className="text-green-300 font-bold">{usuarioActual.instrumentos.join(', ')}</span>
              </p>
            </div>
          </div>

          <button onClick={() => { setPestañaActiva('landing'); setBoloSeleccionadoId(null); }} className={`p-2.5 rounded-xl border transition ${pestañaActiva === 'landing' ? 'bg-green-500 text-black border-green-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
            <Home className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6">

        {/* LANDING */}
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
                  Calendario de bolos, plantilla de músicos y bote.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div onClick={() => setPestañaActiva('bolos')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-green-500/20 text-green-400 rounded-2xl w-fit mb-3"><CalendarIcon className="w-6 h-6" /></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Calendario Bolos</h3>
                  <p className="text-xs text-zinc-400 mt-1">Fechas, rutas y asistencia.</p>
                </div>
                <span className="text-xs font-bold text-green-400 mt-4 block">&rarr; Ver calendario</span>
              </div>

              <div onClick={() => setPestañaActiva('miembros')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 rounded-2xl w-fit mb-3"><Users className="w-6 h-6" /></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Plantilla</h3>
                  <p className="text-xs text-zinc-400 mt-1">Integrantes de la charanga.</p>
                </div>
                <span className="text-xs font-bold text-fuchsia-400 mt-4 block">&rarr; Ver plantilla ({miembros.length})</span>
              </div>

              <div onClick={() => setPestañaActiva('bote')} className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-green-500/60 rounded-3xl p-5 transition cursor-pointer shadow-lg flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl w-fit mb-3"><Wallet className="w-6 h-6" /></div>
                  <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>Bote</h3>
                  <p className="text-xs text-zinc-400 mt-1">Tesorería.</p>
                </div>
                <span className="text-xs font-bold text-amber-400 mt-4 block">&rarr; Ver saldo</span>
              </div>
            </div>
          </div>
        )}

        {/* PLANTILLA */}
        {pestañaActiva === 'miembros' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h2 className="text-3xl tracking-wide text-white mb-4" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                PLANTILLA DE MÚSICOS 2027
              </h2>

              <div className="space-y-3">
                {miembros.map(m => {
                  const conf = CONFIG_CUERDAS[m.cuerda] || CONFIG_CUERDAS['Saxos'];
                  return (
                    <div key={m.id} className={`p-4 rounded-2xl border flex items-center justify-between ${conf.bg} ${conf.border}`}>
                      <div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded" style={{ backgroundColor: conf.dot + '22', color: conf.dot }}>
                          {m.cuerda}
                        </span>
                        <p className="font-bold text-sm text-zinc-100 mt-1">{m.nombre}</p>
                        <p className="text-xs text-zinc-400">Instrumentos: {m.instrumentos.join(', ')}</p>
                      </div>

                      {esAdmin && m.nombre.toLowerCase() !== 'edgar' && (
                        <button onClick={() => eliminarMiembroPlantilla(m.id)} className="text-rose-400 hover:bg-rose-500/20 p-2 rounded-xl transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
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

              {/* Vista Mensual de Días */}
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
                  const miDispo = usuarioActual.disponibilidadBolos[boloActual.id];

                  if (!miDispo) {
                    return (
                      <div className="bg-black/90 border border-amber-500/50 rounded-2xl p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl tracking-wide text-white" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>
                          ¿Vas a asistir a {boloActual.titulo}?
                        </h3>
                        
                        {usuarioActual.instrumentos.length > 1 && (
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
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'puedo', instrumentoElegidoBolo || usuarioActual.instrumentos[0])} className="px-5 py-2.5 bg-emerald-500 text-black font-black rounded-xl text-xs">🟢 Puedo</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'tal_vez')} className="px-5 py-2.5 bg-amber-500 text-black font-black rounded-xl text-xs">🟡 Tal vez</button>
                          <button onClick={() => setDisponibilidadBolo(boloActual.id, 'no')} className="px-5 py-2.5 bg-rose-500 text-white font-black rounded-xl text-xs">🔴 No puedo</button>
                        </div>
                      </div>
                    );
                  }

                  const dispoPuedo = miembros.filter(m => m.disponibilidadBolos[boloActual.id]?.estado === 'puedo');
                  const dispoTalVez = miembros.filter(m => m.disponibilidadBolos[boloActual.id]?.estado === 'tal_vez');
                  const dispoNo = miembros.filter(m => m.disponibilidadBolos[boloActual.id]?.estado === 'no');

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
                        <button onClick={() => setDisponibilidadBolo(boloActual.id, null)} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-xl">🔄 Cambiar</button>
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

                      {/* Lista Asistencia */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider mb-2">🟢 Sí pueden ({dispoPuedo.length})</h4>
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {dispoPuedo.map(m => {
                              const conf = CONFIG_CUERDAS[m.cuerda] || CONFIG_CUERDAS['Saxos'];
                              const dispM = m.disponibilidadBolos[boloActual.id];
                              return (
                                <div key={m.id} className={`p-3 rounded-2xl border flex items-center justify-between ${conf.bg} ${conf.border}`}>
                                  <div>
                                    <p className="font-bold text-sm text-zinc-100">{m.nombre}</p>
                                    <p className="text-xs text-emerald-300 font-bold">Toca: {dispM.instrumento || m.instrumentos[0]}</p>
                                  </div>
                                  {(esAdmin || (puedeJefeCuerda && usuarioActual.cuerda === m.cuerda)) && (
                                    <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda)} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
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
                              {dispoTalVez.map(m => (
                                <div key={m.id} className="p-3 rounded-2xl border bg-amber-500/10 border-amber-500/30 flex items-center justify-between">
                                  <p className="font-bold text-sm text-zinc-100">{m.nombre}</p>
                                  {(esAdmin || (puedeJefeCuerda && usuarioActual.cuerda === m.cuerda)) && (
                                    <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda)} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {dispoNo.length > 0 && (
                          <div>
                            <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider mb-2">🔴 No pueden ({dispoNo.length})</h4>
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {dispoNo.map(m => (
                                <div key={m.id} className="p-3 rounded-2xl border bg-rose-500/10 border-rose-500/30 flex items-center justify-between">
                                  <p className="font-bold text-sm text-zinc-100">{m.nombre}</p>
                                  {(esAdmin || (puedeJefeCuerda && usuarioActual.cuerda === m.cuerda)) && (
                                    <button onClick={() => eliminarDisponibilidadMiembro(m.id, m.cuerda)} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <p className="text-xs text-zinc-500 text-center py-6">Haz clic en un día del calendario con bolo para ver sus detalles.</p>
              )}

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
                <input type="text" placeholder="Vehículo (ej: Furgoneta)" value={vehiculoTrayecto} onChange={e => setVehiculoTrayecto(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white" />
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

        {/* BOTE */}
        {pestañaActiva === 'bote' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-3xl tracking-wide text-white mb-2" style={{ fontFamily: "'Bangers', cursive, sans-serif" }}>SALDO: {saldoTotal.toFixed(2)} €</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-black/60 p-3 rounded-2xl border border-zinc-800 mt-4">
                {movimientosBote.map(m => (
                  <div key={m.id} className="flex justify-between items-center text-xs pb-2 border-b border-zinc-800">
                    <span>{m.concepto}</span>
                    <span className={m.cantidad >= 0 ? 'text-green-400' : 'text-rose-400'}>{m.cantidad.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/95 border border-green-500/30 px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-1.5 z-40">
        {[
          { id: 'landing', label: 'Inicio', icon: Home },
          { id: 'bolos', label: 'Bolos', icon: CalendarIcon },
          { id: 'miembros', label: 'Plantilla', icon: Users },
          { id: 'bote', label: 'Bote', icon: Wallet },
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
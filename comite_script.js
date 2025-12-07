console.log(" script_comite.js cargado correctamente");

// ===== FUNCIONES DE DESENCRIPTACIÓN =====
/**
 * Desencriptar datos usando la clave secreta del servidor
 * Se utiliza para desencriptar correo y cédula desde el frontend
 */
function decryptData(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const SECRET_KEY = 'tu-clave-secreta-muy-segura-cambiar-en-produccion'; // Debe coincidir con backend
    const ALGORITHM = 'aes-256-cbc';
    
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) {
      console.warn('Formato de encriptación inválido');
      return encryptedText; // Retornar tal cual si no puede desencriptar
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.subtle.digest('SHA-256', new TextEncoder().encode(SECRET_KEY));
    
    // Debido a limitaciones de la API de crypto en navegador, usamos una alternativa
    // Para producción, se recomienda desencriptar en el backend y enviar datos desencriptados
    return decryptAES(encryptedText, SECRET_KEY);
  } catch (err) {
    console.error('Error desencriptando:', err);
    return encryptedText; // Retornar el texto original si hay error
  }
}

// Función alternativa para desencriptación simple basada en bibliotecas disponibles
// Para usar CryptoJS (agregar <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.0/crypto-js.min.js"></script>)
function decryptAES(encryptedData, secretKey) {
  try {
    // Si está disponible CryptoJS globalmente
    if (typeof CryptoJS !== 'undefined') {
      const [ivHex, encryptedHex] = encryptedData.split(':');
      const key = CryptoJS.SHA256(secretKey).toString();
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const decrypted = CryptoJS.AES.decrypt(
        CryptoJS.enc.Hex.parse(encryptedHex),
        CryptoJS.enc.Utf8.parse(key.substring(0, 32)),
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    } else {
      // Si no está disponible, hacer solicitud al servidor para desencriptar
      return decryptViaServer(encryptedData);
    }
  } catch (err) {
    console.error('Error en desencriptación AES:', err);
    return null;
  }
}

// Desencriptar a través del servidor (más seguro)
async function decryptViaServer(encryptedData) {
  try {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const response = await fetch('https://becas-back1.onrender.com/api/auth/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ encryptedData })
    });
    
    if (!response.ok) {
      console.error('Error en desencriptación del servidor');
      return encryptedData;
    }
    
    const data = await response.json();
    return data.decrypted || encryptedData;
  } catch (err) {
    console.error('Error desencriptando via servidor:', err);
    return encryptedData;
  }
}

// Asegurar que exista el modal de nueva sesión; si no, crearlo dinámicamente
function ensureModalNuevaSesionExists() {
  // asegurar estilos globales del modal para evitar que hojas de estilo externas lo oculten
  ensureModalStyles();
  if (document.getElementById('modalNuevaSesion')) return;

  const modal = document.createElement('div');
  modal.id = 'modalNuevaSesion';
  modal.className = 'modal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.background = 'rgba(0,0,0,0.45)';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div class="modal-content" style="width:400px; padding:20px; background:var(--bg-primary); border-radius:8px; color:var(--text-primary); max-height:80vh; overflow:auto;">
      <button class="modal-close" id="modalNuevaSesionClose" style="float:right">&times;</button>
      <h3>Crear nueva sesión</h3>
      <div style="margin-top:12px;">
        <label>Fecha</label>
        <input type="date" id="fechaSesion" class="input" style="width:100%; margin-bottom:8px;" />
        <label>Hora</label>
        <input type="time" id="horaSesion" class="input" style="width:100%; margin-bottom:8px;" />
        <label>Lugar</label>
        <input type="text" id="lugarSesion" class="input" style="width:100%; margin-bottom:8px;" />
        <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px;">
          <button class="btn btn-secondary" id="modalNuevaSesionCancel">Cancelar</button>
          <button class="btn btn-primary" id="modalNuevaSesionCreate">Crear sesión</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // listeners para botones del modal recién creado
  document.getElementById('modalNuevaSesionClose')?.addEventListener('click', cerrarModalSesion);
  document.getElementById('modalNuevaSesionCancel')?.addEventListener('click', cerrarModalSesion);
  document.getElementById('modalNuevaSesionCreate')?.addEventListener('click', guardarSesion);
}

// Abrir modal que muestra una resolución completa (usa cache cargada en historialDecisionesCache)
function abrirVerResolucion(idResolucion) {
  if (!idResolucion) return alert('ID de resolución inválido');
  const r = historialDecisionesCache.find(x => (x.id_resolucion || x.id_resolucion) == idResolucion || (x.id && x.id == idResolucion));
  if (!r) {
    // intentar buscar por id_solicitud o refrescar
    console.warn('abrirVerResolucion: resolución no encontrada en cache, intentando refrescar historial');
    cargarHistorialDecisiones().then(() => {
      const rr = historialDecisionesCache.find(x => (x.id_resolucion || x.id_resolucion) == idResolucion || (x.id && x.id == idResolucion));
      if (!rr) return alert('Resolución no encontrada');
      abrirVerResolucionRender(rr);
    });
    return;
  }
  abrirVerResolucionRender(r);
}

function abrirVerResolucionRender(r) {
  const modal = document.getElementById('modalVerResolucion');
  if (!modal) return alert('Modal de resolución no disponible');
  document.getElementById('resolucion_id').textContent = r.id_resolucion || r.id || '-';
  document.getElementById('resolucion_codigo').textContent = r.codigo_solicitud || ('#' + r.id_solicitud) || '-';
  document.getElementById('resolucion_estudiante').textContent = r.estudiante || '-';
  document.getElementById('resolucion_decision').textContent = formatDecisionLabel(r.decision) || '-';
  document.getElementById('resolucion_motivo').innerHTML = r.motivo ? (r.motivo.replace(/\n/g,'<br>')) : '<span class="text-muted">(no especificado)</span>';
  document.getElementById('resolucion_fecha').textContent = r.fecha || '-';
  // Evaluación (si existe)
  document.getElementById('resolucion_metodo_socio').textContent = r.metodo_socio || '(sin evaluación)';
  document.getElementById('resolucion_promedio').textContent = (r.promedio !== undefined && r.promedio !== null) ? r.promedio : '(sin evaluación)';
  document.getElementById('resolucion_reprobadas').textContent = (r.reprobadas !== undefined && r.reprobadas !== null) ? r.reprobadas : '(sin evaluación)';
  document.getElementById('resolucion_evaluado_por').textContent = r.evaluado_por || '(sin evaluación)';
  document.getElementById('resolucion_observaciones').innerHTML = r.observaciones ? r.observaciones.replace(/\n/g,'<br>') : '<span class="text-muted">(no especificado)</span>';
  // fecha de evaluación
  const fechaEvalEl = document.getElementById('resolucion_fecha_evaluacion');
  if (fechaEvalEl) fechaEvalEl.textContent = r.fecha_evaluacion || '(sin evaluación)';
  modal.style.display = 'flex';

  document.getElementById('modalVerResolucionClose')?.addEventListener('click', () => { modal.style.display = 'none'; }, { once: true });
  document.getElementById('modalVerResolucionCloseBtn')?.addEventListener('click', () => { modal.style.display = 'none'; }, { once: true });
}

// Exportar el historial visible (filtrado por búsqueda y cuatrimestre) a CSV
function exportHistorialToCsv() {
  const quarterFilter = document.getElementById('historyQuarterFilter')?.value || 'all';
  const search = (document.getElementById('historialSearch')?.value || '').toLowerCase().trim();

  let rows = historialDecisionesCache.slice();
  rows = rows.map(r => ({ ...r, cuatrimestre: computeCuatrimestreFromFecha(r.fecha || '') }));
  if (quarterFilter && quarterFilter !== 'all') rows = rows.filter(r => r.cuatrimestre === quarterFilter);
  if (search) rows = rows.filter(r => {
    const codigo = (r.codigo_solicitud || ('#' + r.id_solicitud) || '').toString().toLowerCase();
    const estudiante = (r.estudiante || '').toString().toLowerCase();
    return codigo.includes(search) || estudiante.includes(search);
  });

  if (!rows.length) return alert('No hay registros a exportar');

  const headers = ['id_resolucion','id_solicitud','id_sesion','decision','motivo','fecha'];
  const csvRows = [headers.join(',')];
  rows.forEach(r => {
    const values = [
      `"${(r.id_resolucion||'').toString().replace(/"/g,'""')}"`,
      `"${(r.id_solicitud||'').toString().replace(/"/g,'""')}"`,
      `"${(r.id_sesion||'').toString().replace(/"/g,'""')}"`,
      `"${(r.decision||'').toString().replace(/"/g,'""')}"`,
      `"${(r.motivo||'').toString().replace(/"/g,'""')}"`,
      `"${(r.fecha||'').toString().replace(/"/g,'""')}"`
    ];
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `historial_decisiones_${new Date().toISOString().slice(0,10)}.csv`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


// Renderiza tarjetas de sesiones en la vista Reuniones (contenedor opcional)
function renderSessionCards(sesiones) {
  const container = document.getElementById('reunionesCardsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(sesiones) || !sesiones.length) {
    container.innerHTML = '<p class="text-muted">No hay sesiones registradas.</p>';
    return;
  }

  sesiones.forEach(s => {
    const fecha = (s.fecha && s.fecha.split && s.fecha.split('T')[0]) || s.fecha || 'Sin fecha';
    const hora = s.hora || '';
    const lugar = s.lugar || '';
    const motivo = s.motivo || '';
    const id_sesion = s.id_sesion || s.id;
    
    const card = document.createElement('div');
    card.className = 'card session-card';
    card.style.padding = '12px';
    card.style.marginBottom = '8px';
    card.style.background = 'var(--bg-tertiary)';

    // Truncar motivo para la tarjeta, mostrar completo en title
    const motivoShort = motivo && motivo.length > 140 ? motivo.slice(0,140) + '…' : motivo;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
        <div style="flex:1">
          <div style="font-weight:700">${fecha} ${hora ? '• ' + hora : ''}</div>
          <div style="font-size:13px;color:var(--text-secondary); margin-top:6px">${lugar ? 'Lugar: ' + lugar : ''}</div>
          <div style="font-size:13px;color:var(--text-secondary); margin-top:6px" title="${motivo ? motivo.replace(/\"/g,'\'') : ''}">Motivo: ${motivoShort || '<span class="text-muted">(no especificado)</span>'}</div>
          <div style="font-size:13px;color:var(--text-secondary); margin-top:6px">ID: ${id_sesion} • Estado: ${s.estado}</div>
        </div>
        <div style="display:flex; gap:8px; align-items:flex-start;">
          <button class="btn btn-sm btn-primary detalles-sesion-btn" data-sesion-id="${id_sesion}" onclick="handleDetallesClick(event)">Detalles</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function handleDetallesClick(event) {
  event.preventDefault();
  event.stopPropagation();
  const id = event.target.getAttribute('data-sesion-id');
  console.log('✓ Click en Detalles sesión ID:', id);
  abrirDetalleSesion(id);
}



// Insertar reglas CSS que fuerzan visibilidad del modal si alguna hoja externa lo oculta
function ensureModalStyles() {
  if (document.getElementById('comite-modal-override-styles')) return;
  const css = `
    /* Forzar visibilidad y capa del modal del comité */
    #modalNuevaSesion { display: flex !important; position: fixed !important; inset: 0 !important; align-items: center !important; justify-content: center !important; background: rgba(0,0,0,0.45) !important; z-index: 9999 !important; }
    #modalNuevaSesion .modal-content { display: block !important; position: relative !important; z-index: 10000 !important; max-height: 80vh !important; overflow: auto !important; background: var(--bg-primary, #0b0b0b) !important; color: var(--text-primary, #fff) !important; }
    #modalNuevaSesion .modal-close { cursor: pointer; }
  `;
  const style = document.createElement('style');
  style.id = 'comite-modal-override-styles';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

// Helper para formatear hora desde la UI a 'HH:MM:SS' válido para SQL
function formatHoraForSql(inputHora) {
  if (!inputHora && inputHora !== 0) return null;
  let s = String(inputHora).trim();
  s = s.replace(/[Oo]/g, '0'); // corregir O por 0
  s = s.replace(/\s+/g, ' ').toLowerCase();

  const ampmMatch = s.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*(am|pm)/i);
  if (ampmMatch) {
    const timePart = ampmMatch[1];
    const ampm = ampmMatch[2].toLowerCase();
    const parts = timePart.split(':');
    let hh = parseInt(parts[0].replace(/\D/g, ''), 10);
    const mm = (parts[1] || '00').replace(/\D/g, '').padStart(2, '0');
    const ss = (parts[2] || '00').replace(/\D/g, '').padStart(2, '0');
    if (isNaN(hh) || isNaN(parseInt(mm, 10))) return null;
    if (ampm === 'pm' && hh < 12) hh += 12;
    if (ampm === 'am' && hh === 12) hh = 0;
    return `${String(hh).padStart(2, '0')}:${mm}:${ss}`;
  }

  const parts = s.split(':');
  if (parts.length >= 2) {
    const hh = parts[0].replace(/\D/g, '').padStart(2, '0');
    const mm = (parts[1] || '00').replace(/\D/g, '').padStart(2, '0');
    const ss = (parts[2] || '00').replace(/\D/g, '').padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return null;
}


fetch("https://becas-back1.onrender.com/api/comite/pendientes")
  .then(r => {
    console.log("¿CONEXIÓN AL BACKEND?", r.status);
    return r.json();
  })
  .then(data => console.log("DATA BACKEND:", data))
  .catch(err => console.error("ERROR CONEXIÓN BACKEND:", err));

// BASE DE AP

const API_BASE =
  (window.API_CONFIG && window.API_CONFIG.ADMIN_BASE_URL) ||
  window.API_URL ||
  "https://becas-back1.onrender.com/api";

const COMITE_BASE = `${API_BASE}/comite`;

let solicitudesCache = [];
let sesionesCache = [];
let historialDecisionesCache = [];

// =====================================
// TOKEN
// =====================================
function getAuthHeaders(extra = {}) {
  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("authToken");

  const base = { "Content-Type": "application/json", ...extra };

  if (token) {
    return { ...base, Authorization: `Bearer ${token}` };
  } else {
    console.warn("No se encontró token");
    return base;
  }
}

function abrirDrawerNuevaSesion() {
  const drawer = document.getElementById('drawerNuevaSesion');
  const overlay = document.getElementById('drawerOverlay');
  if (!drawer || !overlay) return console.error('Drawer or overlay not found');
  
  drawer.style.right = '0';
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'auto';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  document.body.style.overflow = 'hidden';
  
  // Focus first input
  setTimeout(() => {
    const fechaInput = document.getElementById('fechaSesionDrawer');
    if (fechaInput) fechaInput.focus();
  }, 100);
}

function cerrarDrawerNuevaSesion() {
  const drawer = document.getElementById('drawerNuevaSesion');
  const overlay = document.getElementById('drawerOverlay');
  if (!drawer || !overlay) return;
  
  drawer.style.right = '-480px';
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.background = 'rgba(0,0,0,0)';
  document.body.style.overflow = 'auto';
  
  // Clear form
  const form = document.getElementById('formNuevaSesionDrawer');
  if (form) form.reset();
}

function guardarSesionDesdeDrawer() {
  const fecha = document.getElementById('fechaSesionDrawer')?.value;
  const hora = document.getElementById('horaSesionDrawer')?.value;
  const lugar = document.getElementById('lugarSesionDrawer')?.value;
  const motivo = document.getElementById('motivoSesionDrawer')?.value;

  if (!fecha) {
    return alert("Debes seleccionar una fecha");
  }

  try {
    const horaForm = formatHoraForSql(hora);
    if (hora && horaForm === null) return alert('Formato de hora inválido. Use HH:MM o HH:MM AM/PM');
    const payload = { fecha, hora: horaForm || null, lugar: lugar || null, motivo: motivo || null };
    
    fetch(`${COMITE_BASE}/sesiones`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (!data.id_sesion && data.error) {
        return alert(data.error || "Error creando sesión");
      }
      alert("Sesión creada correctamente");
      cerrarDrawerNuevaSesion();
      cargarProximaSesion();
      cargarHistorialSesiones();
    })
    .catch(err => {
      console.error(err);
      alert("Error conectando con el servidor.");
    });
  } catch (err) {
    console.error('guardarSesionDesdeDrawer error:', err);
    alert('Error procesando la solicitud');
  }
}

// Fallback: si el modal no se muestra por CSS/override, pedir datos por prompt y crear la sesión
async function fallbackPromptCrearSesion() {
  try {
    const fecha = prompt('Fecha de la sesión (YYYY-MM-DD)', '2025-12-10');
    if (!fecha) return alert('Operación cancelada');
    const hora = prompt('Hora de la sesión (HH:mm)', '10:00');
   if (!hora) return alert('Operación cancelada');
    const lugar = prompt('Lugar de la sesión', 'Sala A');
  if (!lugar) return alert('Operación cancelada');

    const motivo = prompt('Motivo / agenda de la sesión (opcional)', 'Revisión de casos');
    await guardarSesionPayload(fecha, hora, lugar, motivo);
  } catch (err) {
   console.error('fallbackPromptCrearSesion error:', err);
    alert('Error creando la sesión (fallback)');
  }
}

// Helper: crear sesión enviando payload (usado por fallback)
async function guardarSesionPayload(fecha, hora, lugar, motivo = null) {
  try {
    const horaForm = formatHoraForSql(hora);
    if (hora && horaForm === null) {
      return alert('Formato de hora inválido. Use HH:MM o HH:MM AM/PM');
    }
    const payload = { fecha, hora: horaForm || null, lugar: lugar || null, motivo: motivo || null };
    const resp = await fetch(`${COMITE_BASE}/sesiones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error('guardarSesionPayload error:', data);
      return alert(data.message || 'Error creando la sesión');
    }
    alert('Sesión creada correctamente (fallback)');
    await cargarProximaSesion();
    await cargarHistorialSesiones();
  } catch (err) {
    console.error('guardarSesionPayload exception:', err);
    alert('Error de conexión al crear la sesión');
  }
}

function cerrarModalSesion() {
  cerrarDrawerNuevaSesion();
}

async function guardarSesion() {
  guardarSesionDesdeDrawer();
}

// =====================================
// PRÓXIMA SESIÓN
// =====================================
async function cargarProximaSesion() {
  const contenedor = document.getElementById("proximaSesionContainer");
  if (!contenedor) return;

  contenedor.innerHTML =
    '<p class="text-muted">Cargando próxima sesión...</p>';

  try {
    const resp = await fetch(`${COMITE_BASE}/sesiones/proxima`, {
      headers: getAuthHeaders(),
    });

    console.log('[DEBUG] GET /sesiones/proxima status:', resp.status);
    let sesion = null;
    try { sesion = await resp.json(); } catch(e) { console.warn('cargarProximaSesion: respuesta no JSON', e); sesion = null; }
    console.log('[DEBUG] GET /sesiones/proxima body:', sesion);

    if (!resp.ok) {
      // Si no autorizado u otro error, mostrar mensaje claro
      contenedor.innerHTML = `<p class="text-danger">${sesion.message || 'Error cargando próxima sesión'}</p>`;
      return;
    }

    if (!sesion) {
      contenedor.innerHTML = '<p class="text-muted">No hay sesiones programadas.</p>';
      return;
    }


    // Guardar ID sesión activa
    sessionStorage.setItem("id_sesion_comite", sesion?.id_sesion || sesion?.id || null);

    // Guardar hidden si existe
    const inputSesion = document.getElementById("id_sesion_actual");
    if (inputSesion) inputSesion.value = sesion?.id_sesion || sesion?.id || '';

    contenedor.innerHTML = `
      <p><strong>Fecha:</strong> ${sesion?.fecha || '-'} ${sesion?.hora ? '• ' + (typeof sesion.hora === 'string' && sesion.hora.indexOf(':')>-1 ? sesion.hora.split(':').slice(0,2).join(':') : sesion.hora) : ''}</p>
      ${sesion?.lugar ? `<p><strong>Lugar:</strong> ${sesion.lugar}</p>` : ''}
      <p><strong>Motivo:</strong> ${sesion?.motivo ? sesion.motivo : '<span class="text-muted">(no especificado)</span>'}</p>
      <p><strong>Estado:</strong> ${sesion?.estado}</p>
      <p><strong>ID Sesión:</strong> ${sesion?.id_sesion || sesion?.id}</p>
    `;

  } catch (err) {
    console.error("Error cargando sesión", err);
    contenedor.innerHTML =
      '<p class="text-danger">Error cargando la sesión.</p>';
  }
}

// =====================================
// CARGAR SOLICITUDES
// =====================================
async function cargarSolicitudesComite() {
  const tbody = document.getElementById("comiteCasosTableBody");
  if (!tbody) return;

  tbody.innerHTML =
    '<tr><td colspan="7" class="text-muted">Cargando solicitudes...</td></tr>';

  try {
    const resp = await fetch(`${COMITE_BASE}/pendientes`, {
      headers: getAuthHeaders(),
    });

    console.log('[DEBUG] GET /pendientes status:', resp.status);
    const body = await resp.json();

    if (!resp.ok) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-danger">${body.message || 'Error cargando solicitudes'}</td></tr>`;
      return;
    }

    solicitudesCache = Array.isArray(body) ? body : [];
    console.log('[DEBUG] solicitudesCache carga:', solicitudesCache.length, 'items');

    if (!solicitudesCache.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-muted">No hay solicitudes en evaluación.</td></tr>';
      return;
    }

    tbody.innerHTML = "";

    solicitudesCache.forEach((s, index) => {
      console.log('[DEBUG] solicitud item', index, s);
      const id = s.id || s.id_solicitud;
      const codigo = s.codigo || s.nombre || `SOL-${id}`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${index + 1}</td>
        <td>${codigo}</td>
        <td>${s.estado}</td>
        <td>${s.nota_socio ?? "N/A"}</td>
        <td>${s.nota_acad ?? "N/A"}</td>
        <td>${s.total ?? "N/A"}</td>
      `;

      const tdActions = document.createElement('td');

      const btnRevisar = document.createElement('button');
      btnRevisar.className = 'btn btn-primary btn-sm';
      btnRevisar.textContent = 'Revisar';
      btnRevisar.addEventListener('click', (ev) => { ev.preventDefault(); evaluarSolicitud(id); });

      const btnAprobar = document.createElement('button');
      btnAprobar.className = 'btn btn-success btn-sm';
      btnAprobar.textContent = 'Aprobar';
      btnAprobar.addEventListener('click', (ev) => { ev.preventDefault(); aprobarSolicitudComite(id); });

      const btnDenegar = document.createElement('button');
      btnDenegar.className = 'btn btn-danger btn-sm';
      btnDenegar.textContent = 'Denegar';
      btnDenegar.addEventListener('click', (ev) => { ev.preventDefault(); denegarSolicitudComite(id); });

      tdActions.appendChild(btnRevisar);
      tdActions.appendChild(btnAprobar);
      tdActions.appendChild(btnDenegar);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error cargando solicitudes", err);
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-danger">Error cargando solicitudes.</td></tr>';
  }
}

// Mostrar/ocultar vistas del panel del comité
function mostrarVista(viewId) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  // Marcar nav
  document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));

  // Activar vista
  const view = document.getElementById(viewId);
  if (view) view.classList.add('active');

  // Marcar enlace del sidebar
  const navItem = document.querySelector(`.nav-item[data-view="${viewId.replace('committee-','')}"]`) || document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (navItem) navItem.classList.add('active');

  // Cargar datos según vista
  if (viewId === 'committee-pendientes-view') {
    cargarSolicitudesPendientes();
  }
  if (viewId === 'committee-dashboard-view') {
    cargarDatosComite();
  }
  if (viewId === 'committee-historial-view') {
    cargarHistorialDecisiones();
  }
}

// Cargar historial de decisiones (vista committee-historial-view)
async function cargarHistorialDecisiones() {
  const tbody = document.getElementById('historialDecisionesTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="12" class="text-muted">Cargando historial...</td></tr>';
  try {
    const resp = await fetch(`${COMITE_BASE}/historial-decisiones`, { headers: getAuthHeaders() });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      tbody.innerHTML = `<tr><td colspan="12" class="text-danger">${(data && data.message) || 'Error cargando historial'}</td></tr>`;
      return;
    }
    const rows = Array.isArray(data) ? data : [];
    historialDecisionesCache = rows;
    renderHistorialDecisiones();

    // attach filters
    const quarter = document.getElementById('historyQuarterFilter');
    if (quarter) quarter.addEventListener('change', renderHistorialDecisiones);
    const search = document.getElementById('historialSearch');
    if (search) search.addEventListener('input', debounce(renderHistorialDecisiones, 250));
  } catch (err) {
    console.error('Error cargando historial de decisiones:', err);
    tbody.innerHTML = '<tr><td colspan="12" class="text-danger">Error cargando historial</td></tr>';
  }
}

function formatDecisionLabel(code) {
  if (!code) return '';
  const map = {
    'APROBADA_100': 'Aprobada 100%',
    'APROBADA_50': 'Aprobada 50%',
    'RECHAZADA': 'Rechazada',
    'APROBADA': 'Aprobada'
  };
  return map[code] || code;
}

function computeCuatrimestreFromFecha(fechaStr) {
  if (!fechaStr) return '';
  // fecha esperada 'YYYY-MM-DD' o 'YYYY-MM-DD HH:MM'
  const y = fechaStr.slice(0,4);
  const month = parseInt(fechaStr.slice(5,7), 10);
  if (isNaN(month)) return '';
  if (month >= 1 && month <=4) return `${y}-1`;
  if (month >=5 && month <=8) return `${y}-2`;
  return `${y}-3`;
}

function renderHistorialDecisiones() {
  const tbody = document.getElementById('historialDecisionesTableBody');
  if (!tbody) return;
  const quarterFilter = document.getElementById('historyQuarterFilter')?.value || 'all';
  const search = (document.getElementById('historialSearch')?.value || '').toLowerCase().trim();

  let rows = historialDecisionesCache.slice();
  // compute cuatrimestre for each row
  rows = rows.map(r => ({ ...r, cuatrimestre: computeCuatrimestreFromFecha(r.fecha || '') }));

  // Nota: mostrar todas las resoluciones (incluyendo PENDIENTE). Si deseas
  // filtrar por decisión final, podemos reactivar un filtro o añadir un toggle.

  if (quarterFilter && quarterFilter !== 'all') {
    rows = rows.filter(r => r.cuatrimestre === quarterFilter);
  }

  if (search) {
    rows = rows.filter(r => {
      const codigo = (r.codigo_solicitud || ('#' + r.id_solicitud) || '').toString().toLowerCase();
      const estudiante = (r.estudiante || '').toString().toLowerCase();
      return codigo.includes(search) || estudiante.includes(search);
    });
  }

  const totalFetched = (historialDecisionesCache && Array.isArray(historialDecisionesCache)) ? historialDecisionesCache.length : 0;

  if (!rows.length) {
    if (totalFetched === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No hay resoluciones registradas. (El servidor no devolvió resoluciones)</td></tr>';
      console.warn('Historial vacío: el endpoint devolvió 0 resoluciones');
      return;
    }
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          No hay resoluciones visibles con los filtros actuales. Registros totales: ${totalFetched}.
          <div style="margin-top:8px;">
            <button id="showRawHistBtn" class="btn btn-sm btn-outline">Ver ejemplo de datos (JSON)</button>
            <span style="margin-left:8px; color:var(--text-secondary);">Prueba limpiar el filtro de cuatrimestre o la búsqueda.</span>
          </div>
        </td>
      </tr>`;

    setTimeout(() => {
      const btn = document.getElementById('showRawHistBtn');
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const sample = historialDecisionesCache.slice(0,5).map(x => ({ id_resolucion: x.id_resolucion, id_solicitud: x.id_solicitud, id_sesion: x.id_sesion, decision: x.decision, motivo: x.motivo, fecha: x.fecha }));
        const pre = document.createElement('pre');
        pre.style.maxHeight = '250px';
        pre.style.overflow = 'auto';
        pre.style.background = 'var(--bg-tertiary)';
        pre.style.padding = '8px';
        pre.style.borderRadius = '6px';
        pre.textContent = JSON.stringify(sample, null, 2);
        const wrapper = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.appendChild(pre);
        wrapper.appendChild(td);
        tbody.innerHTML = '';
        tbody.appendChild(wrapper);
      });
    }, 50);
    return;
  }

  tbody.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(r.id_resolucion || '-')}</td>
      <td>${escapeHtml(r.id_solicitud || '-')}</td>
      <td>${escapeHtml(r.id_sesion || '-')}</td>
      <td>${escapeHtml(r.decision || '-')}</td>
      <td>${escapeHtml(r.motivo || '-')}</td>
      <td>${escapeHtml(r.fecha || '-')}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Util: escape simple HTML
function escapeHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Util: debounce
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// Cargar solicitudes para la vista completa de pendientes (cards)
async function cargarSolicitudesPendientes() {
  const grid = document.querySelector('.application-grid');
  if (!grid) return;

  grid.innerHTML = '<p class="text-muted">Cargando solicitudes...</p>';

  try {
    const resp = await fetch(`${COMITE_BASE}/pendientes`, { headers: getAuthHeaders() });
    const body = await resp.json();
    if (!resp.ok) {
      grid.innerHTML = `<p class="text-danger">${body.message || 'Error cargando solicitudes'}</p>`;
      return;
    }

    const items = Array.isArray(body) ? body : [];
    if (!items.length) {
      grid.innerHTML = '<p>No hay solicitudes pendientes.</p>';
      return;
    }

    grid.innerHTML = '';
    items.forEach(s => {
        console.log('[DEBUG] pendiente item', s);
      const card = document.createElement('div');
      card.className = 'card';
      card.style.padding = '12px';
      card.style.background = 'var(--bg-tertiary)';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700">${s.codigo || ('SOL-'+s.id)}</div>
            <div style="font-size:13px;color:var(--text-secondary)">${s.estudiante || ''} • ${s.carrera || ''}</div>
            <div style="font-size:13px;color:var(--text-secondary)">Estado: ${s.estado}</div>
          </div>
          <div style="display:flex; gap:8px;" class="card-actions">
          </div>
        </div>
      `;

      // Añadir botones mediante DOM y listeners
      const actionsContainer = card.querySelector('.card-actions');
      const id = s.id || s.id_solicitud;

      const bEval = document.createElement('button');
      bEval.className = 'btn btn-primary';
      bEval.textContent = 'Evaluar';
      bEval.addEventListener('click', (ev) => { ev.preventDefault(); evaluarSolicitud(id); });

      const bApr = document.createElement('button');
      bApr.className = 'btn btn-success';
      bApr.textContent = 'Aprobar';
      bApr.addEventListener('click', (ev) => { ev.preventDefault(); aprobarSolicitudComite(id); });

      const bDen = document.createElement('button');
      bDen.className = 'btn btn-danger';
      bDen.textContent = 'Denegar';
      bDen.addEventListener('click', (ev) => { ev.preventDefault(); denegarSolicitudComite(id); });

      actionsContainer.appendChild(bEval);
      actionsContainer.appendChild(bApr);
      actionsContainer.appendChild(bDen);

      grid.appendChild(card);
    });

  } catch (err) {
    console.error('Error cargando pendientes:', err);
    grid.innerHTML = '<p class="text-danger">Error cargando solicitudes.</p>';
  }
}

// Cargar expediente completo y mostrar vista de evaluación
async function cargarExpediente(idSolicitud) {
  try {
    const resp = await fetch(`${COMITE_BASE}/expediente/${idSolicitud}`, { headers: getAuthHeaders() });
    const data = await resp.json();
    if (!resp.ok) {
      return alert(data.message || 'Error cargando expediente');
    }

    const { solicitud, documentos, info_academica, info_socio } = data;

    // Desencriptar correo y cédula si están encriptados
    let correoDesencriptado = solicitud?.correo || '';
    let cedulaDesencriptada = solicitud?.cedula || '';
    
    // Si el correo contiene ':', probablemente esté encriptado
    if (correoDesencriptado && correoDesencriptado.includes(':')) {
      correoDesencriptado = await decryptViaServer(correoDesencriptado);
    }
    
    // Si la cédula contiene ':', probablemente esté encriptada
    if (cedulaDesencriptada && cedulaDesencriptada.includes(':')) {
      cedulaDesencriptada = await decryptViaServer(cedulaDesencriptada);
    }

    // Rellenar datos en la vista de evaluación
    const nameEl = document.getElementById('evalStudentName');
    const emailEl = document.getElementById('evalStudentEmail');
    const careerEl = document.getElementById('evalStudentCareer');
    const docsEl = document.getElementById('evalDocumentsList');

    if (nameEl) nameEl.textContent = solicitud?.estudiante || solicitud?.nombre || 'Sin estudiante';
    if (emailEl) emailEl.textContent = correoDesencriptado || '';
    if (careerEl) careerEl.textContent = solicitud?.carrera ? `Carrera: ${solicitud.carrera}` : '';

    if (docsEl) {
      docsEl.innerHTML = '';
      if (Array.isArray(documentos) && documentos.length) {
        documentos.forEach(d => {
          const item = document.createElement('div');
          item.style.display = 'flex';
          item.style.alignItems = 'center';
          item.style.gap = '8px';
          item.style.padding = '8px';
          item.style.background = 'var(--bg-secondary)';
          item.style.borderRadius = '6px';
          item.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <a href="${d.url_archivo || '#'}" target="_blank">${d.url_archivo ? d.url_archivo.split('/').pop() : 'Documento'}</a>
          `;
          docsEl.appendChild(item);
        });
      } else {
        docsEl.innerHTML = '<div class="text-muted">No hay documentos adjuntos.</div>';
      }
    }

    // Ajustar hidden inputs
    const input = document.getElementById('id_solicitud_actual');
    if (input) input.value = solicitud.id_solicitud || idSolicitud;

    // Mostrar la vista de evaluación
    mostrarVista('committee-evaluacion-view');

  } catch (err) {
    console.error('Error cargando expediente:', err);
    alert('Error cargando expediente');
  }
}

// Enviar resolución desde la vista de evaluación (botones en la UI)
function enviarResolucionDesdeVista(decision) {
  const id = document.getElementById('id_solicitud_actual')?.value;
  if (!id) return alert('No se ha cargado la solicitud a evaluar');
  const motivo = document.getElementById('resolucionMotivoVista')?.value || '';
  // confirmar acción
  if (decision === 'APROBADA') {
    if (!confirm('¿Confirmar aprobación de la solicitud?')) return;
  } else if (decision === 'NO APROBADA') {
    if (!confirm('¿Confirmar denegación de la solicitud?')) return;
  }
  enviarResolucion(id, decision, motivo).catch(err => {
    alert('Error registrando la resolución');
    console.error(err);
  });
}

// =====================================
// EVALUAR SOLICITUD (SE ABRE LA VISTA)
// =====================================
function evaluarSolicitud(idSolicitud) {
  console.log('evaluarSolicitud llamado con id:', idSolicitud);
  // validar id
  if (idSolicitud === undefined || idSolicitud === null) {
    console.warn('evaluarSolicitud: id inválido');
    return alert('No se pudo identificar la solicitud a evaluar');
  }

  // Mostrar carga en la vista de evaluación
  const nameEl = document.getElementById('evalStudentName');
  if (nameEl) nameEl.textContent = 'Cargando expediente...';

  // Abrir expediente y mostrar vista
  cargarExpediente(idSolicitud);
}

// =====================================
// MODAL REVISIÓN (SE MANTIENE TU FUNCIONALIDAD)
// =====================================
function abrirModalRevision(idSolicitud) {
  const modal = document.getElementById("modalRevisionCaso");
  if (!modal) return;

  const solicitud = solicitudesCache.find(
    (s) => (s.id || s.id_solicitud) == idSolicitud
  );

  if (!solicitud) {
    console.warn('abrirModalRevision: solicitud no encontrada en cache, intentando cargar expediente desde backend para id=', idSolicitud);
    // Intentar cargar expediente directamente desde backend
    return cargarExpediente(idSolicitud);
  }

  const content = modal.querySelector(".modal-content");
  if (!content) return;

  const codigo = solicitud.codigo || solicitud.nombre || `SOL-${idSolicitud}`;

  content.innerHTML = `
    <h3>Detalle del Caso</h3>

    <p><strong>Código solicitud:</strong> ${codigo}</p>
    <p><strong>Estado:</strong> ${solicitud.estado}</p>
    <p><strong>Fecha de creación:</strong> ${solicitud.fecha || "-"}</p>
    <p><strong>Nota socioeconómica:</strong> ${solicitud.nota_socio ?? "N/A"}</p>
    <p><strong>Nota académica:</strong> ${solicitud.nota_acad ?? "N/A"}</p>
    <p><strong>Total:</strong> ${solicitud.total ?? "N/A"}</p>

    <br>

    <div style="margin-top:8px;">
      <label for="resolucionMotivo" style="display:block; font-weight:600; margin-bottom:6px;">Motivo / Observaciones (opcional)</label>
      <textarea id="resolucionMotivo" style="width:100%; min-height:80px; margin-bottom:8px;" placeholder="Escribe el motivo o comentario de la decisión"></textarea>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-success" onclick="enviarResolucion(${idSolicitud}, 'APROBADA')">Aprobar</button>
        <button class="btn btn-danger" onclick="enviarResolucion(${idSolicitud}, 'NO APROBADA')">Denegar</button>
        <button class="btn btn-secondary" onclick="cerrarModalRevision()">Cerrar</button>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

function cerrarModalRevision() {
  const modal = document.getElementById("modalRevisionCaso");
  if (modal) modal.style.display = "none";
}

// =====================================
// DETALLE DE SESIÓN (modal)
// =====================================
// Funciones definidas a continuación

/**
 * Abre el modal de detalles de una sesión
 */
function abrirDetalleSesion(idSesion) {
  console.log('abrirDetalleSesion:', idSesion);
  
  // Buscar en cache primero
  let sesion = sesionesCache.find(s => (s.id_sesion || s.id) == idSesion);
  
  if (sesion) {
    mostrarDetalles(sesion);
  } else {
    // Si no está en cache, cargar del servidor
    fetch(`${COMITE_BASE}/sesiones/todas`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        sesionesCache = data;
        sesion = data.find(s => (s.id_sesion || s.id) == idSesion);
        if (sesion) mostrarDetalles(sesion);
        else alert('Sesión no encontrada');
      })
      .catch(err => {
        console.error('Error cargando sesión:', err);
        alert('Error al cargar la sesión');
      });
  }
}

/**
 * Muestra los detalles en el modal
 */
function mostrarDetalles(s) {
  console.log('mostrarDetalles:', s);
  
  if (!s) {
    console.error('❌ Sesión vacía o nula');
    return;
  }
  
  // Guardar sesión para referencia
  window.sesionActual = s;
  
  // Llenar campos de visualización
  const idSesion = s.id_sesion || s.id;
  const fecha = (s.fecha || '').split('T')[0] || '-';
  const hora = s.hora ? '• ' + s.hora : '';
  const lugar = s.lugar || '-';
  const motivo = s.motivo ? s.motivo.replace(/\n/g, '<br>') : '<span class="text-muted">(no especificado)</span>';
  const estado = s.estado || 'SIN ESTADO';
  
  // IMPORTANTE: Verificar que los elementos existan antes de modificarlos
  const elFecha = document.getElementById('detalle_fecha');
  const elHora = document.getElementById('detalle_hora');
  const elLugar = document.getElementById('detalle_lugar');
  const elId = document.getElementById('detalle_id');
  const elEstado = document.getElementById('detalle_estado');
  const elMotivo = document.getElementById('detalle_motivo');
  
  if (elFecha) elFecha.textContent = fecha;
  if (elHora) elHora.textContent = hora;
  if (elLugar) elLugar.textContent = lugar;
  if (elId) elId.textContent = idSesion;
  if (elEstado) elEstado.textContent = estado;
  if (elMotivo) elMotivo.innerHTML = motivo;
  
  console.log('✓ Datos del modal actualizados');
  
  // Restaurar botones a estado normal
  const btnEdit = document.getElementById('modalDetalleSesionEdit');
  const btnDelete = document.getElementById('modalDetalleSesionDelete');
  const btnCloseBtn = document.getElementById('modalDetalleSesionCloseBtn');
  const btnClose = document.getElementById('modalDetalleSesionClose');
  
  if (btnClose) {
    btnClose.style.cssText = 'cursor: pointer !important;';
    console.log('✓ Botón X listo');
  }
  if (btnEdit) {
    btnEdit.textContent = 'Editar';
    btnEdit.style.cssText = 'background: #3b82f6 !important; cursor: pointer !important;';
    console.log('✓ Botón "Editar" listo');
  }
  if (btnDelete) {
    btnDelete.textContent = 'Eliminar';
    btnDelete.style.cssText = 'background: #ef4444 !important; cursor: pointer !important;';
    console.log('✓ Botón "Eliminar" listo');
  }
  if (btnCloseBtn) {
    btnCloseBtn.textContent = 'Cerrar';
    btnCloseBtn.style.cssText = 'cursor: pointer !important;';
  }
  
  // Mostrar modal con estilos fuertes
  const modal = document.getElementById('modalDetalleSesion');
  modal.classList.add('active'); // Agregar clase para CSS
  modal.style.cssText = `
    display: flex !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important; 
    width: 100% !important;
    height: 100% !important;
    align-items: center !important;
    justify-content: center !important;
    background: rgba(0,0,0,0.5) !important;
    z-index: 10002 !important;
    visibility: visible !important;
    opacity: 1 !important;
  `;
  
  console.log('✓ Modal mostrado para sesión:', idSesion);
}

/**
 * Activa el modo edición
 */
function habilitarEditarSesion(s) {
  console.log('habilitarEditarSesion:', s.id_sesion || s.id);
  
  const body = document.getElementById('detalleSesionBody');
  const idSesion = s.id_sesion || s.id;
  const fecha = (s.fecha || '').split('T')[0] || '';
  const hora = s.hora || '';
  const lugar = s.lugar || '';
  const motivo = s.motivo || '';
  
  // Convertir a formulario editable
  body.innerHTML = `
    <p><strong>Fecha:</strong> 
      <input type="date" id="edit_fecha" value="${fecha}" style="width: 100%; padding: 6px; margin-top: 6px; border: 1px solid #555; border-radius: 4px; background: #1a1f2e; color: #e6eef8;">
    </p>
    <p><strong>Hora:</strong> 
      <input type="time" id="edit_hora" value="${hora}" style="width: 100%; padding: 6px; margin-top: 6px; border: 1px solid #555; border-radius: 4px; background: #1a1f2e; color: #e6eef8;">
    </p>
    <p><strong>Lugar:</strong> 
      <input type="text" id="edit_lugar" value="${lugar}" style="width: 100%; padding: 6px; margin-top: 6px; border: 1px solid #555; border-radius: 4px; background: #1a1f2e; color: #e6eef8;">
    </p>
    <p><strong>Motivo / Agenda:</strong>
      <textarea id="edit_motivo" style="width: 100%; padding: 6px; margin-top: 6px; border: 1px solid #555; border-radius: 4px; background: #1a1f2e; color: #e6eef8; min-height: 80px; font-family: inherit;">${motivo}</textarea>
    </p>
  `;
  
  console.log('✓ Modo edición activado');
  
  // Cambiar botones a Guardar y Cancelar
  const btnEdit = document.getElementById('modalDetalleSesionEdit');
  const btnDelete = document.getElementById('modalDetalleSesionDelete');
  const btnCloseBtn = document.getElementById('modalDetalleSesionCloseBtn');
  
  if (btnEdit) {
    btnEdit.textContent = 'Guardar Cambios';
    btnEdit.style.cssText = 'background: #22c55e !important; cursor: pointer !important;';
    console.log('✓ Botón "Guardar Cambios" listo');
  }
  if (btnDelete) {
    btnDelete.textContent = 'Cancelar';
    btnDelete.style.cssText = 'background: #ef4444 !important; cursor: pointer !important;';
    console.log('✓ Botón "Cancelar" listo');
  }
  if (btnCloseBtn) {
    btnCloseBtn.textContent = 'Cerrar';
    btnCloseBtn.style.cssText = 'cursor: pointer !important;';
  }
}


/**
 * Guarda los cambios de la sesión
 */
async function guardarCambiosSesion(idSesion) {
  console.log('guardarCambiosSesion:', idSesion);
  
  const fecha = document.getElementById('edit_fecha')?.value;
  const hora = document.getElementById('edit_hora')?.value;
  const lugar = document.getElementById('edit_lugar')?.value;
  const motivo = document.getElementById('edit_motivo')?.value;
  
  console.log('Datos capturados:', { fecha, hora, lugar, motivo });
  
  if (!fecha) {
    alert('❌ La fecha es obligatoria');
    return;
  }
  
  try {
    const horaForm = formatHoraForSql(hora);
    if (hora && horaForm === null) {
      alert('❌ Formato de hora inválido. Use HH:MM');
      return;
    }
    
    console.log('Enviando PUT a:', `${COMITE_BASE}/sesiones/${idSesion}`);
    
    // Preservar el estado actual si existe
    const estadoActual = window.sesionActual?.estado || 'ABIERTA';
    
    const resp = await fetch(`${COMITE_BASE}/sesiones/${idSesion}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fecha: fecha,
        hora: horaForm || hora || null,
        lugar: lugar || null,
        motivo: motivo || null,
        estado: estadoActual
      })
    });
    
    console.log('Respuesta:', resp.status, resp.statusText);
    
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      console.error('Error en respuesta:', data);
      alert('❌ Error: ' + (data.message || 'No se pudo guardar'));
      return;
    }
    
    const data = await resp.json();
    console.log('✅ Cambios guardados:', data);
    
    // Actualizar cache
    const idx = sesionesCache.findIndex(s => (s.id_sesion || s.id) == idSesion);
    if (idx >= 0) {
      sesionesCache[idx] = data;
      console.log('✓ Cache actualizado');
    }
    
    // Mostrar éxito
    alert('✅ Reunión actualizada correctamente');
    
    // Recargar vistas
    await cargarHistorialSesiones();
    await cargarProximaSesion();
    
    console.log('✓ Vistas recargadas');
    
    // Volver a mostrar detalles
    mostrarDetalles(data);
    
  } catch (err) {
    console.error('Error guardando:', err);
    alert('❌ Error de conexión: ' + err.message);
  }
}

/**
 * Elimina la sesión
 */
async function eliminarSesion(idSesion) {
  console.log('eliminarSesion:', idSesion);
  
  try {
    console.log('Enviando DELETE a:', `${COMITE_BASE}/sesiones/${idSesion}`);
    
    const resp = await fetch(`${COMITE_BASE}/sesiones/${idSesion}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    console.log('Respuesta:', resp.status, resp.statusText);
    
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      console.error('Error en respuesta:', data);
      alert('❌ Error: ' + (data.message || 'No se pudo eliminar'));
      return;
    }

    console.log('✅ Sesión eliminada');
    
    // Quitar de cache
    sesionesCache = sesionesCache.filter(s => (s.id_sesion || s.id) != idSesion);
    console.log('✓ Removida del cache');
    
    // Cerrar modal
    cerrarDetalleSesion();
    
    // Mostrar éxito
    alert('✅ Reunión eliminada correctamente');
    
    // Recargar vistas
    await cargarHistorialSesiones();
    await cargarProximaSesion();
    
    console.log('✓ Vistas recargadas');

  } catch (err) {
    console.error('Error eliminando:', err);
    alert('❌ Error de conexión: ' + err.message);
  }
}

/**
 * Cierra el modal de detalles
 */
function cerrarDetalleSesion() {
  const modal = document.getElementById('modalDetalleSesion');
  if (modal) {
    modal.classList.remove('active');
    modal.style.cssText = 'display: none !important;';
  }
  console.log('✓ Modal cerrado');
}

// =====================================
// APROBAR / DENEGAR SOLICITUD
// =====================================
async function aprobarSolicitudComite(idSolicitud) {
  // Prompt for optional motivo, then register resolution via API
  const motivo = prompt('Motivo/observaciones (opcional) para la aprobación', '');
  if (motivo === null) return; // user cancelled
  try {
    await enviarResolucion(idSolicitud, 'APROBADA', motivo);
    cerrarModalRevision();
    cargarSolicitudesComite();
  } catch (err) {
    console.error('aprobarSolicitudComite error', err);
    alert('Error registrando la aprobación');
  }
}

async function denegarSolicitudComite(idSolicitud) {
  const motivo = prompt('Motivo/observaciones (opcional) para la denegación', '');
  if (motivo === null) return;
  try {
    await enviarResolucion(idSolicitud, 'NO APROBADA', motivo);
    cerrarModalRevision();
    cargarSolicitudesComite();
  } catch (err) {
    console.error('denegarSolicitudComite error', err);
    alert('Error registrando la denegación');
  }
}

// Sistema de votación eliminado: la función guardarDecisionComite ha sido removida.

// Enviar resolución (crea registro en tabla resoluciones y actualiza estado)
async function enviarResolucion(idSolicitud, decision, motivo = '') {
  try {
    // intentar añadir id_sesion actual si existe en sessionStorage
    const idSesionActual = sessionStorage.getItem('id_sesion_comite') || null;
    const body = { decision, motivo };
    if (idSesionActual) body.id_sesion = idSesionActual;

    const resp = await fetch(`${COMITE_BASE}/resolucion/${idSolicitud}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error('enviarResolucion error:', data);
      throw new Error(data.message || 'Error registrando resolución');
    }

    // Refrescar listas relevantes
    await cargarHistorialDecisiones();
    await cargarSolicitudesComite();
    await cargarHistorialSesiones();
    // Limpiar formularios y cerrar modales asociados
    try {
      const motivoVista = document.getElementById('resolucionMotivoVista');
      if (motivoVista) motivoVista.value = '';
      const motivoModal = document.getElementById('resolucionMotivo');
      if (motivoModal) motivoModal.value = '';
      const inputId = document.getElementById('id_solicitud_actual');
      if (inputId) inputId.value = '';
      // Cerrar modal de revisión si está abierto
      cerrarModalRevision();
      // Regresar al dashboard automáticamente
      mostrarVista('committee-dashboard-view');
    } catch (e) { console.warn('Limpiar UI tras resolución falló', e); }

    showConfirmModal('Resolución registrada correctamente');
    return data;
  } catch (err) {
    console.error('enviarResolucion exception:', err);
    throw err;
  }
}

// Mostrar modal de confirmación
function showConfirmModal(message, title = 'Confirmación') {
  const modal = document.getElementById('modalConfirm');
  const msg = document.getElementById('modalConfirmMessage');
  const titleEl = document.getElementById('modalConfirmTitle');
  if (!modal || !msg || !titleEl) return alert(message);
  titleEl.textContent = title;
  msg.textContent = message;
  modal.style.display = 'flex';
  // Use once:true to avoid attaching multiple handlers over repeated calls
  document.getElementById('modalConfirmClose')?.addEventListener('click', closeConfirmModal, { once: true });
}

// Mostrar diálogo de confirmación con callbacks
function showConfirmDialog(message, onConfirm, title = 'Confirmar') {
  const modal = document.getElementById('modalConfirm');
  const msg = document.getElementById('modalConfirmMessage');
  const titleEl = document.getElementById('modalConfirmTitle');
  if (!modal || !msg || !titleEl) return (window.confirm(message) ? onConfirm && onConfirm() : null);

  titleEl.textContent = title;
  msg.textContent = message;

  // Clear previous buttons and create Confirm/Cancel
  const buttonsContainer = modal.querySelector('.modal-content > div');
  if (!buttonsContainer) return;

  // remove existing dynamic buttons (except the close which may exist)
  buttonsContainer.innerHTML = '';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.addEventListener('click', () => { closeConfirmModal(); }, { once: true });

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.textContent = 'Confirmar';
  confirmBtn.addEventListener('click', () => {
    closeConfirmModal();
    try { onConfirm && onConfirm(); } catch (e) { console.error('onConfirm error', e); }
  }, { once: true });

  buttonsContainer.appendChild(cancelBtn);
  buttonsContainer.appendChild(confirmBtn);

  modal.style.display = 'flex';
}

function closeConfirmModal() {
  const modal = document.getElementById('modalConfirm');
  if (modal) modal.style.display = 'none';
}

// Actualizar badge de decisión en la vista de evaluación
// updateDecisionBadge removed along with voting UI

// =====================================
// HISTORIAL SESIONES
// =====================================
async function cargarHistorialSesiones() {
  const tbody = document.getElementById("comiteHistorialSesionBody");
  if (!tbody) return;

  tbody.innerHTML =
    '<tr><td colspan="3" class="text-muted">Cargando historial...</td></tr>';

  try {
    const resp = await fetch(`${COMITE_BASE}/sesiones/todas`, {
      headers: getAuthHeaders(),
    });

    console.log('[DEBUG] GET /sesiones/todas status:', resp.status);
    let data = null;
    try { data = await resp.json(); } catch (e) { console.warn('cargarHistorialSesiones: respuesta no JSON', e); data = null; }
    console.log('[DEBUG] GET /sesiones/todas body:', data);

    if (!resp.ok) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-danger">${(data && data.message) || 'Error cargando historial'}</td></tr>`;
      return;
    }

    // Manejar distintos formatos: si el backend devuelve { rows: [...] } o directamente un array
    let sesiones = [];
    if (Array.isArray(data)) sesiones = data;
    else if (data && Array.isArray(data.rows)) sesiones = data.rows;
    else if (data && Array.isArray(data.data)) sesiones = data.data;
    else sesiones = [];

    // almacenar en cache para detalles rápidos
    sesionesCache = sesiones;

    if (!sesiones.length) {
      tbody.innerHTML = '<tr><td colspan="3">No hay sesiones registradas</td></tr>';
      // also clear session cards container
      try { document.getElementById('reunionesCardsContainer').innerHTML = '<p class="text-muted">No hay sesiones registradas.</p>'; } catch(e){}
      sesionesCache = [];
      return;
    }

    tbody.innerHTML = "";

    sesiones.forEach((s) => {
      const fechaFormateada = (s && s.fecha && s.fecha.split) ? s.fecha.split("T")[0] : (s && s.fecha) || '-';

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fechaFormateada}</td>
        <td>${s.estado || '-'}</td>
        <td>${s.id_sesion || s.id || '-'}</td>
      `;
      tbody.appendChild(tr);
    });

    // cache and render
    sesionesCache = sesiones;
    try { renderSessionCards(sesiones); } catch (e) { console.warn('renderSessionCards no disponible o falló:', e); }

  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="3">Error cargando historial</td></tr>';
  }
}


// =====================================
// INICIALIZACIÓN
// =====================================
async function cargarDatosComite() {
  await cargarProximaSesion();
  await cargarSolicitudesComite();
  await cargarHistorialSesiones();
}

document.addEventListener("DOMContentLoaded", () => {
  // Botón de decisión removido (sistema de votación eliminado)
  // Cargar datos del comité al iniciar la vista
  cargarDatosComite();
  // Delegated listener para los botones "Detalles" dentro del contenedor de reuniones
  try {
    const reunionesContainer = document.getElementById('reunionesCardsContainer');
    if (reunionesContainer) {
      reunionesContainer.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('[data-action="ver"]');
        if (btn) {
          e.preventDefault();
          const id = btn.getAttribute('data-id') || btn.dataset.id;
          console.log('Delegated click en Detalles, id=', id);
          abrirDetalleSesion(id);
        }
      });
    }
  } catch (err) { console.warn('Error attach delegated listener reuniones:', err); }
  // Wire sidebar navigation
  document.querySelectorAll('.nav-item[data-view]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const view = a.getAttribute('data-view');
      if (view) mostrarVista(`${view}-view`);
    });
  });
  // Mostrar nombre del usuario en la cabecera
  loadUserHeader();
  // Asegurar que el botón Nueva Sesión abra el drawer incluso si onclick no funciona
  const btnNueva = document.getElementById('btnNuevaSesion');
  if (btnNueva) btnNueva.addEventListener('click', (e) => { e.preventDefault(); abrirDrawerNuevaSesion(); });
  
  // Drawer buttons
  const drawerClose = document.getElementById('drawerClose');
  const drawerCancel = document.getElementById('drawerCancel');
  const drawerSave = document.getElementById('drawerSave');
  const drawerOverlay = document.getElementById('drawerOverlay');
  
  if (drawerClose) drawerClose.addEventListener('click', (e) => { e.preventDefault(); cerrarDrawerNuevaSesion(); });
  if (drawerCancel) drawerCancel.addEventListener('click', (e) => { e.preventDefault(); cerrarDrawerNuevaSesion(); });
  if (drawerSave) drawerSave.addEventListener('click', (e) => { e.preventDefault(); guardarSesionDesdeDrawer(); });
  if (drawerOverlay) drawerOverlay.addEventListener('click', (e) => { e.preventDefault(); cerrarDrawerNuevaSesion(); });
  // Wire export CSV button for historial
  const btnExport = document.getElementById('exportHistorialCsvBtn');
  if (btnExport) btnExport.addEventListener('click', (e) => { e.preventDefault(); exportHistorialToCsv(); });
  // Nota: los botones "Ver" fueron eliminados; no se añade listener delegado.
  const historialTbody = document.getElementById('historialDecisionesTableBody');

  // Wire evaluation view buttons if present
  const btnAprVista = document.getElementById('btnAprobarVista');
  const btnDenVista = document.getElementById('btnDenegarVista');
  const btnCerrarEval = document.getElementById('btnCerrarEvaluacion');
  if (btnAprVista) btnAprVista.addEventListener('click', (e) => { e.preventDefault(); enviarResolucionDesdeVista('APROBADA'); });
  if (btnDenVista) btnDenVista.addEventListener('click', (e) => { e.preventDefault(); enviarResolucionDesdeVista('NO APROBADA'); });
  if (btnCerrarEval) btnCerrarEval.addEventListener('click', (e) => { e.preventDefault(); mostrarVista('committee-dashboard-view'); });

  // Old modal listeners (deprecated, kept for backward compatibility if ensureModalNuevaSesionExists is called)
  try {
    const mClose = document.getElementById('modalNuevaSesionClose');
    const mCancel = document.getElementById('modalNuevaSesionCancel');
    const mSave = document.getElementById('modalNuevaSesionSave');
    if (mClose) mClose.addEventListener('click', (e) => { e.preventDefault(); cerrarDrawerNuevaSesion(); });
    if (mCancel) mCancel.addEventListener('click', (e) => { e.preventDefault(); cerrarDrawerNuevaSesion(); });
    if (mSave) mSave.addEventListener('click', (e) => { e.preventDefault(); guardarSesionDesdeDrawer(); });
  } catch (e) { console.warn('No se pudieron enlazar listeners del modalNuevaSesion:', e); }
});

// Listener delegado adicional: captura clicks aunque el elemento no tenga listener directo
document.addEventListener('click', (e) => {
  try {
    const target = e.target;
    const hit = target && (target.id === 'btnNuevaSesion' || target.closest && target.closest('#btnNuevaSesion'));
    if (hit) {
      console.log('Delegated: btnNuevaSesion clicked');
      e.preventDefault();
      abrirDrawerNuevaSesion();
    }
  } catch (err) {
    console.warn('Error en listener delegado:', err);
  }
});

// Cargar perfil del usuario autenticado y rellenar la vista "Mi Perfil"
async function cargarPerfil() {
  try {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRole = document.getElementById('profileRole');
    const profilePhone = document.getElementById('profilePhone');
    const profileDept = document.getElementById('profileDepartment');

    // Indicador de carga
    if (profileName) profileName.textContent = 'Cargando...';
    if (profileEmail) profileEmail.textContent = '';

    if (!token) {
      console.warn('cargarPerfil: no hay token en storage');
      const fallback = sessionStorage.getItem('userName') || localStorage.getItem('userName');
      if (profileName) profileName.textContent = fallback || 'No autenticado';
      if (profileRole) profileRole.textContent = '';
      return;
    }

    const headers = getAuthHeaders();
    console.log('cargarPerfil: fetch ->', `${API_BASE}/auth/me`, headers);

    const resp = await fetch(`${API_BASE}/auth/me`, { headers });
    let body = null;
    try { body = await resp.json(); } catch (e) { console.warn('cargarPerfil: respuesta no JSON', e); }

    console.log('cargarPerfil: status', resp.status, 'body', body);

    if (!resp.ok) {
      const fallback = sessionStorage.getItem('userName') || localStorage.getItem('userName');
      if (profileName) profileName.textContent = fallback || 'No disponible';
      if (profileEmail) profileEmail.textContent = '';
      console.warn('cargarPerfil: error ->', body && (body.message || JSON.stringify(body)));
      return;
    }

    const user = (body && (body.user || body)) || {};

    if (profileName) profileName.textContent = user.name || sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Sin nombre';
    if (profileRole) profileRole.textContent = (user.rol || user.role || 'Miembro').toString();
    if (profileEmail) profileEmail.textContent = user.email || '';
    if (profilePhone) profilePhone.textContent = user.phone || user.telefono || profilePhone.textContent || '';
    if (profileDept) profileDept.textContent = user.department || user.departamento || profileDept.textContent || '';

    // Actualizar header y greeting
    if (user.name) {
      sessionStorage.setItem('userName', user.name);
      loadUserHeader();
      loadGreeting();
    }

  } catch (err) {
    console.error('Error cargando perfil:', err);
  }
}

// Llamar cargarPerfil al inicializar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarPerfil();
});

// Mostrar nombre del usuario en la cabecera del comité
function loadUserHeader() {
  const name = sessionStorage.getItem('userName') || localStorage.getItem('userName');
  const el = document.getElementById('committeeUserName');
  if (el) {
    el.textContent = name || 'Miembro';
  }
  const avatar = document.getElementById('committeeAvatar');
  if (avatar && name) {
    avatar.alt = name;
  }
  // Si no hay token, opcionalmente redirigir al login (descomentar si desea)
  // const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  // if (!token) window.location.href = 'index.html';
}

// También actualizar el título de bienvenida grande
function loadGreeting() {
  const name = sessionStorage.getItem('userName') || localStorage.getItem('userName');
  const span = document.getElementById('committeeGreetingName');
  if (span) span.textContent = name || 'Miembro';
}

// Llamar loadGreeting desde loadUserHeader para mantenerlo centralizado
const _oldLoadUserHeader = loadUserHeader;
loadUserHeader = function() {
  _oldLoadUserHeader();
  loadGreeting();
}

// =====================================
// FUNCIONES EXPUESTAS
// =====================================
window.handleDetallesClick = handleDetallesClick;
window.abrirDetalleSesion = abrirDetalleSesion;
window.cerrarDetalleSesion = cerrarDetalleSesion;
window.mostrarDetalles = mostrarDetalles;
window.habilitarEditarSesion = habilitarEditarSesion;
window.guardarCambiosSesion = guardarCambiosSesion;
window.eliminarSesion = eliminarSesion;
window.abrirDrawerNuevaSesion = abrirDrawerNuevaSesion;
window.cerrarDrawerNuevaSesion = cerrarDrawerNuevaSesion;
window.guardarSesionDesdeDrawer = guardarSesionDesdeDrawer;
window.cerrarModalSesion = cerrarModalSesion;
window.guardarSesion = guardarSesion;
window.abrirModalRevision = abrirModalRevision;
window.cerrarModalRevision = cerrarModalRevision;
window.aprobarSolicitudComite = aprobarSolicitudComite;
window.denegarSolicitudComite = denegarSolicitudComite;
window.evaluarSolicitud = evaluarSolicitud;
window.cargarDatosComite = cargarDatosComite;

document.addEventListener("DOMContentLoaded", () => {
  const comiteView = document.getElementById("comite-view");
  if (comiteView && comiteView.classList.contains("active")) {
    cargarDatosComite();
  }
  
  // Event listeners delegados para botones del modal
  document.addEventListener('click', (e) => {
    if (e.target.id === 'modalDetalleSesionEdit') {
      console.log('🎯 Click detectado en', e.target.textContent);
      if (e.target.textContent.includes('Guardar')) {
        // Modo edición: "Guardar Cambios"
        const idSesion = window.sesionActual?.id_sesion || window.sesionActual?.id;
        if (idSesion) {
          guardarCambiosSesion(idSesion);
        }
      } else if (e.target.textContent.includes('Editar')) {
        // Modo vista: "Editar"
        if (window.sesionActual) {
          habilitarEditarSesion(window.sesionActual);
        }
      }
    } else if (e.target.id === 'modalDetalleSesionDelete') {
      console.log('🎯 Click detectado en', e.target.textContent);
      if (e.target.textContent.includes('Cancelar')) {
        // Modo edición: "Cancelar"
        if (window.sesionActual) {
          mostrarDetalles(window.sesionActual);
        }
      } else if (e.target.textContent.includes('Eliminar')) {
        // Modo vista: "Eliminar"
        if (confirm('¿Está seguro que desea ELIMINAR esta reunión? Esta acción NO se puede deshacer.')) {
          const idSesion = window.sesionActual?.id_sesion || window.sesionActual?.id;
          if (idSesion) eliminarSesion(idSesion);
        }
      }
    } else if (e.target.id === 'modalDetalleSesionCloseBtn') {
      console.log('🎯 Click detectado en Cerrar');
      cerrarDetalleSesion();
    } else if (e.target.id === 'modalDetalleSesionClose') {
      console.log('🎯 Click detectado en X');
      cerrarDetalleSesion();
    }
  }, true); // Capturar en fase de captura para asegurar que se ejecute
});

// Logout function
function logout() {
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "index.html";
}

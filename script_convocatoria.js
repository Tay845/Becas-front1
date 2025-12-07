// ===============================
// CONFIGURACIÓN GENERAL DEL API
// ===============================
const API = window.API_CONFIG?.ADMIN_BASE_URL || "https://becas-back1.onrender.com/api/admin";

async function api(path, method = "GET", body = null) {
    const opts = {
        method,
        headers: { "Content-Type": "application/json" }
    };

    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(API + path, opts);

    if (!res.ok) throw new Error("API error " + res.status);

    return res.status === 204 ? null : res.json();
}

// ===============================
// NAVEGACIÓN ENTRE VISTAS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll(".nav-item[data-view]");
    const views = document.querySelectorAll(".view");

    navItems.forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();
            const viewId = item.dataset.view + "-view";

            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            views.forEach(v => v.classList.remove("active"));
            document.getElementById(viewId)?.classList.add("active");

            cargarVista(item.dataset.view);
        });
    });

    cargarVista("convocatoria");
});

let convocatoriaActiva = null;

// ===============================
// CONTROLADOR DE VISTAS
// ===============================
async function cargarVista(vista) {

    if (vista === "tiposbeca") cargarTiposBeca();

    if (vista === "convocatoria") {
        await cargarConvocatorias();
        cargarPeriodos();
        cargarSolicitudes();

        if (convocatoriaActiva) {
            cargarEtapas(convocatoriaActiva.id_convocatoria);
        }

        // 🔹 Apelaciones: se cargan solo en la vista Convocatoria
        cargarApelaciones();
    }

    if (vista === "solicitudes") cargarSolicitudes();
}

// ===============================
// EVENTOS BOTONES → MODALES
// ===============================
document.addEventListener("click", (e) => {

    if (e.target.id === "btnNuevaConvocatoria") {
        document.getElementById("formConvocatoria").reset();
        document.getElementById("modalConvocatoria").style.display = "flex";
    }

    if (e.target.id === "cerrarModalConvocatoria") {
        document.getElementById("modalConvocatoria").style.display = "none";
    }

    if (e.target.id === "btnNuevaSolicitud") {
        document.getElementById("formSolicitud").reset();
        document.getElementById("modalSolicitud").style.display = "flex";
    }

    if (e.target.id === "cerrarModalSolicitud") {
        document.getElementById("modalSolicitud").style.display = "none";
    }

    if (e.target.id === "btnNuevoPeriodo") {
        document.getElementById("formPeriodo").reset();
        document.getElementById("periodoId").value = "";
        document.getElementById("modalPeriodoTitulo").innerText = "Nuevo Periodo";
        document.getElementById("modalPeriodo").style.display = "flex";
    }

    if (e.target.id === "cerrarModalPeriodo") {
        document.getElementById("modalPeriodo").style.display = "none";
    }
});

// ===============================
// TIPOS DE BECA
// ===============================
async function cargarTiposBeca() {
    const tbody = document.getElementById("tiposBecaTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

    try {
        const tipos = await api("/tipos-beca");
        tbody.innerHTML = tipos.map(t => `
            <tr>
                <td>${t.codigo}</td>
                <td>${t.nombre}</td>
                <td>${t.modalidad}</td>
                <td>₡${t.tope_mensual}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editarTipo(${t.id_tipo_beca})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarTipo(${t.id_tipo_beca})">Eliminar</button>
                </td>
            </tr>
        `).join("");
    } catch {
        tbody.innerHTML = `<tr><td colspan="5">Error cargando tipos</td></tr>`;
    }
}

// ===============================
// PERIODOS
// ===============================
async function cargarPeriodos() {
    const tbody = document.getElementById("periodosTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

    try {
        const periodos = await api("/periodos");
        const hoy = new Date();

        tbody.innerHTML = periodos.map(p => {
            const ini = new Date(p.fecha_ini);
            const fin = new Date(p.fecha_fin);
            const activo = hoy >= ini && hoy <= fin;

            return `
                <tr class="${activo ? "periodo-activo" : "periodo-inactivo"}">
                    <td>${p.anio}</td>
                    <td>${p.ciclo}</td>
                    <td>${p.fecha_ini}</td>
                    <td>${p.fecha_fin}</td>
                    <td>${activo ? "ACTUAL" : "CERRADO"}</td>
                </tr>
            `;
        }).join("");

    } catch {
        tbody.innerHTML = `<tr><td colspan="5">Error cargando periodos</td></tr>`;
    }
}

// ===============================
// CONVOCATORIAS
// ===============================
async function cargarConvocatorias() {
    const grid = document.getElementById("convocatoriaGrid");
    if (!grid) return;

    grid.innerHTML = `<p>Cargando convocatorias...</p>`;

    try {
        let conv = await api("/convocatorias");

        if (!conv.length) {
            grid.innerHTML = `<p>No hay convocatorias</p>`;
            return;
        }

        // 💥 CORRECCIÓN CRÍTICA: Normalizar estados
        conv = conv.map(c => ({
            ...c,
            estado: c.estado === "ABIERTA" ? "ABIERTO" : c.estado
        }));

        convocatoriaActiva = conv.find(c => c.estado === "ABIERTO") || null;

        grid.innerHTML = conv.map(c => `
            <div class="convocatoria-card ${c.estado === "ABIERTO" ? "activa" : "cerrada"}">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>${c.nombre}</h4>
                    <span class="estado-tag ${c.estado === "ABIERTO" ? "abierto" : "cerrado"}">
                        ${c.estado === "ABIERTO" ? "ACTUAL" : "CERRADA"}
                    </span>
                </div>

                <p><strong>Inicio:</strong> ${c.fecha_inicio}</p>
                <p><strong>Cierre:</strong> ${c.fecha_cierre}</p>

                <div class="acciones">
                    ${
                        c.estado === "ABIERTO"
                        ? `<button class="btn btn-danger btn-sm" onclick="cerrarConvocatoria(${c.id_convocatoria})">Cerrar</button>`
                        : `<button class="btn btn-primary btn-sm" onclick="abrirConvocatoria(${c.id_convocatoria})">Abrir</button>`
                    }
                </div>
            </div>
        `).join("");

        if (convocatoriaActiva) cargarCronograma(convocatoriaActiva);

    } catch {
        grid.innerHTML = `<p>Error cargando convocatorias</p>`;
    }
}

async function abrirConvocatoria(id) {
    try {
        await api(`/convocatorias/${id}/abrir`, "PUT");
        cargarConvocatorias();
        cargarEtapas(id);
    } catch {}
}

async function cerrarConvocatoria(id) {
    try {
        await api(`/convocatorias/${id}/cerrar`, "PUT");
        cargarConvocatorias();
    } catch {}
}

// ===============================
// SOLICITUDES
// ===============================
async function cargarSolicitudes() {
    const tbody = document.getElementById("solicitudesTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;

    try {
        const data = await api("/solicitudes");

        tbody.innerHTML = data.map(s => `
            <tr>
                <td>${s.id_solicitud}</td>
                <td>${s.id_estudiante}</td>
                <td>${s.id_tipo_beca ?? "-"}</td>
                <td>${s.fecha_creacion || "-"}</td>
                <td>${s.estado}</td>
                <td>
                    <button class="btn btn-secondary btn-sm"
                        onclick="editarEstadoSolicitud(${s.id_solicitud}, '${s.estado}')">
                        Cambiar Estado
                    </button>
                </td>
            </tr>
        `).join("");

    } catch {
        tbody.innerHTML = `<tr><td colspan="6">Error al cargar solicitudes</td></tr>`;
    }
}

// ===============================
// ETAPAS — CORREGIDO COMPLETO
// ===============================
async function cargarEtapas(id_convocatoria) {
    const tbody = document.getElementById("etapasTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4">Cargando...</td></tr>`;

    try {
        const etapas = await api(`/etapas?id_convocatoria=${id_convocatoria}`);

        tbody.innerHTML = etapas.map(e => `
            <tr>
                <td>${e.nombre}</td>
                <td>${e.descripcion}</td>
                <td>${e.estado}</td>
                <td>
                    <button class="btn btn-primary btn-sm"
                        onclick="abrirModalEtapa(${e.id_etapa}, ${id_convocatoria}, '${e.estado}', '${e.nombre}')">
                        Cambiar Estado
                    </button>
                </td>
            </tr>
        `).join("");

    } catch {
        tbody.innerHTML = `<tr><td colspan="4">Error cargando etapas</td></tr>`;
    }
}

function abrirModalEtapa(id_etapa, id_convocatoria, estadoActual, nombre) {
    document.getElementById("etapaId").value = id_etapa;
    document.getElementById("etapaConvocatoriaId").value = id_convocatoria;
    document.getElementById("etapaNombre").value = nombre;
    document.getElementById("etapaEstado").value = estadoActual;

    document.getElementById("modalEtapa").style.display = "flex";
}

document.getElementById("cerrarModalEtapa")?.addEventListener("click", () => {
    document.getElementById("modalEtapa").style.display = "none";
});

// *** SUBMIT CORREGIDO ***
document.getElementById("formEtapa")?.addEventListener("submit", async e => {
    e.preventDefault();

    const id_etapa = document.getElementById("etapaId").value;
    const id_conv = document.getElementById("etapaConvocatoriaId").value;
    const estadoNuevo = document.getElementById("etapaEstado").value;

    try {
        await api(`/etapas/${id_etapa}`, "PUT", {
            id_convocatoria: id_conv,
            estado: estadoNuevo
        });

        alert("Etapa actualizada correctamente");
        document.getElementById("modalEtapa").style.display = "none";
        cargarEtapas(id_conv);

    } catch {
        alert("Error al actualizar etapa");
    }
});

// ===============================
// FORMULARIOS: GUARDAR TODO
// ===============================
document.getElementById("formConvocatoria")?.addEventListener("submit", async e => {
    e.preventDefault();

    const body = {
        nombre: document.getElementById("convNombre").value,
        fecha_inicio: document.getElementById("convInicio").value,
        fecha_cierre: document.getElementById("convCierre").value
    };

    try {
        await api("/convocatorias", "POST", body);
        alert("Convocatoria creada");
        document.getElementById("modalConvocatoria").style.display = "none";
        cargarConvocatorias();
    } catch {
        alert("Error al crear convocatoria");
    }
});

// SOLICITUD
document.getElementById("formSolicitud")?.addEventListener("submit", async e => {
    e.preventDefault();

    const body = {
        id_estudiante: document.getElementById("solicitudEstudiante").value,
        id_tipo_beca: document.getElementById("solicitudTipoBeca").value,
        estado: document.getElementById("solicitudEstado").value
    };

    try {
        await api("/solicitudes", "POST", body);
        alert("Solicitud creada");
        document.getElementById("modalSolicitud").style.display = "none";
        cargarSolicitudes();
    } catch {
        alert("Error al crear solicitud");
    }
});

// PERIODO
document.getElementById("formPeriodo")?.addEventListener("submit", async e => {
    e.preventDefault();

    const id = document.getElementById("periodoId").value;

    const body = {
        anio: document.getElementById("periodoAnio").value,
        ciclo: document.getElementById("periodoCiclo").value,
        fecha_ini: document.getElementById("periodoInicio").value,
        fecha_fin: document.getElementById("periodoFin").value
    };

    try {
        if (id) {
            await api(`/periodos/${id}`, "PUT", body);
        } else {
            await api(`/periodos`, "POST", body);
        }

        alert("Periodo guardado");
        document.getElementById("modalPeriodo").style.display = "none";
        cargarPeriodos();

    } catch {
        alert("Error guardando periodo");
    }
});

// EDITAR ESTADO SOLICITUD
function editarEstadoSolicitud(id, estadoActual) {
    const nuevo = prompt("Nuevo estado:", estadoActual);
    if (!nuevo) return;

    api(`/solicitudes/${id}/estado`, "PUT", { estado: nuevo })
        .then(() => cargarSolicitudes())
        .catch(() => alert("Error actualizando estado"));
}

// ===============================
// CRONOGRAMA
// ===============================
function formatearFecha(fecha) {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-CR", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    });
}

function estadoFecha(inicio, fin) {
    const hoy = new Date();
    if (hoy < inicio) return "pending";
    if (hoy >= inicio && hoy <= fin) return "active";
    if (hoy > fin) return "completed";
}

function cargarCronograma(conv) {
    const timeline = document.getElementById("cronogramaTimeline");
    if (!timeline) return;

    const inicio = new Date(conv.fecha_inicio);
    const cierre = new Date(conv.fecha_cierre);

    const eval_ini = new Date(cierre);
    eval_ini.setDate(eval_ini.getDate() + 1);

    const eval_fin = new Date(cierre);
    eval_fin.setDate(eval_fin.getDate() + 15);

    const comite = new Date(cierre);
    comite.setDate(comite.getDate() + 16);

    const resultados = new Date(cierre);
    resultados.setDate(resultados.getDate() + 20);

    const items = [
        {
            titulo: "Publicación de Convocatoria",
            fecha: formatearFecha(inicio),
            estado: estadoFecha(inicio, inicio)
        },
        {
            titulo: "Recepción de Solicitudes",
            fecha: `${formatearFecha(inicio)} - ${formatearFecha(cierre)}`,
            estado: estadoFecha(inicio, cierre)
        },
        {
            titulo: "Evaluación de Solicitudes",
            fecha: `${formatearFecha(eval_ini)} - ${formatearFecha(eval_fin)}`,
            estado: estadoFecha(eval_ini, eval_fin)
        },
        {
            titulo: "Sesión de Comité",
            fecha: formatearFecha(comite),
            estado: estadoFecha(comite, comite)
        },
        {
            titulo: "Publicación de Resultados",
            fecha: formatearFecha(resultados),
            estado: estadoFecha(resultados, resultados)
        }
    ];

    timeline.innerHTML = items.map(i => `
        <div class="timeline-item ${i.estado}">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <h4>${i.titulo}</h4>
                <p>${i.fecha}</p>
            </div>
        </div>
    `).join("");
}

// ===============================
// APELACIONES
// ===============================
async function cargarApelaciones() {
    const tbody = document.getElementById("apelacionesTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;

    try {
        const apel = await api("/apelaciones");

        if (!apel || apel.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">No hay apelaciones</td></tr>`;
            return;
        }

        tbody.innerHTML = apel.map(a => `
            <tr>
                <td>${a.id_apelacion}</td>
                <td>${a.id_solicitud}</td>
                <td>${a.motivo}</td>
                <td>${a.fecha}</td>
                <td>${a.estado}</td>
                <td>
                    <button class="btn btn-primary btn-sm"
                        onclick="resolverApelacion(${a.id_apelacion}, '${a.estado}', \`${a.resolucion ?? ""}\`)">
                        Resolver
                    </button>
                </td>
            </tr>
        `).join("");

    } catch {
        tbody.innerHTML = `<tr><td colspan="6">Error cargando apelaciones</td></tr>`;
    }
}

// ===============================
// RESOLVER APELACIÓN
// ===============================
function resolverApelacion(id, estadoActual, resolucionActual) {
    const nuevoEstado = prompt(
        "Nuevo estado (PENDIENTE / EN_REVISION / RESUELTA / ACEPTADA):",
        estadoActual
    );
    if (!nuevoEstado) return;

    const nuevaResolucion = prompt("Resolución:", resolucionActual || "");

    api(`/apelaciones/${id}`, "PUT", {
        estado: nuevoEstado,
        resolucion: nuevaResolucion
    })
    .then(() => cargarApelaciones())
    .catch(() => alert("Error actualizando apelación"));
}

const API_BASE = "https://becas-back1.onrender.com/api/admin/informes";

/** ================================
 *  1. Carga inicial
 =================================*/
document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("cmiYearSelector");

    select.addEventListener("change", () => loadCMI(select.value));

    loadCMI(select.value);
});

/** ================================
 *  2. Llamar API
 =================================*/
async function loadCMI(year) {
    try {
        const token = localStorage.getItem("token"); // ajusta si lo guardas diferente

        const response = await fetch(`${API_BASE}/reporte-anual/${year}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Error al obtener datos del CMI");
        }

        const data = await response.json();

        renderMetrics(data);
        renderChartTipos(data.desgloseTipoBeca);
        renderCMI(data.cmiReporte);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

/** ================================
 *  3. MÉTRICAS SUPERIORES
 =================================*/
function renderMetrics(d) {
    document.getElementById("m_solicitudes").textContent = d.totalesAnuales.solicitudes;
    document.getElementById("m_otorgadas").textContent = d.totalesAnuales.otorgadas;
    document.getElementById("m_denegadas").textContent = d.totalesAnuales.denegadas;
    document.getElementById("m_suspendidas").textContent = d.totalesAnuales.suspendidas;

    document.getElementById("m_docs_completos").textContent = d.totalesAnuales.documentacion.completa;
    document.getElementById("m_docs_incompletos").textContent = d.totalesAnuales.documentacion.incompleta;

    document.getElementById("m_matriculados").textContent = d.metricasMatricula.matriculados;
    document.getElementById("m_no_matriculados").textContent = d.metricasMatricula.noMatriculados;
}

/** ================================
 *  4. GRAFICO TIPO DE BECA
 =================================*/
let chartTipos = null;

function renderChartTipos(arr) {
    const ctx = document.getElementById("chartTiposBeca");

    if (chartTipos) chartTipos.destroy();

    chartTipos = new Chart(ctx, {
        type: "bar",
        data: {
            labels: arr.map(e => e.tipo),
            datasets: [{
                label: "Cantidad",
                data: arr.map(e => e.cantidad),
                backgroundColor: "#6f80ff"
            }]
        },
        options: {
            plugins: { legend: { display: false }},
            scales: {
                x: { ticks: { color: "#fff" }},
                y: { ticks: { color: "#fff" }}
            }
        }
    });
}

/** ================================
 *  5. RENDER CMI COMPLETO
 =================================*/
function renderCMI(cmi) {
    const container = document.getElementById("cmiContent");
    container.innerHTML = "";

    cmi.forEach(p => {
        const pDiv = document.createElement("div");
        pDiv.className = "cmi-perspectiva";
        pDiv.innerHTML = `<h3>${p.nombre}</h3>`;

        p.objetivos.forEach(o => {
            const oDiv = document.createElement("div");
            oDiv.className = "cmi-objetivo";
            oDiv.innerHTML = `<h4>${o.nombre}</h4>`;

            o.indicadores.forEach(ind => {
                const wrapper = document.createElement("div");
                wrapper.className = "indicador";

                const cumple = ind.medicion && ind.medicion.valorMeta !== null &&
                               ind.medicion.valorMedido >= ind.medicion.valorMeta;

                wrapper.innerHTML = `
                    <strong>${ind.nombre}</strong><br>
                    Unidad: ${ind.unidadMedida}<br>
                    Meta: ${ind.medicion?.valorMeta ?? "N/A"} |
                    Medido: ${ind.medicion?.valorMedido ?? "N/A"}<br>
                    <span class="indicador-status ${cumple ? "indicador-ok" : "indicador-bad"}">
                        ${cumple ? "✔ Cumple" : "✖ No cumple"}
                    </span>
                `;

                oDiv.appendChild(wrapper);
            });

            pDiv.appendChild(oDiv);
        });

        container.appendChild(pDiv);
    });
}

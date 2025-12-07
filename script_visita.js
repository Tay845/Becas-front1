// =========================================
// URL BASE DEL BACKEND PARA ESTE MÓDULO
// =========================================
const API_VISITAS = "https://becas-back1.onrender.com/api/visitas";

const tablaVisitas = document.getElementById("tablaVisitas");
const formVisita = document.getElementById("formVisita");

// ===============================================
//   CAMBIO DE VISTA PARA data-view = visita-domiciliaria
// ===============================================
document.querySelectorAll("[data-view='visita-domiciliaria']").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();

        // Ocultar todas las vistas
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

        // Mostrar la vista de visita domiciliaria
        const vista = document.getElementById("visita-domiciliaria-view");
        if (vista) {
            vista.classList.add("active");
            window.scrollTo(0, 0);
        }

        // Cargar visitas al abrir la vista
        setTimeout(cargarVisitas, 200);
    });
});

// ===============================================
//   VOLVER A SOCIOECONÓMICO
// ===============================================
document.querySelectorAll("[data-view='socioeconomico']").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();

        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

        const vista = document.getElementById("socioeconomico-view");
        if (vista) {
            vista.classList.add("active");
            window.scrollTo(0, 0);
        }
    });
});

// =====================================
//   Función: Cargar visitas en tabla
// =====================================
async function cargarVisitas() {
    try {
        const res = await fetch(API_VISITAS, { mode: "cors" });
        
        if (!res.ok) {
            console.error("Error HTTP:", res.status);
            return;
        }

        const data = await res.json();
        tablaVisitas.innerHTML = "";

        data.forEach(v => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${v.id_visita}</td>
                <td>${v.id_solicitud ?? ""}</td>
                <td>${v.fecha_programada ?? ""}</td>
                <td>${v.fecha_realizada ?? ""}</td>
                <td>${v.estado ?? ""}</td>
                <td>${v.resultado ?? ""}</td>
                <td>${v.observaciones ?? ""}</td>
            `;

            tablaVisitas.appendChild(fila);
        });

    } catch (error) {
        console.error("Error cargando visitas:", error);
        alert("No se pudieron cargar las visitas domiciliarias.");
    }
}

// =====================================
//   Función: Guardar nueva visita
// =====================================
formVisita?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevaVisita = {
        id_solicitud: document.getElementById("id_solicitud").value,
        fecha_programada: document.getElementById("fecha_programada").value,
        fecha_realizada: document.getElementById("fecha_realizada").value,
        estado: document.getElementById("estado").value,
        observaciones: document.getElementById("observaciones").value,
        resultado: document.getElementById("resultado").value
    };

    try {
        const res = await fetch(API_VISITAS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaVisita),
            mode: "cors"
        });

        const data = await res.json();

        if (!res.ok) {
            alert("Error: " + data.message);
            return;
        }

        alert("Visita registrada correctamente ✔️");

        formVisita.reset();
        cargarVisitas(); // refrescar tabla

    } catch (error) {
        console.error("Error registrando visita:", error);
        alert("No se pudo registrar la visita.");
    }
});

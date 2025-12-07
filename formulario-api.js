(function () {
  const form = document.getElementById("formBeca");
  if (!form) return;

  const btnEnviar = document.getElementById("btnEnviar");
  const mensaje = document.getElementById("mensajeValidacion");

  // Guardar datos en tiempo real en localStorage
  function guardarDatosEnTiempoReal() {
    const datos = {};
    new FormData(form).forEach((v, k) => (datos[k] = v));
    localStorage.setItem("solicitudBeca", JSON.stringify(datos));
    window.dispatchEvent(new CustomEvent('solicitudBecaActualizada', { detail: datos }));
  }

  // Validar campos requeridos en todo el formulario
  function validarFormulario() {
    const inputs = form.querySelectorAll("input[required], select[required], textarea[required]");
    for (let input of inputs) {
      if (!input.value.trim()) {
        const labelText = input.previousElementSibling?.textContent || input.name;
        if (mensaje) {
          mensaje.innerHTML = `<div style="display: flex; gap: 12px; align-items: center;">
            <span style="font-size: 20px;">⚠️</span>
            <div>
              <h4 style="margin: 0; margin-bottom: 4px; color: var(--text-primary);">Campo incompleto</h4>
              <p style="margin: 0; font-size: 14px;">Faltó completar: <strong>${labelText}</strong></p>
            </div>
          </div>`;
          mensaje.style.display = "block";
        }
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
    }
    return true;
  }

  // Armar objeto completo para enviar al backend, filtrando valores null
  async function armarSolicitudCompleta() {
    const d = {};
    new FormData(form).forEach((v, k) => (d[k] = v));
    
    // Validar que id_usuario esté presente
    if (!d.id_usuario) {
      console.error("Error: id_usuario no está definido en el formulario");
      throw new Error("ID de usuario no disponible");
    }
    
    // Crear objeto con solo valores no-null
    // Nota: El backend generará automáticamente el código (SOL-XXXXX) y asignará el tipo de beca socioeconómica
    const solicitud = {
      primer_apellido: d.primer_apellido || null,
      segundo_apellido: d.segundo_apellido || null,
      nombre: d.nombre || null,
      cedula: d.cedula || null,
      fecha_nacimiento: d.fecha_nacimiento || null,
      estado_civil: d.estado_civil || null,
      genero: d.genero || null,
      correo: d.correo || null,
      telefono: d.telefono || null,
      provincia: d.provincia || null,
      canton: d.canton || null,
      distrito: d.distrito || null,
      direccion: d.direccion || null,
      colegio: d.colegio || null,
      tipo_institucion: d.tipo_institucion || null,
      beca_colegio: d.beca_colegio || null,
      institucion_beca: d.institucion_beca || null,
      monto_beca: d.monto_beca || null,
      posee_titulo: d.posee_titulo || null,
      grado_aprobado: d.grado_aprobado || null,
      area: d.area || null,
      tipo_vivienda: d.tipo_vivienda || null,
      condicion_vivienda: d.condicion_vivienda || null,
      medio_adquisicion: d.medio_adquisicion || null,
      servicios_basicos: d.servicios_basicos || null,
      ocupacion_padre: d.ocupacion_padre || null,
      ocupacion_madre: d.ocupacion_madre || null,
      ingreso_total: d.ingreso_total || null,
      egreso_total: d.egreso_total || null,
      desc_ingresos: d.desc_ingresos || null,
      desc_gastos: d.desc_gastos || null,
      observaciones: d.observaciones || null,
      firma: d.firma || null,
      fecha_firma: d.fecha_firma || null,
      id_usuario: d.id_usuario,
      rol: d.rol
    };
    
    return solicitud;
  }

  // Enviar solicitud al backend
  async function enviarSolicitudBackend() {
    const payload = await armarSolicitudCompleta();

    try {
      const resp = await fetch("https://becas-back1.onrender.com/api/solicitud/completa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      console.log("Respuesta backend:", data);

      if (!resp.ok) {
        alert("❌ Error: " + (data.mensaje || data.error));
        return { ok: false };
      }

      // Guardar IDs en localStorage para futuras referencias
      if (data.id_solicitud) {
        localStorage.setItem('id_solicitud_actual', data.id_solicitud);
      }
      if (data.id_aspirante) {
        localStorage.setItem('id_aspirante_actual', data.id_aspirante);
      }
      if (data.codigo) {
        localStorage.setItem('codigo_solicitud_actual', data.codigo);
      }

      return { 
        ok: true, 
        id_solicitud: data.id_solicitud,
        codigo_solicitud: data.codigo
      };

    } catch (err) {
      console.error(err);
      alert("❌ Error al conectar con el servidor.");
      return { ok: false };
    }
  }

  // Manejar submit del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    guardarDatosEnTiempoReal();

    const result = await enviarSolicitudBackend();
    if (!result.ok) return;

    const formContainer = form.closest('.card-body');
    if (formContainer) {
      formContainer.innerHTML = `
      <div id="confirmacion" class="alert-info" 
           style="margin: 0; padding: 24px; border-radius: 8px; border-left: 4px solid var(--success);">
        <h4 style="color: var(--success); margin: 0 0 12px 0; font-size: 18px;">
          ✅ Solicitud enviada correctamente
        </h4>
        <p style="color: var(--text-secondary); font-size: 14px; margin: 0 0 12px 0;">
          Sus datos han sido almacenados en el sistema.
        </p>
        <p style="color: var(--text-secondary); font-size: 12px; margin: 0 0 8px 0;">
          Código de solicitud: <strong>${result.codigo_solicitud || 'N/A'}</strong>
        </p>
        <p style="color: var(--text-secondary); font-size: 12px; margin: 0;">
          ID de solicitud: <strong>${result.id_solicitud}</strong>
        </p>
      </div>`;
    }
  });

  // Guardar cambios en todos los inputs
  const allInputs = form.querySelectorAll("input, select, textarea");
  allInputs.forEach((input) => {
    input.addEventListener("change", guardarDatosEnTiempoReal);
  });
})();

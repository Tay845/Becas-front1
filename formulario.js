document.addEventListener("DOMContentLoaded", () => {
  const pasos = document.querySelectorAll(".form-step");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnSiguiente = document.getElementById("btnSiguiente");
  const btnEnviar = document.getElementById("btnEnviar");
  const form = document.getElementById("formBeca");
  const mensaje = document.getElementById("mensajeValidacion");
  let pasoActual = 0;
  let idSolicitud = null;

  // Obtener token e info del usuario
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const id_usuario = userData?.id || localStorage.getItem("id_usuario");

  // Recuperar ID de solicitud si existe
  const idGuardado = localStorage.getItem("id_solicitud_actual");
  if (idGuardado) idSolicitud = idGuardado;

  // Guardar datos en localStorage en tiempo real
  function guardarDatosEnTiempoReal() {
    const datos = {};
    new FormData(form).forEach((v, k) => (datos[k] = v));
    localStorage.setItem("solicitudBeca", JSON.stringify(datos));
  }

  function mostrarPaso(index) {
    pasos.forEach((p, i) => {
      p.style.display = i === index ? "block" : "none";
      p.classList.toggle("active", i === index);
    });

    btnAnterior.style.display = index === 0 ? "none" : "inline-flex";
    btnSiguiente.style.display = index === pasos.length - 1 ? "none" : "inline-flex";
    btnEnviar.style.display = index === pasos.length - 1 ? "inline-flex" : "none";
    mensaje.style.display = "none";
  }

  function validarPaso(index) {
    const inputs = pasos[index].querySelectorAll("input[required], select[required], textarea[required]");
    for (let input of inputs) {
      if (!input.value.trim()) {
        const labelText = input.previousElementSibling?.textContent || input.name;
        mensaje.innerHTML = `
          <div style="display: flex; gap: 12px; align-items: center;">
            <span style="font-size: 20px;">⚠️</span>
            <div>
              <h4 style="margin: 0; margin-bottom: 4px;">Campo incompleto</h4>
              <p style="margin: 0;">Faltó completar: <strong>${labelText}</strong></p>
            </div>
          </div>`;
        mensaje.style.display = "block";
        input.focus();
        return false;
      }
    }
    return true;
  }

  // 🟢 FUNCIÓN CORREGIDA — LEE LOS CAMPOS DEL PASO A ENVIAR
  function obtenerDatosPaso(pasoNumero) {
    const d = {};

    // Encontrar el elemento del paso específico usando data-step
    const pasoElement = document.querySelector(`.form-step[data-step="${pasoNumero}"]`);
    
    if (!pasoElement) {
      console.error(`%c❌ No se encontró el paso ${pasoNumero}`, 'color: #ff0000; font-weight: bold');
      return {};
    }

    const stepFields = pasoElement.querySelectorAll("input, select, textarea");
    
    console.log(`%c→ Leyendo paso ${pasoNumero}`, 'color: #0066cc; font-weight: bold; font-size: 12px');
    console.log(`%cElemento encontrado: ${pasoElement.tagName} [data-step="${pasoNumero}"]`, 'color: #0066cc');
    console.log(`%cCampos encontrados: ${stepFields.length}`, 'color: #0066cc');

    stepFields.forEach((el, index) => {
      if (el.name) {
        const valor = el.value.trim();
        d[el.name] = valor;
        console.log(`   [${index}] name="${el.name}" → "${valor}"`);
      }
    });

    console.log(`%cObjeto d final:`, 'color: #0066cc; font-weight: bold', d);

    switch (pasoNumero) {
      case 1:
        return {
          id_usuario,
          primer_apellido: d.primer_apellido,
          segundo_apellido: d.segundo_apellido,
          nombre: d.nombre,
          cedula: d.cedula,
          fecha_nacimiento: d.fecha_nacimiento,
          estado_civil: d.estado_civil,
          genero: d.genero,
          correo: d.correo,
          telefono: d.telefono,
          provincia: d.provincia,
          canton: d.canton,
          distrito: d.distrito,
          direccion: d.direccion
        };

      case 2:
        return {
          id_solicitud: idSolicitud,
          colegio: d.colegio,
          tipo_institucion: d.tipo_institucion,
          beca_colegio: d.beca_colegio,
          institucion_beca: d.institucion_beca,
          monto_beca: d.monto_beca,
          posee_titulo: d.posee_titulo,
          grado_aprobado: d.grado_aprobado
        };

      case 3:
        console.log(`%c🔍 Paso 3 - servicios_basicos: "${d.servicios_basicos}"`, 'color: #ff6600; font-weight: bold');
        return {
          id_solicitud: idSolicitud,
          area: d.area,
          tipo_vivienda: d.tipo_vivienda,
          condicion_vivienda: d.condicion_vivienda,
          medio_adquisicion: d.medio_adquisicion,
          servicios_basicos: d.servicios_basicos
        };

      case 4:
        console.log(`%c🔍 Paso 4 - ocupacion_padre: "${d.ocupacion_padre}", ocupacion_madre: "${d.ocupacion_madre}"`, 'color: #ff6600; font-weight: bold');
        return {
          id_solicitud: idSolicitud,
          ocupacion_padre: d.ocupacion_padre,
          ocupacion_madre: d.ocupacion_madre
        };

      case 5:
        return {
          id_solicitud: idSolicitud,
          ingreso_total: d.ingreso_total,
          egreso_total: d.egreso_total,
          desc_ingresos: d.desc_ingresos,
          desc_gastos: d.desc_gastos
        };

      case 6:
        return {
          id_solicitud: idSolicitud,
          observaciones: d.observaciones
        };

      case 7:
        return {
          id_solicitud: idSolicitud,
          firma: d.firma,
          fecha_firma: d.fecha_firma
        };

      default:
        return {};
    }
  }

  // Guarda información académica en BD
  async function guardarInfoAcademicaEnDB(paso) {
    if (paso !== 2) return true;

    const d = obtenerDatosPaso(2);

    const resp = await fetch("https://becas-back1.onrender.com/api/info-academica", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + (token || "")
      },
      body: JSON.stringify(d)
    });

    const data = await resp.json();
    if (resp.ok) {
      localStorage.setItem('id_info_academica', data.id_insertado);
      return true;
    }

    console.error("Error guardando info académica:", data);
    return true;
  }

  // Enviar datos de cada paso
  async function enviarPaso(paso) {
    try {
      const datos = obtenerDatosPaso(paso);
      const endpoint = `https://becas-back1.onrender.com/api/solicitud/paso${paso}`;

      console.log(`%c=== ENVIANDO PASO ${paso} ===`, 'color: #0066cc; font-weight: bold; font-size: 14px');
      console.log(`%cEndpoint:`, 'color: #cc0000; font-weight: bold', endpoint);
      console.log(`%cDatos enviados:`, 'color: #00aa00; font-weight: bold', datos);
      console.log(`%cidSolicitud actual:`, 'color: #aa00aa; font-weight: bold', idSolicitud);

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(datos)
      });

      const data = await resp.json();
      
      console.log(`%cRespuesta del servidor:`, 'color: #00aa00; font-weight: bold', data);
      
      if (!resp.ok) {
        console.error(`%c❌ Error en paso ${paso}:`, 'color: #ff0000; font-weight: bold', data);
        return false;
      }

      if (data.id_solicitud && !idSolicitud) {
        idSolicitud = data.id_solicitud;
        localStorage.setItem("id_solicitud_actual", idSolicitud);
        console.log(`%c✅ ID solicitud guardado:`, 'color: #00ff00; font-weight: bold', idSolicitud);
      }

      if (paso === 2) await guardarInfoAcademicaEnDB(paso);

      console.log(`%c✅ Paso ${paso} completado exitosamente`, 'color: #00ff00; font-weight: bold; font-size: 14px');
      return true;
    } catch (err) {
      console.error(`%c❌ Error enviando paso ${paso}:`, 'color: #ff0000; font-weight: bold', err);
      return false;
    }
  }

  btnSiguiente.addEventListener("click", async () => {
    if (validarPaso(pasoActual)) {
      const ok = await enviarPaso(pasoActual + 1);
      if (ok) {
        pasoActual++;
        mostrarPaso(pasoActual);
        guardarDatosEnTiempoReal();
      }
    }
  });

  btnAnterior.addEventListener("click", () => {
    pasoActual--;
    mostrarPaso(pasoActual);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validarPaso(pasoActual)) return;

    const ok = await enviarPaso(7);
    if (ok) {
      localStorage.removeItem("solicitudBeca");
      localStorage.removeItem("id_solicitud_actual");

      form.innerHTML = `
        <div class="alert-info" style="padding: 24px;">
          <h4>✅ Solicitud enviada correctamente</h4>
          <p>Sus datos han sido procesados.</p>
          <p>ID de solicitud: <strong>${idSolicitud}</strong></p>
        </div>`;
    }
  });

  // Guardar cambios en tiempo real
  const allInputs = form.querySelectorAll("input, select, textarea");
  allInputs.forEach(input => {
    input.addEventListener("change", guardarDatosEnTiempoReal);
  });

  mostrarPaso(pasoActual);
});

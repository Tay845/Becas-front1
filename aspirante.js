const API_SOLICITUDES_BASE = "https://becas-back1.onrender.com/api/solicitud";

document.addEventListener("DOMContentLoaded", () => {

  async function obtenerSolicitud() {
    // Obtener datos del usuario logueado desde sessionStorage
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');
    const userEmail = sessionStorage.getItem('userEmail');
    const token = sessionStorage.getItem('token');

    // Si no hay usuario logueado, usar datos de prueba
    if (!userId || !token) {
      console.warn("⚠️ No hay usuario logueado. Usando datos de prueba.");
      return {
        id_usuario: 1,
        nombre: "Prueba",
        primer_apellido: "Tester",
        correo: "prueba@test.com"
      };
    }

    // Obtener datos completos del usuario desde el backend
    try {
      const response = await fetch("https://becas-back1.onrender.com/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener datos del usuario');

      const data = await response.json();
      const user = data.user;

      const userData = {
        id_usuario: user.id,
        id_aspirante: user.id_aspirante || user.id,
        nombre: user.name,
        correo: user.email,
        rol: user.rol
      };

      // Guardar el ID del aspirante en localStorage para uso en otras vistas
      // Si el usuario es aspirante, usar id_aspirante; si no, usar id_usuario
      const idAspirante = user.id_aspirante || user.id;
      localStorage.setItem('id_aspirante', idAspirante);
      localStorage.setItem('userId', user.id);

      return userData;

    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      // Retornar datos del sessionStorage como fallback
      const userData = {
        id_usuario: userId,
        nombre: userName,
        correo: userEmail
      };

      // Guardar el ID en localStorage
      localStorage.setItem('id_aspirante', userId);
      localStorage.setItem('userId', userId);

      return userData;
    }
  }

  // Función para obtener solo el ID del usuario actual
  async function obtenerIdUsuarioActual() {
    const datos = await obtenerSolicitud();
    return datos?.id_usuario || null;
  }

  // Función para obtener la solicitud actual del usuario con ID de solicitud
  async function obtenerSolicitudActual() {
    const token = sessionStorage.getItem('token');
    
    console.log('[DEBUG FRONTEND] obtenerSolicitudActual() llamada');
    console.log('[DEBUG FRONTEND] Token en sessionStorage:', token ? 'SÍ' : 'NO');
    console.log('[DEBUG FRONTEND] Token value:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
      console.warn("⚠️ No hay token disponible en sessionStorage");
      return null;
    }

    try {
      console.log('[DEBUG FRONTEND] Enviando petición a GET /api/solicitud');
      const response = await fetch("https://becas-back1.onrender.com/api/solicitud", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log('[DEBUG FRONTEND] Response status:', response.status);
      
      if (!response.ok) {
        console.warn("⚠️ Response no OK. Status:", response.status);
        const errorData = await response.json();
        console.warn('[DEBUG FRONTEND] Error response:', errorData);
        return null;
      }

      const data = await response.json();
      console.log('[DEBUG FRONTEND] Datos recibidos:', data);
      
      if (data.ok && data.solicitudes && data.solicitudes.length > 0) {
        // Retornar la primera solicitud (la más reciente)
        console.log('[DEBUG FRONTEND] Solicitud encontrada:', data.solicitudes[0]);
        return data.solicitudes[0];
      }

      console.warn('[DEBUG FRONTEND] No hay solicitudes en la respuesta');
      return null;

    } catch (error) {
      console.error("Error al obtener solicitud actual:", error);
      return null;
    }
  }

  async function actualizarDashboard() {
    const datos = await obtenerSolicitud();

    // Si no hay solicitud, mostrar mensajes vacíos
    if (!datos) {
      const names = document.querySelectorAll(".user-name");
      names.forEach(el => el.textContent = "Aspirante");

      const currentApp = document.querySelector(".current-application");
      if (currentApp) {
        currentApp.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-secondary)">
          No tienes solicitudes registradas.
        </p>`;
      }
      return;
    }

    /* ----- Datos básicos ----- */
    const nombreCompleto = `${datos.nombre || ""} ${datos.primer_apellido || ""}`.trim();
    const nombre = nombreCompleto || datos.nombre || "Aspirante";
    const correo = datos.correo || "No registrado";

    // 🔴 ACTUALIZAR TODOS LOS ELEMENTOS CON CLASE .user-name
    const allUserNames = document.querySelectorAll(".user-name");
    allUserNames.forEach(element => {
      element.textContent = nombre;
    });

    // 🔴 ACTUALIZAR CORREO EN EL PERFIL
    const perfilEmail = document.getElementById("perfil-email");
    if (perfilEmail) {
      perfilEmail.textContent = correo;
    }

    // 🔴 ACTUALIZAR NOMBRE EN LA SECCIÓN DE INFORMACIÓN PERSONAL
    const perfilNombre = document.getElementById("perfil-nombre");
    if (perfilNombre) {
      perfilNombre.textContent = nombre;
    }

    // 🔴 ACTUALIZAR TODOS LOS h2 DENTRO DE .view-header
    const allViewHeaders = document.querySelectorAll(".view-header h2");
    allViewHeaders.forEach(heading => {
      heading.textContent = `Bienvenido, ${nombre}`;
    });

    // 🔴 ACTUALIZAR CUALQUIER ELEMENTO CON LA CLASE welcome-title
    const welcomeTitles = document.querySelectorAll(".welcome-title");
    welcomeTitles.forEach(title => {
      title.textContent = `Bienvenido, ${nombre}`;
    });

    /* ----- Cards estadísticas ----- */
    const statCards = document.querySelectorAll(".stat-card");

    // Solicitudes activas
    if (statCards[0]) {
      statCards[0].querySelector(".stat-value").textContent = "1";
      statCards[0].querySelector(".stat-change").textContent = "En evaluación";
    }

    // Estado de solicitud
    if (statCards[2]) {
      statCards[2].querySelector(".stat-value").textContent = "Evaluando";
      statCards[2].querySelector(".stat-change").textContent = "En análisis socioeconómico";
    }
  }

  actualizarDashboard();
  
  // Ejecutar nuevamente después de un pequeño delay para asegurar que el DOM esté listo
  setTimeout(() => {
    actualizarDashboard();
  }, 300);

  /* ============================================================
     🔵 3. NAVEGACIÓN ENTRE VISTAS ✔ CORREGIDO (solo UNO)
     ============================================================ */
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");
  const mobileMenuToggle = document.getElementById("mobileMenuToggleAspirant");
  const sidebar = document.getElementById("sidebarAspirant");

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  navItems.forEach((item) => {
  item.addEventListener("click", async function (e) {
    e.preventDefault();

    const viewKey = this.getAttribute("data-view");
    const viewId = viewKey + "-view";

    // Cambiar estilos de navegación
    navItems.forEach((n) => n.classList.remove("active"));
    views.forEach((v) => v.classList.remove("active"));

    this.classList.add("active");
    document.getElementById(viewId).classList.add("active");

    if (sidebar.classList.contains("open")) sidebar.classList.remove("open");

    /* 🔵 FORMULARIO DE SOLICITUD */
    if (viewKey === "aspirant-solicitar") {
      const cont = document.querySelector("#aspirant-solicitar-view #form-container");
      if (cont && !cont.dataset.loaded) {
        const idUsuario = await obtenerIdUsuarioActual();
        cont.dataset.userId = idUsuario;
        await cargarFormularioSolicitud(cont);
        cont.dataset.loaded = "true";
      }
    }

    /* 🔵 MIS DOCUMENTOS */
    if (viewKey === "aspirant-documentos") {
      inicializarMisDocumentosView();
      cargarMisDocumentos();
    }

    /* 🔵 RESULTADOS: cargar `resultado.html` dentro de la vista */
    if (viewKey === "aspirant-resultados") {
      const cont = document.querySelector("#aspirant-resultados-view #resultado-container");
      if (cont && !cont.dataset.loaded) {
        cont.innerHTML = `<p style="padding:20px; text-align:center;">Cargando resultados...</p>`;
        try {
            // Obtener los datos del usuario autenticado
            const solicitud = await obtenerSolicitud();
            const idUsuario = solicitud?.id_usuario;
            
            // Guardar el ID del usuario en localStorage para que resultado.html lo obtenga
            if (idUsuario) {
              localStorage.setItem('id_aspirante', idUsuario);
              console.log('ID del usuario autenticado guardado en localStorage:', idUsuario);
            } else {
              console.warn('⚠️ No se pudo obtener el ID del usuario, usando valor por defecto');
            }
            
            const res = await fetch("resultado.html");
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Preferir un contenedor específico del archivo resultado.html (id="contenedor")
            const source = doc.getElementById("contenedor") || doc.body;

            // Vaciar contenedor destino y adjuntar el nodo importado (con su id)
            cont.innerHTML = "";
            try {
              const imported = document.importNode(source, true);
              cont.appendChild(imported);
            } catch (err) {
              // Fallback: insertar innerHTML si importNode falla
              cont.innerHTML = source.innerHTML;
            }

            // Ejecutar scripts encontrados en el HTML cargado (inline o con src)
            const scripts = doc.querySelectorAll("script");

            for (const s of scripts) {
              if (!s.src) {
                const ns = document.createElement("script");
                ns.textContent = s.textContent;
                document.body.appendChild(ns);
              } else {
                const ns = document.createElement("script");
                ns.src = s.src;
                document.body.appendChild(ns);
                // esperar a que cargue antes de continuar
                await new Promise((r) => { ns.onload = ns.onerror = r; });
              }
            }

            cont.dataset.loaded = "true";
        } catch (error) {
          console.error("Error al cargar resultado.html:", error);
          cont.innerHTML = `<p style="color:red; padding:20px;">Error al cargar resultados.</p>`;
        }
      }
    }

    /* 🔵 APELACIONES */
    if (viewKey === "aspirant-apelacion") {
      await cargarApelaciones();
      await inicializarFormularioApelacion();
    }
  });
});


  /* ============================================================
     🔵 4. CARGAR FORMULARIO Y ENVIARLO AL BACKEND
     ============================================================ */
  async function cargarFormularioSolicitud(container) {
    try {
      const response = await fetch("solicitud.html");
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const main = doc.querySelector(".main-content");

      container.innerHTML = main.innerHTML;

      // Asignar ID de usuario al formulario si existe
      const form = container.querySelector("#formBeca");
      if (form && container.dataset.userId) {
        const idUsuarioInput = form.querySelector("input[name='id_usuario']");
        if (idUsuarioInput) {
          idUsuarioInput.value = container.dataset.userId;
        } else {
          // Si no existe el campo, crearlo como oculto
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = "id_usuario";
          input.value = container.dataset.userId;
          form.appendChild(input);
        }
      }

      // Reemplazar formulario.js por versión adaptada a API
      const script = document.createElement("script");
      script.src = "formulario-api.js"; 
      container.appendChild(script);

    } catch (error) {
      console.error("Error al cargar el formulario", error);
      container.innerHTML = `<p style="color:red; padding:30px;">Error al cargar formulario</p>`;
    }
  }

  /* ============================================================
     🔵 5. FAQ TOGGLES
     ============================================================ */
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach((q) => {
    q.addEventListener("click", function () {
      const answer = this.nextElementSibling;
      const toggle = this.querySelector(".faq-toggle");

      const isOpen = answer.style.display === "block";
      answer.style.display = isOpen ? "none" : "block";
      toggle.textContent = isOpen ? "+" : "-";
    });
  });

  /* ============================================================
     🔵 5.5 APELACIONES — CARGAR Y GESTIONAR
     ============================================================ */
  async function cargarApelaciones() {
    const appealsList = document.getElementById("appealsList");
    if (!appealsList) return;

    const solicitud = await obtenerSolicitudActual();
    if (!solicitud || !solicitud.id_solicitud) {
      appealsList.innerHTML = `<p style="padding:20px; text-align:center;">No tienes solicitudes registradas.</p>`;
      return;
    }

    try {
      const res = await fetch(`https://becas-back1.onrender.com/api/apelacion/solicitud/${solicitud.id_solicitud}`);
      const data = await res.json();
      const apelaciones = data.apelaciones || [];

      if (apelaciones.length === 0) {
        appealsList.innerHTML = `<p style="padding:20px; text-align:center; color:var(--text-secondary);">No tienes apelaciones registradas.</p>`;
      } else {
        appealsList.innerHTML = apelaciones.map(apelacion => `
          <div class="appeal-item" style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="margin: 0;">Apelación #${apelacion.id_apelacion}</h4>
              <span class="badge badge-${apelacion.estado === 'APROBADA' ? 'success' : apelacion.estado === 'RECHAZADA' ? 'danger' : 'warning'}">${apelacion.estado}</span>
            </div>
            <p style="margin: 5px 0;"><strong>Motivo:</strong> ${apelacion.motivo_apelacion}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(apelacion.fecha_apelacion).toLocaleDateString('es-CR')}</p>
            ${apelacion.resolucion_apelacion ? `<p style="margin: 5px 0;"><strong>Resolución:</strong> ${apelacion.resolucion_apelacion}</p>` : ''}
          </div>
        `).join('');
      }
    } catch (error) {
      console.error("Error al cargar apelaciones:", error);
      appealsList.innerHTML = `<p style="color:red; padding:20px;">Error al cargar apelaciones.</p>`;
    }
  }

  /* Cargar apelaciones cuando se abre la vista */
  const handleApelacionView = async function (e) {
    const viewKey = this.getAttribute("data-view");
    if (viewKey === "aspirant-apelacion") {
      await cargarApelaciones();
      await inicializarFormularioApelacion();
    }
  };

  /* ============================================================
     🔵 5.5.1 INICIALIZAR FORMULARIO DE APELACIÓN
     ============================================================ */
  async function inicializarFormularioApelacion() {
    const appealForm = document.getElementById("appealForm");
    const motivoTextarea = document.getElementById("motivoApelacion");
    const charCount = document.getElementById("charCount");
    const btnEnviar = document.getElementById("btnEnviarApelacion");
    const btnCancelar = document.getElementById("btnCancelarApelacion");

    if (!appealForm) return;

    // Mostrar contador de caracteres
    if (motivoTextarea) {
      motivoTextarea.addEventListener("input", () => {
        const len = motivoTextarea.value.length;
        if (charCount) charCount.textContent = len;
        // Habilitar botón solo si hay texto
        if (btnEnviar) {
          btnEnviar.disabled = len < 10;
        }
      });
    }

    // Cancelar
    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => {
        appealForm.reset();
        if (charCount) charCount.textContent = "0";
        if (btnEnviar) btnEnviar.disabled = true;
      });
    }

    // Enviar apelación
    appealForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const motivo = motivoTextarea?.value?.trim();
      const token = sessionStorage.getItem("token");
      const solicitud = await obtenerSolicitudActual();

      if (!motivo || motivo.length < 10) {
        alert("El motivo debe contener al menos 10 caracteres.");
        return;
      }

      if (!solicitud || !solicitud.id_solicitud) {
        alert("No se encontró solicitud registrada.");
        return;
      }

      if (!token) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        return;
      }

      try {
        const res = await fetch("https://becas-back1.onrender.com/api/apelacion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            idSolicitud: solicitud.id_solicitud,
            motivo: motivo
          })
        });

        const data = await res.json();

        if (!data.ok) {
          alert(data.msg || "Error al enviar apelación.");
          return;
        }

        alert("Apelación enviada correctamente.");
        appealForm.reset();
        if (charCount) charCount.textContent = "0";
        if (btnEnviar) btnEnviar.disabled = true;
        
        // Recargar lista de apelaciones
        await cargarApelaciones();

      } catch (error) {
        console.error("Error al enviar apelación:", error);
        alert("Error al enviar apelación. Intenta nuevamente.");
      }
    });
  }

  /* ============================================================
     🔵 6. MIS DOCUMENTOS — LISTA + VALIDACIÓN + BOTÓN ELIMINAR
     ============================================================ */

  let documentosViewInicializado = false;

  async function cargarMisDocumentos() {
    const docsList = document.getElementById("documents-list");
    const statTotal = document.getElementById("stat-docs-total");
    const statValidos = document.getElementById("stat-docs-validos");
    const statPendientes = document.getElementById("stat-docs-pendientes");

    docsList.innerHTML = `
      <p style="padding:20px; text-align:center; color:var(--text-secondary);">
        Cargando documentos...
      </p>
    `;

    const solicitud = await obtenerSolicitud();
    const idSolicitud = solicitud?.id_solicitud;
    if (!idSolicitud) return;

    try {
      const res = await fetch(`${API_SOLICITUDES_BASE}/${idSolicitud}/docs`);
      const data = await res.json();

      const documentos = data.documentos || [];

      // Contadores
      let total = documentos.filter(d => d.url_archivo).length;
      let validos = documentos.filter(d => d.url_archivo && d.valido === "SI").length;
      let pendientes = total - validos;

      statTotal.textContent = total;
      statValidos.textContent = validos;
      statPendientes.textContent = pendientes;

      docsList.innerHTML = "";

      documentos.forEach(doc => {
        const tieneArchivo = !!doc.url_archivo;
        const esValido = doc.valido === "SI";

        const estadoTexto = !tieneArchivo
          ? "Sin archivo"
          : esValido ? "Válido" : "Pendiente";

        const estadoClass = !tieneArchivo
          ? "badge-secondary"
          : esValido ? "badge-success" : "badge-warning";

        const obligatorioBadgeHTML =
          doc.obligatorio === "SI"
            ? '<span class="badge badge-danger badge-doc-obligatorio">Obligatorio</span>'
            : '<span class="badge badge-secondary badge-doc-obligatorio">Opcional</span>';

        const card = document.createElement("div");
        card.classList.add("document-item");

        card.innerHTML = `
          <div class="document-main">
            <div>
              <h4 class="document-title">${doc.nombre} ${obligatorioBadgeHTML}</h4>
              <p class="text-muted">Código: <strong>${doc.codigo}</strong></p>
            </div>
            <span class="badge ${estadoClass}">${estadoTexto}</span>
          </div>

          <div class="document-actions">
            ${
              tieneArchivo
                ? `
                    <a href="/uploads/documentos/${encodeURIComponent(doc.url_archivo)}"
                      target="_blank"
                      class="btn btn-secondary btn-sm">Ver</a>

                    <button class="btn btn-outline-light btn-sm"
                      onclick="abrirModalDocumento(${doc.id_documento})">
                      Cambiar
                    </button>

                    <button class="btn btn-danger btn-sm"
                      onclick="eliminarDocumento(${doc.id_documento})">
                      Eliminar
                    </button>
                  `
                : `
                    <button class="btn btn-primary btn-sm"
                      onclick="abrirModalDocumento(${doc.id_documento})">
                      Subir
                    </button>
                  `
            }
          </div>
        `;

        docsList.appendChild(card);
      });

    } catch (error) {
      console.error("Error al cargar documentos:", error);
      docsList.innerHTML = `
        <p style="padding:20px; text-align:center; color:red;">
          Error al cargar documentos.
        </p>`;
    }
  }

  /* ============================================================
     🔥 7. FUNCIÓN PARA ELIMINAR DOCUMENTO
     ============================================================ */

  window.eliminarDocumento = async (idDocumento) => {
    if (!confirm("¿Seguro que deseas eliminar este documento?")) return;

    const solicitud = await obtenerSolicitud();
    const idSolicitud = solicitud.id_solicitud;

    try {
      const res = await fetch(
        `${API_SOLICITUDES_BASE}/${idSolicitud}/docs/${idDocumento}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!data.ok) {
        return alert(data.msg || "Error al eliminar documento");
      }

      alert("Documento eliminado correctamente.");
      cargarMisDocumentos();

    } catch (error) {
      console.error("Error eliminando documento:", error);
      alert("Error al eliminar documento.");
    }
  };

  /* ============================================================
     🔵 8. SUBIR DOCUMENTOS — VALIDACIÓN PROFESIONAL
     ============================================================ */

  function inicializarMisDocumentosView() {
    if (documentosViewInicializado) return;
    documentosViewInicializado = true;

    const modal = document.getElementById("modalSubirDoc");
    const btnCerrar = document.getElementById("btnCerrarModalDoc");
    const btnCancelar = document.getElementById("btnCancelarSubirDoc");
    const formSubir = document.getElementById("formSubirDoc");
    const selectTipoDoc = document.getElementById("selectTipoDoc");
    const inputArchivo = document.getElementById("inputArchivoDoc");
    const dropzoneText = document.getElementById("dropzoneText");

    if (!modal || !formSubir) return;

    window.abrirModalDocumento = (idDocumento) => {
      selectTipoDoc.value = idDocumento;
      modal.style.display = "flex";
    };

    const cerrarModal = () => {
      modal.style.display = "none";
      formSubir.reset();
      dropzoneText.textContent = "Arrastra un archivo aquí o haz clic para seleccionar";
    };

    btnCerrar?.addEventListener("click", cerrarModal);
    btnCancelar?.addEventListener("click", cerrarModal);

    inputArchivo.addEventListener("change", () => {
      if (inputArchivo.files?.[0]) {
        dropzoneText.textContent = `Archivo: ${inputArchivo.files[0].name}`;
      }
    });

    /* VALIDACIÓN + ENVÍO */
    formSubir.addEventListener("submit", async (e) => {
      e.preventDefault();

      const tipoDoc = selectTipoDoc.value;
      const file = inputArchivo.files[0];

      if (!tipoDoc || !file) {
        alert("Debe seleccionar un tipo de documento y un archivo.");
        return;
      }

      const extensionesPermitidas = ["pdf", "jpg", "jpeg", "png"];
      const extension = file.name.split(".").pop().toLowerCase();

      if (!extensionesPermitidas.includes(extension)) {
        alert(`Formato NO permitido (${extension}). Solo se permiten PDF, JPG, JPEG, PNG.`);
        return;
      }

      const maxSizeMB = 5;
      const maxBytes = maxSizeMB * 1024 * 1024;

      if (file.size > maxBytes) {
        alert(`El archivo supera el tamaño máximo de ${maxSizeMB}MB.`);
        return;
      }

      const solicitud = await obtenerSolicitud();
      const idSolicitud = solicitud.id_solicitud;

      const formData = new FormData();
      formData.append("archivo", file);
      formData.append("id_documento", tipoDoc);

      try {
        const res = await fetch(`${API_SOLICITUDES_BASE}/${idSolicitud}/docs`, {
          method: "POST",
          body: formData
        });

        const data = await res.json();

        if (!data.ok) {
          alert(data.msg || "Error al subir documento");
          return;
        }

        alert("Documento subido correctamente.");
        cerrarModal();
        cargarMisDocumentos();

      } catch (error) {
        console.error("Error al subir documento:", error);
        alert("Error al subir el documento.");
      }
    });
  }

});

// Logout function
function logout() {
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "index.html";
}

// frontend/student-script.js
// Navigation for Student Portal
document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById("mobileMenuToggleStudent")
  const sidebar = document.getElementById("sidebarStudent")

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // Navigation items
  const navItems = document.querySelectorAll(".nav-item")
  const views = document.querySelectorAll(".view")

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()

      // Remove active class from all nav items
      navItems.forEach((nav) => nav.classList.remove("active"))

      // Add active class to clicked item
      this.classList.add("active")

      // Get the view to show
      const viewName = this.getAttribute("data-view");
      if (viewName === 'student-mis-solicitudes') {
      cargarResultados();
      }

      // Hide all views
      views.forEach((view) => view.classList.remove("active"))

      // Show the selected view
      const selectedView = document.getElementById(`${viewName}-view`)
      if (selectedView) {
        selectedView.classList.add("active")
      }

      // Close mobile menu if open
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove("open")
      }
    })
  })

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 1024) {
      if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        sidebar.classList.remove("open")
      }
    }
  })

  // Add animation to cards on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe all cards
  document.querySelectorAll(".card, .stat-card, .quick-action-card, .notification-item").forEach((card) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease"
    observer.observe(card)
  })

  // FAQ accordion functionality
  const faqItems = document.querySelectorAll('.faq-item')
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question')
    if (question) {
      question.addEventListener('click', () => {
        const wasActive = item.classList.contains('active')
        
        // Close all FAQ items
        faqItems.forEach(faq => faq.classList.remove('active'))
        
        // Toggle current item
        if (!wasActive) {
          item.classList.add('active')
        }
      })
    }
  })
})

// Logout function
function logout() {
  sessionStorage.clear()
  window.location.href = "index.html"
}

// ============================================
// CHATBOT FUNCTIONALITY
// ============================================

const chatbotKnowledgeBase = {

  
  
  "como solicito una beca": {
    response:
      "Para solicitar una beca debes:\n\n1. Iniciar sesión en tu portal de estudiante.\n2. Ir a la sección **Convocatorias**.\n3. Verificar los requisitos de la beca.\n4. Completar el formulario de solicitud.\n5. Subir todos los documentos requeridos.\n6. Enviar la solicitud antes de la fecha límite.\n\n¿Quieres saber qué documentos necesitas?",
  },

  "que documentos necesito": {
    response:
      "Los documentos más comunes para solicitar una beca son:\n\n• Cédula o identificación oficial\n• Constancia de matrícula\n• Historial académico actualizado\n• Recibos o comprobantes de ingresos del hogar\n• Certificación de notas\n• Carta de motivos\n• Comprobante de domicilio\n• Foto tamaño pasaporte\n\nDependiendo del tipo de beca, podría solicitarse documentación adicional.",
  },

  "estado de mi solicitud": {
    response:
      "Puedes ver el estado de tus solicitudes en la sección **Mis Solicitudes** del portal.\n\nLos estados posibles son:\n• Pendiente\n• En revisión\n• En análisis socioeconómico\n• En evaluación académica\n• En comité de becas\n• Aprobada\n• Rechazada\n\nSi quieres te explico qué significa cada estado.",
  },

  "significado de estados": {
    response:
      "Estos son los significados:\n\n• **Pendiente:** Tu solicitud fue recibida.\n• **En revisión:** Se están verificando tus documentos.\n• **Socioeconómico:** La trabajadora social revisa tu caso.\n• **Académico:** Se evalúa tu rendimiento académico.\n• **En comité:** Tu caso se presentará para toma de decisión.\n• **Aprobada:** Obtienes el beneficio.\n• **Rechazada:** No cumpliste con los criterios.\n\n¿Quieres saber por qué puede ser rechazada una beca?",
  },

  "por que rechazan becas": {
    response:
      "Las causas más comunes de rechazo son:\n\n• Documentos incompletos o inválidos.\n• No cumplir requisitos académicos.\n• No demostrar necesidad económica.\n• Inconsistencias en la información.\n• Presentar documentos fuera de tiempo.\n• Falta de cupo o presupuesto.\n\nSi deseas puedes enviar una apelación en caso de rechazo.",
  },

  "como renuevo mi beca": {
    response:
      "Para renovar tu beca debes:\n\n1. Ingresar al portal y entrar a **Renovar Beca**.\n2. Verificar que cumples los requisitos académicos.\n3. Subir documentos actualizados.\n4. Completar la encuesta socioeconómica, si aplica.\n5. Enviar la solicitud dentro del período habilitado.\n\n¿Quieres que te liste los requisitos académicos?",
  },

  "requisitos de renovacion": {
    response:
      "Los requisitos generales de renovación son:\n\n• Promedio mínimo según tipo de beca.\n• Tener al menos el 80% de materias aprobadas.\n• No tener sanciones disciplinarias.\n• Estar matriculado en el período actual.\n• Mantener la situación socioeconómica declarada.\n\nEstos pueden variar según el tipo de beca.",
  },


  "suspension de beca": {
    response:
      "Puedes solicitar suspensión de beca si:\n\n• Tienes una incapacidad.\n• Presentas problemas familiares o de salud.\n• Debes ausentarte temporalmente.\n\nLa suspensión debe solicitarse antes del inicio del período e incluir evidencia.\n¿Deseas saber cómo solicitarla?",
  },

  "como suspendo mi beca": {
    response:
      "Para suspender tu beca:\n\n1. Ve a la sección *Mis Becas*.\n2. Selecciona **Solicitar Suspensión**.\n3. Indica fechas de inicio y fin.\n4. Adjunta documentos justificativos.\n5. Envía la solicitud.\n\nEl comité evaluará tu caso.",
  },


  "apelacion": {
    response:
      "Si no estás de acuerdo con el resultado:\n\n1. Entra a **Mis Solicitudes**.\n2. Selecciona la solicitud rechazada.\n3. Haz clic en **Enviar Apelación**.\n4. Explica el motivo y adjunta evidencia.\n\nEl comité revisará nuevamente tu caso.",
  },


 
  "trabajadora social": {
    response:
      "La trabajadora social se encarga de:\n\n• Evaluación socioeconómica.\n• Visitas domiciliarias.\n• Verificación de ingresos.\n• Seguimiento de casos vulnerables.\n• Recomendaciones al comité.\n\n¿Quieres saber qué revisa exactamente?",
  },

  "que revisa trabajadora social": {
    response:
      "En el análisis socioeconómico se revisa:\n\n• Ingresos del hogar.\n• Número de dependientes.\n• Vivienda y servicios.\n• Gastos mensuales.\n• Situaciones especiales (salud, desempleo, etc.).\n\nTodo esto se usa para determinar el nivel de necesidad.",
  },


  "comite de becas": {
    response:
      "El Comité de Becas es el responsable de:\n\n• Revisar casos pendientes.\n• Evaluar informes socioeconómicos.\n• Confirmar el cumplimiento académico.\n• Aprobar o denegar becas.\n• Registrar resoluciones oficiales.\n\nSe reúnen según el calendario institucional.",
  },

  "cuando se reune el comite": {
    response:
      "El comité se reúne:\n\n• De forma ordinaria una vez por cuatrimestre.\n• De forma extraordinaria cuando hay casos urgentes.\n\nPuedes ver la fecha exacta en la sección *Comité de Becas* del portal.",
  },


  "noticias": {
    response:
      "En la sección **Noticias** puedes ver:\n\n• Comunicados oficiales del comité\n• Resultados de convocatorias\n• Becas disponibles\n• Cambios en requisitos\n• Recordatorios importantes\n\nLas noticias se actualizan regularmente.",
  },


  "consulta": {
    response:
      "Puedes enviar consultas desde:\n\n📌 La sección *Ayuda* en tu portal\n📧 Correo: becas@universidad.edu\n📞 Teléfono: (+506) 123-4567\n\nResponderemos lo antes posible.",
  },

  contacto: {
    response:
      "Nuestros canales de contacto son:\n\n📧 Correo: becas@universidad.edu\n📞 Teléfono: (+506) 123-4567\n🏢 Oficina: Edificio Administrativo, Piso 2\n🕐 Horarios: Lunes a Viernes de 9:00 AM a 5:00 PM",
  },

  // ===========================
  // MENSAJES GENÉRICOS
  // ===========================
  "gracias": { response: "¡Con gusto! 😊 Si necesitas más ayuda, aquí estoy." },
  "hola": { response: "¡Hola! 👋 ¿En qué puedo ayudarte con tu beca hoy?" },
  "adios": { response: "¡Hasta luego! 👋 Que tengas un excelente día." }
};

function toggleChatbot() {
  const widget = document.getElementById("chatbotWidget")
  const button = document.getElementById("chatbotButton")

  if (widget && button) {
    if (widget.classList.contains("active")) {
      widget.classList.remove("active")
      button.classList.remove("hidden")
    } else {
      widget.classList.add("active")
      button.classList.add("hidden")
    }
  }
}

function sendMessage() {
  const input = document.getElementById("chatbotInput")
  if (!input) return
  
  const message = input.value.trim()

  if (message) {
    addUserMessage(message)
    input.value = ""

    setTimeout(() => {
      const response = getBotResponse(message)
      addBotMessage(response)
    }, 500)
  }
}

function sendQuickReply(message) {
  addUserMessage(message)

  setTimeout(() => {
    const response = getBotResponse(message)
    addBotMessage(response)
  }, 500)
}

function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage()
  }
}

function addUserMessage(message) {
  const messagesContainer = document.getElementById("chatbotMessages")
  if (!messagesContainer) return
  
  const messageDiv = document.createElement("div")
  messageDiv.className = "chatbot-message user"
  messageDiv.innerHTML = `
    <div class="message-content">
      <p>${escapeHtml(message)}</p>
    </div>
    <div class="message-avatar">👤</div>
  `
  messagesContainer.appendChild(messageDiv)
  scrollToBottom()
}

function addBotMessage(message) {
  const messagesContainer = document.getElementById("chatbotMessages")
  if (!messagesContainer) return
  
  const messageDiv = document.createElement("div")
  messageDiv.className = "chatbot-message bot"
  messageDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    </div>
  `
  messagesContainer.appendChild(messageDiv)
  scrollToBottom()
}

function getBotResponse(userMessage) {
  const normalizedMessage = userMessage
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  // Check for keywords in knowledge base
  for (const [key, value] of Object.entries(chatbotKnowledgeBase)) {
    if (normalizedMessage.includes(key.replace(/ /g, "")) || normalizedMessage.includes(key)) {
      return value.response
    }
  }

  // Check for greetings
  if (normalizedMessage.match(/hola|buenos dias|buenas tardes|buenas noches|hey|hi/)) {
    return "¡Hola! ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre:\n\n• Cómo solicitar una beca\n• Documentos requeridos\n• Tipos de becas disponibles\n• Proceso de renovación\n• Requisitos académicos\n• Contacto y horarios"
  }

  // Check for thanks
  if (normalizedMessage.match(/gracias|muchas gracias|thank you|thanks/)) {
    return "¡De nada! Si tienes más preguntas, no dudes en consultarme. Estoy aquí para ayudarte. 😊"
  }

  // Check for goodbye
  if (normalizedMessage.match(/adios|hasta luego|chao|bye|nos vemos/)) {
    return "¡Hasta luego! Que tengas un excelente día. Recuerda que puedes consultarme cuando lo necesites. 👋"
  }

  // Default response
  return "Entiendo tu pregunta, pero no tengo una respuesta específica para eso. Te recomiendo:\n\n• Contactar directamente a la oficina de becas: becas@universidad.edu\n• Llamar al (555) 123-4567\n• Visitar la oficina en el Edificio Administrativo, 2do piso\n\n¿Hay algo más en lo que pueda ayudarte?"
}

function scrollToBottom() {
  const messagesContainer = document.getElementById("chatbotMessages")
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

const API_BASE = window.API_CONFIG.API_BASE_URL;

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }
  return response.json();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.scholarship-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Obtén el id del estudiante guardado en sessionStorage o de donde corresponda
    const studentId = sessionStorage.getItem('studentId');
    const convocatoriaSelect = form.querySelector('select[name="convocatoria"]');
    const idConvocatoria = convocatoriaSelect.value;
    try {
      const data = await apiFetch(`/estudiantes/${studentId}/solicitudes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_convocatoria: idConvocatoria })
      });
      alert(`Solicitud creada (ID: ${data.id_solicitud})`);
    } catch (err) {
      alert('Hubo un problema al enviar la solicitud');
      console.error(err);
    }
  });
});

async function subirDocumento(idSolicitud, idDocumento, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id_documento', idDocumento);

  await apiFetch(`/solicitudes/${idSolicitud}/documentos`, {
    method: 'POST',
    body: formData
  });
  alert('Documento subido con éxito');
}

async function enviarApelacion(idSolicitud, motivo) {
  await apiFetch(`/solicitudes/${idSolicitud}/apelaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo })
  });
  alert('Apelación enviada');
}

async function registrarSuspension(idBeca, fechaInicio, fechaFin, motivo) {
  await apiFetch(`/becas/${idBeca}/suspensiones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fecha_inicio: fechaInicio, fecha_fin: fechaFin, motivo })
  });
  alert('Suspensión registrada');
}

async function cargarResultados() {
  // Recuperamos el ID del estudiante desde sessionStorage
  const id = sessionStorage.getItem('studentId');
  if (!id) {
    console.warn('No se encontró studentId en sessionStorage');
    return;
  }

  try {
    const data = await apiFetch(`/resultados/${id}`);
    const lista = document.querySelector('.solicitudes-list');
    lista.innerHTML = ''; // vaciamos la lista previa

    data.resultados.forEach(item => {
      // Determinamos el estado a mostrar (decisión o estado de la solicitud)
      const estado = item.decision || item.estado_solicitud || 'En revisión';
      const badgeClass = item.decision
        ? 'badge-success'
        : estado.toLowerCase().includes('rech')
        ? 'badge-danger'
        : 'badge-secondary';

      // Construimos la tarjeta de la solicitud
      const card = document.createElement('div');
      card.className = 'solicitud-card';
      card.innerHTML = `
        <div class="solicitud-header">
          <div>
            <h3>Solicitud #${item.id_solicitud}</h3>
            <p class="text-muted">${item.fecha || ''}</p>
          </div>
          <span class="badge ${badgeClass}">${estado}</span>
        </div>
        <div class="solicitud-body">
          <p>${item.motivo || ''}</p>
        </div>
      `;
      lista.appendChild(card);
    });
  } catch (err) {
    console.error('Error cargando resultados:', err);
  }
}
document.addEventListener("DOMContentLoaded", () => {

  // ============================
  // 1) Toggle del menú móvil
  // ============================
  const mobileMenuToggle = document.getElementById("mobileMenuToggleStudent");
  const sidebar = document.getElementById("sidebarStudent");

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 1024) {
      if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        sidebar.classList.remove("open");
      }
    }
  });

  // ============================
  // 2) Navegación entre vistas
  // ============================
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");

  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");

      const viewName = this.getAttribute("data-view");

      views.forEach((view) => view.classList.remove("active"));

      const selectedView = document.getElementById(`${viewName}-view`);
      if (selectedView) selectedView.classList.add("active");

      if (window.innerWidth <= 1024) {
        sidebar.classList.remove("open");
      }
    });
  });

  // ============================
  // 3) Animación de tarjetas
  // ============================
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  document.querySelectorAll(".card, .stat-card, .quick-action-card, .notification-item").forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(card);
  });

  // ============================
  // 4) FAQ toggle
  // ============================
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const wasActive = item.classList.contains("active");
      faqItems.forEach((f) => f.classList.remove("active"));
      if (!wasActive) item.classList.add("active");
    });
  });

  // ============================
  // 5) Quick actions
  // ============================
  document.querySelectorAll(".quick-action-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      switch (action) {
        case "solicitar-beca":
          document.querySelector("[data-view='student-solicitar']").click();
          break;
        case "renovar-beca":
          document.querySelector("[data-view='student-renovacion']").click();
          break;
        case "subir-documentos":
          document.querySelector("[data-view='student-documentos']").click();
          break;
        case "ver-convocatorias":
          document.querySelector("[data-view='student-convocatorias']").click();
          break;
      }
    });
  });

  // ============================
  // 6) Cargar Dashboard
  // ============================
  loadStudentDashboard();

  // ============================
  // 7) Cargar expediente
  // ============================
  loadStudentExpediente();

  // ============================
  // 8) Cargar perfil
  // ============================
  loadStudentPerfil();


  // ============================
  // 🔥 9) Listener real del botón EDITAR PERFIL
  // ============================
  const btnEdit = document.getElementById("btnEditarPerfil");
  if (btnEdit) {
    btnEdit.addEventListener("click", activarEdicionPerfil);
  }
});

async function loadStudentPerfil() {
  const token = sessionStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("https://becas-back1.onrender.com/api/student/perfil", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      console.error("Error al obtener perfil:", await res.text());
      return;
    }

    const data = await res.json();

    // ============================
    // 1. Información Personal
    // ============================
    document.getElementById("perfil-nombre").textContent = data.nombre || "No registrado";
    document.getElementById("perfil-correo").textContent = data.correo || "No registrado";
    document.getElementById("perfil-telefono").textContent = data.telefono || "No registrado";
    document.getElementById("perfil-direccion").textContent = data.direccion || "No registrado";
    document.getElementById("perfil-provincia").textContent = data.provincia || "No registrado";
    document.getElementById("perfil-canton").textContent = data.canton || "No registrado";
    document.getElementById("perfil-distrito").textContent = data.distrito || "No registrado";
    document.getElementById("perfil-genero").textContent = data.genero || "No registrado";
    document.getElementById("perfil-estado-civil").textContent = data.estado_civil || "No registrado";
    document.getElementById("perfil-curp").textContent = data.curp || "No registrado";
    document.getElementById("perfil-fecha-nacimiento").textContent = data.fecha_nacimiento || "No registrado";


    // Si deseas mostrar CURP, Estado Civil, Género:
    if (document.getElementById("perfil-curp"))
      document.getElementById("perfil-curp").textContent = data.curp || "No registrado";

    if (document.getElementById("perfil-estado-civil"))
      document.getElementById("perfil-estado-civil").textContent = data.estado_civil || "No registrado";

    if (document.getElementById("perfil-genero"))
      document.getElementById("perfil-genero").textContent = data.genero || "No registrado";

    if (document.getElementById("perfil-fecha-nacimiento"))
      document.getElementById("perfil-fecha-nacimiento").textContent = data.fecha_nacimiento || "No registrado";

    // ============================
    // 2. Información Académica
    // ============================
    document.getElementById("perfil-carnet").textContent = data.carnet || "No registrado";
    document.getElementById("perfil-carrera").textContent = data.carrera || "No registrado";
    document.getElementById("perfil-promedio").textContent = data.promedio || "No registrado";

  } catch (err) {
    console.error("Error cargando perfil:", err);
  }
}

  async function loadStudentExpediente() {
  const token = sessionStorage.getItem("token")
  if (!token) return

  try {
    const res = await fetch("https://becas-back1.onrender.com/api/student/expediente", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    if (!res.ok) {
      console.error("Error al obtener expediente:", await res.text())
      return
    }

    const data = await res.json()
    const socio = data.socioeconomica || {}
    const familiares = Array.isArray(data.familiares) ? data.familiares : []

    const findFam = (buscado) =>
      familiares.find(f =>
        (f.parentesco || '').toLowerCase().includes(buscado)
      ) || {}

    const padre = findFam('padre')
    const madre = findFam('madre')

    // ====== Rellenar formulario socioeconómico ======
    const setVal = (id, val) => {
      const el = document.getElementById(id)
      if (el) el.value = val != null ? val : ''
    }

    setVal("exp-ocupacion-padre", socio.ocupacion_padre)
    setVal("exp-ocupacion-madre", socio.ocupacion_madre)
    setVal("exp-ingreso-total", socio.ingreso_total)
    setVal("exp-egreso-total", socio.egreso_total)
    setVal("exp-tipo-vivienda", socio.tipo_vivienda)
    setVal("exp-condicion-vivienda", socio.condicion_vivienda)
    setVal("exp-servicios-basicos", socio.servicios_basicos)
    setVal("exp-observaciones", socio.observaciones)

    setVal("exp-padre-nombre", padre.nombre)
    setVal("exp-padre-edad", padre.edad)
    setVal("exp-padre-ocupacion", padre.ocupacion)
    setVal("exp-padre-ingreso", padre.ingreso_mensual)
    setVal("exp-padre-nivel", padre.nivel_educativo)

    setVal("exp-madre-nombre", madre.nombre)
    setVal("exp-madre-edad", madre.edad)
    setVal("exp-madre-ocupacion", madre.ocupacion)
    setVal("exp-madre-ingreso", madre.ingreso_mensual)
    setVal("exp-madre-nivel", madre.nivel_educativo)

    // ====== Vista resumen “Información Familiar” ======
    const setText = (id, val, fallback = "No registrado") => {
      const el = document.getElementById(id)
      if (el) el.textContent = val && String(val).trim() !== "" ? val : fallback
    }

    setText("perfil-padre-nombre", padre.nombre)
    setText("perfil-padre-ocupacion", padre.ocupacion)
    setText("perfil-padre-telefono", "No registrado")

    setText("perfil-madre-nombre", madre.nombre)
    setText("perfil-madre-ocupacion", madre.ocupacion)
    setText("perfil-madre-telefono", "No registrado")
  } catch (err) {
    console.error("Error cargando expediente:", err)
  }

  // Listener de submit lo montamos aquí (para asegurar que el DOM ya está)
  initExpedienteFormHandler()
}

function initExpedienteFormHandler() {
  const form = document.getElementById("studentExpedienteForm")
  if (!form || form.dataset.bound === "1") return

  form.dataset.bound = "1"

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const token = sessionStorage.getItem("token")
    if (!token) return

    const getVal = (id) => {
      const el = document.getElementById(id)
      return el ? el.value.trim() : ""
    }

    const toNumberOrNull = (val) => {
      if (val === "") return null
      const n = Number(val)
      return Number.isNaN(n) ? null : n
    }

    const payload = {
      socioeconomica: {
        ocupacion_padre: getVal("exp-ocupacion-padre"),
        ocupacion_madre: getVal("exp-ocupacion-madre"),
        ingreso_total: toNumberOrNull(getVal("exp-ingreso-total")),
        egreso_total: toNumberOrNull(getVal("exp-egreso-total")),
        tipo_vivienda: getVal("exp-tipo-vivienda"),
        condicion_vivienda: getVal("exp-condicion-vivienda"),
        servicios_basicos: getVal("exp-servicios-basicos"),
        observaciones: getVal("exp-observaciones")
      },
      familiares: [
        {
          nombre: getVal("exp-padre-nombre"),
          parentesco: "Padre",
          edad: toNumberOrNull(getVal("exp-padre-edad")),
          ocupacion: getVal("exp-padre-ocupacion"),
          ingreso_mensual: toNumberOrNull(getVal("exp-padre-ingreso")),
          nivel_educativo: getVal("exp-padre-nivel")
        },
        {
          nombre: getVal("exp-madre-nombre"),
          parentesco: "Madre",
          edad: toNumberOrNull(getVal("exp-madre-edad")),
          ocupacion: getVal("exp-madre-ocupacion"),
          ingreso_mensual: toNumberOrNull(getVal("exp-madre-ingreso")),
          nivel_educativo: getVal("exp-madre-nivel")
        }
      ]
    }

    try {
      const res = await fetch("https://becas-back1.onrender.com/api/student/expediente", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        console.error("Error al actualizar expediente:", await res.text())
        alert("Ocurrió un error al guardar el expediente.")
        return
      }

      alert("Expediente actualizado correctamente.")
      // Recargamos datos desde el backend
      loadStudentExpediente()
    } catch (err) {
      console.error("Error al enviar expediente:", err)
      alert("Ocurrió un error al guardar el expediente.")
    }
  })
}

function activarEdicionPerfil() {
  const editables = [
    { id: "perfil-nombre", campo: "nombre" },
    { id: "perfil-correo", campo: "correo" },
    { id: "perfil-telefono", campo: "telefono" },
    { id: "perfil-direccion", campo: "direccion" },
    { id: "perfil-genero", campo: "genero" },
    { id: "perfil-estado-civil", campo: "estado_civil" },
    { id: "perfil-fecha-nacimiento", campo: "fecha_nacimiento" }
  ];

  editables.forEach(item => {
    const span = document.getElementById(item.id);
    if (!span) return;

    const input = document.createElement("input");
    input.className = "input";
    input.dataset.campo = item.campo;
    input.value = span.textContent === "No registrado" ? "" : span.textContent;

    span.replaceWith(input);
  });

  // Botón Guardar
  if (!document.getElementById("btnGuardarPerfil")) {
    const btn = document.createElement("button");
    btn.id = "btnGuardarPerfil";
    btn.className = "btn btn-success";
    btn.textContent = "Guardar cambios";
    document.querySelector("#student-perfil-view .view-header").appendChild(btn);

    btn.addEventListener("click", guardarPerfil);
  }
}

async function guardarPerfil() {
  const token = sessionStorage.getItem("token");
  if (!token) return;

  const inputs = document.querySelectorAll("#student-perfil-view input.input");
  const data = {};

  inputs.forEach(input => {
    const campo = input.dataset.campo;
    if (campo) data[campo] = input.value.trim();
  });

  try {
    const resp = await fetch("https://becas-back1.onrender.com/api/student/perfil", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await resp.json();

    if (!resp.ok) {
      alert("Error al guardar: " + result.message);
      return;
    }

    alert("Perfil actualizado con éxito.");
    location.reload();

  } catch (err) {
    console.error("Error guardando perfil:", err);
    alert("Error al guardar perfil.");
  }
}

async function loadStudentDashboard() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    // Si no hay token, mandamos al login
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch("https://becas-back1.onrender.com/api/student/panel", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error("Error al obtener panel de estudiante:", await res.text());
      return;
    }

    const data = await res.json();

    // ==========================
    // 1) Nombre del estudiante
    // ==========================
    const userName = data.user?.nombre || "Estudiante";

    const headerName = document.getElementById("studentUserName");
    if (headerName) headerName.textContent = userName;

    const welcomeName = document.getElementById("welcomeUserName");
    if (welcomeName) welcomeName.textContent = userName;

    // ==========================
    // 2) Beca actual
    // ==========================
    const beca = data.becaActual;

    const becaNombreEl = document.getElementById("dash-beca-nombre");
    const becaVigenciaEl = document.getElementById("dash-beca-vigencia");

    if (beca) {
      if (becaNombreEl) {
        const porcentaje = beca.valor ? `${beca.valor}` : "";
        becaNombreEl.textContent = `${beca.tipo || "Beca"} ${porcentaje}`.trim();
      }

      if (becaVigenciaEl) {
        const periodo = beca.periodo ? `Período ${beca.periodo}` : "";
        const fechas = (beca.fechaInicio && beca.fechaFin)
          ? `Del ${beca.fechaInicio} al ${beca.fechaFin}`
          : "";
        becaVigenciaEl.textContent = `${beca.estado || ""} ${periodo} ${fechas}`.trim();
      }
    } else {
      if (becaNombreEl) becaNombreEl.textContent = "Sin beca activa";
      if (becaVigenciaEl) becaVigenciaEl.textContent = "Puedes aplicar en la sección Convocatorias";
    }

    // ==========================
    // 3) Promedio
    // ==========================
    const promValorEl = document.getElementById("dash-promedio-valor");
    const promEstadoEl = document.getElementById("dash-promedio-estado");

    const promedio = data.user?.promedio;
    if (promValorEl) promValorEl.textContent = promedio || "—";

    if (promEstadoEl) {
      if (promedio && Number(promedio) >= 8) {
        promEstadoEl.textContent = "Cumpliendo requisitos";
        promEstadoEl.classList.add("positive");
      } else if (promedio) {
        promEstadoEl.textContent = "En riesgo, revisa tu promedio";
        promEstadoEl.classList.remove("positive");
      } else {
        promEstadoEl.textContent = "Sin datos académicos";
      }
    }

    // ==========================
    // 4) Solicitudes
    // ==========================
    const solResumenEl = document.getElementById("dash-solicitudes-resumen");
    const solDetalleEl = document.getElementById("dash-solicitudes-detalle");

    const sol = data.stats?.solicitudes || {};
    const total = sol.total || 0;
    const activas = (sol.enEvaluacion || 0) + (sol.aprobadas || 0);

    if (solResumenEl) solResumenEl.textContent = `${activas} activa(s)`;
    if (solDetalleEl) {
      if (total === 0) {
        solDetalleEl.textContent = "Sin solicitudes registradas";
      } else {
        solDetalleEl.textContent = `Total: ${total} (Aprobadas: ${sol.aprobadas || 0}, Rechazadas: ${sol.rechazadas || 0})`;
      }
    }

    // ==========================
    // 5) Documentos
    // ==========================
    const docsResumenEl = document.getElementById("dash-docs-resumen");
    const docsDetalleEl = document.getElementById("dash-docs-detalle");

    const docs = data.stats?.documentos || {};
    const totalDocs = docs.total || 0;
    const aprobados = docs.aprobados || 0;
    const pendientes = docs.pendientes || 0;

    if (docsResumenEl) docsResumenEl.textContent = `${aprobados}/${totalDocs}`;
    if (docsDetalleEl) {
      if (totalDocs === 0) {
        docsDetalleEl.textContent = "Sin documentos cargados";
      } else if (pendientes === 0) {
        docsDetalleEl.textContent = "Expediente completo";
      } else {
        docsDetalleEl.textContent = `${pendientes} documento(s) pendiente(s)`;
      }
    }

    // ==========================
    // 6) Notificaciones reales
    // ==========================
    const notiContainer = document.getElementById("notificationsContainer");
    if (notiContainer) {
      notiContainer.innerHTML = ""; // limpio maqueta

      const notificaciones = data.notificaciones || [];

      if (notificaciones.length === 0) {
        notiContainer.innerHTML = "<p class='text-muted'>No tienes notificaciones.</p>";
      }

      notificaciones.forEach(n => {
        const card = document.createElement("div");
        card.className = `notification-item ${n.leido === 0 ? "unread" : ""}`;
        card.innerHTML = `
          <div class="notification-icon" style="background: rgba(6, 182, 212, 0.1); color:#06b6d4;">
            📢
          </div>
          <div class="notification-content">
            <h4>${n.tipo}</h4>
            <p>${n.mensaje}</p>
            <span class="notification-time">${new Date(n.fecha_envio).toLocaleString()}</span>
          </div>
        `;
        notiContainer.appendChild(card);
      });
    }

    // ==========================
    // 7) Estado de mi beca real
    // ==========================
    const bec = data.becaActual;

    if (bec) {
      document.getElementById("mbeca-nombre").textContent = bec.tipo + " " + (bec.codigo || "");
      document.getElementById("mbeca-estado").textContent = bec.estado;
      document.getElementById("mbeca-porcentaje").textContent = bec.valor ? bec.valor + "%" : "—";
      document.getElementById("mbeca-valor").textContent = bec.valor ? bec.valor + "% de matrícula" : "—";
      document.getElementById("mbeca-vigencia").textContent = bec.fechaInicio + " → " + bec.fechaFin;
      document.getElementById("mbeca-promreq").textContent = "8.0"; // si tienes tabla de requisitos lo pongo dinámico
      document.getElementById("mbeca-promedio").textContent = data.user.promedio || "—";

      // progreso
      const progress = Math.min(
        100,
        Math.round((data.user.promedio / 8) * 100)
      );

      document.getElementById("mbeca-progress").style.width = progress + "%";
      document.getElementById("mbeca-progress-text").textContent = progress + "% completado";
    } else {
      document.getElementById("mbeca-nombre").textContent = "Sin beca activa";
    }

    // ==========================
    // 8) Fechas importantes
    // ==========================
    const tl = document.getElementById("timelineBeca");
    if (tl) {
      tl.innerHTML = "";

      if (!bec) {
        tl.innerHTML = "<p class='text-muted'>No tienes beca activa.</p>";
      } else {
        const fechaInicio = new Date(bec.fechaInicio);
        const fechaFin = new Date(bec.fechaFin);

        const revisionMedia = new Date(
          (fechaInicio.getTime() + fechaFin.getTime()) / 2
        );

        const renovacion = new Date(fechaFin);
        renovacion.setDate(renovacion.getDate() - 30);

        const items = [
          { titulo: "Inicio de Beca", fecha: fechaInicio },
          { titulo: "Revisión de Medio Término", fecha: revisionMedia },
          { titulo: "Inicio Renovación", fecha: renovacion },
          { titulo: "Fin de Vigencia", fecha: fechaFin }
        ];

        items.forEach((i, idx) => {
          const div = document.createElement("div");
          div.className = `timeline-item ${idx === 0 ? "completed" : ""}`;

          div.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <h4>${i.titulo}</h4>
                <p>${i.fecha.toLocaleDateString()}</p>
            </div>
          `;

          tl.appendChild(div);
        });
      }
    }

  } catch (err) {
    console.error("Error cargando panel de estudiante:", err);
  }

}


// Logout function
function logout() {
  sessionStorage.clear()
  window.location.href = "index.html"
}

// ============================================
// STUDENT PROFILE DYNAMIC UPDATE
// ============================================
function updateStudentProfile(studentData) {
  // studentData = { nombre, email, carrera, cuatrimestre }
  const fields = {
    nombre: document.getElementById("studentName"),
    email: document.getElementById("studentEmail"),
    carrera: document.getElementById("studentCareer"),
    cuatrimestre: document.getElementById("studentQuarter")
  }

  for (const key in fields) {
    if (fields[key] && studentData[key]) {
      fields[key].textContent = studentData[key]
    }
  }
}

// ============================================
// CHATBOT FUNCTIONALITY
// ============================================

const chatbotKnowledgeBase = {
  "como solicito una beca": {
    response:
      "Para solicitar una beca, sigue estos pasos:\n\n1. Inicia sesión en el sistema\n2. Ve a la sección 'Convocatorias' y revisa las becas disponibles\n3. Verifica que cumples con los requisitos\n4. Haz clic en 'Solicitar Beca' y completa el formulario\n5. Sube todos los documentos requeridos\n6. Envía tu solicitud antes de la fecha límite\n\n¿Necesitas ayuda con algún paso específico?",
  },
  "que documentos necesito": {
    response:
      "Los documentos básicos requeridos son:\n\n• Identificación oficial vigente\n• Constancia de estudios del período actual\n• Historial académico (Kardex)\n• Comprobante de domicilio (no mayor a 3 meses)\n• Fotografía tamaño infantil\n• Carta de motivos\n• Comprobante de ingresos familiares (para beca socioeconómica)\n\nTodos los documentos deben estar en formato PDF, JPG o PNG, con un tamaño máximo de 5 MB.",
  },
  "cuanto tarda el proceso": {
    response:
      "El proceso completo de evaluación toma aproximadamente:\n\n• Revisión de documentos: 3-5 días hábiles\n• Análisis socioeconómico: 10-15 días hábiles\n• Evaluación académica: 5-7 días hábiles\n• Sesión de comité: según calendario\n• Comunicación de resultados: 2-3 días después del comité\n\nEn total, el proceso puede tomar de 4 a 6 semanas. Recibirás notificaciones en cada etapa.",
  },
  "como renuevo mi beca": {
    response:
      "Para renovar tu beca:\n\n1. Asegúrate de cumplir con todos los requisitos académicos (promedio mínimo, créditos, asistencia)\n2. Ve a la sección 'Renovar Beca' cuando se abra el período de renovación\n3. Actualiza tu información y documentos si es necesario\n4. Envía tu solicitud de renovación\n\nEl período de renovación generalmente abre 2 meses antes del inicio del nuevo cuatrimestre. Te notificaremos cuando esté disponible.",
  },
  "tipos de becas": {
    response:
      "Ofrecemos los siguientes tipos de becas:\n\n• Becas Académicas: Para estudiantes con excelencia académica (50%-100% de colegiatura)\n• Becas Socioeconómicas: Apoyo para estudiantes en situación de vulnerabilidad (25%-100%)\n• Becas Deportivas: Para atletas destacados que representen a la universidad (30%-75%)\n• Becas Culturales: Para estudiantes destacados en actividades artísticas y culturales\n\nCada tipo tiene requisitos específicos. ¿Sobre cuál te gustaría saber más?",
  },
  "requisitos academicos": {
    response:
      "Los requisitos académicos generales son:\n\n• Promedio mínimo: 8.0 para becas académicas, 7.5 para otras\n• Carga académica: Mínimo 12 créditos por semestre\n• Asistencia: Mínimo 90% en todas las materias\n• Sin materias reprobadas en el período actual\n• Estar inscrito como estudiante regular\n\nLos requisitos específicos pueden variar según el tipo de beca.",
  },
  contacto: {
    response:
      "Puedes contactarnos por:\n\n📧 Email: becas@universidad.edu\n📞 Teléfono: (555) 123-4567\n🏢 Oficina: Edificio Administrativo, 2do piso\n🕐 Horario: Lun-Vie 9:00 AM - 5:00 PM\n\nTambién puedes enviar un mensaje desde la sección de Ayuda en tu portal de estudiante.",
  },
  "beca rechazada": {
    response:
      "Si tu beca fue rechazada:\n\n1. Revisa los motivos del rechazo en la notificación que recibiste\n2. Puedes presentar una apelación dentro de los 5 días hábiles siguientes\n3. Proporciona evidencia adicional que respalde tu caso\n4. Contacta a la oficina de becas para orientación personalizada\n\nRecuerda que puedes aplicar nuevamente en la siguiente convocatoria.",
  },
  cuatrimestres: {
    response:
      "El sistema de becas funciona por cuatrimestres:\n\n• 2024-1: Enero - Abril\n• 2024-2: Mayo - Agosto\n• 2024-3: Septiembre - Diciembre\n\nCada cuatrimestre tiene su propia convocatoria y proceso de evaluación. Tu desempeño se evalúa por cuatrimestre para renovaciones.",
  },
  horarios: {
    response:
      "Horarios de atención:\n\n🏢 Oficina de Becas:\nLunes a Viernes: 9:00 AM - 5:00 PM\n\n💬 Asistente Virtual:\nDisponible 24/7\n\n📞 Línea telefónica:\nLunes a Viernes: 9:00 AM - 5:00 PM\n\nFuera de horario, puedes enviar un correo y te responderemos en 24-48 horas.",
  },
}

function toggleChatbot() {
  const widget = document.getElementById("chatbotWidget")
  const button = document.getElementById("chatbotButton")

  if (widget && button) {
    if (widget.classList.contains("active")) {
      widget.classList.remove("active")
      button.classList.remove("hidden")
    } else {
      widget.classList.add("active")
      button.classList.add("hidden")
    }
  }
}

function sendMessage() {
  const input = document.getElementById("chatbotInput")
  if (!input) return
  
  const message = input.value.trim()

  if (message) {
    addUserMessage(message)
    input.value = ""

    setTimeout(() => {
      const response = getBotResponse(message)
      addBotMessage(response)
    }, 500)
  }
}

function sendQuickReply(message) {
  addUserMessage(message)

  setTimeout(() => {
    const response = getBotResponse(message)
    addBotMessage(response)
  }, 500)
}

function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage()
  }
}

function addUserMessage(message) {
  const messagesContainer = document.getElementById("chatbotMessages")
  if (!messagesContainer) return
  
  const messageDiv = document.createElement("div")
  messageDiv.className = "chatbot-message user"
  messageDiv.innerHTML = `
    <div class="message-content">
      <p>${escapeHtml(message)}</p>
    </div>
    <div class="message-avatar">👤</div>
  `
  messagesContainer.appendChild(messageDiv)
  scrollToBottom()
}

function addBotMessage(message) {
  const messagesContainer = document.getElementById("chatbotMessages")
  if (!messagesContainer) return
  
  const messageDiv = document.createElement("div")
  messageDiv.className = "chatbot-message bot"
  messageDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    </div>
  `
  messagesContainer.appendChild(messageDiv)
  scrollToBottom()
}

function getBotResponse(userMessage) {
  const normalizedMessage = userMessage
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

 
  for (const [key, value] of Object.entries(chatbotKnowledgeBase)) {
    const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "")
    if (normalizedMessage.includes(normalizedKey)) return value.response
  }

 
  if (normalizedMessage.match(/hola|buenos dias|buenas tardes|buenas noches|hey|hi/)) {
    return "¡Hola! ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre:\n\n• Cómo solicitar una beca\n• Documentos requeridos\n• Tipos de becas disponibles\n• Proceso de renovación\n• Requisitos académicos\n• Contacto y horarios"
  }

  // Check for thanks
  if (normalizedMessage.match(/gracias|muchas gracias|thank you|thanks/)) {
    return "¡De nada! Si tienes más preguntas, no dudes en consultarme. Estoy aquí para ayudarte. 😊"
  }

  // Check for goodbye
  if (normalizedMessage.match(/adios|hasta luego|chao|bye|nos vemos/)) {
    return "¡Hasta luego! Que tengas un excelente día. Recuerda que puedes consultarme cuando lo necesites. 👋"
  }

  // Default response
  return "Entiendo tu pregunta, pero no tengo una respuesta específica para eso. Te recomiendo:\n\n• Contactar directamente a la oficina de becas: becas@universidad.edu\n• Llamar al (555) 123-4567\n• Visitar la oficina en el Edificio Administrativo, 2do piso\n\n¿Hay algo más en lo que pueda ayudarte?"
}

function scrollToBottom() {
  const messagesContainer = document.getElementById("chatbotMessages")
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

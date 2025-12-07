// ==========================
// MODALES LOGIN / REGISTER
// ==========================

function showLoginModal(role = "") {
  const modal = document.getElementById("loginModal");
  modal.classList.add("show");
  document.body.style.overflow = "hidden";

  if (role) {
    document.getElementById("userType").value = role;
  }
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
}

// ==========================
// LOGIN (CON BACKEND)
// ==========================

async function handleLogin(event) {
  event.preventDefault();

  const userType = document.getElementById("userType").value;
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("https://becas-back1.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Credenciales incorrectas");
      return;
    }

    // ==========================
    // GUARDAR DATOS DEL USUARIO
    // ==========================
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("userId", data.user.id);
    sessionStorage.setItem("userName", data.user.name);
    sessionStorage.setItem("userEmail", data.user.email);
    sessionStorage.setItem("userRole", data.user.rol);

    // Redirección según rol
    const rol = (data.user.rol || "").toLowerCase();
    
    if (rol.includes("aspirante")) {
      window.location.href = "aspirante.html";
    } else if (rol.includes("estudiante")) {
      window.location.href = "student.html";
    } else if (rol.includes("comite")) {
      window.location.href = "comite.html";
    } else if (rol.includes("trabajadora") || rol.includes("admin") || rol.includes("social")) {
      window.location.href = "administracion.html";
    } else {
      window.location.href = "student.html";
    }

  } catch (err) {
    console.error("Login error:", err);
    alert("No hay conexión con el servidor");
  }
}

// ==========================
// RECUPERAR CONTRASEÑA
// ==========================

function showRecoveryModal() {
  alert("Recuperación de contraseña pendiente de implementación");
  closeLoginModal();
}

// ==========================
// REGISTER (CON BACKEND)
// ==========================

function showRegisterModal() {
  closeLoginModal();
  const modal = document.getElementById("registerModal");
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeRegisterModal() {
  const modal = document.getElementById("registerModal");
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
}

async function handleRegister(event) {
  event.preventDefault();

  const userType = document.getElementById("registerUserType").value; // 'aspirante' o 'estudiante'
  const fullName = document.getElementById("registerFullName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const passwordConfirm = document.getElementById("registerPasswordConfirm").value;
  const termsAccepted = document.getElementById("registerTerms").checked;

  if (!userType || !fullName || !email || !password || !passwordConfirm) {
    alert("Completa todos los campos");
    return;
  }

  if (password !== passwordConfirm) {
    alert("Las contraseñas no coinciden");
    return;
  }

  if (!termsAccepted) {
    alert("Debes aceptar los términos");
    return;
  }

  try {
    const res = await fetch("https://becas-back1.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email: email,
        password: password,
        role: userType
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error al registrar");
      return;
    }

    alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
    closeRegisterModal();

    setTimeout(() => {
      showLoginModal();
      document.getElementById("username").value = email;
    }, 300);

  } catch (err) {
    console.error("Register error:", err);
    alert("No hay conexión con el servidor");
  }
}

// ==========================
// MOSTRAR NOMBRE DEL USUARIO (EN CUALQUIER PANTALLA)
// ==========================

function loadUserName() {
  const name = sessionStorage.getItem("userName");
  const element = document.getElementById("displayUserName");

  if (element && name) {
    element.textContent = name;
  }
}

document.addEventListener("DOMContentLoaded", loadUserName);

// ==========================
// CERRAR SESIÓN
// ==========================

function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

// ==========================
// SCROLL + MODALES + HEADER
// ==========================

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

window.onclick = (event) => {
  const login = document.getElementById("loginModal");
  const register = document.getElementById("registerModal");

  if (event.target === login) closeLoginModal();
  if (event.target === register) closeRegisterModal();
};

window.addEventListener("scroll", () => {
  const header = document.querySelector(".landing-header");
  if (window.scrollY > 50) header.classList.add("scrolled");
  else header.classList.remove("scrolled");
});

// ==========================
// ROTADOR IMÁGENES HERO
// ==========================

let currentImg = 0;
const imgs = document.querySelectorAll(".hero-gallery .gallery-img");

if (imgs.length > 0) {
  setInterval(() => {
    imgs[currentImg].classList.remove("active");
    currentImg = (currentImg + 1) % imgs.length;
    imgs[currentImg].classList.add("active");
  }, 5000);
}

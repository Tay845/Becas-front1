// ===============================
// CONFIGURACIÓN GENERAL DEL API - CORREGIDA
// ===============================
function getAPIBase() {
    return window.API_CONFIG?.ADMIN_BASE_URL || "https://becas-back1.onrender.com/api/admin";
}

async function api(path, method = "GET", body = null) {
    const opts = {
        method,
        headers: window.buildAuthHeaders()
    };

    if (body) {
        opts.body = JSON.stringify(body);
    }

    const res = await fetch(getAPIBase() + path, opts);

    if (!res.ok) {
        throw new Error("API error " + res.status);
    }

    return res.status === 204 ? null : res.json();
}// config.js
// Cambiar esta URL cuando despliegue
window.API_CONFIG = {
  API_BASE_URL: "https://becas-back1.onrender.com/api" // ejemplo: backend local, tenemos que hostear las apis tambien
};

/* Ejemplo de como se utilizaria el api
const baseUrl = window.API_CONFIG.API_BASE_URL;
fetch(`${baseUrl}/auth/login`, { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'} })
*/


window.addEventListener('storage', (event) => {
  if (event.key === 'solicitudBeca') {
    const event_actualizada = new CustomEvent('solicitudBecaActualizada', { 
      detail: event.newValue ? JSON.parse(event.newValue) : {} 
    });
    window.dispatchEvent(event_actualizada);
  }
});


function sincronizarDatos() {
  
  const datosActuales = localStorage.getItem('solicitudBeca');
  window.dispatchEvent(new CustomEvent('solicitudBecaActualizada', {
    detail: datosActuales ? JSON.parse(datosActuales) : {}
  }));
}


let ultimoChecksum = '';

function crearChecksum(obj) {
  return JSON.stringify(obj);
}

setInterval(() => {
  const datos = localStorage.getItem('solicitudBeca');
  const checksum = crearChecksum(datos);
  
  if (checksum !== ultimoChecksum) {
    ultimoChecksum = checksum;
    const event_actualizada = new CustomEvent('solicitudBecaActualizada', {
      detail: datos ? JSON.parse(datos) : {}
    });
    window.dispatchEvent(event_actualizada);
  }
}, 500); // Verificar cada 500ms

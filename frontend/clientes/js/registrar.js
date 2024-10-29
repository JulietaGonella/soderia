document.addEventListener('DOMContentLoaded', () => { 
    const localidadSelect = document.getElementById('localidad');
    const barrioSelect = document.getElementById('barrio');
    const clienteForm = document.getElementById('clienteForm');;  
    const barrioHelp = document.getElementById('barrioHelp');

    let barriosActuales = [];

    // Función para cargar localidades
    async function cargarLocalidades() {
        try {
            const response = await fetch('http://localhost:3000/localidades');
            const localidades = await response.json();

            localidades.forEach(localidad => {
                const option = document.createElement('option');
                option.value = localidad.ID;
                option.textContent = localidad.localidad;
                localidadSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar localidades:', error);
        }
    }

    // Función para cargar barrios por localidad
    async function cargarBarriosPorLocalidad(localidadID) {
        try {
            const response = await fetch(`http://localhost:3000/barrios?IDlocalidad=${localidadID}`);
            const barrios = await response.json();

            barrioSelect.innerHTML = '';
            barrioHelp.textContent = '';

            if (barrios.length > 0) {
                barriosActuales = barrios.map(b => b.ID);  // Guardar los IDs actuales
                barrios.forEach(barrio => {
                    const option = document.createElement('option');
                    option.value = barrio.ID;
                    option.textContent = barrio.barrio;
                    barrioSelect.appendChild(option);
                });
                barrioSelect.disabled = false;
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay barrios disponibles';
                barrioSelect.appendChild(option);
                barrioSelect.disabled = true;
            }
        } catch (error) {
            console.error('Error al cargar barrios:', error);
        }
    }

    // Cargar barrios periodicamente para detectar nuevos
    async function verificarNuevosBarrios(localidadID) {
        try {
            const response = await fetch(`http://localhost:3000/barrios?IDlocalidad=${localidadID}`);
            const barrios = await response.json();
            const nuevosBarrios = barrios.filter(b => !barriosActuales.includes(b.ID));

            if (nuevosBarrios.length > 0) {
                console.log('Nuevos barrios detectados:', nuevosBarrios);
                cargarBarriosPorLocalidad(localidadID);  // Recargar el select de barrios
            }
        } catch (error) {
            console.error('Error al verificar nuevos barrios:', error);
        }
    }

    cargarLocalidades();

    // Cargar barrios al cambiar la localidad
    localidadSelect.addEventListener('change', function () {
        const localidadID = this.value;
        if (localidadID) {
            cargarBarriosPorLocalidad(localidadID);
        } else {
            barrioSelect.innerHTML = '';
            barrioSelect.disabled = true;
        }
    });

    // Polling para verificar si se agregan nuevos barrios cada 10 segundos
    setInterval(() => {
        const localidadID = localidadSelect.value;
        if (localidadID) {
            verificarNuevosBarrios(localidadID);
        }
    }, 10000);  // 10 segundos de intervalo
    
    clienteForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = document.getElementById('nombreyapellido').value;
        const telefono = document.getElementById('telefono').value;
        const barrioID = barrioSelect.value; // Obtiene el ID del barrio seleccionado
        const direccion = document.getElementById('direccion').value;

        if (!nombre || !telefono || !barrioID || !direccion) {
            Swal.fire('Error', 'Por favor completa todos los campos requeridos.', 'error');
            return;
        }

        try {
            const clienteResponse = await fetch('http://localhost:3000/cliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre,
                    telefono: telefono,
                    IDbarrio: barrioID, // Envía el ID del barrio seleccionado
                    direccion: direccion // Envía la dirección
                })
            });
        
            const clienteData = await clienteResponse.json(); // Siempre intenta obtener JSON
            if (!clienteResponse.ok) {
                throw new Error(clienteData.message || 'Error al agregar el cliente.');
            }
        
            Swal.fire('Éxito', 'Cliente agregado correctamente.', 'success').then(() => {
                window.location.href = 'clientes.html'; // Redirige a clientes.html
            });
        } catch (error) {
            console.error('Error al guardar el cliente:', error);
            Swal.fire('Error', error.message || 'Error inesperado al guardar el cliente.', 'error');
        }        
    });
});
                                                                      

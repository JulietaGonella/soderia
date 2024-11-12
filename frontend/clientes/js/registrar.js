// Ejecutar el código cuando el contenido del documento esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {   

    // Obtener elementos HTML
    const localidadSelect = document.getElementById('localidad'); // Select para localidades
    const barrioSelect = document.getElementById('barrio');       // Select para barrios
    const clienteForm = document.getElementById('clienteForm');   // Formulario de cliente
    const barrioHelp = document.getElementById('barrioHelp');     // Mensaje de ayuda para barrios

    // Variable para almacenar los barrios actuales
    let barriosActuales = [];

    // Función para cargar las localidades desde el servidor
    async function cargarLocalidades() {
        try {
            const response = await fetch('http://localhost:3000/localidades'); // Petición para obtener localidades
            const localidades = await response.json(); // Convertir la respuesta a JSON

            // Agregar cada localidad como opción en el select
            localidades.forEach(localidad => {
                const option = document.createElement('option');
                option.value = localidad.ID;
                option.textContent = localidad.localidad;
                localidadSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar localidades:', error); // Mensaje en caso de error
        }
    }

    // Función para cargar barrios según la localidad seleccionada
    async function cargarBarriosPorLocalidad(localidadID) {
        try {
            const response = await fetch(`http://localhost:3000/barrios?IDlocalidad=${localidadID}`);
            const barrios = await response.json();

            barrioSelect.innerHTML = ''; // Limpiar las opciones actuales en el select de barrios
            barrioHelp.textContent = ''; // Limpiar el mensaje de ayuda

            if (barrios.length > 0) { // Si hay barrios disponibles
                barriosActuales = barrios.map(b => b.ID); // Guardar los IDs actuales de los barrios
                barrios.forEach(barrio => {
                    const option = document.createElement('option');
                    option.value = barrio.ID;
                    option.textContent = barrio.barrio;
                    barrioSelect.appendChild(option);
                });
                barrioSelect.disabled = false; // Habilitar el select
            } else { // Si no hay barrios disponibles
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay barrios disponibles';
                barrioSelect.appendChild(option);
                barrioSelect.disabled = true; // Deshabilitar el select
            }
        } catch (error) {
            console.error('Error al cargar barrios:', error); // Mensaje en caso de error
        }
    }

    // Función para verificar si se agregan nuevos barrios a la localidad seleccionada
    async function verificarNuevosBarrios(localidadID) {
        try {
            const response = await fetch(`http://localhost:3000/barrios?IDlocalidad=${localidadID}`);
            const barrios = await response.json();
            const nuevosBarrios = barrios.filter(b => !barriosActuales.includes(b.ID)); // Filtrar barrios nuevos

            if (nuevosBarrios.length > 0) { // Si hay barrios nuevos detectados
                console.log('Nuevos barrios detectados:', nuevosBarrios);
                cargarBarriosPorLocalidad(localidadID); // Recargar el select de barrios
            }
        } catch (error) {
            console.error('Error al verificar nuevos barrios:', error); // Mensaje en caso de error
        }
    }

    // Llamar a la función para cargar localidades al inicio
    cargarLocalidades();

    // Evento que carga barrios cuando cambia la localidad seleccionada
    localidadSelect.addEventListener('change', function () {
        const localidadID = this.value;
        if (localidadID) {
            cargarBarriosPorLocalidad(localidadID); // Cargar barrios para la localidad seleccionada
        } else {
            barrioSelect.innerHTML = ''; // Limpiar barrios
            barrioSelect.disabled = true; // Deshabilitar el select
        }
    });

    // Intervalo para verificar periódicamente si se agregan nuevos barrios cada 10 segundos
    setInterval(() => {
        const localidadID = localidadSelect.value;
        if (localidadID) {
            verificarNuevosBarrios(localidadID);
        }
    }, 10000); // Intervalo de 10 segundos
    
    // Evento para manejar el envío del formulario de cliente
    clienteForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar el envío por defecto

        // Obtener valores de los campos de entrada
        const nombre = document.getElementById('nombreyapellido').value;
        const telefono = document.getElementById('telefono').value;
        const barrioID = barrioSelect.value;
        const direccion = document.getElementById('direccion').value;

        // Verificar que todos los campos requeridos estén completos
        if (!nombre || !telefono || !barrioID || !direccion) {
            Swal.fire('Error', 'Por favor completa todos los campos requeridos.', 'error');
            return;
        }

        try {
            // Enviar los datos del cliente al servidor mediante POST
            const clienteResponse = await fetch('http://localhost:3000/cliente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre,
                    telefono: telefono,
                    IDbarrio: barrioID,
                    direccion: direccion
                })
            });

            const clienteData = await clienteResponse.json(); // Obtener respuesta como JSON
            if (!clienteResponse.ok) { // Verificar si hubo un error
                throw new Error(clienteData.message || 'Error al agregar el cliente.');
            }

            // Mensaje de éxito y redirección a la página de clientes
            Swal.fire('Éxito', 'Cliente agregado correctamente.', 'success').then(() => {
                window.location.href = 'clientes.html'; // Redirigir a clientes.html
            });
        } catch (error) {
            console.error('Error al guardar el cliente:', error); // Mensaje en caso de error
            Swal.fire('Error', error.message || 'Error inesperado al guardar el cliente.', 'error');
        }
    });
});

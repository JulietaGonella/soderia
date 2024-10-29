document.addEventListener('DOMContentLoaded', () => {
    const localidadSelect = document.getElementById('localidad');
    const barrioForm = document.getElementById('barrioForm');

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

    // Cargar localidades al inicio
    cargarLocalidades();

    // Manejar el envío del formulario
    barrioForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombreBarrio = document.getElementById('nombrebarrio').value;
        const idLocalidad = localidadSelect.value;

        if (!nombreBarrio || !idLocalidad) {
            Swal.fire('Error', 'Por favor, complete todos los campos', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/barrios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: nombreBarrio, idLocalidad })
            });

            if (response.ok) {
                Swal.fire('Éxito', 'Barrio agregado con éxito', 'success').then(() => {
                    window.location.href = 'lugares.html'; // Redirigir a lugares.html
                });
            } else {
                Swal.fire('Error', 'No se pudo agregar el barrio', 'error');
            }
        } catch (error) {
            console.error('Error al agregar barrio:', error);
            Swal.fire('Error', 'Error en el servidor', 'error');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const provinciaSelect = document.getElementById('provincia');
    const localidadForm = document.getElementById('localidadForm');

    // Función para cargar provincias
    async function cargarProvincias() {
        try {
            const response = await fetch('http://localhost:3000/provincias');
            const provincias = await response.json();

            provincias.forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia.ID;
                option.textContent = provincia.nombre;
                provinciaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar provincias:', error);
        }
    }

    // Cargar provincias al inicio
    cargarProvincias();

    // Manejar el envío del formulario
    localidadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombreLocalidad = document.getElementById('nombrelocalidad').value;
        const idProvincia = provinciaSelect.value;

        if (!nombreLocalidad || !idProvincia) {
            Swal.fire('Error', 'Por favor, complete todos los campos', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/localidades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: nombreLocalidad, idProvincia })
            });

            if (response.ok) {
                Swal.fire('Éxito', 'Localidad agregada con éxito', 'success').then(() => {
                    window.location.href = 'lugares.html'; // Redirigir a lugares.html
                });
            } else {
                Swal.fire('Error', 'No se pudo agregar la localidad', 'error');
            }
        } catch (error) {
            console.error('Error al agregar localidad:', error);
            Swal.fire('Error', 'Error en el servidor', 'error');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitButton').addEventListener('click', async () => {
        const nombreProvincia = document.getElementById('nombreprovincia').value;

        if (!nombreProvincia) {
            Swal.fire('Error', 'El nombre de la provincia es obligatorio.', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/provincias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: nombreProvincia })
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire('Éxito', 'Provincia agregada correctamente.', 'success').then(() => {
                    window.location.href = 'lugares.html'; // Redirige a lugares.html
                });
                document.getElementById('nombreprovincia').value = ''; // Limpiar el campo
            } else {
                Swal.fire('Error', 'No se pudo agregar la provincia.', 'error');
            }
        } catch (error) {
            console.error('Error al agregar provincia:', error);
            Swal.fire('Error', 'Error en la comunicación con el servidor.', 'error');
        }
    });
});

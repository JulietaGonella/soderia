document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitButton').addEventListener('click', async () => {
        const nombreCategoria = document.getElementById('nombrecategoria').value;

        if (!nombreCategoria) {
            Swal.fire('Error', 'El nombre de la categoría es obligatorio.', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/categorias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre: nombreCategoria }),
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire('Éxito', 'Categoria agregada correctamente.', 'success').then(() => {
                    window.location.href = 'categorias.html'; // Redirige a lugares.html
                });
                document.getElementById('nombrecategoria').value = ''; // Limpiar el campo
            } else {
                Swal.fire('Error', 'No se pudo agregar la categoria.', 'error');
            }
        } catch (error) {
            console.error('Error al agregar categoría:', error);
            Swal.fire('Error', 'Error en la comunicación con el servidor.', 'error');
        }
    });
});

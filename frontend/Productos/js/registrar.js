document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nuevoProductoForm');

    // Llamada para obtener las categorías
    fetch('http://localhost:3000/categorias')
        .then(response => response.json())
        .then(categorias => {
            const categoriaSelect = document.getElementById('productoCategoria');

            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.ID;
                option.textContent = categoria.nombre;
                categoriaSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar las categorías:', error);
            Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
        });

    // Manejar el envío del formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar el comportamiento predeterminado del formulario

        const nombre = document.getElementById('productoNombre').value;
        const idCategoria = document.getElementById('productoCategoria').value;
        const precio = document.getElementById('productoPrecio').value;
        const stock = document.getElementById('productoStock').value;

        // Verificar si todos los campos son válidos
        if (!nombre || !idCategoria || !precio || !stock) {
            Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, idCategoria, precio, stock }),
            });

            if (response.ok) {
                Swal.fire('Éxito', 'Producto agregado correctamente.', 'success').then(() => {
                    window.location.href = 'productos.html'; // Redirige a productos.html
                });
                // Limpiar campos del formulario
                form.reset();
            } else {
                Swal.fire('Error', 'No se pudo agregar el producto.', 'error');
            }
        } catch (error) {
            console.error('Error al agregar producto:', error);
            Swal.fire('Error', 'Error en la comunicación con el servidor.', 'error');
        }
    });
});

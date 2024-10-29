$(document).ready(function () {
    // Llama a la API para obtener productos no eliminados
    $.get('http://localhost:3000/productos', function (data) {
        let tableBody = $('#tabla-productos tbody');
        tableBody.empty(); // Limpia el contenido de la tabla

        // Agrega productos a la tabla
        data.forEach(function (producto) {
            tableBody.append(`
                <tr>
                    <th scope="row">${producto.ID}</th>
                    <td>${producto.producto}</td>
                    <td>${producto.categoria}</td>
                    <td>${producto.precio}</td>
                    <td>${producto.stock}</td>
                    <td class="text-center">
                        <a href="editar.html?id=${producto.ID}" class="btn btn-sm me-2 modificar">Modificar</a>
                        <button type="button" class="btn btn-danger btn-sm" data-id="${producto.ID}" onclick="eliminarProducto(${producto.ID})">Eliminar</button>
                    </td>
                </tr>
            `);
        });

        // Configuración de DataTables después de cargar los datos
        $("#tabla-productos").DataTable({
            "pageLength": 5,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            }
        });
    }).fail(function () {
        console.error('Error al cargar los datos de los productos');
    });
});

// Función para eliminar un producto
function eliminarProducto(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Este producto será marcada como eliminada, pero podrás recuperarla más tarde.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Llama al endpoint de eliminación
            $.ajax({
                url: `http://localhost:3000/productos/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: true }), // Cambiando el estado a eliminado
                contentType: 'application/json',
                success: function () {
                    Swal.fire('Eliminado!', 'El producto ha sido marcado como eliminado.', 'success')
                        .then(() => {
                            location.reload(); // Recargar la página o volver a cargar los datos
                        });
                },
                error: function () {
                    Swal.fire('Error!', 'No se pudo eliminar el producto.', 'error');
                }
            });
        }
    });
}

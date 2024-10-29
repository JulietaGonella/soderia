$(document).ready(function () { 
    // Cargar los productos eliminados
    $.get('http://localhost:3000/productos?eliminado=true', function (data) {
        let tableBody = $('#tablaproductobody');
        tableBody.empty(); // Limpia el contenido de la tabla

        // Verifica si hay datos y crea las filas de la tabla
        if (data.length > 0) {
            data.forEach(function (producto) {
                tableBody.append(
                    `<tr>
                        <th scope="row">${producto.ID}</th>
                        <td>${producto.producto}</td>
                        <td>${producto.categoria}</td>
                        <td>${producto.precio}</td>
                        <td>${producto.stock}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm" data-id="${producto.ID}" onclick="restaurarProducto(this)">Restaurar</button>
                        </td>
                    </tr>`
                );
            });
        }

        // Inicializa DataTables después de llenar la tabla
        $('#tabla-productos-eliminados').DataTable({
            "pageLength": 5,
            lengthMenu: [
                [5, 10, 25, 50],
                [5, 10, 25, 50]
            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            }
        });
    }).fail(function () {
        console.error('Error al cargar los datos de los productos eliminados');
    });
});

// Función para restaurar un producto eliminado
function restaurarProducto(button) {
    const productoId = $(button).data('id');

    // Usar SweetAlert para confirmar la restauración
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Este producto será restaurado y ya no estará eliminado.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar la solicitud AJAX para restaurar el producto
            $.ajax({
                url: `http://localhost:3000/productos/${productoId}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: false }), // Cambiando el estado a no eliminado
                contentType: 'application/json',
                success: function () {
                    // Mostrar mensaje de éxito y recargar la tabla
                    Swal.fire(
                        'Restaurado!',
                        'El producto ha sido restaurado.',
                        'success'
                    ).then(() => {
                        location.reload(); // Recargar la página o volver a cargar los datos
                    });
                },
                error: function (xhr) {
                    Swal.fire(
                        'Error!',
                        'Error al restaurar el producto: ' + xhr.responseText,
                        'error'
                    );
                }
            });
        }
    });
}

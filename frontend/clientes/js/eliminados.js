$(document).ready(function () {
    // Cargar los clientes eliminados
    $.get('http://localhost:3000/cliente?eliminado=true', function (data) {
        let tableBody = $('#table_id_eliminados'); // Cambia esto al ID correcto de tu tabla
        tableBody.empty(); // Limpia el contenido de la tabla

        // Verifica si hay datos y crea las filas de la tabla
        if (data.length > 0) {
            data.forEach(function (cliente) {
                tableBody.append(
                    `<tr>
                        <th scope="row">${cliente.ID}</th>
                        <td>${cliente.nombre}</td>
                        <td>${cliente.telefono}</td>
                        <td>${cliente.localidad}</td>
                        <td>${cliente.barrio}</td>
                        <td>${cliente.direccion}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm" data-id="${cliente.ID}" onclick="restaurarCliente(this)">Restaurar</button>
                        </td>
                    </tr>`
                );
            });
        }
        // Inicializa DataTables después de llenar la tabla, incluso si está vacía
        $('#table_eliminados').DataTable({
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
        console.error('Error al cargar los datos de los clientes eliminados');
    });
});

// Función para restaurar un cliente eliminado
function restaurarCliente(button) {
    const clienteId = $(button).data('id');

    // Usar SweetAlert para confirmar la restauración
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Este cliente será restaurado y ya no estará eliminado.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar la solicitud AJAX para restaurar el cliente
            $.ajax({
                url: `http://localhost:3000/cliente/${clienteId}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: false }), // Cambiando el estado a no eliminado
                contentType: 'application/json',
                success: function () {
                    // Mostrar mensaje de éxito y recargar la tabla
                    Swal.fire(
                        'Restaurado!',
                        'El cliente ha sido restaurado.',
                        'success'
                    ).then(() => {
                        location.reload(); // Recargar la página o volver a cargar los datos
                    });
                },
                error: function (xhr) {
                    Swal.fire(
                        'Error!',
                        'Error al restaurar el cliente: ' + xhr.responseText,
                        'error'
                    );
                }
            });
        }
    });
}


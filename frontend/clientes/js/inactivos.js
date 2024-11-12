$(document).ready(function () { 
    // Al cargar el documento, se cargan los clientes eliminados desde la API.
    $.get('http://localhost:3000/cliente?eliminado=true', function (data) {
        let tableBody = $('#table_id_eliminados'); // Selección del cuerpo de la tabla donde se mostrarán los datos
        tableBody.empty(); // Limpiar el contenido actual de la tabla

        // Verifica si hay clientes eliminados en los datos recibidos
        if (data.length > 0) {
            data.forEach(function (cliente) {
                // Agrega una fila a la tabla con los datos de cada cliente eliminado
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

        // Inicialización del plugin DataTables para mejorar la tabla (paginación, búsqueda, etc.)
        $('#table_eliminados').DataTable({
            "pageLength": 5, // Número de filas por página
            lengthMenu: [
                [5, 10, 25, 50],
                [5, 10, 25, 50]
            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json" // Traducción al español
            },
            // Configuración para permitir la búsqueda solo en la columna de "Cliente"
            "columnDefs": [
                {
                    "targets": 1, // Índice de la columna de "Cliente"
                    "searchable": true // Habilita la búsqueda en esta columna
                },
                {
                    "targets": "_all", // Deshabilita la búsqueda en las demás columnas
                    "searchable": false
                }
            ]
        });

    }).fail(function () {
        // Manejo de errores si no se pueden cargar los datos de clientes eliminados
        console.error('Error al cargar los datos de los clientes eliminados');
    });
});

// Función para restaurar un cliente eliminado
function restaurarCliente(button) {
    const clienteId = $(button).data('id'); // Obtiene el ID del cliente a restaurar

    // Usar SweetAlert para confirmar la restauración
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Este cliente será restaurado y ya no estará desactivado.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, activar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        // Si el usuario confirma la restauración
        if (result.isConfirmed) {
            // Realizar solicitud AJAX para actualizar el estado de eliminación del cliente
            $.ajax({
                url: `http://localhost:3000/cliente/${clienteId}`, // Endpoint para el cliente específico
                type: 'PUT',
                data: JSON.stringify({ eliminado: false }), // Cambiar estado de 'eliminado' a falso
                contentType: 'application/json',
                success: function () {
                    // Mostrar mensaje de éxito y recargar la tabla de clientes eliminados
                    Swal.fire(
                        'Restaurado!',
                        'El cliente ha sido activado.',
                        'success'
                    ).then(() => {
                        location.reload(); // Recargar la página o actualizar la tabla
                    });
                },
                error: function (xhr) {
                    // Manejo de error al restaurar el cliente
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


$(document).ready(function () {
    // Llama a la API para obtener clientes no eliminados por defecto
    $.get('http://localhost:3000/cliente', function (data) {
        let tableBody = $('#tablaclientesbody');
        tableBody.empty(); // Limpia el contenido de la tabla

        // Verifica si hay datos y agrega clientes a la tabla
        if (data.length > 0) {
            data.forEach(function (cliente) {
                tableBody.append(`
                    <tr>
                        <td>${cliente.ID}</td>          <!-- Nueva columna para el ID -->
                        <td>${cliente.nombre}</td>       <!-- Nombre -->
                        <td>${cliente.telefono}</td>     <!-- Teléfono -->
                        <td>${cliente.localidad}</td>    <!-- Localidad -->
                        <td>${cliente.barrio}</td>       <!-- Barrio -->
                        <td>${cliente.direccion}</td>    <!-- Dirección -->
                        <td class="text-center">
                            <a href="editar.html?id=${cliente.ID}" class="btn btn-sm me-2 modificar">Modificar</a>
                            <button type="button" class="btn btn-danger btn-sm" data-id="${cliente.ID}" onclick="eliminarCliente(${cliente.ID})">Eliminar</button>
                        </td>
                    </tr>
                `);
            });
        }

        // Inicializa DataTables
        $("#table_id").DataTable({
            "pageLength": 5,
            lengthMenu: [
                [5, 10, 25, 50],
                [5, 10, 25, 50]
            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            },
            // Configuración para hacer que el buscador solo busque en la columna del nombre del cliente
            "columnDefs": [
                {
                    "targets": 1, // El índice de la columna de "Cliente" (asumiendo que es la segunda columna)
                    "searchable": true // Habilita la búsqueda solo en esta columna
                },
                {
                    "targets": "_all", // Deshabilita la búsqueda en todas las demás columnas
                    "searchable": false
                }
            ]
        });
    }).fail(function () {
        console.error('Error al cargar los datos de los clientes');
    });
});

// Función para eliminar un cliente
function eliminarCliente(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Este cliente será marcado como eliminado, pero podrás recuperarlo más tarde.',
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
                url: `http://localhost:3000/cliente/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: true }), // Cambiando el estado a eliminado
                contentType: 'application/json',
                success: function () {
                    Swal.fire('Eliminado!', 'El cliente ha sido marcado como eliminado.', 'success')
                        .then(() => {
                            location.reload(); // Recargar la página o volver a cargar los datos
                        });
                },
                error: function () {
                    Swal.fire('Error!', 'No se pudo eliminar el cliente.', 'error');
                }
            });
        }
    });
}


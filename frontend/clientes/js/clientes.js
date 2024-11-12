// Ejecuta la función cuando el documento está listo.
$(document).ready(function () { 
    // Llama a la API para obtener clientes que no están eliminados por defecto.
    $.get('http://localhost:3000/cliente', function (data) {
        // Selecciona el cuerpo de la tabla donde se mostrarán los clientes.
        let tableBody = $('#tablaclientesbody');
        tableBody.empty(); // Limpia el contenido de la tabla antes de agregar nuevos datos.

        // Verifica si hay datos y agrega cada cliente a la tabla.
        if (data.length > 0) {
            data.forEach(function (cliente) {
                tableBody.append(`
                    <tr>
                        <td>${cliente.ID}</td>          <!-- Columna para el ID del cliente -->
                        <td>${cliente.nombre}</td>       <!-- Columna para el nombre -->
                        <td>${cliente.telefono}</td>     <!-- Columna para el teléfono -->
                        <td>${cliente.localidad}</td>    <!-- Columna para la localidad -->
                        <td>${cliente.barrio}</td>       <!-- Columna para el barrio -->
                        <td>${cliente.direccion}</td>    <!-- Columna para la dirección -->
                        <td class="text-center">
                            <!-- Enlace para modificar el cliente -->
                            <a href="editar.html?id=${cliente.ID}" class="btn btn-sm me-2 modificar">Modificar</a>
                            <!-- Botón para desactivar el cliente -->
                            <button type="button" class="btn btn-danger btn-sm" data-id="${cliente.ID}" onclick="eliminarCliente(${cliente.ID})">Desactivar</button>
                        </td>
                    </tr>
                `);
            });
        }

        // Inicializa el plugin DataTables para paginar, buscar y ordenar.
        $("#table_id").DataTable({
            "pageLength": 5, // Número de filas que se mostrarán por página.
            lengthMenu: [
                [5, 10, 25, 50], // Opciones de número de filas por página.
                [5, 10, 25, 50] 
            ],
            "language": {
                // Configuración para mostrar el DataTable en español.
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            },
            // Configuración para hacer que el buscador solo busque en la columna del nombre del cliente.
            "columnDefs": [
                {
                    "targets": 1, // Índice de la columna de "Cliente" (suponiendo que es la segunda columna).
                    "searchable": true // Habilita la búsqueda solo en esta columna.
                },
                {
                    "targets": "_all", // Deshabilita la búsqueda en todas las demás columnas.
                    "searchable": false
                }
            ]
        });
    }).fail(function () {
        // Maneja errores al cargar los datos de los clientes.
        console.error('Error al cargar los datos de los clientes');
    });
});

// Función para eliminar (desactivar) un cliente.
function eliminarCliente(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Este cliente será marcado como desactivado, pero podrás activarlo más tarde.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Llama al endpoint de eliminación para cambiar el estado del cliente.
            $.ajax({
                url: `http://localhost:3000/cliente/${id}`,
                type: 'PUT', // Define la solicitud como tipo PUT para actualizar.
                data: JSON.stringify({ eliminado: true }), // Marca el cliente como eliminado.
                contentType: 'application/json', // Especifica el tipo de contenido como JSON.
                success: function () {
                    Swal.fire('Eliminado!', 'El cliente ha sido marcado como eliminado.', 'success')
                        .then(() => {
                            location.reload(); // Recarga la página para actualizar los datos.
                        });
                },
                error: function () {
                    // Maneja errores en caso de falla al desactivar el cliente.
                    Swal.fire('Error!', 'No se pudo eliminar el cliente.', 'error');
                }
            });
        }
    });
}

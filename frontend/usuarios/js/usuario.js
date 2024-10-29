$(document).ready(function () {
    // Llama a la API para obtener usuarios, incluyendo los eliminados
    $.get('http://localhost:3000/usuarios', function (data) {
        let tableBody = $('#tablabodyusuarios');
        tableBody.empty(); // Limpia el contenido de la tabla

        // Agrega usuarios a la tabla si hay datos
        data.forEach(function (usuario) {
            tableBody.append(`
                <tr>
                    <td>${usuario.ID}</td>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.email}</td>
                    <td>
                        <span class="contraseña-text" style="display:none;">${usuario.contraseña}</span>
                        <span class="contraseña-puntos">••••••••</span>
                        <button type="button" class="btn btn-sm" onclick="togglePassword(this)">👁</button>
                    </td> <!-- Columna de contraseña con botón -->
                    <td>${usuario.rol}</td>
                    <td class="text-center">
                        <a href="editar.html?id=${usuario.ID}" class="btn btn-sm me-2 modificar">Modificar</a>
                        <button type="button" class="btn btn-danger btn-sm" data-id="${usuario.ID}" onclick="eliminarUsuario(${usuario.ID})">Eliminar</button>
                    </td>
                </tr>
            `);
        });

        // Inicializa DataTables después de llenar la tabla
        if ($.fn.DataTable.isDataTable('#table_id')) {
            $('#table_id').DataTable().destroy(); // Destruye la instancia anterior
        }
        
        $('#table_id').DataTable({
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
        console.error('Error al cargar los datos de los usuarios');
    });
});

// Función para eliminar un usuario
function eliminarUsuario(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Este usuario será marcado como eliminado, pero podrás recuperarla más tarde.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:3000/usuarios/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: true }), // Cambiando el estado a eliminado
                contentType: 'application/json',
                success: function () {
                    Swal.fire('Eliminado!', 'El usuario ha sido marcado como eliminado.', 'success')
                        .then(() => {
                            location.reload(); // Recargar la página para reflejar los cambios
                        });
                },
                error: function () {
                    Swal.fire('Error!', 'Ocurrió un error al eliminar el usuario.', 'error');
                }
            });
        }
    });
}

// Función para alternar la visibilidad de la contraseña
function togglePassword(button) {
    let td = $(button).closest('td'); // Obtiene el <td> más cercano
    let contraseñaText = td.find('.contraseña-text');
    let contraseñaPuntos = td.find('.contraseña-puntos');
    let isVisible = contraseñaText.is(':visible');

    if (isVisible) {
        contraseñaText.hide();
        contraseñaPuntos.show();
        $(button).text('👁');
    } else {
        contraseñaText.show();
        contraseñaPuntos.hide();
        $(button).text('👁');
    }
}

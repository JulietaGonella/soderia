$(document).ready(function () {
    // Cargar los usuarios eliminados
    $.get('http://localhost:3000/usuarios?eliminado=true', function (data) {
        let tableBody = $('#tablabodyusuarios');
        tableBody.empty(); // Limpia el contenido de la tabla

        // Verifica si hay datos y crea las filas de la tabla
        if (data.length > 0) {
            data.forEach(function (usuario) {
                tableBody.append(
                    `<tr>
                        <th scope="row">${usuario.ID}</th>
                        <td>${usuario.nombre}</td>
                        <td>${usuario.email}</td>
                        <td>
                            <span class="contraseña-text" style="display:none;">${usuario.contraseña}</span>
                            <span class="contraseña-puntos">••••••••</span>
                            <button type="button" class="btn btn btn-sm" onclick="togglePassword(this)">👁</button>
                        </td>
                        <td>${usuario.rol}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm" data-id="${usuario.ID}" onclick="restaurarUsuario(this)">Restaurar</button>
                        </td>
                    </tr>`
                );
            });
        }

        // Inicializa DataTables después de llenar la tabla, incluso si está vacía
        $('#tabla-usuarios-eliminados').DataTable({
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
        console.error('Error al cargar los datos de los usuarios eliminados');
    });
});

// Función para restaurar un usuario eliminado
function restaurarUsuario(button) {
    const usuarioId = $(button).data('id');

    // Usar SweetAlert para confirmar la restauración
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Este usuario será restaurado y ya no estará eliminado.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar la solicitud AJAX para restaurar el usuario
            $.ajax({
                url: `http://localhost:3000/usuarios/${usuarioId}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: false }), // Cambiando el estado a no eliminado
                contentType: 'application/json',
                success: function () {
                    // Mostrar mensaje de éxito y recargar la tabla
                    Swal.fire(
                        'Restaurado!',
                        'El usuario ha sido restaurado.',
                        'success'
                    ).then(() => {
                        location.reload(); // Recargar la página o volver a cargar los datos
                    });
                },
                error: function (xhr) {
                    Swal.fire(
                        'Error!',
                        'Error al restaurar el usuario: ' + xhr.responseText,
                        'error'
                    );
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

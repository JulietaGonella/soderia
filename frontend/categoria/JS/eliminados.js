$(document).ready(function () {
    // Cargar las categorías eliminadas
    $.get('http://localhost:3000/categorias?eliminado=true', function (data) {
        let tableBody = $('#tablecategoriabody');
        tableBody.empty(); // Limpia el contenido de la tabla

        // Verifica si hay datos y crea las filas de la tabla
        if (data.length > 0) {
            data.forEach(function (categoria) {
                tableBody.append(
                    `<tr>
                        <td>${categoria.ID}</td>
                        <td>${categoria.nombre}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm" data-id="${categoria.ID}" onclick="restaurarCategoria(this)">Restaurar</button>
                        </td>
                    </tr>`
                );
            });
        }

        // Inicializa DataTables después de llenar la tabla
        $('#tablecategoriaseliminadas').DataTable({
            "pageLength": 5,
            lengthMenu: [
                [5, 10, 25, 50],
                [5, 10, 25, 50]
            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            }
        });
    });
});

// Función para restaurar categoría
function restaurarCategoria(button) {
    const id = $(button).data('id');

    // Usar SweetAlert para confirmar la restauración
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta categoría será restaurada y ya no estará eliminada.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar la solicitud AJAX para restaurar la categoría
            $.ajax({
                url: `http://localhost:3000/categorias/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: false }), // Cambiando el estado a no eliminado
                contentType: 'application/json',
                success: function (response) {
                    // Mostrar mensaje de éxito y recargar la tabla
                    Swal.fire(
                        'Restaurado!',
                        'La categoría ha sido restaurada.',
                        'success'
                    ).then(() => {
                        location.reload(); // Recargar la página o volver a cargar los datos
                    });
                },
                error: function (xhr) {
                    Swal.fire(
                        'Error!',
                        'Error al restaurar la categoría: ' + xhr.responseText,
                        'error'
                    );
                }
            });
        }
    });
}




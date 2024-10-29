$(document).ready(function () {
    $.get('http://localhost:3000/categorias', function (data) {
        let tableBody = $('#tablebodycategoria');
        tableBody.empty();
        data.forEach(function (categoria) {
            tableBody.append(`
                <tr>
                    <th scope="row">${categoria.ID}</th>
                    <td>${categoria.nombre}</td>
                    <td class="text-center">
                        <a href="editarcategoria.html?id=${categoria.ID}" class="btn btn-sm me-2 modificar">Modificar</a>
                        <button type="button" class="btn btn-danger btn-sm" data-id="${categoria.ID}" onclick="eliminarCategoria(${categoria.ID})">Eliminar</button>
                    </td>
                </tr>
            `);
        });

        $("#table_id").DataTable({
            "pageLength": 5,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            }
        });
    }).fail(function () {
        console.error('Error al cargar los datos de las categorías');
    });
});

function eliminarCategoria(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta categoría será marcada como eliminada, pero podrás recuperarla más tarde.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar la solicitud AJAX para marcar la categoría como eliminada
            $.ajax({
                url: `http://localhost:3000/categorias/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: true }), // Cambiando el estado a eliminado
                contentType: 'application/json',
                success: function () {
                    Swal.fire('Eliminado!', 'La categoría ha sido marcada como eliminada.', 'success')
                        .then(() => {
                            location.reload(); // Recargar la página o volver a cargar los datos
                        });
                },
                error: function () {
                    Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
                }
            });
        }
    });
}


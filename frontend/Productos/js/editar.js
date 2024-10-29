$(document).ready(function () {  
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = urlParams.get('id');

    let originalNombre;
    let originalIdCategoria; // Variable para almacenar el ID de la categoría original

    // Cargar categorías en el dropdown
    $.get('http://localhost:3000/categorias', function (categorias) {
        categorias.forEach(categoria => {
            $('#productoCategoria').append(new Option(categoria.nombre, categoria.ID));
        });

        // Cargar producto si se proporciona el ID
        if (idProducto) {
            $.get(`http://localhost:3000/productos/${idProducto}`, function (producto) {
                console.log("Datos del producto recibidos:", producto);

                originalNombre = producto.nombre;
                originalIdCategoria = producto.IDcategoria; // Almacena el ID de la categoría original

                $('#idproducto').val(producto.ID);
                $('#productoNombre').val(originalNombre);
                $('#productoPrecio').val(producto.precio);
                $('#productoStock').val(producto.stock);
                $('#productoCategoria').val(originalIdCategoria); // Selecciona la categoría correcta
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.error("Error en la solicitud:", textStatus, errorThrown);
                Swal.fire('Error', 'No se pudo cargar el producto.', 'error');
            });
        } else {
            console.log("No se proporcionó un ID de producto en la URL.");
        }
    }).fail(function () {
        console.error('Error al cargar las categorías.');
        Swal.fire('Error', 'No se pudieron cargar las categorías.', 'error');
    });

    // Maneja el envío del formulario para actualizar el nombre del producto, precio, stock y categoría
    $('#editarProductoForm').submit(function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        const nombre = $('#productoNombre').val();
        const idCategoria = $('#productoCategoria').val(); // Obtiene el ID de la categoría seleccionada
        const precio = $('#productoPrecio').val();
        const stock = $('#productoStock').val();

        // Prepara los datos a actualizar
        let dataToUpdate = {};

        // Verifica si hay un cambio en el nombre, precio, stock o en la categoría
        if (nombre && nombre !== originalNombre) {
            dataToUpdate.nombre = nombre; // Solo actualiza el nombre
        }
        if (idCategoria && idCategoria !== originalIdCategoria) {
            dataToUpdate.idCategoria = idCategoria; // Actualiza el ID de la categoría
        }
        if (precio) {
            dataToUpdate.precio = precio; // Actualiza el precio
        }
        if (stock) {
            dataToUpdate.stock = stock; // Actualiza el stock
        }

        // Debug: Verifica los datos que se están enviando
        console.log("Datos a actualizar:", dataToUpdate);

        // Realiza la solicitud de actualización solo si hay cambios
        if (Object.keys(dataToUpdate).length > 0) {
            $.ajax({
                url: `http://localhost:3000/productos/${idProducto}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(dataToUpdate),
                success: function () {
                    // Mostrar alerta de éxito
                    Swal.fire('Éxito', 'Producto actualizado con éxito.', 'success').then(() => {
                        // Redirigir a productos.html
                        window.location.href = 'productos.html';
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Error al actualizar el producto:", textStatus, errorThrown);
                    Swal.fire('Error', 'No se pudo actualizar el producto.', 'error');
                }
            });
        } else {
            console.log("No se detectaron cambios en el nombre, precio, stock o en la categoría.");
            Swal.fire('Aviso', 'No se detectaron cambios en el nombre, precio, stock o en la categoría.', 'info');
        }
    });
});

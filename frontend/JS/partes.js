document.addEventListener("DOMContentLoaded", function () {
    // Cargar la barra de navegación
    fetch("../Cabezera/nabvar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-container").innerHTML = data;

            // Añadir evento de click al botón de cerrar sesión
            document.getElementById('logoutButton').addEventListener('click', async function () {
                try {
                    const response = await fetch('http://localhost:3000/logout', {
                        method: 'POST',
                        credentials: 'include' // Esto asegura que se envíen las cookies de sesión
                    });

                    if (response.ok) {
                        // Redirigir a la página de inicio de sesión
                        window.location.href = '../iniciosesion/Iniciosesion.html';
                    } else {
                        const data = await response.json();
                        alert('Error al cerrar sesión: ' + data.message);
                    }
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                }
            });

        })
        .catch(error => console.error('Error fetching navbar:', error));

    // Cargar el pie de página
    fetch("../pie/footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-container").innerHTML = data;
        })
        .catch(error => console.error('Error fetching footer:', error));
});

document.getElementById('logoutButton').addEventListener('click', async function () {
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = '../iniciosesion/Iniciosesion.html';  // Redirigir al inicio de sesión
      } else {
        alert('Error al cerrar sesión.');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error en el servidor.');
    }
});
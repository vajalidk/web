document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('carId');

    const carData = {
        1: { name: 'Accord 2024', price: 350000, image: 'src/accord24.png' },
        2: { name: 'Accord Híbrido', price: 580000, image: 'src/accord-hibrido.png' },
        3: { name: 'BR-V', price: 488900, image: 'src/brv.png' },
        4: { name: 'City', price: 592900, image: 'src/city.png' }
    };

    if (carId && carData[carId]) {
        document.getElementById('car-name').textContent = carData[carId].name;
        document.getElementById('car-price').textContent = `$${carData[carId].price.toLocaleString()}`;
        document.getElementById('car-image').src = carData[carId].image;
    } else {
        alert('Carro no encontrado');
        window.location.href = 'index.html';
    }
});

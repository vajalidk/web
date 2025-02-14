document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:5000/autos")  // Llamar a la API del servidor
        .then(response => response.json())
        .then(data => {
            console.log("Autos obtenidos:", data);

            const autosContainer = document.getElementById("autosContainer");
            autosContainer.innerHTML = "";

            if (data.length === 0) {
                autosContainer.innerHTML = "<p>No hay autos disponibles.</p>";
                return;
            }

            data.forEach(auto => {
                const autoCard = document.createElement("div");
                autoCard.classList.add("auto-card");

                autoCard.innerHTML = `
                    <h3>${auto.marca} ${auto.modelo} ${auto.anio}</h3>
                    <p>Color: ${auto.color}</p>
                    <p>Precio: $${auto.precio.toLocaleString()}</p>
                    <button onclick="cotizarCarro(${auto.id})">Cotizar</button>
                `;

                autosContainer.appendChild(autoCard);
            });
        })
        .catch(error => {
            console.error("❌ Error al obtener los autos:", error);
            alert("Error al cargar los autos.");
        });
});

function cotizarCarro(carId) {
    console.log(`Redirigiendo a compras con carId: ${carId}`);
    window.location.href = `compras.html?carId=${carId}`;
}

let slideIndex = 0;
const slides = document.querySelectorAll('.carousel-container .slide');
const indicators = document.querySelectorAll('.carousel-indicators span');

function showSlides() {
    if (slideIndex >= slides.length) {
        slideIndex = 0;
    } else if (slideIndex < 0) {
        slideIndex = slides.length - 1;
    }

    const offset = -slideIndex * 100;
    document.querySelector('.carousel-container').style.transform = `translateX(${offset}%)`;

    indicators.forEach((indicator, index) => {
        if (index === slideIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function moveSlide(step) {
    slideIndex += step;
    showSlides();
}

function currentSlide(n) {
    slideIndex = n;
    showSlides();
}

setInterval(() => {
    slideIndex++;
    showSlides();
}, 4000);

document.addEventListener('DOMContentLoaded', showSlides);

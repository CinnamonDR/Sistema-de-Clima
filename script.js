const API_KEY = '131f7892ef1142e7b8e221848261804'; 

const cityInput = document.getElementById('cityInput');
const suggestionsList = document.getElementById('suggestions');
const clearBtn = document.getElementById('clearBtn');
const weatherResult = document.getElementById('weatherResult');
const statusMessage = document.getElementById('statusMessage');

/**
 * 1. LÓGICA DE PREDICCIÓN (AUTOCOMPLETE)
 */
cityInput.addEventListener('input', async () => {
    const query = cityInput.value.trim();
    
    if (query.length < 3) {
        suggestionsList.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`);
        const cities = await response.json();

        if (cities.length > 0) {
            showSuggestions(cities);
        } else {
            suggestionsList.innerHTML = '';
        }
    } catch (err) {
        console.error("Error al predecir ciudades");
    }
});

// --- FUNCIÓN CORREGIDA ---
function showSuggestions(cities) {
    suggestionsList.innerHTML = '';
    cities.forEach(city => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        
        // Creamos una cadena única para que la API no se confunda
        // Ejemplo: "Madrid, Madrid, Spain"
        const fullLocation = `${city.name}, ${city.region}, ${city.country}`;
        
        li.textContent = fullLocation;

        li.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que otros eventos interfieran
            
            cityInput.value = city.name; // El usuario ve el nombre corto
            suggestionsList.innerHTML = ''; // Limpiamos la lista
            
            // Enviamos la localización completa a la búsqueda de clima
            getWeatherData(fullLocation); 
        });
        suggestionsList.appendChild(li);
    });
}

/**
 * 2. LÓGICA DE BÚSQUEDA Y CLIMA
 */

// Buscar al presionar Enter
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            suggestionsList.innerHTML = '';
            getWeatherData(city);
        }
    }
});

// Botón de cerrar/limpiar
clearBtn.addEventListener('click', () => {
    cityInput.value = '';
    suggestionsList.innerHTML = '';
    weatherResult.classList.add('d-none');
    statusMessage.classList.remove('d-none');
    statusMessage.innerHTML = `<p class="text-info opacity-50">Busca una ciudad para ver el clima...</p>`;
});

async function getWeatherData(city) {
    // La variable 'city' aquí ya trae el nombre, región y país si viene de un clic
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&lang=es`;

    try {
        statusMessage.innerHTML = `<div class="spinner-border text-info" role="status"></div>`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            showError("No se encontró la ciudad");
            return;
        }

        displayWeather(data);
    } catch (error) {
        showError("Error de conexión a internet");
    }
}

function displayWeather(data) {
    statusMessage.classList.add('d-none');
    weatherResult.classList.remove('d-none');

    // Datos principales
    document.getElementById('cityName').textContent = `${data.location.name}, ${data.location.country}`;
    document.getElementById('dateText').textContent = data.location.localtime;
    document.getElementById('tempMain').textContent = `${Math.round(data.current.temp_c)}°C`;
    document.getElementById('description').textContent = data.current.condition.text;
    
    // Icono grande
    const iconUrl = `https:${data.current.condition.icon.replace('64x64', '128x128')}`;
    document.getElementById('weatherIcon').innerHTML = `<img src="${iconUrl}" style="width:150px; filter: drop-shadow(0 0 15px #00d4ff)">`;

    // Tarjetas de datos
    document.getElementById('humidityText').textContent = `${data.current.humidity}%`;
    document.getElementById('windText').textContent = `${Math.round(data.current.wind_kph)} km/h`;
    document.getElementById('feelsLikeText').textContent = `${Math.round(data.current.feelslike_c)}°C`;
    document.getElementById('uvText').textContent = data.current.uv;
}

function showError(msg) {
    weatherResult.classList.add('d-none');
    statusMessage.classList.remove('d-none');
    statusMessage.innerHTML = `<p class="text-danger">⚠️ ${msg}</p>`;
}

// --- LOGICA DE CIERRE CORREGIDA ---
document.addEventListener('click', (e) => {
    // Si el clic NO fue dentro de la caja de búsqueda, cerramos las sugerencias
    const isClickInside = document.querySelector('.search-box').contains(e.target);
    
    if (!isClickInside) {
        suggestionsList.innerHTML = '';
    }
});

// Obtenemos el elemento canvas donde se dibujará el juego y su contexto 2D
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
document.getElementById('showCollisionBox').addEventListener('change', function() {
  showCollition = this.checked;  // Cambiamos la variable global según el checkbox
});

// Definimos la altura del suelo (línea base del juego)
let groundY = canvas.height - 50;

// Definimos el personaje del dinosaurio con propiedades iniciales
let dinosaur = {
    x: 5, // Posición horizontal inicial
    y: groundY, // Posición vertical sobre el suelo
    width: 60, // Ancho del dinosaurio
    height: 60, // Alto del dinosaurio
    velocityY: 0, // Velocidad vertical (para el salto)
    gravity: 0.8, // Fuerza de la gravedad
    jumpPower: -18, // Potencia del salto
    jumpCount: 0 // Contador de saltos
};

// Variables de estado y juego
let isJumping = false; // Si el dinosaurio está saltando
let obstacles = []; // Array de obstáculos
let coins = []; // Array de monedas normales
let superCoins = []; // Array de monedas super
let selectedPowerUp = ''; // Power-up seleccionado por el jugador
let score = 0; // Puntaje del jugador
let highscore = localStorage.getItem('highscore') || 0; // Puntaje más alto guardado
let gameOver = false; // Estado del juego (terminado o no)
let gameSpeed = 5; // Velocidad de movimiento de obstáculos y monedas
let lastSpeedIncrementScore = 0; // Última puntuación donde se incrementó la velocidad
let jumpkey = 'Space'; // Definir tecla salto
let showCollition = false; // Opcional, para debug


// Música de fondo
let backgroundMusic = document.getElementById('backgroundMusic');

// Cargar las imágenes del fondo y los obstáculos
let fondoImg = new Image();
fondoImg.src = 'exterior.jpg'; // Fondo del juego

let obstaculoImg = new Image();
obstaculoImg.src = 'obstaculo.png'; // Imagen del obstáculo
// Cargar imágenes para monedas
let coinImg = new Image();
coinImg.src = 'moneda.png'; // Imagen para la moneda normal

let superCoinImg = new Image();
superCoinImg.src = 'supermoneda.png'; // Imagen para la super moneda


// Cargar las imágenes de la animación del dinosaurio
let ninaFrames = [];
for (let i = 1; i <= 8; i++) {
    let img = new Image();
    img.src = `nina${i === 1 ? '' : i}.gif`;
    ninaFrames.push(img);
}

// Inicializar las variables para la animación de la nina (dinosaurio)
let currentFrame = 0;
let frameCounter = 0;
let frameSpeed = 5; // Cuántos frames esperar antes de cambiar la imagen

// Función para dibujar las monedas (normales o super)
function drawCoin(x, y, isSuperCoin = false) {
    if (isSuperCoin) {
        ctx.drawImage(superCoinImg, x - 25, y - 25, 90, 90); // Super moneda (más grande)
    } else {
        ctx.drawImage(coinImg, x - 15, y - 15, 70, 70); // Moneda normal
    }
}
// Función para iniciar el juego
function startGame() {
    gameOver = false; // Reseteamos el estado del juego
    score = 0; // Reseteamos el puntaje
    obstacles = []; // Limpiamos los obstáculos
    coins = []; // Limpiamos las monedas
    superCoins = []; // Limpiamos las monedas super
    gameSpeed = 5; // Restablecemos la velocidad
    lastSpeedIncrementScore = 0; // Restablecemos el puntaje para el incremento de velocidad
    dinosaur.y = groundY; // Colocamos al dinosaurio en el suelo
    dinosaur.velocityY = 0; // Restablecemos la velocidad vertical
    dinosaur.jumpCount = 0; // Restablecemos el contador de saltos
    isJumping = false; // El dinosaurio no está saltando
    backgroundMusic.currentTime = 0; // Restablecemos la música
    backgroundMusic.play(); // Reproducimos la música de fondo
    document.getElementById('menu').style.display = 'none'; // Ocultamos el menú
    document.getElementById('powerUpSelection').style.display = 'none'; // Ocultamos la selección de power-ups
    document.getElementById('gameOverScreen').style.display = 'none'; // Ocultamos la pantalla de game over
    gameLoop(); // Comenzamos el ciclo del juego
}

// Función principal que actualiza el estado del juego
function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiamos el canvas

        // Dibujamos el fondo del juego
        ctx.drawImage(fondoImg, 0, 0, canvas.width, canvas.height);

        // Aumentamos la velocidad del juego cada vez que el puntaje alcanza un múltiplo de 100
        if (score - lastSpeedIncrementScore >= 100) {
            gameSpeed += 0.5;
            lastSpeedIncrementScore = score;
        }

        // Actualizamos obstáculos, monedas y dinosaurio
        updateObstacles();
        updateCoins();
        updateSuperCoins();
        updateDinosaur();

        // Animación del dinosaurio
        frameCounter++;
        if (frameCounter >= frameSpeed) {
            currentFrame = (currentFrame + 1) % ninaFrames.length;
            frameCounter = 0;
        }

        ctx.drawImage(ninaFrames[currentFrame], dinosaur.x, dinosaur.y, dinosaur.width, dinosaur.height); // Dibujamos la imagen actual

        // Mostramos el puntaje y el puntaje más alto
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText("Puntaje: " + score, 10, 30);
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('highscore', highscore); // Guardamos el puntaje más alto
        }
        ctx.fillText("Puntaje más alto: " + highscore, 10, 60);

        // Llamamos a la siguiente iteración del ciclo de juego
        requestAnimationFrame(gameLoop);
    }
}
if (showCollition) {
  ctx.beginPath();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  // Suponiendo que la colisión es un círculo centrado en el dinosaurio
  let centerX = dinosaur.x + dinosaur.width / 2;
  let centerY = dinosaur.y + dinosaur.height / 2;
  let radius = Math.min(dinosaur.width, dinosaur.height) / 2 * 0.8; // 80% del tamaño menor
  
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
}

// Mostrar el círculo de colisión del personaje (solo si está activado)
if (showCollition) {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    let dinoCenterX = dinosaur.x + dinosaur.width / 2;
    let dinoCenterY = dinosaur.y + dinosaur.height / 2;
    ctx.arc(dinoCenterX, dinoCenterY, 5, 0, Math.PI * 2); // Círculo del radio
    ctx.stroke();
}

// Función que actualiza la posición y el estado del dinosaurio
function updateDinosaur() {
    dinosaur.velocityY += dinosaur.gravity; // Aplica la gravedad al dinosaurio
    dinosaur.y += dinosaur.velocityY; // Actualiza la posición vertical del dinosaurio

    // Si el dinosaurio llega al suelo, lo detenemos
    if (dinosaur.y >= groundY) {
        dinosaur.y = groundY;
        dinosaur.velocityY = 0;
        dinosaur.jumpCount = 0;
        isJumping = false;
    }
}

// Detectamos la pulsación de la tecla de salto (espacio)
// Evento keydown para salto solo con la tecla espacio
document.addEventListener('keydown', function(e) {
    if (e.code === jumpkey) {
        let maxJumps = selectedPowerUp === 'doublejump' ? 2 : 1;
        if (dinosaur.jumpCount < maxJumps) {
            dinosaur.velocityY = dinosaur.jumpPower;
            dinosaur.jumpCount++;
            isJumping = true;
        }
        e.preventDefault();
    }
});

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;

        ctx.drawImage(
            obstaculoImg,
            obstacles[i].x,
            obstacles[i].y,
            obstacles[i].width,
            obstacles[i].height
        );

        // ==== Colisión circular más justa ====
        let collisionRadius = 5; // Ajusta este valor si quieres más tolerancia
        let dinoCenterX = dinosaur.x + dinosaur.width / 2;
        let dinoCenterY = dinosaur.y + dinosaur.height / 2;

        let obs = obstacles[i];
        let obsCenterX = obs.x + obs.width / 2;
        let obsCenterY = obs.y + obs.height / 2;

        let dx = dinoCenterX - obsCenterX;
        let dy = dinoCenterY - obsCenterY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < collisionRadius + Math.min(obs.width, obs.height) / 2) {
            if (selectedPowerUp === 'shield') {
                obstacles.splice(i, 1); // Escudo absorbe el golpe
            } else {
                gameOver = true;
                backgroundMusic.pause();
                document.getElementById('gameOverScreen').style.display = 'block';
                document.getElementById('score').textContent = 'Puntaje: ' + score;
                return;
            }
        }

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }

    if (obstacles.length === 0 || canvas.width - obstacles[obstacles.length - 1].x > 240) {
        if (Math.random() < 0.009) {
            let obstacleHeight = 60;
            let obstacleY = groundY + (dinosaur.height - obstacleHeight);

            let minGap = 260;
            if (obstacles.length > 0) {
                let lastObstacle = obstacles[obstacles.length - 1];
                if (canvas.width - lastObstacle.x < minGap) {
                    return;
                }
            }

            obstacles.push({
                x: canvas.width,
                y: obstacleY,
                width: 60,
                height: obstacleHeight
            });
        }
    }
}


// Función que actualiza las monedas normales
function updateCoins() {
    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        coin.x -= gameSpeed; // Movemos la moneda hacia la izquierda

        // Dibujamos la moneda
        drawCoin(coin.x, coin.y);

        // Comprobamos si el dinosaurio recoge una moneda
        if (
            dinosaur.x + dinosaur.width > coin.x - 15 &&
            dinosaur.x < coin.x + 15 &&
            dinosaur.y + dinosaur.height > coin.y - 15 &&
            dinosaur.y < coin.y + 15
        ) {
            coins.splice(i, 1); // Elimina la moneda recogida
            score += 10; // Aumenta el puntaje
        }

        // Eliminamos las monedas que han salido del canvas
        if (coin.x + 15 < 0) {
            coins.splice(i, 1);
        }
    }

    // Generamos nuevas monedas
    if (coins.length === 0 || canvas.width - coins[coins.length - 1].x > 150) {
        if (Math.random() < 0.05) { // Probabilidad de aparición de monedas
            coins.push({
                x: canvas.width,
                y: Math.random() * 70 + (groundY - 120)
            });
        }
    }
}

// Función que actualiza las monedas super
function updateSuperCoins() {
    for (let i = superCoins.length - 1; i >= 0; i--) {
        let superCoin = superCoins[i];
        superCoin.x -= gameSpeed; // Movemos la super moneda hacia la izquierda

        // Dibujamos la super moneda
        drawCoin(superCoin.x, superCoin.y, true);

        // Comprobamos si el dinosaurio recoge una super moneda
        if (
            dinosaur.x + dinosaur.width > superCoin.x - 25 &&
            dinosaur.x < superCoin.x + 25 &&
            dinosaur.y + dinosaur.height > superCoin.y - 25 &&
            dinosaur.y < superCoin.y + 25
        ) {
            superCoins.splice(i, 1); // Elimina la super moneda recogida
            score += 50; // Aumenta el puntaje con 50 puntos por cada super moneda
        }

        // Eliminamos las super monedas que han salido del canvas
        if (superCoin.x + 25 < 0) {
            superCoins.splice(i, 1);
        }
    }

    // Generamos nuevas super monedas con una baja probabilidad
    if (superCoins.length === 0 || canvas.width - superCoins[superCoins.length - 1].x > 150) {
        if (Math.random() <0.003) { // Probabilidad de aparición de super monedas
            superCoins.push({
                x: canvas.width,
                y: Math.random() * 70 + (groundY - 120)
            });
        }
    }
}

// Función para seleccionar el power-up (no disponible pór ahora por pequeños errores tecnicos)
function selectPowerUp(powerUp) {
    selectedPowerUp = powerUp; // Guardamos el power-up seleccionado
    document.getElementById('powerUpSelection').style.display = 'none'; // Ocultamos la pantalla de selección
    startGame(); // Iniciamos el juego
}

// Función para reiniciar el juego tras el Game Over
function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none'; // Ocultamos la pantalla de Game Over
    selectPowerUp(''); // Resetemos el power-up
}
function showPowerUpSelection() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('powerUpSelection').style.display = 'block';
}
// ==== Variables de configuración desde los ajustes ====
let showCollision = false;
let jumpKey = 'Space'; // Valor por defecto

// ==== Listeners para los controles de ajustes ====
document.addEventListener("DOMContentLoaded", () => {
  // Mostrar radio de colisión
  const collisionCheckbox = document.getElementById("showCollisionBox");
  collisionCheckbox.addEventListener("change", () => {
    showCollision = collisionCheckbox.checked;
  });

  // Selector de tecla de salto
  const jumpSelector = document.getElementById("jumpKeySelector");
  jumpSelector.addEventListener("change", () => {
    jumpkey = jumpSelector.value;
  });

  // Guardar el valor inicial por si ya hay cambios hechos antes del juego
  jumpkey = jumpSelector.value;
  showCollision = collisionCheckbox.checked;
});
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configurações do Jogador (Nave)
const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 40,
    width: 30,
    height: 30,
    speed: 5,
    color: "#00ff00"
};

// Listas para controlar tiros e inimigos
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;

// Controle de teclas pressionadas
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    // Evita o scroll da página ao apertar Espaço ou Setas
    if (["Space", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
        e.preventDefault();
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

// Função para disparar tiro
function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        speed: 7,
        color: "#ffff00"
    });
}

// Escuta o espaço para atirar (apenas um tiro por clique)
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !gameOver) {
        shoot();
    }
    if (e.code === "Space" && gameOver) {
        restartGame();
    }
});

// Criar inimigos aleatoriamente
function spawnEnemy() {
    if (Math.random() < 0.02 && !gameOver) {
        const size = 25;
        enemies.push({
            x: Math.random() * (canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed: 2 + Math.random() * 2,
            color: "#ff0000"
        });
    }
}

// Reiniciar o jogo
function restartGame() {
    bullets = [];
    enemies = [];
    score = 0;
    player.x = canvas.width / 2 - 15;
    gameOver = false;
    update();
}

// Atualizar posições e lógica do jogo
function update() {
    if (gameOver) return;

    // Movimento do jogador
    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    // Movimento dos tiros
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        // Remove tiro se sair da tela
        if (bullet.y < 0) bullets.splice(index, 1);
    });

    // Movimento dos inimigos
    spawnEnemy();
    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;

        // Fim de jogo se o inimigo tocar o chão
        if (enemy.y > canvas.height) {
            gameOver = true;
        }

        // Colisão entre Inimigo e Jogador
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y
        ) {
            gameOver = true;
        }

        // Colisão entre Tiro e Inimigo
        bullets.forEach((bullet, bIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Remove inimigo e tiro, aumenta pontuação
                setTimeout(() => {
                    enemies.splice(eIndex, 1);
                    bullets.splice(bIndex, 1);
                    score += 10;
                }, 0);
            }
        });
    });

    draw();
    requestAnimationFrame(update);
}

// Desenhar elementos na tela
function draw() {
    // Limpa a tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha jogador
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Desenha tiros
    bullets.forEach((bullet) => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Desenha inimigos
    enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Desenha pontuação
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Pontos: ${score}`, 10, 30);

    // Tela de Game Over
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff0000";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);

        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.fillText("Pressione ESPAÇO para reiniciar", canvas.width / 2, canvas.height / 2 + 30);
        ctx.textAlign = "left"; // Reseta o alinhamento
    }
}

// Inicia o loop do jogo pela primeira vez
update();

// Lógica para o botão de Tela Cheia
const gameContainer = document.getElementById("game-container");
const fullscreenBtn = document.getElementById("fullscreenBtn");

fullscreenBtn.addEventListener("click", () => {
    // Se já estiver em tela cheia, sai dela
    if (document.fullscreenElement) {
        document.exitFullscreen();
        fullscreenBtn.innerText = "Jogar em Tela Cheia";
    } else {
        // Caso contrário, entra em tela cheia
        gameContainer.requestFullscreen().catch(err => {
            console.log(`Erro ao tentar ativar tela cheia: ${err.message}`);
        });
        fullscreenBtn.innerText = "Sair da Tela Cheia";
    }
});

// Detecta se o usuário saiu da tela cheia apertando a tecla 'ESC'
document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.innerText = "Jogar em Tela Cheia";
    }
});


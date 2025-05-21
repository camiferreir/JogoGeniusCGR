const btnIniciar = document.getElementById('btn-iniciar');
const btnVoltar = document.getElementById('btn-voltar');
const btnSom = document.getElementById('btn-som');
const btnTema = document.getElementById('btn-tema');
const telaInicial = document.getElementById('tela-inicial');
const telaJogo = document.getElementById('tela-jogo');
const botoes = document.querySelectorAll('.botao');
const nivelTexto = document.getElementById('nivel');
const mensagem = document.getElementById('mensagem');
const recordeTexto = document.getElementById('recorde');

const sons = {
  verde: new Audio('sons/verde.mp3'),
  vermelho: new Audio('sons/vermelho.mp3'),
  amarelo: new Audio('sons/amarelo.mp3'),
  azul: new Audio('sons/azul.mp3'),
  erro: new Audio('sons/erro.mp3'),
  fundo: new Audio('sons/musica.mp3'),
  sucesso: new Audio('sons/sucesso.mp3')
};

sons.fundo.loop = true;

let sequenciaJogo = [];
let sequenciaJogador = [];
let nivel = 0;
let esperandoClique = false;
let somAtivo = true;
let temaClaro = localStorage.getItem("tema") === "claro";
let recorde = localStorage.getItem("recorde") || 0;

recordeTexto.textContent = `Recorde: ${recorde}`;
atualizarTema();

// 🎵 Música toca na tela inicial
window.addEventListener('load', () => {
  if (somAtivo) {
    sons.fundo.play();
  }
});

btnIniciar.addEventListener('click', () => {
  sons.fundo.pause();
  telaInicial.style.display = 'none';
  telaJogo.style.display = 'flex';
  iniciarJogo();
});

btnVoltar.addEventListener('click', () => {
  telaJogo.style.display = 'none';
  telaInicial.style.display = 'flex';
  if (somAtivo) {
    sons.fundo.play();
  }
});

btnSom.addEventListener('click', () => {
  somAtivo = !somAtivo;
  btnSom.textContent = somAtivo ? "🔊 Som" : "🔇 Som";

  // Controle da música de fundo
  if (somAtivo) {
    if (telaInicial.style.display !== 'none') {
      sons.fundo.play();
    }
  } else {
    sons.fundo.pause();
    pararTodosOsSons();
  }
});

btnTema.addEventListener('click', () => {
  temaClaro = !temaClaro;
  localStorage.setItem("tema", temaClaro ? "claro" : "escuro");
  atualizarTema();
});

function atualizarTema() {
  document.body.classList.toggle("claro", temaClaro);
  document.body.classList.toggle("dark", !temaClaro);
}

function iniciarJogo() {
  nivel = 0;
  sequenciaJogo = [];
  proximoNivel();
}

function proximoNivel() {
  esperandoClique = false;
  nivel++;
  sequenciaJogador = [];
  nivelTexto.textContent = `Nível: ${nivel}`;
  mensagem.textContent = "";

  const cores = ['verde', 'vermelho', 'amarelo', 'azul'];
  const cor = cores[Math.floor(Math.random() * 4)];
  sequenciaJogo.push(cor);

  let i = 0;
  const intervalo = setInterval(() => {
    animarCor(sequenciaJogo[i]);
    tocarSom(sequenciaJogo[i]);
    i++;
    if (i >= sequenciaJogo.length) {
      clearInterval(intervalo);
      esperandoClique = true;
    }
  }, 800);
}

function animarCor(cor) {
  const botao = document.getElementById(cor);
  botao.classList.add('ativa');
  setTimeout(() => botao.classList.remove('ativa'), 400);
}

function tocarSom(cor) {
  if (!somAtivo) return;
  if (sons[cor]) {
    sons[cor].currentTime = 0;
    sons[cor].play();
  }
}

botoes.forEach(botao => {
  botao.addEventListener('click', () => {
    if (!esperandoClique) return;
    const cor = botao.dataset.cor;
    tocarSom(cor);
    animarCor(cor);
    verificarJogada(cor);
  });
});

function verificarJogada(cor) {
  sequenciaJogador.push(cor);
  const i = sequenciaJogador.length - 1;
  if (cor !== sequenciaJogo[i]) {
    tocarSom('erro');
    mensagem.textContent = "❌ Você errou! Tente novamente";
    if (nivel > recorde) {
      recorde = nivel;
      localStorage.setItem("recorde", recorde);
    }
    recordeTexto.textContent = `Recorde: ${recorde}`;
    esperandoClique = false;
    setTimeout(() => {
      telaJogo.style.display = 'none';
      telaInicial.style.display = 'flex';
      if (somAtivo) sons.fundo.play();
    }, 3000);
    return;
  }

  if (sequenciaJogador.length === sequenciaJogo.length) {
    estourarConfete();
    mensagem.textContent = "✅ Muito bem!";
    tocarSom('sucesso');
    setTimeout(proximoNivel, 1000);
  }
}

function estourarConfete() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// 🚫 Função para garantir que todos os sons parem quando desliga
function pararTodosOsSons() {
  for (let som in sons) {
    sons[som].pause();
    sons[som].currentTime = 0;
  }
}

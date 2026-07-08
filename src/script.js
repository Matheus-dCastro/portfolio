const textElement = document.getElementById("typewriter");
const phrases = ["Matheus", "de Castro"];

const textos = ["Matheus de Castro", "Backend Developer", "Machine Learning Student"];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
  const currentPhrase = phrases[phraseIndex];
  const isCoder = currentPhrase === "de Castro";

  // Obtém o texto atual sendo digitado
  let currentText = currentPhrase.substring(0, charIndex);

  // Se for a frase do Coder, envolvemos o texto atual na classe outline
  if (isCoder) {
    textElement.innerHTML = `<span class="outline">${currentText}</span>`;
  } else {
    textElement.innerHTML = currentText;
  }

  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  let typeSpeed = isDeleting ? 80 : 150;

  if (!isDeleting && charIndex === currentPhrase.length + 1) {
    isDeleting = true;
    typeSpeed = 2000;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 500;
  }

  setTimeout(type, typeSpeed);
}

document.addEventListener("DOMContentLoaded", type);

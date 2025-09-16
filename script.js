// текущий год в подвале
document.getElementById('year').textContent = new Date().getFullYear();

// открыть картинку в лайтбоксе
function openLightbox(img) {
  document.getElementById("lightbox-img").src = img.src;
  document.getElementById("lightbox").style.display = "flex";
}

// закрыть лайтбокс
function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

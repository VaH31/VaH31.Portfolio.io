const OWNER = "VaH31";
const REPO = "VaH31.Portfolio.io";
const BASE_PATH = "Фото портфолио";
const allowedLangs = ["Python", "CSharp"]; // Только эти языки

const grid = document.getElementById("projects-grid");
const loader = document.getElementById("loader");
@@ -34,20 +35,20 @@
    errorBox.hidden = true;
    grid.innerHTML = "";

    // Получаем языки (C++, C#, Python и т.д.)
    // Получаем языки
    const langs = await fetchJson(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(BASE_PATH)}`);

    for(const lang of langs){
      if(lang.type !== "dir") continue;
      if(lang.type !== "dir" || !allowedLangs.includes(lang.name)) continue;

      // Получаем проекты внутри языка, учитываем спецсимволы
      const projects = await fetchJson(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(BASE_PATH)}/${encodeURIComponent(lang.name)}`);
      // Получаем проекты внутри языка
      const projects = await fetchJson(lang.url);

      for(const project of projects){
        if(project.type !== "dir") continue;

        // Получаем файлы проекта
        const files = await fetchJson(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(BASE_PATH)}/${encodeURIComponent(lang.name)}/${encodeURIComponent(project.name)}`);
        const files = await fetchJson(project.url);
        const images = files.filter(f => f.type==="file" && isImage(f.name)).map(f => f.download_url);

        if(images.length){
@@ -102,6 +103,7 @@
  lightboxImg.src = currentImages[currentIndex];
}

// Лайтбокс управление
btnClose.addEventListener("click", ()=> lightbox.classList.remove("open"));
btnPrev.addEventListener("click", ()=> {
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
@@ -112,9 +114,9 @@
  showImage();
});

// Клик по фону закрывает лайтбокс
// Закрытие по клику на фон
lightbox.addEventListener("click", (e)=>{
  if(e.target === lightbox) lightbox.classList.remove("open");
});

loadProjects();

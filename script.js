const OWNER = "VaH31";
const REPO = "VaH31.Portfolio.io";
const BASE_PATH = "Фото портфолио";
const allowedLangs = ["Python", "CSharp"]; // Только эти языки

const grid = document.getElementById("projects-grid");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImage");
const btnClose = document.getElementById("closeLightbox");
const btnPrev = document.getElementById("prev");
const btnNext = document.getElementById("next");

let PROJECTS = [];
let currentImages = [];
let currentIndex = 0;

// 🔹 Краткие описания проектов
const DESCRIPTIONS = {
  "SnakeGame": "Классическая игра 'Змейка' на Python.",
  "WeatherApp": "Приложение для получения прогноза погоды.",
  "Calculator": "Учебный калькулятор на C# с графическим интерфейсом.",
  "ToDoApp": "Простое приложение для заметок на C#.",
  "Tetris": "Реализация Тетриса на Python."
};

function isImage(name){
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}

async function fetchJson(url){
  const r = await fetch(url);
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function loadProjects(){
  try{
    loader.hidden = false;
    errorBox.hidden = true;
    grid.innerHTML = "";

    // Получаем языки
    const langs = await fetchJson(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(BASE_PATH)}`);

    for(const lang of langs){
      if(lang.type !== "dir" || !allowedLangs.includes(lang.name)) continue;

      // Получаем проекты внутри языка
      const projects = await fetchJson(lang.url);

      for(const project of projects){
        if(project.type !== "dir") continue;

        // Получаем файлы проекта
        const files = await fetchJson(project.url);
        const images = files.filter(f => f.type==="file" && isImage(f.name)).map(f => f.download_url);

        if(images.length){
          PROJECTS.push({
            title: project.name,
            lang: lang.name,
            images
          });
        }
      }
    }

    renderProjects();
  }catch(err){
    console.error(err);
    errorBox.hidden = false;
    errorBox.textContent = "Ошибка загрузки проектов: " + err.message;
  }finally{
    loader.hidden = true;
  }
}

function renderProjects(){
  grid.innerHTML = "";
  PROJECTS.forEach((p, idx)=>{
    const langName = p.lang === "CSharp" ? "C#" : p.lang;

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.images[0]}" alt="${p.title}" data-idx="${idx}">
      <h3>${p.title}</h3>
      <p class="desc">${DESCRIPTIONS[p.title] || "Описание скоро будет."}</p>
      <div class="meta"><span class="tag">${langName}</span></div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("img").forEach(img=>{
    img.addEventListener("click", e=>{
      const idx = parseInt(e.target.dataset.idx,10);
      openLightbox(PROJECTS[idx].images, 0);
    });
  });
}

function openLightbox(images, startIdx){
  currentImages = images;
  currentIndex = startIdx;
  showImage();
  lightbox.classList.add("open");
}

function showImage(){
  lightboxImg.src = currentImages[currentIndex];
}

// Лайтбокс управление
btnClose.addEventListener("click", ()=> lightbox.classList.remove("open"));
btnPrev.addEventListener("click", ()=> {
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  showImage();
});
btnNext.addEventListener("click", ()=> {
  currentIndex = (currentIndex + 1) % currentImages.length;
  showImage();
});

// Закрытие по клику на фон
lightbox.addEventListener("click", (e)=>{
  if(e.target === lightbox) lightbox.classList.remove("open");
});

loadProjects();

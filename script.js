// === КОНФИГУРАЦИЯ (при необходимости поменяй) ===
const OWNER = 'VaH31';         // GitHub-юзер
const REPO  = 'VaH31.Portfolio.io';  // репозиторий
const BASE_PATH = 'Фото портфолио'; // папка, где лежат языки/проекты (точно как в репе, регистр важен)
// ==================================================

document.getElementById('year').textContent = new Date().getFullYear();

const projectsGrid = document.getElementById('projects-grid');
const loader = document.getElementById('loader');
const errorBox = document.getElementById('error');

let PROJECTS = []; // [{title, lang, images: [url,...]}]
let current = { projectIdx: 0, imageIdx: 0 };

// helper
function isImageName(name){
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
}
async function fetchJson(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`${res.status} ${res.statusText} (${url})`);
  return res.json();
}
function safeText(s){ return (s||'').toString(); }

// main loader: рекурсивно обходит структуру BASE_PATH -> язык -> проект -> файлы
async function loadProjectsFromRepo(){
  try{
    loader.hidden = false; errorBox.hidden = true;
    const baseUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(BASE_PATH)}`;
    const topList = await fetchJson(baseUrl);

    // topList — массив файлов/директорий в "Фото портфолио"
    for(const langEntry of topList){
      if(langEntry.type !== 'dir') continue;
      const langName = langEntry.name; // например "Python" или "С#"
      const projectsList = await fetchJson(langEntry.url);

      for(const projectEntry of projectsList){
        if(projectEntry.type === 'dir'){
          const files = await fetchJson(projectEntry.url);
          const images = files.filter(f=>f.type==='file' && isImageName(f.name)).map(f=>f.download_url);
          if(images.length){
            PROJECTS.push({
              title: projectEntry.name,
              lang: langName,
              images
            });
          }
        } else if(projectEntry.type === 'file' && isImageName(projectEntry.name)){
          // случай: картинки лежат прямо в папке языка -> создаём проект с именем языка
          PROJECTS.push({
            title: langName,
            lang: langName,
            images: [projectEntry.download_url]
          });
        }
      }
    }

    // если ничего не найдено, покажем сообщение
    if(PROJECTS.length === 0){
      errorBox.hidden = false;
      errorBox.textContent = 'Не найдено проектов/изображений в папке "'+BASE_PATH+'". Проверь структуру и права доступа (репозиторий должен быть публичным).';
      return;
    }

    renderProjects();
  } catch(err) {
    console.error(err);
    errorBox.hidden = false;
    errorBox.textContent = 'Ошибка загрузки проектов: ' + err.message;
  } finally {
    loader.hidden = true;
  }
}

function renderProjects(){
  projectsGrid.innerHTML = '';
  PROJECTS.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = p.title;
    card.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = p.lang;
    meta.appendChild(tag);
    card.appendChild(meta);

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'thumb';
    const img = document.createElement('img');
    img.src = p.images[0];
    img.alt = p.title;
    img.dataset.proj = i;
    img.dataset.idx = 0;
    img.addEventListener('click', onThumbClick);
    thumbWrap.appendChild(img);
    card.appendChild(thumbWrap);

    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = ''; // можно подставить описание (если захочешь, добавим JSON)
    card.appendChild(desc);

    projectsGrid.appendChild(card);
  });
}

/* ------------------- lightbox ------------------- */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
document.getElementById('lb-close').addEventListener('click', closeLb);
document.getElementById('lb-prev').addEventListener('click', ()=>navigate(-1));
document.getElementById('lb-next').addEventListener('click', ()=>navigate(1));
lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLb(); });
document.addEventListener('keydown', (e)=>{
  if(!lb.classList.contains('open')) return;
  if(e.key === 'Escape') closeLb();
  if(e.key === 'ArrowLeft') navigate(-1);
  if(e.key === 'ArrowRight') navigate(1);
});

function onThumbClick(e){
  const projIdx = Number(e.currentTarget.dataset.proj);
  const imgIdx = Number(e.currentTarget.dataset.idx) || 0;
  openLb(projIdx, imgIdx);
}

function openLb(projIdx, imgIdx){
  current.projectIdx = projIdx;
  current.imageIdx = imgIdx;
  updateLb();
  lb.classList.add('open');
  lb.setAttribute('aria-hidden','false');
}

function closeLb(){
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden','true');
  lbImg.src = '';
}

function navigate(dir){
  const proj = PROJECTS[current.projectIdx];
  if(!proj) return;
  current.imageIdx = (current.imageIdx + dir + proj.images.length) % proj.images.length;
  updateLb();
}

function updateLb(){
  const proj = PROJECTS[current.projectIdx];
  if(!proj) return;
  lbImg.src = proj.images[current.imageIdx];
  lbCaption.textContent = `${proj.title} — ${current.imageIdx + 1}/${proj.images.length}`;
}

/* ------------------------------------------------ */
loadProjectsFromRepo();


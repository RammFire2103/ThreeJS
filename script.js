// app.js

// Настройка сцены, камеры и рендерера
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); // Устанавливаем светлый фон

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Добавляем свет
const light = new THREE.PointLight(0xffffff, 1, 100); // Белый свет
light.position.set(10, 10, 10); // Позиция источника света
scene.add(light);

// Добавляем дополнительный свет
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Фоновый свет
scene.add(ambientLight);

// Загрузка 3D модели
const loader = new THREE.GLTFLoader();
let model;

loader.load(
  "model.glb",
  (gltf) => {
    model = gltf.scene;
    scene.add(model);
    model.scale.set(1.75, 1.75, 1.75); // Масштабируем модель для удобства
    console.log("Модель загружена", model);
    animate();
  },
  undefined,
  (error) => {
    console.error("Ошибка при загрузке модели:", error);
  }
);

// Камера
camera.position.set(0, 2, 6); // Устанавливаем камеру в позицию, чтобы видеть модель
camera.lookAt(0, 0, 0); // Камера смотрит в центр сцены

// Управление моделью с помощью мыши
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Модальное окно и кнопки
const modal = document.querySelector(".modal-overlay");
const closeModalButton = document.querySelector(".close-modal");
const changeMaterialButton = document.querySelector(".change-material");
const mainProperties = document.querySelector(".main-roperties");
const coordinates = document.querySelector(".coordinates");
const coordinatesCont = document.querySelector(".coordinates-cont");
const mainPropertiesCont = document.querySelector(".main-roperties-cont");

const x = document.querySelector(".x-span");
const y = document.querySelector(".y-span");
const z = document.querySelector(".z-span");

mainProperties.addEventListener("click", (e) => {
  if (mainPropertiesCont.classList.contains("show-1")) {
    mainPropertiesCont.classList.remove("show-1");
    mainPropertiesCont.classList.add("hide-1");
  } else {
    mainPropertiesCont.classList.add("show-1");
    mainPropertiesCont.classList.remove("hide-1");
  }
});

coordinates.addEventListener("click", (e) => {
  if (coordinatesCont.classList.contains("show-2")) {
    coordinatesCont.classList.remove("show-2");
    coordinatesCont.classList.add("hide-2");
  } else {
    coordinatesCont.classList.add("show-2");
    coordinatesCont.classList.remove("hide-2");
  }
});

// Обработчик открытия модального окна (нажимаем на модель)
function onModelRightClick(event) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Переводим координаты мыши в диапазон от -1 до 1
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  x.innerText = camera.position.x.toFixed(10);
  y.innerText = camera.position.y.toFixed(10);
  z.innerText = camera.position.z.toFixed(10);

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(model, true);

  if (intersects.length > 0) {
    modal.style.display = "block"; // Открываем модальное окно только при клике по модели
  }
}

function closeModal() {
  modal.style.display = "none";
  mainPropertiesCont.classList.remove("hide-1");
  mainPropertiesCont.classList.remove("show-1");
  coordinatesCont.classList.remove("hide-2");
  coordinatesCont.classList.remove("show-2");
}

// Закрытие модального окна
closeModalButton.addEventListener("click", () => {
  closeModal();
});

modal.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    closeModal();
  }
});

let ChangedColor = "3f8cff";
// Смена цвета модели
changeMaterialButton.addEventListener("click", () => {
  // Проходим по всем частям модели и меняем цвет только для голубых частей
  model.traverse((child) => {
    if (child.isMesh) {
      const hex = child.material.color.getHex().toString(16);
      // Проверяем, если цвет материала этой части модели - голубой
      if (hex == "3f8cff") {
        child.material.color.set("Blue"); // Меняем на выбранный цвет
      }
    }
  });
});

// Перехват правого клика
let rightClickStartTime = 0;
const clickThreshold = 200; // Порог времени для клика в миллисекундах

window.addEventListener("mousedown", (event) => {
  if (event.button === 2) {
    // 2 — это код для правой кнопки мыши
    event.preventDefault(); // Отключаем стандартное контекстное меню браузера
    rightClickStartTime = Date.now(); // Запоминаем время начала клика
  }
});

// Перехват отпускания правой кнопки
window.addEventListener("mouseup", (event) => {
  if (event.button === 2 && rightClickStartTime !== 0) {
    // Проверяем, что был начат правый клик
    const clickDuration = Date.now() - rightClickStartTime; // Время между нажатием и отпусканием

    if (clickDuration <= clickThreshold) {
      // Если время клика меньше порога, то считаем это быстрым кликом
      rightClickStartTime = 0; // Сбрасываем время начала
      onModelRightClick(event); // Открываем модальное окно, если это был клик по модели
    } else {
      rightClickStartTime = 0; // Если время клика слишком долгое, сбрасываем
    }
  }
});

let isDragging = false; // Флаг для отслеживания состояния перетаскивания
let previousMousePosition = { x: 0, y: 0 };

// Отключение стандартного контекстного меню правой кнопки мыши
window.addEventListener("contextmenu", (event) => {
  event.preventDefault(); // Это предотвратит появление контекстного меню
});

// Анимация сцены
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

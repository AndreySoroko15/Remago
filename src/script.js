import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import init from './init';

import './style.css';

const { sizes, camera, scene, canvas, controls, renderer } = init();

camera.position.set(0, 2, 15);

scene.position.y = -3;

// СВЕТ
// создание общего освещения
const hemiLight = new THREE.HemisphereLight(0xfffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);
// создание напровленной тени
const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

// model

const loader = new GLTFLoader();
let android;

loader.load(
	'/models/IT_ROOM.gltf',
	(gltf) => {
	android = gltf.scene.children[22];

	// начальная позиция статуэтки
	if (android.userData.startY === undefined) {
		android.userData.startY = android.position.y;
	}

	android.onClick = () => {
		animateJump();
	};

	// добавляю все элементы на сцену
	scene.add(gltf.scene);
	},
  );

// // onWindowResize();

const tick = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();

/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', () => {
	// Обновляем размеры
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Обновляем соотношение сторон камеры
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});

function animateJump() {
	const ANDROID_JUMP_HEIGHT = 0.5;
	const ANDROID_DURATION = 500;
	const ANDROID_JUMP_START_TIME = Date.now();

	function updateAndroidPosition() {
	  	const progress = (Date.now() - ANDROID_JUMP_START_TIME) / ANDROID_DURATION;

	  	if (progress < 1) {
			android.position.y = android.userData.startY + ANDROID_JUMP_HEIGHT * Math.sin(progress * Math.PI);

			requestAnimationFrame(updateAndroidPosition);
	  	} else {
			android.position.y = android.userData.startY;
	  	}
	}

	updateAndroidPosition();
}

  // обработчик клика для анимации статуэтки
window.addEventListener('click', (event) => {
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();

	mouse.x = (event.clientX / sizes.width) * 2 - 1;
	mouse.y = -(event.clientY / sizes.height) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObjects(scene.children, true);

	const androidIntersected = intersects.find((intersect) => intersect.object === android);

	if (androidIntersected) {
	  	animateJump();
	}
});
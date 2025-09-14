// --- Three.js Setup ---
const container = document.getElementById("three-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111133);

const camera = new THREE.PerspectiveCamera(75, container.clientWidth / 400, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, 400);
container.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Road network
const road = new THREE.Mesh(
  new THREE.BoxGeometry(30, 0.1, 5),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
scene.add(road);

const crossRoad = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.1, 30),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
scene.add(crossRoad);

// Vehicles
function makeCar(color, x, z) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.5, 0.8),
    new THREE.MeshStandardMaterial({ color })
  );
}

const car1 = makeCar(0xff0000, -10, 1);
const car2 = makeCar(0x0000ff, 5, -10);
const car3 = makeCar(0x00ff00, -5, 8);

scene.add(car1, car2, car3);

// IoT Sensors
function makeSensor(x, z) {
  const sensor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 1, 16),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  sensor.position.set(x, 0.5, z);
  return sensor;
}
scene.add(makeSensor(15, 0), makeSensor(-15, 0), makeSensor(0, 15), makeSensor(0, -15));

// Camera
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

// Animate
function animate() {
  requestAnimationFrame(animate);

  car1.position.x += 0.05;
  if (car1.position.x > 15) car1.position.x = -15;

  car2.position.z += 0.05;
  if (car2.position.z > 15) car2.position.z = -15;

  car3.position.x -= 0.05;
  if (car3.position.x < -15) car3.position.x = 15;

  renderer.render(scene, camera);
}
animate();

// --- Incident System ---
let incidents = [];
const statusEl = document.getElementById("status");
const incidentsEl = document.getElementById("incidents");

document.getElementById("simulate").onclick = () => {
  const incident = {
    id: Date.now(),
    location: "Location " + Math.floor(Math.random() * 100),
    severity: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
    type: ["Accident", "Breakdown", "Obstruction"][Math.floor(Math.random() * 3)],
    timestamp: new Date().toLocaleTimeString()
  };
  incidents.push(incident);
  statusEl.innerText = "⚠️ Congestion Detected";
  updateUI();

  // Auto-clear after 20s
  setTimeout(() => {
    incidents = incidents.filter(i => i.id !== incident.id);
    if (incidents.length === 0) statusEl.innerText = "✅ Normal Flow";
    updateUI();
  }, 20000);
};

document.getElementById("alert").onclick = () => {
  statusEl.innerText = "🚨 Emergency services alerted!";
  setTimeout(() => {
    statusEl.innerText = incidents.length ? "⚠️ Congestion Detected" : "✅ Normal Flow";
  }, 3000);
};

function updateUI() {
  incidentsEl.innerHTML = "";
  incidents.forEach(inc => {
    const div = document.createElement("div");
    div.className = "incident";
    div.style.background =
      inc.severity === "High" ? "#fee2e2" :
      inc.severity === "Medium" ? "#fef9c3" : "#dcfce7";
    div.innerHTML = `<b>${inc.type}</b> | ${inc.location} | ${inc.severity} | ${inc.timestamp}`;
    incidentsEl.appendChild(div);
  });
}

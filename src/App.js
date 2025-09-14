import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 28.6139,
  lng: 77.209,
};

const sampleIncidents = [
  { id: 1, lat: 28.615, lng: 77.21, severity: 'High', type: 'Accident' },
  { id: 2, lat: 28.612, lng: 77.208, severity: 'Medium', type: 'Breakdown' },
];

function App() {
  const mountRef = useRef(null);
  const [incidents] = useState(sampleIncidents);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 30, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    scene.add(dirLight);

    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

    function createRoadSegment(length, width, height = 0, rotationY = 0, position = { x: 0, y: 0, z: 0 }) {
      const geometry = new THREE.BoxGeometry(length, 0.2, width);
      const mesh = new THREE.Mesh(geometry, roadMat);
      mesh.position.set(position.x, position.y + height, position.z);
      mesh.rotation.y = rotationY;
      return mesh;
    }

    const roads = [];

    roads.push(createRoadSegment(60, 6, 0, 0, { x: 0, y: 0, z: -10 }));
    roads.push(createRoadSegment(60, 6, 0, 0, { x: 0, y: 0, z: 0 }));
    roads.push(createRoadSegment(60, 6, 0, 0, { x: 0, y: 0, z: 10 }));

    roads.push(createRoadSegment(60, 6, 0, Math.PI / 2, { x: -10, y: 0, z: 0 }));
    roads.push(createRoadSegment(60, 6, 0, Math.PI / 2, { x: 0, y: 0, z: 0 }));
    roads.push(createRoadSegment(60, 6, 0, Math.PI / 2, { x: 10, y: 0, z: 0 }));

    roads.push(createRoadSegment(20, 6, 3, 0, { x: 0, y: 3, z: 0 }));

    roads.forEach((road) => scene.add(road));

    const vehicleMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const vehicleGeo = new THREE.BoxGeometry(2, 1, 1);

    const vehicles = [];
    for (let i = 0; i < 5; i++) {
      const vehicle = new THREE.Mesh(vehicleGeo, vehicleMat);
      vehicle.position.set(-25 + i * 10, 0.6, -10);
      scene.add(vehicle);
      vehicles.push(vehicle);
    }

    const incidentMarkers = [];

    function addIncidentMarker(x, y, z) {
      const geometry = new THREE.SphereGeometry(0.7, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      scene.add(sphere);
      incidentMarkers.push(sphere);
    }

    function latLngToXYZ(lat, lng) {
      const latDiff = lat - center.lat;
      const lngDiff = lng - center.lng;
      const scale = 10000;
      return {
        x: lngDiff * scale,
        y: 0.7,
        z: -latDiff * scale,
      };
    }

    incidents.forEach((inc) => {
      const pos = latLngToXYZ(inc.lat, inc.lng);
      addIncidentMarker(pos.x, pos.y, pos.z);
    });

    let vehicleSpeed = 0.1;
    function animate() {
      requestAnimationFrame(animate);

      vehicles.forEach((v) => {
        v.position.x += vehicleSpeed;
        if (v.position.x > 30) v.position.x = -30;
      });

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [incidents]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 20 }}>
      <h1>IoT Accident Detection with 3D Roads & Google Maps</h1>

      <div
        ref={mountRef}
        style={{ width: '100%', height: '500px', border: '1px solid #ccc', borderRadius: 8 }}
      />

      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={14}>
          {incidents.map((inc) => (
            <Marker
              key={inc.id}
              position={{ lat: inc.lat, lng: inc.lng }}
              title={`${inc.type} - Severity: ${inc.severity}`}
              icon={{
                url:
                  inc.severity === 'High'
                    ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    : inc.severity === 'Medium'
                    ? 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                    : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default App;

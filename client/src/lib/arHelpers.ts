
import * as THREE from 'three';

export function createWordCardMesh(
  object: any,
  position: THREE.Vector3,
  isLearned: boolean,
  onMarkAsLearned: () => void
) {
  // Create canvas for word card
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = 512;
  canvas.height = 256;

  // Draw word card background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8F87F1';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // Draw text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(object.name, canvas.width / 2, 80);
  
  ctx.font = '36px Arial';
  ctx.fillText(object.translation, canvas.width / 2, 140);

  // Create texture and material
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  // Create mesh
  const geometry = new THREE.PlaneGeometry(1, 0.5);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  
  // Make mesh face camera
  mesh.lookAt(0, 0, 0);

  return mesh;
}

export function createARConfetti(scene: THREE.Scene, position: THREE.Vector3) {
  const colors = [0x8F87F1, 0xC68EFD, 0xE9A5F1, 0xFED2E2];
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    
    const particle = new THREE.Mesh(geometry, material);
    
    // Set random position around the word card
    particle.position.set(
      position.x + (Math.random() - 0.5) * 0.5,
      position.y + (Math.random() - 0.5) * 0.5,
      position.z + (Math.random() - 0.5) * 0.5
    );
    
    // Add animation
    const animate = () => {
      particle.position.y -= 0.01;
      particle.rotation.x += 0.1;
      particle.rotation.y += 0.1;
      
      if (particle.position.y < position.y - 1) {
        scene.remove(particle);
      } else {
        requestAnimationFrame(animate);
      }
    };
    
    scene.add(particle);
    animate();
  }
}

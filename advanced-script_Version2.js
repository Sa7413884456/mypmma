// ===== NAVIGATION =====
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close menu when link clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ===== 3D VIEWER =====
let scene3D, camera3D, renderer3D, moleculeGroup3D;
let autoRotate3D = true;
let unitCount = 6;

function initiate3DViewer() {
    const container = document.getElementById('3d-canvas');
    if (!container || !window.THREE) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color(0xf8f9fa);

    // Camera
    camera3D = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera3D.position.z = 25;

    // Renderer
    renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer3D.setSize(width, height);
    renderer3D.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer3D.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene3D.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene3D.add(directionalLight);

    // Molecule group
    moleculeGroup3D = new THREE.Group();
    createPMMAChain();
    scene3D.add(moleculeGroup3D);

    // Mouse controls
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMouse = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMouse.x;
            const deltaY = e.clientY - previousMouse.y;

            moleculeGroup3D.rotation.y += deltaX * 0.005;
            moleculeGroup3D.rotation.x += deltaY * 0.005;

            previousMouse = { x: e.clientX, y: e.clientY };
        }
    });

    container.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera3D.position.z += e.deltaY * 0.01;
        camera3D.position.z = Math.max(15, Math.min(60, camera3D.position.z));
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (autoRotate3D) {
            moleculeGroup3D.rotation.y += 0.003;
            moleculeGroup3D.rotation.x += 0.0008;
        }

        renderer3D.render(scene3D, camera3D);
    }

    animate();
}

function createPMMAChain() {
    const spacing = 3;

    for (let i = 0; i < unitCount; i++) {
        const x = i * spacing - (unitCount * spacing) / 2;

        // Carbons
        createAtom3D(x, 0, 0, 0.5, 0x333333);
        createAtom3D(x + 1.2, 0, 0, 0.5, 0x333333);

        // Bonds
        createBond3D(new THREE.Vector3(x, 0, 0), new THREE.Vector3(x + 1.2, 0, 0), 0x666666, 0.2);

        // Ester
        createAtom3D(x + 0.6, 1.5, 0, 0.4, 0xff0000);
        createBond3D(new THREE.Vector3(x + 0.6, 0, 0), new THREE.Vector3(x + 0.6, 1.5, 0), 0x888888, 0.15);

        // Methyl
        createAtom3D(x + 0.2, 1.2, 0.8, 0.35, 0x2ecc71);
        createBond3D(new THREE.Vector3(x, 0, 0), new THREE.Vector3(x + 0.2, 1.2, 0.8), 0x888888, 0.15);

        // H atoms
        createAtom3D(x - 0.3, 0, 0.6, 0.25, 0x00d4ff);
        createAtom3D(x + 1.5, 0, -0.6, 0.25, 0x00d4ff);
    }

    updateAtomCount();
}

function createAtom3D(x, y, z, size, color) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        emissive: color,
        emissiveIntensity: 0.2
    });
    const atom = new THREE.Mesh(geometry, material);
    atom.position.set(x, y, z);
    moleculeGroup3D.add(atom);
}

function createBond3D(pos1, pos2, color, thickness) {
    const distance = pos1.distanceTo(pos2);
    const geometry = new THREE.CylinderGeometry(thickness, thickness, distance, 16);
    const material = new THREE.MeshPhongMaterial({ color: color, shininess: 50 });
    const bond = new THREE.Mesh(geometry, material);

    const midpoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
    bond.position.copy(midpoint);

    const direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    moleculeGroup3D.add(bond);
}

function updateAtomCount() {
    document.getElementById('unitCount').textContent = unitCount;
    document.getElementById('atomCount').textContent = unitCount * 7;
    document.getElementById('bondCount').textContent = unitCount * 6;
}

function toggleRotation3D() {
    autoRotate3D = !autoRotate3D;
}

function resetView3D() {
    moleculeGroup3D.rotation.set(0, 0, 0);
    camera3D.position.z = 25;
    autoRotate3D = true;
}

function addUnit3D() {
    if (unitCount < 10) {
        unitCount++;
        moleculeGroup3D.clear();
        createPMMAChain();
    }
}

function removeUnit3D() {
    if (unitCount > 3) {
        unitCount--;
        moleculeGroup3D.clear();
        createPMMAChain();
    }
}

// ===== TACTICITY VIEWERS =====
function initTacticityViewers() {
    if (!window.THREE) return;

    createTacticityViewer('isotactic');
    createTacticityViewer('atactic');
    createTacticityViewer('syndiotactic');
}

function createTacticityViewer(type) {
    const container = document.getElementById(`canvas-${type}`);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(light);

    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(10, 10, 10);
    scene.add(dir);

    const group = new THREE.Group();
    const spacing = 2.5;
    const unitCount = 5;

    for (let i = 0; i < unitCount; i++) {
        const x = i * spacing - (unitCount * spacing) / 2;
        let side = 1;

        if (type === 'atactic') {
            side = Math.random() > 0.5 ? 1 : -1;
        } else if (type === 'syndiotactic') {
            side = i % 2 === 0 ? 1 : -1;
        }

        // Backbone
        createAtom3D_viewer(group, x, 0, 0, 0.4, 0x333333);
        if (i < unitCount - 1) {
            createBond3D_viewer(group, new THREE.Vector3(x, 0, 0), new THREE.Vector3(x + spacing, 0, 0), 0x666666, 0.15);
        }

        // Substituents
        createAtom3D_viewer(group, x + 0.3, side * 1.2, 0, 0.3, 0xff0000);
        createBond3D_viewer(group, new THREE.Vector3(x, 0, 0), new THREE.Vector3(x + 0.3, side * 1.2, 0), 0x888888, 0.1);
    }

    scene.add(group);

    function animate() {
        requestAnimationFrame(animate);
        group.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();
}

function createAtom3D_viewer(group, x, y, z, size, color) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: color, shininess: 100 });
    const atom = new THREE.Mesh(geometry, material);
    atom.position.set(x, y, z);
    group.add(atom);
}

function createBond3D_viewer(group, pos1, pos2, color, thickness) {
    const distance = pos1.distanceTo(pos2);
    const geometry = new THREE.CylinderGeometry(thickness, thickness, distance, 16);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const bond = new THREE.Mesh(geometry, material);

    const midpoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
    bond.position.copy(midpoint);

    const direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    group.add(bond);
}

// ===== PROPERTIES TAB SWITCHING =====
function switchPropertiesTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // Deactivate all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const tab = document.getElementById(tabName);
    if (tab) tab.classList.add('active');

    // Activate button
    event.target.classList.add('active');
}

// ===== STRESS-STRAIN CHART =====
function initStressStrainChart() {
    const ctx = document.getElementById('stressStrainChart');
    if (!ctx || !window.Chart) return;

    const chartData = {
        pmma: {
            labels: [0, 1, 2, 3],
            data: [0, 60, 70, 75],
            borderColor: '#00d4ff'
        },
        pc: {
            labels: [0, 5, 10, 15, 20],
            data: [0, 50, 55, 60, 65],
            borderColor: '#00ff88'
        },
        ps: {
            labels: [0, 1, 1.5, 2],
            data: [0, 40, 45, 50],
            borderColor: '#ff00ff'
        }
    };

    window.stressStrainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.pmma.labels,
            datasets: [{
                label: 'PMMA',
                data: chartData.pmma.data,
                borderColor: chartData.pmma.borderColor,
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Strain (%)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Stress (MPa)'
                    }
                }
            }
        }
    });
}

function updateCurve(material) {
    if (!window.stressStrainChart) return;

    const data = {
        pmma: { labels: [0, 1, 2, 3], data: [0, 60, 70, 75] },
        pc: { labels: [0, 5, 10, 15, 20], data: [0, 50, 55, 60, 65] },
        ps: { labels: [0, 1, 1.5, 2], data: [0, 40, 45, 50] }
    };

    window.stressStrainChart.data.labels = data[material].labels;
    window.stressStrainChart.data.datasets[0].data = data[material].data;
    window.stressStrainChart.update();
}

function updateCurveTemp(temp) {
    document.getElementById('curveTemp').textContent = temp + '°C';
}

// ===== REACTOR SIMULATION =====
let reactionActive = false;

function startReaction() {
    reactionActive = true;
    const particles = document.querySelectorAll('.particle');
    particles.forEach((p, i) => {
        p.style.animation = `float ${2 + Math.random()}s linear infinite`;
    });
}

function pauseReaction() {
    reactionActive = false;
}

function resetReaction() {
    reactionActive = false;
    document.querySelectorAll('.particle').forEach(p => {
        p.style.animation = 'none';
    });
}

function updateTemperature(value) {
    document.getElementById('tempDisplay').textContent = value + '°C';
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initiate3DViewer();
    initTacticityViewers();
    initStressStrainChart();

    // Active tab
    const firstTab = document.querySelector('.tab-pane');
    if (firstTab) firstTab.classList.add('active');

    const firstBtn = document.querySelector('.tab-btn');
    if (firstBtn) firstBtn.classList.add('active');
});

// ===== WINDOW RESIZE =====
window.addEventListener('resize', () => {
    if (renderer3D && camera3D) {
        const container = document.getElementById('3d-canvas');
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera3D.aspect = width / height;
            camera3D.updateProjectionMatrix();
            renderer3D.setSize(width, height);
        }
    }
});

// ===== SMOOTH SCROLL ACTIVE LINK =====
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ===== SCROLL TO TOP BUTTON =====
const scrollBtn = document.createElement('button');
scrollBtn.innerHTML = '⬆ Top';
scrollBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #00d4ff, #00ff88);
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-weight: bold;
    display: none;
    z-index: 999;
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
    transition: all 0.3s;
`;

document.body.appendChild(scrollBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollBtn.style.display = 'block';
    } else {
        scrollBtn.style.display = 'none';
    }
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

scrollBtn.addEventListener('mouseover', () => {
    scrollBtn.style.transform = 'translateY(-5px)';
});

scrollBtn.addEventListener('mouseout', () => {
    scrollBtn.style.transform = 'translateY(0)';
});
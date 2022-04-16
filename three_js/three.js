window.addEventListener("DOMContentLoaded", init)

function init() {
  const width = 960
  const height = 540

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
  })
  // レンダラーを作成
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)

  // シーンを作成
  const scene = new THREE.Scene()

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000)
  camera.position.set(0, 0, +1000)

  const geometry = new THREE.SphereGeometry(300, 30, 30)
  // const loader = new THREE.TextureLoader()
  // const texture = loader.load("imgs/earthmap1.jpg")
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // 並行光源
  const directionalLight = new THREE.DirectionalLight(0xffffff)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  tick()

  // 毎フレームごとに実行されるループイベント
  function tick() {
    mesh.rotation.x += 0.005
    mesh.rotation.y += 0.005
    mesh.rotation.z += 0.005
    renderer.render(scene, camera)

    requestAnimationFrame(tick)
  }
}

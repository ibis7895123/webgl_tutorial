import { Loader } from "three"
import * as THREE from "three"
import Camera from "./Camera"
import SavePoint from "./SavePoint"

export default class Main {
  private readonly _scene: THREE.Scene
  private readonly _camera: Camera
  private _renderer: THREE.WebGLRenderer
  private _savePoint: SavePoint

  constructor() {
    this._scene = new THREE.Scene()
    this._camera = new Camera()

    // renderer
    this._renderer = new THREE.WebGLRenderer({ antialias: true })
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this._renderer.domElement)

    // 環境光
    const light = new THREE.PointLight(0xaaaaaa, 1.6, 50)
    light.position.set(0.577, 0.577, 0.577)
    light.castShadow = true
    this._scene.add(light)

    // 地面
    const planeTexture = new THREE.TextureLoader().load("img/tile.png")
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping
    planeTexture.repeat.set(16, 16)
    const PlaneGeometry = new THREE.PlaneGeometry(100, 100, 1, 1)
    const planeMaterial = new THREE.MeshPhongMaterial({
      map: planeTexture,
      bumpMap: planeTexture,
      bumpScale: 1.0,
      shininess: 3,
      specularMap: planeTexture,
      side: THREE.BackSide,
    })
    const plane = new THREE.Mesh(PlaneGeometry, planeMaterial)
    plane.rotation.x = (90 * Math.PI) / 180
    this._scene.add(plane)

    // セーブポイント
    this._savePoint = new SavePoint()
    this._scene.add(this._savePoint)

    this._tick()
  }

  private _tick() {
    requestAnimationFrame(() => {
      this._tick()
    })

    // カメラの更新
    this._camera.update()

    // セーブポイントの更新
    this._savePoint.update()

    this._renderer.render(this._scene, this._camera)
  }
}

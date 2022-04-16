import * as THREE from "three"

export default class Swirl extends THREE.Object3D {
  // フレームごとにカウントされる値
  private _counter: number = 0
  private readonly _texture: THREE.Texture

  constructor() {
    super()

    // テクスチャ
    this._texture = new THREE.TextureLoader().load("img/swirl.png")
    this._texture.offset.y = -0.25
    this._texture.wrapS = THREE.RepeatWrapping

    // ドーナツ
    const geometry = new THREE.TorusGeometry(6, 3, 2, 100)
    const material = new THREE.MeshBasicMaterial({
      color: 0x007eff,
      map: this._texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
    const torus = new THREE.Mesh(geometry, material)
    torus.position.y = 0.01
    torus.rotation.x = (90 * Math.PI) / 180
    this.add(torus)
  }

  public update() {
    this._counter++
    const angle = (this._counter * Math.PI) / 180
    this._texture.offset.x = -angle * 0.2
  }
}

import * as THREE from "three"
import Pillar from "./Pillar"
import Swirl from "./Swirl"

export default class SavePoint extends THREE.Object3D {
  // 縦長の光の柱
  private readonly _pillar: Pillar
  // 広がる光の柱
  private readonly _pillar2: Pillar
  // 地面の渦
  private readonly _swirl: Swirl

  constructor() {
    super()

    // 光の柱
    this._pillar = new Pillar(3, 3, 10)
    this.add(this._pillar)

    // 広がる光の柱
    this._pillar2 = new Pillar(8, 5, 2.5)
    this.add(this._pillar2)

    // 地面の渦
    this._swirl = new Swirl()
    this.add(this._swirl)

    // 地面の光
    const groundTexture = new THREE.TextureLoader().load("img/ground.png")
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: groundTexture,
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
      })
    )
    ground.scale.multiplyScalar(1.35)
    ground.rotation.x = (90 * Math.PI) / 180
    ground.position.set(0, 0.02, 0)
    this.add(ground)
  }

  // フレームごとに更新
  public update() {
    this._pillar.update()
    this._pillar2.update()
    this._swirl.update()
  }
}

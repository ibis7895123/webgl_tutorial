import * as THREE from "three"

// 光の柱クラス
export default class Pillar extends THREE.Object3D {
  // フレームごとにカウントされる値
  private _counter: number = 0
  // マテリアルにあてるテクスチャ
  private readonly _texture: THREE.Texture
  // 柱のメッシュ
  private readonly _cylinder: THREE.Mesh

  constructor(topRadius: number, bottomRadius: number, height: number) {
    super()

    // テクスチャ
    this._texture = new THREE.TextureLoader().load("img/pillar.png")
    this._texture.wrapS = THREE.RepeatWrapping
    this._texture.repeat.set(10, 1)

    // 光の柱
    const geometry = new THREE.CylinderGeometry(
      topRadius,
      bottomRadius,
      height,
      20,
      1,
      true
    )
    const material = new THREE.MeshBasicMaterial({
      color: 0x007eff,
      map: this._texture,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    })

    this._cylinder = new THREE.Mesh(geometry, material)
    // 地面の高さに合わせる
    this._cylinder.position.set(0, height / 2, 0)

    this.add(this._cylinder)
  }

  public update() {
    this._counter += 0.5
    const angle = (this._counter * Math.PI) / 180
    // テクスチャを上下させる
    this._texture.offset.y = 0.1 + 0.2 * Math.sin(angle * 3)
    // テクスチャを回転させる
    this._texture.offset.x = angle
  }
}

import * as THREE from "three"
import { Util } from "./Util"

// 何度も作られるのでクラス外で定数化する
const texture = new THREE.TextureLoader().load("img/particle_2.png")
const material = new THREE.SpriteMaterial({
  color: 0x007eff,
  map: texture,
  transparent: true,
  blending: THREE.AdditiveBlending,
})

export default class Particle extends THREE.Sprite {
  // フレームごとにカウントされる値
  private _counter: number = 0
  // パーティクルの速度
  private _velocity: THREE.Vector3

  constructor() {
    super(material)

    this._init()
  }

  // ランダムな移動方向を設定
  // 生成位置は同じ
  private _init() {
    this.position.set(0, 0, 0)
    this.scale.set(1, 1, 1)
    this._velocity = new THREE.Vector3(
      Util.randomNum(-0.015, 0.015),
      Util.randomNum(0.05, 0.1),
      Util.randomNum(-0.015, 0.015)
    )
    this.material.opacity = 1
  }

  public update() {
    this._counter++
    // 設定された移動方向に移動する
    this.position.add(this._velocity.clone())
    // 少しずつ消えていく
    this.material.opacity -= 0.009

    const rad = Math.sin((this._counter * 30 * Math.PI) / 180)
    const scale = 0.5 + rad
    this.scale.set(scale, scale, scale)

    // 消えてしまったら新たなパーティクルを生成する
    if (this.material.opacity <= 0) {
      this._init()
    }
  }
}

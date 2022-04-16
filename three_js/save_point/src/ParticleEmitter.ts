import * as THREE from "three"
import Particle from "./Particle"

export default class ParticleEmitter extends THREE.Object3D {
  // フレームごとにカウントされる値
  private _counter: number = 0
  // パーティクルの配列
  private _particles: Particle[] = []
  // 生成するパーティクルの数
  private _particleNum: number = 10
  // パーティクルの発生間隔
  private _interval: number = 15

  constructor() {
    super()
  }

  public update() {
    this._counter++

    // 全パーティクルの更新
    this._particles.forEach((particle) => {
      particle.update()
    })

    // フレームのインターバルごとに新たなパーティクルを生成
    if (this._counter % this._interval == 0) {
      this._addParticle()
    }
  }

  private _addParticle() {
    if (this._particles.length > this._particleNum) {
      return
    }

    const particle = new Particle()
    this._particles.push(particle)
    this.add(particle)
  }
}

export class Util {
  // min - max の間でランダムな数を返す
  public static randomNum(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }
}

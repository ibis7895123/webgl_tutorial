import * as WebFont from "webfontloader"

export const FONT_BASE = "Source Code Pro"
export const FONT_ICON = "FontAwesome"

// 3Dのパーティクル表現のデモクラス。プリロードしてから実行する。
export function loadFont(): Promise<void> {
  return new Promise((resolve, reject) => {
    // ウェブフォントのロードを待ってから初期化
    WebFont.load({
      custom: {
        families: [FONT_BASE, FONT_ICON],
        urls: [
          "https://fonts.googleapis.com/css?family=Source+Code+Pro:600",
          "https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css",
        ],
        testStrings: {
          FontAwesome: "\uf001",
        },
      },
      active: () => {
        resolve()
      },
      inactive: () => {
        reject()
      },
    })
  })
}

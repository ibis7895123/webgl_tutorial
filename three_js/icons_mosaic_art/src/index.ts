import { loadFont } from "./utils/load-font"
import "./styles/style.css"

window.addEventListener("DOMContentLoaded", async () => {
  await loadFont
  new DemoIconsWorld()
})

class DemoIconsWorld {}

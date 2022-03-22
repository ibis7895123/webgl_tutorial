window.onload = main

function main() {
  const canvas = document.querySelector("#glCanvas")

  // GL コンテキストを初期化する
  const gl = canvas.getContext("webgl")

  // WebGL が使用可能で動作している場合にのみ続行します
  if (gl === null) {
    alert(
      "WebGL を初期化できません。ブラウザーまたはマシンがサポートしていない可能性があります。"
    )
    return
  }

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `

  const fsSource = `
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `

  // シェーダープログラムを初期化する。ここで頂点などのライティングがすべて確立される。
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource)

  // シェーダープログラムを使用するために必要な情報をすべて収集する。
  // シェーダープログラムが aVertexPosition にどの属性を使用しているかを調べ、均一な位置を調べる。
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
  }

  // ここで、これから描画するすべてのオブジェクトを構築するルーチンを呼び出します。
  const buffers = initBuffers(gl)

  // シーンを描画する
  drawScene(gl, programInfo, buffers)
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // シェーダープログラムの生成に失敗したらアラート
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    )
    return null
  }

  return shaderProgram
}

// 与えられたタイプのシェーダを作成し、ソースをアップロードしてコンパイルする。
function loadShader(gl, type, source) {
  const shader = gl.createShader(type)

  // シェーダーオブジェクトにソースを送る
  gl.shaderSource(shader, source)

  // シェーダープログラムのコンパイル
  gl.compileShader(shader)

  // コンパイルに成功したか確認する
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    )
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function initBuffers(gl) {
  // スクエアの位置のバッファーを作る
  const positionBuffer = gl.createBuffer()

  // バッファーにpositionBufferを適用する
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // 正方形の位置の配列を作成する
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]

  // ここで、WebGL に位置のリストを渡し、形状を構築します。
  // これは JavaScript の配列から Float32Array を作成し、
  // それを使って現在のバッファを埋めることで行います。
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  // カラーバッファを作る
  const colors = [
    1.0,
    1.0,
    1.0,
    1.0, // white
    1.0,
    0.0,
    0.0,
    1.0, // red
    0.0,
    1.0,
    0.0,
    1.0, // green
    0.0,
    0.0,
    1.0,
    1.0, // blue
  ]

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    color: colorBuffer,
  }
}

function drawScene(gl, programInfo, buffers) {
  // 黒色、完全不透明にクリア
  gl.clearColor(0.0, 0.0, 0.0, 1.0) // Clear to black, fully opaque
  gl.clearDepth(1.0) // Clear everything
  gl.enable(gl.DEPTH_TEST) // Enable depth testing
  gl.depthFunc(gl.LEQUAL) // Near things obscure far things

  // キャンバスに描画を開始する前に、キャンバスをクリアします。
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // パースペクティブマトリックス（特殊な行列）を作成します。
  // カメラで遠近法の歪みをシミュレートするために使用されます。
  // 視野角は45度、幅と高さの比率はキャンバスの表示サイズに合わせ、
  // カメラから0.1単位から100単位離れたオブジェクトのみを表示するようにします。
  const fieldOfView = (45 * Math.PI) / 180 // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
  const zNear = 0.1
  const zFar = 100.0
  const projectionMatrix = mat4.create()

  // note: glmatrix.jsは常に第1引数を結果の受け取り先としています。
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

  // 描画位置をシーンの中心である「ID」ポイントに設定します。
  const modelViewMatrix = mat4.create()

  // ここで描画位置を少し移動して、正方形を描き始めたい位置に移動します。
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -6.0]
  ) // amount to translate

  // WebGL に、位置バッファから vertexPosition 属性に位置を引き出す方法を指示します。
  {
    const numComponents = 2
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
  }

  // WebGL に、カラーバッファから vertexColor 属性に色を抽出する方法を指示します。
  {
    const numComponents = 4
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
  }

  // WebGLに描画時に我々のプログラムを使用するように指示する
  gl.useProgram(programInfo.program)

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  )
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  )

  {
    const offset = 0
    const vertexCount = 4
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
  }
}

let cubeRotation = 0.0

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

  let then = 0
  // シーンを繰り返し描画する
  function render(now) {
    now *= 0.001
    const deltaTime = now - then
    then = now

    // シーンを描画する
    drawScene(gl, programInfo, buffers, deltaTime)

    requestAnimationFrame(render)
  }

  render(Date.now())
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

  // ここで、キューブの位置の配列を作成します。
  const positions = [
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
  ]

  // ここで、WebGL に位置のリストを渡し、形状を構築します。
  // これは JavaScript の配列から Float32Array を作成し、
  // それを使って現在のバッファを埋めることで行います。
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  // カラーバッファを作る
  const faceColors = [
    [1.0, 1.0, 1.0, 1.0], // Front face: white
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
    [1.0, 1.0, 0.0, 1.0], // Right face: yellow
    [1.0, 0.0, 1.0, 1.0], // Left face: purple
  ]

  let colors = []
  faceColors.forEach((color) => {
    colors = colors.concat(color, color, color, color)
  })

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

  // 要素配列バッファを構築する。
  // これは，各面の頂点の頂点配列へのインデックスを指定するものである．
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

  // この配列は、各面を2つの三角形として定義し、
  // 頂点配列のインデックスを用いて各三角形の位置を指定する。
  const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // front

    4,
    5,
    6,
    4,
    6,
    7, // back

    8,
    9,
    10,
    8,
    10,
    11, // top

    12,
    13,
    14,
    12,
    14,
    15, // bottom

    16,
    17,
    18,
    16,
    18,
    19, // right

    20,
    21,
    22,
    20,
    22,
    23, // left
  ]

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  )

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  }
}

function drawScene(gl, programInfo, buffers, deltaTime) {
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
    [-0.0, 0.0, -6.0] // amount to translate
  )

  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation, // amount to rotate in radians
    [0, 0, 1] // axis to rotate around(Z)
  )

  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.7, // amount to rotate in radians
    [0, 1, 0] // axis to rotate around (X)
  )

  // WebGL に、位置バッファから vertexPosition 属性に位置を引き出す方法を指示します。
  {
    const numComponents = 3
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

  // WebGL に、頂点のインデックスに使用するインデックスを通知します。
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)

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
    const vertexCount = 36
    const type = gl.UNSIGNED_SHORT
    const offset = 0
    gl.drawElements(gl.TRIANGLE_STRIP, vertexCount, type, offset)
  }

  // 次の描画のためにローテーションを更新する
  cubeRotation += deltaTime
}

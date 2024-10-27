// 3D engine from scratch

class CanvasDraw {
  // Textures
  colors = {
    base: "black",
    line: "red",
    primary: "white",
  };

  constructor(screenWidth, screenHeight) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.screenWidth;
    this.canvas.height = this.screenHeight;
    document.body.appendChild(this.canvas);

    // Create context and clear canvas
    this.ctx = this.canvas.getContext("2d");
  }

  clearCanvas() {
    this.ctx.fillStyle = this.colors.base;
    this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
  }

  DrawLine(v1, v2, color) {
    if (!color) {
      throw new Error("No color specified");
    }
    this.ctx.beginPath();
    this.ctx.moveTo(v1.x, v1.y);
    this.ctx.lineTo(v2.x, v2.y);
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  DrawTriangle(tri, color) {
    this.DrawLine(tri[0], tri[1], color);
    this.DrawLine(tri[1], tri[2], color);
    this.DrawLine(tri[2], tri[0], color);
  }

  FillTriangle(tri, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(tri[0].x, tri[0].y);
    this.ctx.lineTo(tri[1].x, tri[1].y);
    this.ctx.lineTo(tri[2].x, tri[2].y);
    this.ctx.lineTo(tri[0].x, tri[0].y);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }
}

// 3D vector constructor
function Vec3d(x, y, z) {
  return { x, y, z };
}

// Triangle constructor
function Triangle(v1, v2, v3) {
  return [
    new Vec3d(v1.x, v1.y, v1.z),
    new Vec3d(v2.x, v2.y, v2.z),
    new Vec3d(v3.x, v3.y, v3.z),
  ];
}

// Matrix 4x4
function Mat4x4() {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

// Mesh
function Mesh() {
  return { tris: [] };
}

class Engine3D extends CanvasDraw {
  meshCube = new Mesh();
  matProj = new Mat4x4();
  fTheta = 0.0;

  vCamera = new Vec3d(0.0, 0.0, 0.0);

  constructor({ screenWidth, screenHeight, appName, tickRate }) {
    super(screenWidth, screenHeight);
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.tickRate = tickRate;
    this.appName = appName;
  }

  OnUserCreate() {
    // Define the 3D cube model with triangles representing each face
    this.meshCube.tris = [
      new Triangle(
        { x: 0.0, y: 0.0, z: 0.0 },
        { x: 0.0, y: 1.0, z: 0.0 },
        { x: 1.0, y: 1.0, z: 0.0 }
      ),
      new Triangle(
        { x: 0.0, y: 0.0, z: 0.0 },
        { x: 1.0, y: 1.0, z: 0.0 },
        { x: 1.0, y: 0.0, z: 0.0 }
      ),
      new Triangle(
        { x: 1.0, y: 0.0, z: 0.0 },
        { x: 1.0, y: 1.0, z: 0.0 },
        { x: 1.0, y: 1.0, z: 1.0 }
      ),
      new Triangle(
        { x: 1.0, y: 0.0, z: 0.0 },
        { x: 1.0, y: 1.0, z: 1.0 },
        { x: 1.0, y: 0.0, z: 1.0 }
      ),
      new Triangle(
        { x: 1.0, y: 0.0, z: 1.0 },
        { x: 1.0, y: 1.0, z: 1.0 },
        { x: 0.0, y: 1.0, z: 1.0 }
      ),
      new Triangle(
        { x: 1.0, y: 0.0, z: 1.0 },
        { x: 0.0, y: 1.0, z: 1.0 },
        { x: 0.0, y: 0.0, z: 1.0 }
      ),
      new Triangle(
        { x: 0.0, y: 0.0, z: 1.0 },
        { x: 0.0, y: 1.0, z: 1.0 },
        { x: 0.0, y: 1.0, z: 0.0 }
      ),
      new Triangle(
        { x: 0.0, y: 0.0, z: 1.0 },
        { x: 0.0, y: 1.0, z: 0.0 },
        { x: 0.0, y: 0.0, z: 0.0 }
      ),
      new Triangle(
        { x: 0.0, y: 1.0, z: 0.0 },
        { x: 0.0, y: 1.0, z: 1.0 },
        { x: 1.0, y: 1.0, z: 1.0 }
      ),
      new Triangle(
        { x: 0.0, y: 1.0, z: 0.0 },
        { x: 1.0, y: 1.0, z: 1.0 },
        { x: 1.0, y: 1.0, z: 0.0 }
      ),
      new Triangle(
        { x: 1.0, y: 0.0, z: 1.0 },
        { x: 0.0, y: 0.0, z: 1.0 },
        { x: 0.0, y: 0.0, z: 0.0 }
      ),
      new Triangle(
        { x: 1.0, y: 0.0, z: 1.0 },
        { x: 0.0, y: 0.0, z: 0.0 },
        { x: 1.0, y: 0.0, z: 0.0 }
      ),
    ];

    // Projection matrix setup for converting 3D coordinates to 2D screen space
    const fNear = 0.1;
    const fFar = 1000.0;
    const fFov = 90.0;
    const fAspectRatio = this.screenHeight / this.screenWidth;
    const fFovRad = 1.0 / Math.tan(((fFov * 0.5) / 180.0) * Math.PI);

    this.matProj[0][0] = fAspectRatio * fFovRad;
    this.matProj[1][1] = fFovRad;
    this.matProj[2][2] = fFar / (fFar - fNear);
    this.matProj[3][2] = (-fFar * fNear) / (fFar - fNear);
    this.matProj[2][3] = 1.0;
    this.matProj[3][3] = 0.0;
  }

  OnUserUpdate(fElapsedTime) {
    this.clearCanvas(); // Clear screen

    const matRotZ = new Mat4x4();
    const matRotX = new Mat4x4();
    this.fTheta += 1.0 * fElapsedTime;

    // Set up rotation matrix for Z-axis
    matRotZ[0][0] = Math.cos(this.fTheta);
    matRotZ[0][1] = Math.sin(this.fTheta);
    matRotZ[1][0] = -Math.sin(this.fTheta);
    matRotZ[1][1] = Math.cos(this.fTheta);
    matRotZ[2][2] = 1;
    matRotZ[3][3] = 1;

    // Set up rotation matrix for X-axis
    matRotX[0][0] = 1;
    matRotX[1][1] = Math.cos(this.fTheta * 0.5);
    matRotX[1][2] = Math.sin(this.fTheta * 0.5);
    matRotX[2][1] = -Math.sin(this.fTheta * 0.5);
    matRotX[2][2] = Math.cos(this.fTheta * 0.5);
    matRotX[3][3] = 1;

    // Process each triangle in the mesh
    for (const tri of this.meshCube.tris) {
      const triRotatedZ = new Triangle({}, {}, {});
      const triRotatedZX = new Triangle({}, {}, {});
      const triProjected = new Triangle({}, {}, {});

      // Rotate triangle in Z-axis
      this.MultiplyMatrixVector(tri[0], triRotatedZ[0], matRotZ);
      this.MultiplyMatrixVector(tri[1], triRotatedZ[1], matRotZ);
      this.MultiplyMatrixVector(tri[2], triRotatedZ[2], matRotZ);

      // Rotate triangle in X-axis
      this.MultiplyMatrixVector(triRotatedZ[0], triRotatedZX[0], matRotX);
      this.MultiplyMatrixVector(triRotatedZ[1], triRotatedZX[1], matRotX);
      this.MultiplyMatrixVector(triRotatedZ[2], triRotatedZX[2], matRotX);

      // Translate triangle along Z-axis to create depth
      const triTranslated = triRotatedZX;
      triTranslated[0].z += 3.0;
      triTranslated[1].z += 3.0;
      triTranslated[2].z += 3.0;

      // Calculate triangle normal
      const normal = new Vec3d();
      const line1 = new Vec3d();
      const line2 = new Vec3d();

      line1.x = triTranslated[1].x - triTranslated[0].x;
      line1.y = triTranslated[1].y - triTranslated[0].y;
      line1.z = triTranslated[1].z - triTranslated[0].z;

      line2.x = triTranslated[2].x - triTranslated[0].x;
      line2.y = triTranslated[2].y - triTranslated[0].y;
      line2.z = triTranslated[2].z - triTranslated[0].z;

      normal.x = line1.y * line2.z - line1.z * line2.y;
      normal.y = line1.z * line2.x - line1.x * line2.z;
      normal.z = line1.x * line2.y - line1.y * line2.x;

      const len = Math.sqrt(
        normal.x * normal.x + normal.y * normal.y + normal.z * normal.z
      );
      normal.x /= len;
      normal.y /= len;
      normal.z /= len;

      // Skip triangle if it is not front facing
      if (
        normal.x * (triTranslated[0].x - this.vCamera.x) +
          normal.y * (triTranslated[0].y - this.vCamera.y) +
          normal.z * (triTranslated[0].z - this.vCamera.z) <
        0
      ) {
        // Project the translated triangle from 3D space to 2D screen space
        this.MultiplyMatrixVector(
          triTranslated[0],
          triProjected[0],
          this.matProj
        );
        this.MultiplyMatrixVector(
          triTranslated[1],
          triProjected[1],
          this.matProj
        );
        this.MultiplyMatrixVector(
          triTranslated[2],
          triProjected[2],
          this.matProj
        );

        // Scale into view by adjusting to screen space coordinates
        for (let i = 0; i < 3; i++) {
          triProjected[i].x =
            (triProjected[i].x + 1.0) * 0.5 * this.screenWidth;
          triProjected[i].y =
            (triProjected[i].y + 1.0) * 0.5 * this.screenHeight;
        }

        // Draw the triangle on the canvas
        this.FillTriangle(triProjected, this.colors.primary);
        this.DrawTriangle(triProjected, this.colors.line);
      }
    }
  }

  MultiplyMatrixVector(i, o, m) {
    o.x = i.x * m[0][0] + i.y * m[1][0] + i.z * m[2][0] + m[3][0];
    o.y = i.x * m[0][1] + i.y * m[1][1] + i.z * m[2][1] + m[3][1];
    o.z = i.x * m[0][2] + i.y * m[1][2] + i.z * m[2][2] + m[3][2];
    const w = i.x * m[0][3] + i.y * m[1][3] + i.z * m[2][3] + m[3][3];

    if (w !== 0.0) {
      o.x /= w;
      o.y /= w;
      o.z /= w;
    }
  }

  Start() {
    this.OnUserCreate(); // Initial setup

    const tickDelay = 1000 / this.tickRate;
    let lastTime = Date.now();

    // Main loop
    this.engineInterval = setInterval(() => {
      const currentTime = Date.now();
      const fElapsedTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      this.OnUserUpdate(fElapsedTime);
    }, tickDelay);
  }

  Stop() {
    clearInterval(this.engineInterval);
  }
}

// Initialize and start the 3D engine
function main() {
  const engine = new Engine3D({
    screenWidth: 900,
    screenHeight: 900,
    appName: "3D Demo",
    tickRate: 124,
  });
  engine.Start();
}

main();

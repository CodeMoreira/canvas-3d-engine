# 3D Engine Explanation

This project is a basic 3D graphics engine built from scratch in JavaScript. It showcases the fundamental algorithms and calculations needed to render 3D objects onto a 2D screen. Here’s a brief explanation of how it works and the key components involved.

## How a 3D Engine Works

A 3D engine takes objects defined in 3D space (with `x`, `y`, and `z` coordinates) and projects them onto a 2D screen, simulating depth and perspective. This involves a series of mathematical transformations and algorithms to calculate how each point in 3D space should appear on a 2D plane. Here’s a breakdown of the main steps:

### 1. Defining 3D Objects with Triangles
3D objects are represented as **meshes** made up of **triangles**. Triangles are the simplest polygon and are used extensively in 3D rendering because they are easy to work with mathematically. Each triangle is defined by three vertices, each with `x`, `y`, and `z` coordinates.

```javascript
const cubeMesh = [
    new Triangle([0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [1.0, 1.0, 0.0]),
    // More triangles defining the other faces of the cube
];
```

Each triangle is stored in the `Mesh` class and used in rendering. The vertices are transformed and projected each frame.

### 2. Transformations: Rotation and Translation
Before projecting a 3D object onto the screen, the engine applies transformations to manipulate the object's position and orientation:

- **Rotation**: Rotates the object around the X, Y, or Z axis. This is done using **rotation matrices**, which are used to calculate the new positions of each vertex after rotation.
- **Translation**: Moves the object along the X, Y, or Z axis. This is essential for positioning the object relative to the camera.

#### Example of a Rotation Matrix Calculation:
A rotation matrix for rotating around the Z-axis looks like this:
```javascript
matRotZ[0][0] = Math.cos(theta);
matRotZ[0][1] = Math.sin(theta);
matRotZ[1][0] = -Math.sin(theta);
matRotZ[1][1] = Math.cos(theta);
```
Each vertex of the triangle is multiplied by this matrix to calculate its rotated position.

### 3. Projection: Converting 3D to 2D
The projection step transforms 3D points into 2D points on the screen, giving the illusion of depth and perspective. This engine uses a **perspective projection matrix**, which scales objects so they appear smaller as they move further away from the camera.

#### Perspective Projection Matrix Calculation:
The matrix used for perspective projection ensures that objects farther from the camera appear smaller, simulating depth:
```javascript
const fFovRad = 1.0 / Math.tan(fov * 0.5 * (Math.PI / 180));
matProj[0][0] = aspectRatio * fFovRad;
matProj[1][1] = fFovRad;
matProj[2][2] = far / (far - near);
matProj[3][2] = (-far * near) / (far - near);
matProj[2][3] = 1.0;
```

### 4. Lighting: Calculating Light Intensity
The engine calculates basic lighting based on the **triangle's normal vector** and the direction of the light source. The **normal vector** is perpendicular to the triangle's surface and is calculated using the **cross product** of two edges of the triangle. By taking the **dot product** of the normal vector and a light direction vector, we determine the angle between them, which controls the brightness of the triangle.

#### Lighting Calculation:
```javascript
// Cross product to get the normal vector
normal.x = line1.y * line2.z - line1.z * line2.y;
normal.y = line1.z * line2.x - line1.x * line2.z;
normal.z = line1.x * line2.y - line1.y * line2.x;

// Dot product for lighting intensity
lightIntensity = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
```

### 5. Painter’s Algorithm: Sorting Triangles for Correct Rendering Order
To ensure that triangles at the back of the object are drawn before those in front, this engine uses the **Painter's Algorithm**. This algorithm sorts triangles by their depth (average `z` coordinate) and renders them from back to front. This avoids visual artifacts where closer triangles are incorrectly drawn behind farther ones.

#### Painter’s Algorithm Sorting:
```javascript
triangles.sort((a, b) => {
    const z1 = (a.p[0].z + a.p[1].z + a.p[2].z) / 3;
    const z2 = (b.p[0].z + b.p[1].z + b.p[2].z) / 3;
    return z2 - z1;
});
```

### Summary of Key Calculations and Algorithms

- **Rotation Matrix**: Rotates points around an axis.
- **Projection Matrix**: Converts 3D coordinates to 2D with depth perspective.
- **Normal Calculation**: Determines the angle of a surface relative to a light source.
- **Dot Product**: Used for lighting to find the brightness of surfaces.
- **Painter’s Algorithm**: Ensures correct rendering order of triangles based on depth.

This project is a fun exploration of 3D graphics basics, showing how complex rendering engines are built from simple mathematical foundations.

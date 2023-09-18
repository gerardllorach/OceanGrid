// Use VS plugin "Comment tagged templates" and add /* glsl */
export const myVertShader = /* glsl */ `

precision lowp float;


void main() {
    // Buffer geometry
    // position
    // normal
    // uv

    // Built-in uniforms
    // modelMatrix = object.matrixWorld
    // projectionMatrix = camera.projectionMatrix
    // modelViewMatrix = camera.matrixWorldInverse * object.matrixWorld
    // viewMatrix = camera.matrixWorldInverse
    // cameraPosition = camera position in world space

    // Screen space position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`




export const myFragShader = /* glsl */ `

precision lowp float;

// cameraPosition
// viewMatrix


void main() {


    // Output color
    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}
`
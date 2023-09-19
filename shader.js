// https://threejs.org/docs/index.html#api/en/materials/ShaderMaterial
// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram -- cameraPosition matrices etc...
// https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html
// https://www.khronos.org/files/opengles_shading_language.pdf
// https://registry.khronos.org/OpenGL/specs/es/2.0/GLSL_ES_Specification_1.00.pdf // For WebGL




// Use VS plugin "Comment tagged templates" and add /* glsl */
export const myVertShader = /* glsl */ `

#define distanceFromCamera 5.0
precision lowp float;

uniform mat4 u_cameraModelMatrix;
uniform vec3 u_cameraGridPosition;
uniform vec2 u_cameraViewportScale;


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

    
    // Scale the vertices to fall inside the viewport
    vec3 scaledPosition = position;
    scaledPosition.x = position.x * u_cameraViewportScale.x;
    scaledPosition.y = position.y * u_cameraViewportScale.y * 1.0;

    // Move vertex according to camera model matrix
    vec4 posCamMatrix = u_cameraModelMatrix * vec4(scaledPosition, 1.0);
    if (posCamMatrix.w != 0.0) // Homogeneous division if needed
        posCamMatrix = posCamMatrix / posCamMatrix.w;
    // Extract forward vector from camera
    mat3 orientationMatrix = mat3(u_cameraModelMatrix);
    vec3 forwardCameraVector = -orientationMatrix[2];
    // Move vertices forward
    vec3 posFrontCamera = vec3(posCamMatrix) + normalize(forwardCameraVector) * distanceFromCamera;


    // Project vertex in the XZ plane
    // Calculate intersection between plane and camera ray
    vec3 ray = normalize(posFrontCamera - u_cameraGridPosition);
    // Ray is not parallel to the horizon
    float t = -1.0;
    if (ray.y != 0.0)
        t = (0.0 - u_cameraGridPosition.y) / ray.y;

    // Intersection point
    vec3 intersectionPoint = u_cameraGridPosition + ray * t;

    // HACK -> if cameraForward is opposite from ray direction, move intersection point on the opposite side
    // TODO: this method assumes that the camera is close to the center 0,0,0
    vec3 ray2 = normalize(intersectionPoint - u_cameraGridPosition);
    float dotResult = dot(forwardCameraVector, ray2);
    if (dotResult < 0.0)
        intersectionPoint = intersectionPoint * -1.0;


    // Screen space position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(intersectionPoint, 1.0); // Position on the XZ plane
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(vec3(posFrontCamera), 1.0); // Position in front of the camera
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Default geometry
}
`




export const myFragShader = /* glsl */ `

precision lowp float;

// cameraPosition
// viewMatrix


void main() {


    // Output color
    gl_FragColor = vec4(1.0, 1.0, 0.0, 0.7);
}
`
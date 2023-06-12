varying vec2 vUv;
varying vec3 vPosition;
varying vec3 eyeVector;
varying vec3 vNormal;


void main() {
    vUv = uv;

    vPosition = position.xyz;
    vec4 worldPosition = modelMatrix *  vec4(position, 1.0);

    vNormal = normal;
    eyeVector = normalize(worldPosition.xyz - cameraPosition);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
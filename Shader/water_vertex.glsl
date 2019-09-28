varying vec4 clipSpace;
varying vec4 worldPosition;
varying vec2 vUV;
varying vec3 fromFragmentToCamera;

uniform vec3 lightPosition;
uniform vec3 eyePosition;

const float tiling = 4.0;

void main() {
	vUV = uv;

	worldPosition = modelViewMatrix * vec4(position, 1.0);

	clipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	fromFragmentToCamera = eyePosition - worldPosition.xyz;

	gl_Position = clipSpace;
}
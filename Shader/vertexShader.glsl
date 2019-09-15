varying vec4 clipSpace;
varying vec4 worldPosition;
varying vec2 vUV;
varying vec3 L;
varying vec3 V;

// attribute vec3 tangent;
attribute vec3 bitangent;

attribute vec3 tangent;

uniform vec3 lightPosition;
uniform vec3 eyePosition;

void main() {
	vUV = uv;

	vec3 tangent2 = tangent;
	vec3 normal2 = normal;

	

	worldPosition = modelViewMatrix * vec4(position, 1.0);

	clipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	gl_Position = clipSpace;
}
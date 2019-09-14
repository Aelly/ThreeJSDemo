varying vec4 clipSpace;
varying vec4 worldPosition;
varying vec2 vUV;

void main()
{
	vUV = uv;

	worldPosition = modelViewMatrix * vec4(position, 1.0);

    clipSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	gl_Position = clipSpace;
}
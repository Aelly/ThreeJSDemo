varying vec4 worldPosition;
varying vec4 clipSpace;

void main()
{
	worldPosition = modelViewMatrix * vec4(position, 1.0);

    clipSpace = projectionMatrix * worldPosition;

	gl_Position = clipSpace;
}
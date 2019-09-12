varying vec4 worldPosition;

void main()
{
	worldPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * worldPosition;
}
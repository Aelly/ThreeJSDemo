varying vec4 clipSpace;

uniform sampler2D reflectionTexture;

void main(){
    vec2 ndc = (clipSpace.xy / clipSpace.w)/2.0 + 0.5;
    vec2 reflectTextCoords = vec2(ndc.x, 1.0-ndc.y);

    vec4 reflectColor = texture2D(reflectionTexture, reflectTextCoords);

    gl_FragColor = reflectColor;
}
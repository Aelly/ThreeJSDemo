uniform sampler2D normalSampler;
uniform sampler2D reflectionTexture;

uniform vec3 sunDirection;
uniform vec3 eyePosition;
uniform float time;

varying vec4 clipSpace;
varying vec4 worldPosition;
varying vec2 vUV;

varying vec3 L;
varying vec3 V;

vec3 sunColor = vec3(1.0, 1.0, 1.0);

void main() {
    vec2 ndc = (clipSpace.xy / clipSpace.w) / 2.0 + 0.5;
    vec2 reflectTextCoords = vec2(ndc.x, 1.0 - ndc.y);
    vec3 reflectColor = vec3(texture2D(reflectionTexture, reflectTextCoords));

    vec4 normalMapValue = 2.0 * texture2D(normalSampler, vUV, -1.0) - 1.0;

    vec3 unitNormal = normalize(normalMapValue.rgb);
    vec3 unitVectorToCamera = normalize(V);

    vec3 totalDiffuse = vec3(0.0);
    vec3 totalSpecular = vec3(0.0);

    float distance = length(L);
    vec3 unitLightVector = normalize(L);
    float nDotl = dot(unitNormal, unitLightVector);
    float brightness = max(nDotl, 0.0);

    totalDiffuse = vec3(0.5, 0.5, 0.5) + totalDiffuse + (brightness * vec3(1,1,1));

    vec3 color = vec3(0.3, 0.5, 0.9);
    gl_FragColor = vec4(totalDiffuse, 1.0) ;
    // if (reflectColor.x == 0.0 && reflectColor.y == 0.0 && reflectColor.z == 0.0) {
    //     gl_FragColor = vec4(color, 1.0);
    // } else {
    //     gl_FragColor = vec4(reflectColor, 1.0);
    // }
}
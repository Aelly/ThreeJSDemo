uniform sampler2D normalSampler;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
uniform sampler2D dudvTexture;

uniform vec3 lightPosition;
uniform vec3 eyePosition;
uniform float time;

uniform float waterDistortionStrength;
uniform float waterReflectivity;

const float fresnelStrength = 1.0;

varying vec4 clipSpace;
varying vec4 worldPosition;
varying vec2 vUV;
varying vec3 fromFragmentToCamera;

vec3 sunColor = vec3(1.0, 1.0, 1.0);
vec4 shallowWaterColor =  vec4(0.0, 0.1, 0.3, 1.0);

const float shineDamper = 20.0;

vec3 getNormal(vec2 textureCoords) {
    vec4 normalMapColor = texture2D(normalSampler, vec2(vUV.x + time, vUV.y + time));
    float makeNormalPointUpwardsMore = 2.6;
    vec3 normal = vec3(
      normalMapColor.r * 2.0 - 1.0,
      normalMapColor.b * makeNormalPointUpwardsMore,
      normalMapColor.g * 2.0 - 1.0
    );
    normal = normalize(normal);

    return normal;
}

void main() {
    vec3 sunDirection = vec3(-lightPosition.x, -lightPosition.y, -lightPosition.z);

    // Normalized device corrdinates (0 - 1)
    vec2 ndc = (clipSpace.xy / clipSpace.w) / 2.0 + 0.5;

    vec2 refractTexCoords = vec2(ndc.x, ndc.y);
    // Reflections are upside down
    vec2 reflectTexCoords = vec2(ndc.x, 1.0 - ndc.y);

    vec2 distortedTexCoords = texture2D(dudvTexture, vec2(fract(vUV.x + time), vUV.y)).rg * 0.1;
    distortedTexCoords = vUV + vec2(distortedTexCoords.x, fract(distortedTexCoords.y + time));
    vec2 totalDistortion = (texture2D(dudvTexture, distortedTexCoords).rg * 2.0 - 1.0)
     * waterDistortionStrength;

    refractTexCoords += totalDistortion;
    reflectTexCoords += totalDistortion;

    vec4 reflectionColor = texture2D(reflectionTexture, reflectTexCoords);
    vec4 refractionColor = texture2D(refractionTexture, refractTexCoords);

    vec3 toCamera = normalize(fromFragmentToCamera);
    vec3 normal = getNormal(distortedTexCoords);
    // Fresnel Effect. Looking at the water from above makes the water more transparent.
    float refractiveFactor = dot(toCamera, normal);
    // A higher fresnelStrength makes the water more reflective since the
    // refractive factor will decrease
    refractiveFactor = pow(refractiveFactor, fresnelStrength);

    vec3 reflectedLight = reflect(normalize(sunDirection), normal);
    float specular = max(dot(reflectedLight, toCamera), 0.0);
    specular = pow(specular, shineDamper);
    vec3 specularHighlights = sunColor * specular * waterReflectivity;

    gl_FragColor = mix(reflectionColor, refractionColor, refractiveFactor);
    gl_FragColor = mix(gl_FragColor, shallowWaterColor, 0.2) + vec4(specularHighlights, 0.0);
}


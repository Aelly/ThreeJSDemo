uniform sampler2D normalSampler;
uniform sampler2D reflectionTexture;

uniform vec3 sunDirection;
uniform vec3 eyePosition;
uniform float time;

varying vec4 clipSpace;

vec3 sunColor = vec3(1.0, 1.0, 1.0);

vec4 getNoise(vec2 uv){
    vec2 uv0 = (uv/103.0)+vec2(time/17.0, time/29.0);
    vec2 uv1 = uv/107.0-vec2(time/-19.0, time/31.0);
    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(time/101.0, time/97.0);
    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(time/109.0, time/-113.0);
    vec4 noise = (texture2D(normalSampler, uv0)) +
                 (texture2D(normalSampler, uv1)) +
                 (texture2D(normalSampler, uv2)) +
                 (texture2D(normalSampler, uv3));
    return noise*0.5-1.0;
}

void sunLight(const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse,
              inout vec3 diffuseColor, inout vec3 specularColor){
    vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));
    float direction = max(0.0, dot(eyeDirection, reflection));
    specularColor += pow(direction, shiny)*sunColor*spec;
    diffuseColor += max(dot(sunDirection, surfaceNormal),0.0)*sunColor*diffuse;
}

void main() {
    vec2 ndc = (clipSpace.xy / clipSpace.w)/2.0 + 0.5;
    vec2 reflectTextCoords = vec2(ndc.x, 1.0-ndc.y);

    vec4 reflectColor = texture2D(reflectionTexture, reflectTextCoords);

    vec4 eye = vec4(eyePosition, 1.0);
    
    vec4 noise = getNoise(clipSpace.xz);
    vec3 surfaceNormal = normalize(noise.xzy*vec3(2.0, 1.0, 2.0));

    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);

    vec3 worldToEye = (eye-clipSpace).xyz;
    vec3 eyeDirection = normalize(worldToEye);

    sunLight(surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuse, specular);

    gl_FragColor = reflectColor;
	// gl_FragColor = vec4((diffuse+specular+vec3(0.1))*vec3(0.3, 0.5, 0.9), 1.0);
}


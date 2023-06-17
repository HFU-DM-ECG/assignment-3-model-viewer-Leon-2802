// Source for getting the lights: https://www.maya-ndljk.com/blog/threejs-basic-toon-shader

#include <common>
#include <lights_pars_begin>

varying vec3 vPosition;
varying vec3 eyeVector;
varying vec3 vNormal;

uniform float strength;
uniform float detail;
uniform vec4 color;
uniform float brightness;



// calculates brightness values according to angle between normal of the vertex and the vector of the "eye" -> camera
// values are brighter the bigger the angle
float Fresnel(vec3 eyeVector, vec3 worldNormal) {
    return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}


// results in fragment being fully illuminated if angle to light is below
float Toon(vec3 normal, vec3 lightDir) 
{
    float NdotL = max(0.0, dot(normalize(normal), normalize(lightDir)));

    return floor(NdotL/detail);
}


void main() {
    float fres = Fresnel(eyeVector, vNormal);

    vec4 color = Toon(vNormal, directionalLights[0].direction) * strength + color + brightness;
    gl_FragColor = vec4(mix(color, vec4(fres), 0.2));
}


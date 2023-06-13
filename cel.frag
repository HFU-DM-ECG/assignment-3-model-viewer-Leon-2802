struct PointLight {
    vec3 position;
    vec3 color;
    float strength;
};

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 eyeVector;
varying vec3 vNormal;

uniform sampler2D texture1;
uniform PointLight[8] lights;

// calculates brightness values according to angle between normal of the vertex and the vector of the "eye" -> camera
// values are brighter the bigger the angle
float Fresnel(vec3 eyeVector, vec3 worldNormal) {
    return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

vec3 brightnessToColor(float b) {
    b *= 0.25;
    //assign brightness value to the different color channels
    //brightness to the power of 2 leads to a smaller value, bc the value is always between 0 and 1
    //for the color of the sun, red should get the highest value, green a smaller one and blue should be almost zero
    return (vec3(b, b*b, b*b*b*b) / 0.25) * 0.8;
}

vec3 calculatePointLight(int i) {
    //geometric data
    vec3 fragmentLight = normalize(lights[i].position - vPosition);

    //get lighting level
    float level = max(0.0, dot(vNormal, fragmentLight));
    //quantize level into n levels
    level = floor(level * 2.) / 2.0;
    vec3 result = lights[i].color * level;

    return result;
}

void main() {
    float fres = Fresnel(eyeVector, vNormal);
    // vec3 color = brightnessToColor(fres);

    //ambient
    vec3 temp = vec3(0.2);

    //Lighting
    for(int i=0; i < 8; i++) {
        temp += calculatePointLight(i);
    }

    vec4 tex = texture2D(texture1, vUv);

    // vec3 color = tex.rgb + temp;
    vec3 color = temp;
    color = color + fres;

    gl_FragColor = vec4(vec3(fres), 1.0);
    // gl_FragColor = vec4(color, tex.a);
}


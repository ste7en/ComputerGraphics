#version 300 es
precision mediump float;

in vec3 fs_pos;
in vec3 fs_norm;
out vec4 outColor;

uniform vec3 u_lightPos;
uniform vec3 u_eyeDirVec;
uniform vec4 u_diffLightColor;
uniform vec4 u_specLightColor;
uniform vec4 u_color;

void main() {
    // Light computation through Lambert diffusion and Phong specular
    vec3 nLightDirection = normalize(u_lightPos - fs_pos);
    float SpecShine = 0.2;

    vec4 diffTerm = u_diffLightColor * u_color * clamp(dot(nLightDirection, fs_norm), 0.0, 1.0);
    vec3 reflTerm = -reflect(nLightDirection, fs_norm);
    vec4 specTerm = u_specLightColor * u_color * pow(clamp(dot(u_eyeDirVec, reflTerm), 0.0, 1.0), SpecShine);

    outColor = vec4(clamp(diffTerm + specTerm, 0.0, 1.0).rgb, 1.0);
}
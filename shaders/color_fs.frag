#version 300 es
precision mediump float;

in vec3 fs_pos;
in vec3 fs_norm;
out vec4 outColor;

uniform vec3 u_lightPos;
uniform vec4 u_lightColor;
uniform vec4 u_color;

void main() {
    // Light computation through Lambert diffusion
    vec3 nLightDirection = normalize(u_lightPos - fs_pos);

    vec4 diffTerm = u_lightColor * u_color * clamp(dot(nLightDirection, fs_norm), 0.0, 1.0);

    outColor = vec4(diffTerm.rgb, 1.0);
}
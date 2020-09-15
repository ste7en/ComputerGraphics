#version 300 es
precision mediump float;

out vec4 outColor;

uniform vec4 u_color;

void main() {
    outColor = u_color;
}
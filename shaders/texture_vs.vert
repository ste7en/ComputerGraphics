#version 300 es

in vec3 a_position; //in = attribute, we need a vertex buffer object
in vec2 a_texcoord;
out vec2 uv_fs; //don't need the buffer object because we initialize it in here

uniform mat4 u_worldViewProjection;

void main() {
  uv_fs = a_texcoord;
  gl_Position = (u_worldViewProjection * vec4(a_position, 1.0));
}
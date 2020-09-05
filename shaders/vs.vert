#version 300 es

in vec3 a_position; //in = attribute, we need a vertex buffer object
in vec2 a_uv;

out vec2 uv_fs; //don't need the buffer object because we initialize it in here

uniform mat4 matrix;

void main() {
  uv_fs = a_uv;
  gl_Position = matrix * vec4(a_position, 1.0); //la posizione dipenderà dalla matrice (ci serve per far muovere le cose)
}
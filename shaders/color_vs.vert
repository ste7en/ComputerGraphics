#version 300 es

in vec4 a_position; //in = attribute, we need a vertex buffer object

uniform mat4 u_worldViewProjection;

void main() {
  gl_Position = u_worldViewProjection * a_position; //la posizione dipenderà dalla matrice (ci serve per far muovere le cose)
}
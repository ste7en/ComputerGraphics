#version 300 es

in vec3 a_position; //in = attribute, we need a vertex buffer object

uniform mat4 u_worldViewProjection;

void main() {
  gl_Position = u_worldViewProjection * vec4(a_position, 1.0); //la posizione dipenderà dalla matrice (ci serve per far muovere le cose)
}
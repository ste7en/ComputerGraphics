#version 300 es

in vec3 a_position; //in = attribute, we need a vertex buffer object
in vec3 a_normal;
out vec3 fs_pos;
out vec3 fs_norm;

uniform mat4 u_worldViewProjection;
uniform mat4 u_vertexMatrix;
uniform mat4 u_normalMatrix;

void main() {
  fs_norm = mat3(u_normalMatrix) * a_normal;
  fs_pos = (u_vertexMatrix * vec4(a_position, 1.0)).xyz;
  gl_Position = u_worldViewProjection * vec4(a_position, 1.0); //la posizione dipenderà dalla matrice (ci serve per far muovere le cose)
}
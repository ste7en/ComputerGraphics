#version 300 es
precision mediump float;

in vec2 fs_uv;
in vec3 fs_pos;
in vec3 fs_norm;

out vec4 outColor;

uniform sampler2D u_texture;
uniform sampler2D u_normalMap;
uniform vec3 u_lightPos;

void main() { 
  // On-the fly computation of geometrical normal
  vec3 X = dFdx(fs_pos); 
  vec3 Y = dFdy(fs_pos);
  vec3 n_norm = normalize(cross(X, Y)); //TODO: check if the result is the same of using objects' vertex normals
  // n_norm = normalize(fs_norm);

  // On-the fly computation of tangent and bi-normal:
  //// First the way in which both the coordinates of the 
  //// triangle and the UV changes on screen are determined.

  vec3 p_dx = X; //dFdx(fs_pos);
  vec3 p_dy = Y; //dFdy(fs_pos);

  vec2 tc_dx = dFdx(fs_uv);
  vec2 tc_dy = dFdy(fs_uv);

  //// Then the direction of the U axis, which corresponds to 
  //// the tangent direction, is transformed in world space 
  //// exploiting the vectors previously computed.
  vec3 t = (tc_dy.y * p_dx - tc_dx.y * p_dy) / (tc_dx.x * tc_dy.y - tc_dy.x * tc_dx.y);
  
  //// Exploiting the cross product and the computed vectors,
  //// the orthogonal version of the tangent and bitangent are
  //// computed, as for the case in which tangents are attached to vertexes.
  t = normalize(t - n_norm * dot(n_norm, t));

  vec3 b = normalize(cross(n_norm, t));

  //// Finally, the tangent transform matrix (TBN)
  mat3 tbn =  mat3(t, b, n_norm);

  vec4 textnm = texture(u_normalMap, fs_uv);
  vec3 nmNormal = textnm.rgb * 2.0 - vec3(1.0, 1.0, 1.0);
  vec3 n = normalize(tbn * nmNormal);

  // Light computation through Lambert diffusion
  // and texture color
  vec4 textcol = texture(u_texture, fs_uv);
  vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);
  vec3 nLightDirection = normalize(-u_lightDirection);
  vec3 nLightDirection = normalize(u_lightPos - fs_pos);

  vec4 diffTerm = lightColor  * textcol * clamp(dot(nLightDirection, n), 0.0, 1.0);

  outColor = vec4(diffTerm.rgb, 1.0);
}
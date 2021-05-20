
precision mediump float;

varying vec4 fColor;
varying vec3 fNormal; //++++++
varying vec3 fWorldPosition;
varying vec2 fTextureCoords;
varying vec3 viewDirection;

uniform sampler2D uTexture;
uniform bool useTexture;
uniform vec3 cameraPosition;

// global
uniform vec3 lightColor;
uniform bool isDirection;
varying vec3 lightDirection;


// Per object
uniform float shininessConstant;
uniform float ambientConstant;
uniform float specularConstant;
uniform float diffuseConstant;

void main()
{

    vec3 surfaceNormal = normalize(fNormal);
    vec3 normalViewDirection = normalize(viewDirection);

    float normalDotLightDirection = max(dot(surfaceNormal, lightDirection), 0.0);
    float specular = 0.0;
    if(normalDotLightDirection > 0.0){
        vec3 reflection = 2.0 * normalDotLightDirection * surfaceNormal - lightDirection;
        specular = pow(max(dot(normalViewDirection, reflection),0.0),shininessConstant);
        //specular = pow(max(dot(normalViewDirection, reflection),0.0),1.0);
    }
    
    //float finalIntensity = ambientConstant + diffuseConstant * normalDotLightDirection + specularConstant * specular;
    float finalIntensity =  ambientConstant + diffuseConstant * normalDotLightDirection + specularConstant * specular;
    finalIntensity = max(min(finalIntensity,1.0),0.0);
    vec3 intensityVec3 = vec3(finalIntensity,finalIntensity,finalIntensity);

    float dist = length(cameraPosition - fWorldPosition);
    float alpha = 1.0 - dist / 40.0;
    
    //gl_FragColor = vec4(fColor.rgb * intensityVec3, max(min(alpha,1.0),0.0));
    gl_FragColor = vec4(fColor.rgb * intensityVec3, 1.0);
    //gl_FragColor = vec4(intensityVec3,1.0); 
    //gl_FragColor = vec4(fColor.rgb,1.0); 
    if(useTexture){
        gl_FragColor = texture2D(uTexture, fTextureCoords);
        if(gl_FragColor.a < .5) discard;
    }

   

}

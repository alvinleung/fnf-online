import { glEnumToString } from "twgl.js";

let printCount = 0;
export function printProgramInfo(gl:WebGLRenderingContext,program:WebGLProgram){
  if(printCount < 1){
    
    let log = "";
    log+= "Attributes\n"
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let ii = 0; ii < numAttribs; ++ii) {
      const attribInfo = gl.getActiveAttrib(program, ii);
      const index = gl.getAttribLocation(program, attribInfo.name);
      log+="\t";
      log += index + ":";
      log += attribInfo.name;
      log += " [" + glEnumToString(gl,attribInfo.type) + "]\n"
    }

    log+= "Uniforms\n"
    const numUniform = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let ii = 0; ii < numUniform; ++ii) {
      const uniformInfo = gl.getActiveUniform(program, ii);
      const index = gl.getUniformLocation(program, uniformInfo.name);
      log+="\t";
      log += ii + ":"
      log += uniformInfo.name;
      log += " [" + glEnumToString(gl,uniformInfo.type) + "]\n"
    }
    console.log(log)

    printCount++;
  }
}


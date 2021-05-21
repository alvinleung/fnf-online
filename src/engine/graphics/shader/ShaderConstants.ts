export namespace ShaderConstants {
  // variable storage qualifier -> variable type

  // attributes
  export enum ATTRIBUTE {
    FLOAT_VEC2 = 100,
    FLOAT_VEC3,
    FLOAT_VEC4,
  }
  // materials
  export enum UNIFORM {
    FLOAT_VEC3 = 200,
    FLOAT_VEC4,
    FLOAT_MAT4,
    FLOAT,
    BOOL,
    SAMPLER_2D,
  }
  export enum GEOMETRY {
    // geometry
    VERTICES = "vPosition",
    NORMALS = "vNormal",
    TEXCOORDS = "vTextureCoords",
    MODEL_MATRIX = "modelMatrix",
    VIEW_MATRIX = "viewMatrix",
    PROJECTION_MATRIX = "projectionMatrix",
  }
  // translation for webglEnum
  // https://developer.mozilla.org/en-US//docs/Web/API/WebGL_API/Constants
  const webGLenumMapLocal = {
    0x8b51: "FLOAT_VEC3",
    0x8b52: "FLOAT_VEC4",
    0x8b50: "FLOAT_VEC2",
    0x8b5c: "FLOAT_MAT4",
    0x8b56: "BOOL",
    0x1406: "FLOAT",
    0x1404: "INT",
    0x8b54: "INT_VEC3",
    0x8b5e: "SAMPLER_2D",
  };
  /**
   * Since Webgl types Enum does not distingush between attribute or unifrom, this function is used to translate (webglenum,attrib/unfirom) ,into a single enum
   * @param glEnum a webgl enum according to  // https://developer.mozilla.org/en-US//docs/Web/API/WebGL_API/Constants
   * @param enumType a namespace string of either "ATTRIBUTE" or "UNIFORM"
   * @returns local version of enum
   */
  export function resolveEnumFromGLType(glEnum: number, enumType: string) {
    const namespace = enumType.trim().toUpperCase();
    const enumName = webGLenumMapLocal[glEnum];
    if (!ShaderConstants[namespace]) {
      console.error("enum namespace not found: [" + enumType + "]");
      return null;
    }
    if (!enumName) {
      console.error(
        "enum: [" +
          glEnum +
          "] not supported yet, if this is a valid WebGL type, please contact the developers"
      );
      return null;
    } else if (!ShaderConstants[namespace][enumName]) {
      console.error(
        "enum: [" +
          glEnum +
          "] in namespace[" +
          namespace +
          "] not supported yet, if this is a valid WebGL type, please contact the developers"
      );
      return null;
    }
    return ShaderConstants[namespace][enumName];
  }
}

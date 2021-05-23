// Simple parse that only reads the vertex, normals and text coordinates from obj file
export function parseObjFileFormat(fileText) {
  // with reference to https://web.dev/read-files/

  // parsing referenced https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html

  // regular expression for parsing lines in format
  // type data data data ...
  const keywordRE = /(\w*)(?: )*(.*)/;

  const lines = fileText.split("\n");

  const vertices = [[0, 0, 0]];
  const textureCoords = [[0, 0]];
  const normals = [[0, 0, 0]];
  const faces = [];

  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const currentLine = lines[lineNo].trim();

    // skip empty and comments
    if (currentLine === "" || currentLine.startsWith("#")) {
      continue;
    }

    const match = keywordRE.exec(currentLine);

    if (!match) {
      continue;
    }

    // match in format
    // 'line of text', 'of text'
    //console.log(match)
    const rowType = match[1];
    const rowContent = match[2].split(" ");
    switch (rowType) {
      case "v":
        vertices.push([
          parseFloat(rowContent[0]),
          parseFloat(rowContent[1]),
          parseFloat(rowContent[2]),
        ]);
        break;
      case "vt":
        textureCoords.push([1 - parseFloat(rowContent[0]), parseFloat(rowContent[1])]);
        break;
      case "vn":
        normals.push([
          parseFloat(rowContent[0]),
          parseFloat(rowContent[1]),
          parseFloat(rowContent[2]),
        ]);
        break;
      case "f":
        faces.push([...rowContent]);
        break;
      default:
        continue;
    }
  }

  // find max in each direction and normailze model to between -1 and 1
  /*
  let max = 0;
  let min = 0;

  for (let i = 0; i < vertices.length; i++) {
    for (let j = 0; j < 3; j++) {
      if (vertices[i][j] > max) {
        max = vertices[i][0];
      }
      if (vertices[i][j] < min) {
        min = vertices[i][0];
      }
    }
  }
  const furthestValue = Math.max(Math.abs(max), Math.abs(min));
  for (var i = 0; i < vertices.length; i++) {
    for (var j = 0; j < 3; j++) {
      vertices[i][j] = vertices[i][j] / furthestValue;
    }
  }
*/
  // build object from face
  const objVertices = [];
  const objTextures = [];
  const objNormals = [];

  for (var faceNo = 0; faceNo < faces.length; faceNo++) {
    var currentFace = faces[faceNo];
    // construct face
    // If face has more than 3 vertices, treats it as a trianglur Fan
    // referenced parsing more than 3 vertices https://stackoverflow.com/questions/52824956/how-can-i-parse-a-simple-obj-file-into-triangles
    // https://en.wikipedia.org/wiki/Fan_triangulation
    // vertex 1

    for (var triangleNo = 0; triangleNo < currentFace.length - 2; triangleNo++) {
      // Same vertex through out tht face
      var vertOnePos = currentFace[0].split("/");
      objVertices.push(vertices[parseInt(vertOnePos[0])]);
      objTextures.push(textureCoords[parseInt(vertOnePos[1])]);
      objNormals.push(normals[parseInt(vertOnePos[2])]);

      // vertex n + 1
      var vertTwoPos = currentFace[triangleNo + 1].split("/");
      objVertices.push(vertices[parseInt(vertTwoPos[0])]);
      objTextures.push(textureCoords[parseInt(vertTwoPos[1])]);
      objNormals.push(normals[parseInt(vertTwoPos[2])]);

      // vertex n + 2
      var vertThree = currentFace[triangleNo + 2].split("/");
      objVertices.push(vertices[parseInt(vertThree[0])]);
      objTextures.push(textureCoords[parseInt(vertThree[1])]);
      objNormals.push(normals[parseInt(vertThree[2])]);
    }
  }

  const object = {
    vertices: objVertices,
    numVertices: objVertices.length,
    normals: objNormals,
    textures: objTextures,
  };
  return object;
}

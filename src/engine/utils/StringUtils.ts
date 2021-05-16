export function camelCaseToSentenceCase(text: string) {
  const result = text.replace(/([A-Z])/g, " $1");
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult;
}

/**
 * The ultimate split path.
 * Extracts dirname, filename, extension, and trailing URL params.
 * Correct handles:
 *   empty dirname,
 *   empty extension,
 *   random input (extracts as filename),
 *   multiple extensions (only extracts the last one),
 *   dotfiles (however, will extract extension if there is one)
 * @param  {string} path
 * @return {Object} Object containing fields "dirname", "filename", "extension", and "params"
 */
export function splitPath(path) {
  var result = path.replace(/\\/g, "/").match(/(.*\/)?(\..*?|.*?)(\.[^.]*?)?(#.*$|\?.*$|$)/);
  return {
    dirname: result[1] || "",
    filename: result[2] || "",
    extension: result[3] || "",
    params: result[4] || "",
  };
}

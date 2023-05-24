import { TestResult_TestError_StackFrame } from './index';

/**
 * Serializes a NodeJs error stack into a collection of consumable objects.
 * @param errStack - The stack property on a NodeJs Error.
 * @returns Serialized error stack frames which include properties
 *          functionName, fileName, lineNumber, columnNumber.
 */
export function serializeStack(
  errStack: string
): TestResult_TestError_StackFrame[] {
  if (!errStack) {
    return [];
  }

  const stack = errStack.split('\n');
  // removes first line with redundant error message, already
  // captured in err.message
  stack.shift();

  return stack.map((frameStr: string) => {
    const frame = frameStr.split('at ')[1];
    if (!frame) {
      // Frame is in an invalid format, this is defensive.
      return TestResult_TestError_StackFrame.create();
    }
    const locationParansRegex = /\(([^)]+)\)/;
    const locationInParens = locationParansRegex.exec(frame);

    if (locationInParens) {
      // if regex passed, location will be found at
      // [1] index. If so, then there is a function
      // name prefix
      return TestResult_TestError_StackFrame.fromJSON({
        function_name: frame.split(locationInParens[0])[0].trim(),
        ...serializeLocation(locationInParens[1]),
      });
    }
    return TestResult_TestError_StackFrame.fromJSON({
      function_name: undefined,
      ...serializeLocation(frame),
    });
  });
}

/**
 * Serializes the location of an error which takes one of the following forms:
 * * native, if the frame represents a call internal to V8 (as in [].forEach).
 * * plain-filename.js:line:column, if the frame represents a call internal to
 *   Node.js.
 * * /absolute/path/to/file.js:line:column, if the frame represents a call in
 * a user program (using CommonJS module system), or its dependencies.
 * * <transport-protocol>:///url/to/module/file.mjs:line:column, if the frame
 *   represents a call in a user program (using ES module system), or its
 *   dependencies.
 * @param location String location at which an error occurred.
 * @returns serializedLocation the serialized location that includes
 *                   fileName, lineNumber, and columnNumber.
 */
export function serializeLocation(location: string) {
  const locationColonSplit = location.split(':'); // last two entries are line, col. There may be
  // ":" in other places in string.
  if (locationColonSplit.length < 3) {
    return { file_name: location };
  }

  const columnNumber = locationColonSplit.pop();
  const lineNumber = locationColonSplit.pop();

  return {
    file_path: locationColonSplit.join(':'),
    line: Number(lineNumber),
    column: Number(columnNumber),
  };
}

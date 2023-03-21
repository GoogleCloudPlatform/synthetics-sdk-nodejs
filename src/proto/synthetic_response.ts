/* eslint-disable */
import * as Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "cloud_monitoring_uptime_proto";

export interface MochaSuiteResult {
  /** the number of total test suites ran. */
  suite_count?:
    | number
    | undefined;
  /** the number of total tests that we're ran. */
  test_count?:
    | number
    | undefined;
  /** the number of total tests that passed. */
  passing_test_count?:
    | number
    | undefined;
  /** the number of total tests that failed eg 1. */
  failing_test_count?:
    | number
    | undefined;
  /** the number of total tests that did not run for some reason. */
  pending_test_count?:
    | number
    | undefined;
  /** the start time of the test suite in iso format. */
  suite_start_time?:
    | string
    | undefined;
  /** the end time of the test suite in iso format. */
  suite_end_time?: string | undefined;
}

export interface MochaTestResult {
  /**
   * The name of the test in this suite, "pings my website". Multiple tests can
   * have the same title & title_path.
   */
  title?:
    | string
    | undefined;
  /** whether or not the test passed */
  test_passed?:
    | boolean
    | undefined;
  /**
   * The full path of names from the name of the suite, to the name of the test.
   * Tests may be nested under multiple suites. Eg. ["my suite name", "pings my
   * website", “three times”]
   */
  title_paths: string[];
  /** the start time of the test in iso format. */
  test_start_time?:
    | string
    | undefined;
  /** the end time of the test suite in iso format. */
  test_end_time?:
    | string
    | undefined;
  /** The error that was the result of a test failure. */
  error?: MochaTestResult_TestError | undefined;
}

/** Information on an error that occurred. */
export interface MochaTestResult_TestError {
  /** The class of error. */
  name?:
    | string
    | undefined;
  /**
   * The full error message. Eg. "The url that you are fetching failed DNS
   * lookup"
   */
  message?:
    | string
    | undefined;
  /** A list of StackFrame messages that indicate a single trace of code. */
  stack_frames: MochaTestResult_TestError_StackFrame[];
}

/** An individual stack frame that represents a line of code within a file. */
export interface MochaTestResult_TestError_StackFrame {
  /** The name of the function that reported the error */
  function_name?:
    | string
    | undefined;
  /** The name of the file that reported the error */
  file_name?:
    | string
    | undefined;
  /** Line number that reported the error */
  line?:
    | number
    | undefined;
  /** Column number that reported the error */
  column?: number | undefined;
}

export interface MochaResultV1 {
  /** An aggregation of test results from a given synthetic's mocha suite run */
  suite_result?:
    | MochaSuiteResult
    | undefined;
  /**
   * A collection of individual test results from a given synthetic's mocha
   * suite
   */
  test_results: MochaTestResult[];
}

export interface GenericResultV1 {
  /** Whether or not the synthetic is considered to have passed */
  is_ok?: boolean | undefined;
  error: GenericResultV1_GenericError | undefined;
}

export interface GenericResultV1_GenericError {
  /** The class of error. */
  name?:
    | string
    | undefined;
  /**
   * The full error message. Eg. "The url that you are fetching failed DNS
   * lookup"
   */
  message?: string | undefined;
  function_name?:
    | string
    | undefined;
  /** The name of the file that reported the error */
  file_name?:
    | string
    | undefined;
  /** Line number that reported the error */
  line?: number | undefined;
}

export interface SyntheticResult {
  synthetic_mocha_result?:
    | MochaResultV1
    | undefined;
  /** Not Implemented Yet, see Future Work section */
  synthetic_generic_result?:
    | GenericResultV1
    | undefined;
  /**
   * Used to determine information about the runtime environment that the
   * synthetic is running in, such as K_SERVICE, and K_REVISION for cloud run,
   * SYNTHETIC_SDK_PACKAGE_VERSION for nodejs package
   */
  runtime_metadata: { [key: string]: string };
}

export interface SyntheticResult_RuntimeMetadataEntry {
  key: string;
  value: string;
}

function createBaseMochaSuiteResult(): MochaSuiteResult {
  return {
    suite_count: undefined,
    test_count: undefined,
    passing_test_count: undefined,
    failing_test_count: undefined,
    pending_test_count: undefined,
    suite_start_time: undefined,
    suite_end_time: undefined,
  };
}

export const MochaSuiteResult = {
  encode(message: MochaSuiteResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.suite_count !== undefined) {
      writer.uint32(8).int64(message.suite_count);
    }
    if (message.test_count !== undefined) {
      writer.uint32(16).int64(message.test_count);
    }
    if (message.passing_test_count !== undefined) {
      writer.uint32(24).int64(message.passing_test_count);
    }
    if (message.failing_test_count !== undefined) {
      writer.uint32(32).int64(message.failing_test_count);
    }
    if (message.pending_test_count !== undefined) {
      writer.uint32(40).int64(message.pending_test_count);
    }
    if (message.suite_start_time !== undefined) {
      writer.uint32(50).string(message.suite_start_time);
    }
    if (message.suite_end_time !== undefined) {
      writer.uint32(58).string(message.suite_end_time);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MochaSuiteResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMochaSuiteResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.suite_count = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag != 16) {
            break;
          }

          message.test_count = longToNumber(reader.int64() as Long);
          continue;
        case 3:
          if (tag != 24) {
            break;
          }

          message.passing_test_count = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.failing_test_count = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.pending_test_count = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.suite_start_time = reader.string();
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.suite_end_time = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MochaSuiteResult {
    return {
      suite_count: isSet(object.suite_count) ? Number(object.suite_count) : undefined,
      test_count: isSet(object.test_count) ? Number(object.test_count) : undefined,
      passing_test_count: isSet(object.passing_test_count) ? Number(object.passing_test_count) : undefined,
      failing_test_count: isSet(object.failing_test_count) ? Number(object.failing_test_count) : undefined,
      pending_test_count: isSet(object.pending_test_count) ? Number(object.pending_test_count) : undefined,
      suite_start_time: isSet(object.suite_start_time) ? String(object.suite_start_time) : undefined,
      suite_end_time: isSet(object.suite_end_time) ? String(object.suite_end_time) : undefined,
    };
  },

  toJSON(message: MochaSuiteResult): unknown {
    const obj: any = {};
    message.suite_count !== undefined && (obj.suite_count = Math.round(message.suite_count));
    message.test_count !== undefined && (obj.test_count = Math.round(message.test_count));
    message.passing_test_count !== undefined && (obj.passing_test_count = Math.round(message.passing_test_count));
    message.failing_test_count !== undefined && (obj.failing_test_count = Math.round(message.failing_test_count));
    message.pending_test_count !== undefined && (obj.pending_test_count = Math.round(message.pending_test_count));
    message.suite_start_time !== undefined && (obj.suite_start_time = message.suite_start_time);
    message.suite_end_time !== undefined && (obj.suite_end_time = message.suite_end_time);
    return obj;
  },

  create<I extends Exact<DeepPartial<MochaSuiteResult>, I>>(base?: I): MochaSuiteResult {
    return MochaSuiteResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MochaSuiteResult>, I>>(object: I): MochaSuiteResult {
    const message = createBaseMochaSuiteResult();
    message.suite_count = object.suite_count ?? undefined;
    message.test_count = object.test_count ?? undefined;
    message.passing_test_count = object.passing_test_count ?? undefined;
    message.failing_test_count = object.failing_test_count ?? undefined;
    message.pending_test_count = object.pending_test_count ?? undefined;
    message.suite_start_time = object.suite_start_time ?? undefined;
    message.suite_end_time = object.suite_end_time ?? undefined;
    return message;
  },
};

function createBaseMochaTestResult(): MochaTestResult {
  return {
    title: undefined,
    test_passed: undefined,
    title_paths: [],
    test_start_time: undefined,
    test_end_time: undefined,
    error: undefined,
  };
}

export const MochaTestResult = {
  encode(message: MochaTestResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.title !== undefined) {
      writer.uint32(10).string(message.title);
    }
    if (message.test_passed !== undefined) {
      writer.uint32(16).bool(message.test_passed);
    }
    for (const v of message.title_paths) {
      writer.uint32(26).string(v!);
    }
    if (message.test_start_time !== undefined) {
      writer.uint32(34).string(message.test_start_time);
    }
    if (message.test_end_time !== undefined) {
      writer.uint32(42).string(message.test_end_time);
    }
    if (message.error !== undefined) {
      MochaTestResult_TestError.encode(message.error, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MochaTestResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMochaTestResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.title = reader.string();
          continue;
        case 2:
          if (tag != 16) {
            break;
          }

          message.test_passed = reader.bool();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.title_paths.push(reader.string());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.test_start_time = reader.string();
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.test_end_time = reader.string();
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.error = MochaTestResult_TestError.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MochaTestResult {
    return {
      title: isSet(object.title) ? String(object.title) : undefined,
      test_passed: isSet(object.test_passed) ? Boolean(object.test_passed) : undefined,
      title_paths: Array.isArray(object?.title_paths) ? object.title_paths.map((e: any) => String(e)) : [],
      test_start_time: isSet(object.test_start_time) ? String(object.test_start_time) : undefined,
      test_end_time: isSet(object.test_end_time) ? String(object.test_end_time) : undefined,
      error: isSet(object.error) ? MochaTestResult_TestError.fromJSON(object.error) : undefined,
    };
  },

  toJSON(message: MochaTestResult): unknown {
    const obj: any = {};
    message.title !== undefined && (obj.title = message.title);
    message.test_passed !== undefined && (obj.test_passed = message.test_passed);
    if (message.title_paths) {
      obj.title_paths = message.title_paths.map((e) => e);
    } else {
      obj.title_paths = [];
    }
    message.test_start_time !== undefined && (obj.test_start_time = message.test_start_time);
    message.test_end_time !== undefined && (obj.test_end_time = message.test_end_time);
    message.error !== undefined &&
      (obj.error = message.error ? MochaTestResult_TestError.toJSON(message.error) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<MochaTestResult>, I>>(base?: I): MochaTestResult {
    return MochaTestResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MochaTestResult>, I>>(object: I): MochaTestResult {
    const message = createBaseMochaTestResult();
    message.title = object.title ?? undefined;
    message.test_passed = object.test_passed ?? undefined;
    message.title_paths = object.title_paths?.map((e) => e) || [];
    message.test_start_time = object.test_start_time ?? undefined;
    message.test_end_time = object.test_end_time ?? undefined;
    message.error = (object.error !== undefined && object.error !== null)
      ? MochaTestResult_TestError.fromPartial(object.error)
      : undefined;
    return message;
  },
};

function createBaseMochaTestResult_TestError(): MochaTestResult_TestError {
  return { name: undefined, message: undefined, stack_frames: [] };
}

export const MochaTestResult_TestError = {
  encode(message: MochaTestResult_TestError, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== undefined) {
      writer.uint32(10).string(message.name);
    }
    if (message.message !== undefined) {
      writer.uint32(18).string(message.message);
    }
    for (const v of message.stack_frames) {
      MochaTestResult_TestError_StackFrame.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MochaTestResult_TestError {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMochaTestResult_TestError();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.message = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.stack_frames.push(MochaTestResult_TestError_StackFrame.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MochaTestResult_TestError {
    return {
      name: isSet(object.name) ? String(object.name) : undefined,
      message: isSet(object.message) ? String(object.message) : undefined,
      stack_frames: Array.isArray(object?.stack_frames)
        ? object.stack_frames.map((e: any) => MochaTestResult_TestError_StackFrame.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MochaTestResult_TestError): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.message !== undefined && (obj.message = message.message);
    if (message.stack_frames) {
      obj.stack_frames = message.stack_frames.map((e) =>
        e ? MochaTestResult_TestError_StackFrame.toJSON(e) : undefined
      );
    } else {
      obj.stack_frames = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MochaTestResult_TestError>, I>>(base?: I): MochaTestResult_TestError {
    return MochaTestResult_TestError.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MochaTestResult_TestError>, I>>(object: I): MochaTestResult_TestError {
    const message = createBaseMochaTestResult_TestError();
    message.name = object.name ?? undefined;
    message.message = object.message ?? undefined;
    message.stack_frames = object.stack_frames?.map((e) => MochaTestResult_TestError_StackFrame.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMochaTestResult_TestError_StackFrame(): MochaTestResult_TestError_StackFrame {
  return { function_name: undefined, file_name: undefined, line: undefined, column: undefined };
}

export const MochaTestResult_TestError_StackFrame = {
  encode(message: MochaTestResult_TestError_StackFrame, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.function_name !== undefined) {
      writer.uint32(10).string(message.function_name);
    }
    if (message.file_name !== undefined) {
      writer.uint32(18).string(message.file_name);
    }
    if (message.line !== undefined) {
      writer.uint32(24).int64(message.line);
    }
    if (message.column !== undefined) {
      writer.uint32(32).int64(message.column);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MochaTestResult_TestError_StackFrame {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMochaTestResult_TestError_StackFrame();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.function_name = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.file_name = reader.string();
          continue;
        case 3:
          if (tag != 24) {
            break;
          }

          message.line = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag != 32) {
            break;
          }

          message.column = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MochaTestResult_TestError_StackFrame {
    return {
      function_name: isSet(object.function_name) ? String(object.function_name) : undefined,
      file_name: isSet(object.file_name) ? String(object.file_name) : undefined,
      line: isSet(object.line) ? Number(object.line) : undefined,
      column: isSet(object.column) ? Number(object.column) : undefined,
    };
  },

  toJSON(message: MochaTestResult_TestError_StackFrame): unknown {
    const obj: any = {};
    message.function_name !== undefined && (obj.function_name = message.function_name);
    message.file_name !== undefined && (obj.file_name = message.file_name);
    message.line !== undefined && (obj.line = Math.round(message.line));
    message.column !== undefined && (obj.column = Math.round(message.column));
    return obj;
  },

  create<I extends Exact<DeepPartial<MochaTestResult_TestError_StackFrame>, I>>(
    base?: I,
  ): MochaTestResult_TestError_StackFrame {
    return MochaTestResult_TestError_StackFrame.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MochaTestResult_TestError_StackFrame>, I>>(
    object: I,
  ): MochaTestResult_TestError_StackFrame {
    const message = createBaseMochaTestResult_TestError_StackFrame();
    message.function_name = object.function_name ?? undefined;
    message.file_name = object.file_name ?? undefined;
    message.line = object.line ?? undefined;
    message.column = object.column ?? undefined;
    return message;
  },
};

function createBaseMochaResultV1(): MochaResultV1 {
  return { suite_result: undefined, test_results: [] };
}

export const MochaResultV1 = {
  encode(message: MochaResultV1, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.suite_result !== undefined) {
      MochaSuiteResult.encode(message.suite_result, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.test_results) {
      MochaTestResult.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MochaResultV1 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMochaResultV1();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.suite_result = MochaSuiteResult.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.test_results.push(MochaTestResult.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MochaResultV1 {
    return {
      suite_result: isSet(object.suite_result) ? MochaSuiteResult.fromJSON(object.suite_result) : undefined,
      test_results: Array.isArray(object?.test_results)
        ? object.test_results.map((e: any) => MochaTestResult.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MochaResultV1): unknown {
    const obj: any = {};
    message.suite_result !== undefined &&
      (obj.suite_result = message.suite_result ? MochaSuiteResult.toJSON(message.suite_result) : undefined);
    if (message.test_results) {
      obj.test_results = message.test_results.map((e) => e ? MochaTestResult.toJSON(e) : undefined);
    } else {
      obj.test_results = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MochaResultV1>, I>>(base?: I): MochaResultV1 {
    return MochaResultV1.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<MochaResultV1>, I>>(object: I): MochaResultV1 {
    const message = createBaseMochaResultV1();
    message.suite_result = (object.suite_result !== undefined && object.suite_result !== null)
      ? MochaSuiteResult.fromPartial(object.suite_result)
      : undefined;
    message.test_results = object.test_results?.map((e) => MochaTestResult.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGenericResultV1(): GenericResultV1 {
  return { is_ok: undefined, error: undefined };
}

export const GenericResultV1 = {
  encode(message: GenericResultV1, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.is_ok !== undefined) {
      writer.uint32(8).bool(message.is_ok);
    }
    if (message.error !== undefined) {
      GenericResultV1_GenericError.encode(message.error, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenericResultV1 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenericResultV1();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.is_ok = reader.bool();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.error = GenericResultV1_GenericError.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GenericResultV1 {
    return {
      is_ok: isSet(object.is_ok) ? Boolean(object.is_ok) : undefined,
      error: isSet(object.error) ? GenericResultV1_GenericError.fromJSON(object.error) : undefined,
    };
  },

  toJSON(message: GenericResultV1): unknown {
    const obj: any = {};
    message.is_ok !== undefined && (obj.is_ok = message.is_ok);
    message.error !== undefined &&
      (obj.error = message.error ? GenericResultV1_GenericError.toJSON(message.error) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<GenericResultV1>, I>>(base?: I): GenericResultV1 {
    return GenericResultV1.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GenericResultV1>, I>>(object: I): GenericResultV1 {
    const message = createBaseGenericResultV1();
    message.is_ok = object.is_ok ?? undefined;
    message.error = (object.error !== undefined && object.error !== null)
      ? GenericResultV1_GenericError.fromPartial(object.error)
      : undefined;
    return message;
  },
};

function createBaseGenericResultV1_GenericError(): GenericResultV1_GenericError {
  return { name: undefined, message: undefined, function_name: undefined, file_name: undefined, line: undefined };
}

export const GenericResultV1_GenericError = {
  encode(message: GenericResultV1_GenericError, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== undefined) {
      writer.uint32(10).string(message.name);
    }
    if (message.message !== undefined) {
      writer.uint32(18).string(message.message);
    }
    if (message.function_name !== undefined) {
      writer.uint32(26).string(message.function_name);
    }
    if (message.file_name !== undefined) {
      writer.uint32(34).string(message.file_name);
    }
    if (message.line !== undefined) {
      writer.uint32(40).int64(message.line);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenericResultV1_GenericError {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenericResultV1_GenericError();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.message = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.function_name = reader.string();
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.file_name = reader.string();
          continue;
        case 5:
          if (tag != 40) {
            break;
          }

          message.line = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GenericResultV1_GenericError {
    return {
      name: isSet(object.name) ? String(object.name) : undefined,
      message: isSet(object.message) ? String(object.message) : undefined,
      function_name: isSet(object.function_name) ? String(object.function_name) : undefined,
      file_name: isSet(object.file_name) ? String(object.file_name) : undefined,
      line: isSet(object.line) ? Number(object.line) : undefined,
    };
  },

  toJSON(message: GenericResultV1_GenericError): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.message !== undefined && (obj.message = message.message);
    message.function_name !== undefined && (obj.function_name = message.function_name);
    message.file_name !== undefined && (obj.file_name = message.file_name);
    message.line !== undefined && (obj.line = Math.round(message.line));
    return obj;
  },

  create<I extends Exact<DeepPartial<GenericResultV1_GenericError>, I>>(base?: I): GenericResultV1_GenericError {
    return GenericResultV1_GenericError.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GenericResultV1_GenericError>, I>>(object: I): GenericResultV1_GenericError {
    const message = createBaseGenericResultV1_GenericError();
    message.name = object.name ?? undefined;
    message.message = object.message ?? undefined;
    message.function_name = object.function_name ?? undefined;
    message.file_name = object.file_name ?? undefined;
    message.line = object.line ?? undefined;
    return message;
  },
};

function createBaseSyntheticResult(): SyntheticResult {
  return { synthetic_mocha_result: undefined, synthetic_generic_result: undefined, runtime_metadata: {} };
}

export const SyntheticResult = {
  encode(message: SyntheticResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.synthetic_mocha_result !== undefined) {
      MochaResultV1.encode(message.synthetic_mocha_result, writer.uint32(10).fork()).ldelim();
    }
    if (message.synthetic_generic_result !== undefined) {
      GenericResultV1.encode(message.synthetic_generic_result, writer.uint32(18).fork()).ldelim();
    }
    Object.entries(message.runtime_metadata).forEach(([key, value]) => {
      SyntheticResult_RuntimeMetadataEntry.encode({ key: key as any, value }, writer.uint32(26).fork()).ldelim();
    });
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SyntheticResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSyntheticResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.synthetic_mocha_result = MochaResultV1.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.synthetic_generic_result = GenericResultV1.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          const entry3 = SyntheticResult_RuntimeMetadataEntry.decode(reader, reader.uint32());
          if (entry3.value !== undefined) {
            message.runtime_metadata[entry3.key] = entry3.value;
          }
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SyntheticResult {
    return {
      synthetic_mocha_result: isSet(object.synthetic_mocha_result)
        ? MochaResultV1.fromJSON(object.synthetic_mocha_result)
        : undefined,
      synthetic_generic_result: isSet(object.synthetic_generic_result)
        ? GenericResultV1.fromJSON(object.synthetic_generic_result)
        : undefined,
      runtime_metadata: isObject(object.runtime_metadata)
        ? Object.entries(object.runtime_metadata).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: SyntheticResult): unknown {
    const obj: any = {};
    message.synthetic_mocha_result !== undefined && (obj.synthetic_mocha_result = message.synthetic_mocha_result
      ? MochaResultV1.toJSON(message.synthetic_mocha_result)
      : undefined);
    message.synthetic_generic_result !== undefined && (obj.synthetic_generic_result = message.synthetic_generic_result
      ? GenericResultV1.toJSON(message.synthetic_generic_result)
      : undefined);
    obj.runtime_metadata = {};
    if (message.runtime_metadata) {
      Object.entries(message.runtime_metadata).forEach(([k, v]) => {
        obj.runtime_metadata[k] = v;
      });
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SyntheticResult>, I>>(base?: I): SyntheticResult {
    return SyntheticResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SyntheticResult>, I>>(object: I): SyntheticResult {
    const message = createBaseSyntheticResult();
    message.synthetic_mocha_result =
      (object.synthetic_mocha_result !== undefined && object.synthetic_mocha_result !== null)
        ? MochaResultV1.fromPartial(object.synthetic_mocha_result)
        : undefined;
    message.synthetic_generic_result =
      (object.synthetic_generic_result !== undefined && object.synthetic_generic_result !== null)
        ? GenericResultV1.fromPartial(object.synthetic_generic_result)
        : undefined;
    message.runtime_metadata = Object.entries(object.runtime_metadata ?? {}).reduce<{ [key: string]: string }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseSyntheticResult_RuntimeMetadataEntry(): SyntheticResult_RuntimeMetadataEntry {
  return { key: "", value: "" };
}

export const SyntheticResult_RuntimeMetadataEntry = {
  encode(message: SyntheticResult_RuntimeMetadataEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SyntheticResult_RuntimeMetadataEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSyntheticResult_RuntimeMetadataEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SyntheticResult_RuntimeMetadataEntry {
    return { key: isSet(object.key) ? String(object.key) : "", value: isSet(object.value) ? String(object.value) : "" };
  },

  toJSON(message: SyntheticResult_RuntimeMetadataEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  create<I extends Exact<DeepPartial<SyntheticResult_RuntimeMetadataEntry>, I>>(
    base?: I,
  ): SyntheticResult_RuntimeMetadataEntry {
    return SyntheticResult_RuntimeMetadataEntry.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SyntheticResult_RuntimeMetadataEntry>, I>>(
    object: I,
  ): SyntheticResult_RuntimeMetadataEntry {
    const message = createBaseSyntheticResult_RuntimeMetadataEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

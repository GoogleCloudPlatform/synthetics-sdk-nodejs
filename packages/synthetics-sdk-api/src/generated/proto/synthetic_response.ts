// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "cloud.monitoring.uptime.synthetic";

export interface TestResult {
  /**
   * The name of the test in this suite, "pings my website". Multiple tests can
   * have the same title & title_path.
   */
  title: string;
  /** Whether or not the test passed. */
  test_passed?:
    | boolean
    | undefined;
  /**
   * The full path of names from the name of the suite, to the name of the test.
   * Tests may be nested under multiple suites. Eg. ["my suite name", "pings my
   * website", "three times"].
   */
  title_paths: string[];
  /** The start time of the test in iso format. */
  test_start_time: string;
  /** The end time of the test suite in iso format. */
  test_end_time: string;
  /** The error that was the result of a test failure. */
  test_error: TestResult_TestError | undefined;
}

/** Information on an error that occurred. */
export interface TestResult_TestError {
  /** The class of error. */
  error_type: string;
  /**
   * The full error message. Eg. "The url that you are fetching failed DNS
   * lookup".
   */
  error_message: string;
  /** A list of StackFrame messages that indicate a single trace of code. */
  stack_frames: TestResult_TestError_StackFrame[];
}

/** An individual stack frame that represents a line of code within a file. */
export interface TestResult_TestError_StackFrame {
  /** The name of the function that reported the error. */
  function_name: string;
  /** The name of the file that reported the error. */
  file_path: string;
  /** Line number that reported the error. */
  line?:
    | number
    | undefined;
  /** Column number that reported the error. */
  column?: number | undefined;
}

export interface TestFrameworkResultV1 {
  /** The number of total test suites ran. */
  suite_count?:
    | number
    | undefined;
  /** The number of total tests that ran as a part of the suite run. */
  test_count?:
    | number
    | undefined;
  /** The number of total tests that passed as a part of the suite run. */
  passing_test_count?:
    | number
    | undefined;
  /** The number of total tests that failed as a prt of the suite run. */
  failing_test_count?:
    | number
    | undefined;
  /** The number of total tests that remain pending after the suite run. */
  pending_test_count?:
    | number
    | undefined;
  /**
   * A collection of individual test results from a given synthetic's test
   * suite.
   */
  test_results: TestResult[];
}

export interface GenericResultV1 {
  /** Whether or not the synthetic is considered to have passed. */
  ok?:
    | boolean
    | undefined;
  /** Error that was associated with this result, causing it to fail. */
  generic_error: GenericResultV1_GenericError | undefined;
}

export interface GenericResultV1_GenericError {
  /** The class of error. */
  error_type: string;
  /**
   * The full error message. Eg. "The url that you are fetching failed DNS
   * lookup".
   */
  error_message: string;
  /** The name of the function where the error occurred */
  function_name: string;
  /** The name of the file that reported the error. */
  file_path: string;
  /** Line number that reported the error. */
  line?: number | undefined;
}

export interface SyntheticResult {
  synthetic_test_framework_result_v1?: TestFrameworkResultV1 | undefined;
  synthetic_generic_result_v1?:
    | GenericResultV1
    | undefined;
  /**
   * Used to determine information about the runtime environment that the
   * synthetic is running in, such as K_SERVICE, and K_REVISION for cloud run,
   * SYNTHETIC_SDK_NPM_PACKAGE_VERSION for nodejs package.
   */
  runtime_metadata: { [key: string]: string };
  /** The start time of the synthetic in iso format. */
  start_time: string;
  /** The end time of the synthetic in iso format. */
  end_time: string;
}

export interface SyntheticResult_RuntimeMetadataEntry {
  key: string;
  value: string;
}

function createBaseTestResult(): TestResult {
  return {
    title: "",
    test_passed: undefined,
    title_paths: [],
    test_start_time: "",
    test_end_time: "",
    test_error: undefined,
  };
}

export const TestResult = {
  encode(message: TestResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.test_passed !== undefined) {
      writer.uint32(16).bool(message.test_passed);
    }
    for (const v of message.title_paths) {
      writer.uint32(26).string(v!);
    }
    if (message.test_start_time !== "") {
      writer.uint32(34).string(message.test_start_time);
    }
    if (message.test_end_time !== "") {
      writer.uint32(42).string(message.test_end_time);
    }
    if (message.test_error !== undefined) {
      TestResult_TestError.encode(message.test_error, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TestResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTestResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.title = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.test_passed = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.title_paths.push(reader.string());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.test_start_time = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.test_end_time = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.test_error = TestResult_TestError.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TestResult {
    return {
      title: isSet(object.title) ? String(object.title) : "",
      test_passed: isSet(object.test_passed) ? Boolean(object.test_passed) : undefined,
      title_paths: Array.isArray(object?.title_paths) ? object.title_paths.map((e: any) => String(e)) : [],
      test_start_time: isSet(object.test_start_time) ? String(object.test_start_time) : "",
      test_end_time: isSet(object.test_end_time) ? String(object.test_end_time) : "",
      test_error: isSet(object.test_error) ? TestResult_TestError.fromJSON(object.test_error) : undefined,
    };
  },

  toJSON(message: TestResult): unknown {
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
    message.test_error !== undefined &&
      (obj.test_error = message.test_error ? TestResult_TestError.toJSON(message.test_error) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<TestResult>, I>>(base?: I): TestResult {
    return TestResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<TestResult>, I>>(object: I): TestResult {
    const message = createBaseTestResult();
    message.title = object.title ?? "";
    message.test_passed = object.test_passed ?? undefined;
    message.title_paths = object.title_paths?.map((e) => e) || [];
    message.test_start_time = object.test_start_time ?? "";
    message.test_end_time = object.test_end_time ?? "";
    message.test_error = (object.test_error !== undefined && object.test_error !== null)
      ? TestResult_TestError.fromPartial(object.test_error)
      : undefined;
    return message;
  },
};

function createBaseTestResult_TestError(): TestResult_TestError {
  return { error_type: "", error_message: "", stack_frames: [] };
}

export const TestResult_TestError = {
  encode(message: TestResult_TestError, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error_type !== "") {
      writer.uint32(10).string(message.error_type);
    }
    if (message.error_message !== "") {
      writer.uint32(18).string(message.error_message);
    }
    for (const v of message.stack_frames) {
      TestResult_TestError_StackFrame.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TestResult_TestError {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTestResult_TestError();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.error_type = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.error_message = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.stack_frames.push(TestResult_TestError_StackFrame.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TestResult_TestError {
    return {
      error_type: isSet(object.error_type) ? String(object.error_type) : "",
      error_message: isSet(object.error_message) ? String(object.error_message) : "",
      stack_frames: Array.isArray(object?.stack_frames)
        ? object.stack_frames.map((e: any) => TestResult_TestError_StackFrame.fromJSON(e))
        : [],
    };
  },

  toJSON(message: TestResult_TestError): unknown {
    const obj: any = {};
    message.error_type !== undefined && (obj.error_type = message.error_type);
    message.error_message !== undefined && (obj.error_message = message.error_message);
    if (message.stack_frames) {
      obj.stack_frames = message.stack_frames.map((e) => e ? TestResult_TestError_StackFrame.toJSON(e) : undefined);
    } else {
      obj.stack_frames = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<TestResult_TestError>, I>>(base?: I): TestResult_TestError {
    return TestResult_TestError.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<TestResult_TestError>, I>>(object: I): TestResult_TestError {
    const message = createBaseTestResult_TestError();
    message.error_type = object.error_type ?? "";
    message.error_message = object.error_message ?? "";
    message.stack_frames = object.stack_frames?.map((e) => TestResult_TestError_StackFrame.fromPartial(e)) || [];
    return message;
  },
};

function createBaseTestResult_TestError_StackFrame(): TestResult_TestError_StackFrame {
  return { function_name: "", file_path: "", line: undefined, column: undefined };
}

export const TestResult_TestError_StackFrame = {
  encode(message: TestResult_TestError_StackFrame, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.function_name !== "") {
      writer.uint32(10).string(message.function_name);
    }
    if (message.file_path !== "") {
      writer.uint32(18).string(message.file_path);
    }
    if (message.line !== undefined) {
      writer.uint32(24).int64(message.line);
    }
    if (message.column !== undefined) {
      writer.uint32(32).int64(message.column);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TestResult_TestError_StackFrame {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTestResult_TestError_StackFrame();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.function_name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.file_path = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.line = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.column = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TestResult_TestError_StackFrame {
    return {
      function_name: isSet(object.function_name) ? String(object.function_name) : "",
      file_path: isSet(object.file_path) ? String(object.file_path) : "",
      line: isSet(object.line) ? Number(object.line) : undefined,
      column: isSet(object.column) ? Number(object.column) : undefined,
    };
  },

  toJSON(message: TestResult_TestError_StackFrame): unknown {
    const obj: any = {};
    message.function_name !== undefined && (obj.function_name = message.function_name);
    message.file_path !== undefined && (obj.file_path = message.file_path);
    message.line !== undefined && (obj.line = Math.round(message.line));
    message.column !== undefined && (obj.column = Math.round(message.column));
    return obj;
  },

  create<I extends Exact<DeepPartial<TestResult_TestError_StackFrame>, I>>(base?: I): TestResult_TestError_StackFrame {
    return TestResult_TestError_StackFrame.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<TestResult_TestError_StackFrame>, I>>(
    object: I,
  ): TestResult_TestError_StackFrame {
    const message = createBaseTestResult_TestError_StackFrame();
    message.function_name = object.function_name ?? "";
    message.file_path = object.file_path ?? "";
    message.line = object.line ?? undefined;
    message.column = object.column ?? undefined;
    return message;
  },
};

function createBaseTestFrameworkResultV1(): TestFrameworkResultV1 {
  return {
    suite_count: undefined,
    test_count: undefined,
    passing_test_count: undefined,
    failing_test_count: undefined,
    pending_test_count: undefined,
    test_results: [],
  };
}

export const TestFrameworkResultV1 = {
  encode(message: TestFrameworkResultV1, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
    for (const v of message.test_results) {
      TestResult.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TestFrameworkResultV1 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTestFrameworkResultV1();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.suite_count = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.test_count = longToNumber(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.passing_test_count = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.failing_test_count = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.pending_test_count = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.test_results.push(TestResult.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): TestFrameworkResultV1 {
    return {
      suite_count: isSet(object.suite_count) ? Number(object.suite_count) : undefined,
      test_count: isSet(object.test_count) ? Number(object.test_count) : undefined,
      passing_test_count: isSet(object.passing_test_count) ? Number(object.passing_test_count) : undefined,
      failing_test_count: isSet(object.failing_test_count) ? Number(object.failing_test_count) : undefined,
      pending_test_count: isSet(object.pending_test_count) ? Number(object.pending_test_count) : undefined,
      test_results: Array.isArray(object?.test_results)
        ? object.test_results.map((e: any) => TestResult.fromJSON(e))
        : [],
    };
  },

  toJSON(message: TestFrameworkResultV1): unknown {
    const obj: any = {};
    message.suite_count !== undefined && (obj.suite_count = Math.round(message.suite_count));
    message.test_count !== undefined && (obj.test_count = Math.round(message.test_count));
    message.passing_test_count !== undefined && (obj.passing_test_count = Math.round(message.passing_test_count));
    message.failing_test_count !== undefined && (obj.failing_test_count = Math.round(message.failing_test_count));
    message.pending_test_count !== undefined && (obj.pending_test_count = Math.round(message.pending_test_count));
    if (message.test_results) {
      obj.test_results = message.test_results.map((e) => e ? TestResult.toJSON(e) : undefined);
    } else {
      obj.test_results = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<TestFrameworkResultV1>, I>>(base?: I): TestFrameworkResultV1 {
    return TestFrameworkResultV1.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<TestFrameworkResultV1>, I>>(object: I): TestFrameworkResultV1 {
    const message = createBaseTestFrameworkResultV1();
    message.suite_count = object.suite_count ?? undefined;
    message.test_count = object.test_count ?? undefined;
    message.passing_test_count = object.passing_test_count ?? undefined;
    message.failing_test_count = object.failing_test_count ?? undefined;
    message.pending_test_count = object.pending_test_count ?? undefined;
    message.test_results = object.test_results?.map((e) => TestResult.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGenericResultV1(): GenericResultV1 {
  return { ok: undefined, generic_error: undefined };
}

export const GenericResultV1 = {
  encode(message: GenericResultV1, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.ok !== undefined) {
      writer.uint32(8).bool(message.ok);
    }
    if (message.generic_error !== undefined) {
      GenericResultV1_GenericError.encode(message.generic_error, writer.uint32(18).fork()).ldelim();
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
          if (tag !== 8) {
            break;
          }

          message.ok = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.generic_error = GenericResultV1_GenericError.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GenericResultV1 {
    return {
      ok: isSet(object.ok) ? Boolean(object.ok) : undefined,
      generic_error: isSet(object.generic_error)
        ? GenericResultV1_GenericError.fromJSON(object.generic_error)
        : undefined,
    };
  },

  toJSON(message: GenericResultV1): unknown {
    const obj: any = {};
    message.ok !== undefined && (obj.ok = message.ok);
    message.generic_error !== undefined && (obj.generic_error = message.generic_error
      ? GenericResultV1_GenericError.toJSON(message.generic_error)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<GenericResultV1>, I>>(base?: I): GenericResultV1 {
    return GenericResultV1.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GenericResultV1>, I>>(object: I): GenericResultV1 {
    const message = createBaseGenericResultV1();
    message.ok = object.ok ?? undefined;
    message.generic_error = (object.generic_error !== undefined && object.generic_error !== null)
      ? GenericResultV1_GenericError.fromPartial(object.generic_error)
      : undefined;
    return message;
  },
};

function createBaseGenericResultV1_GenericError(): GenericResultV1_GenericError {
  return { error_type: "", error_message: "", function_name: "", file_path: "", line: undefined };
}

export const GenericResultV1_GenericError = {
  encode(message: GenericResultV1_GenericError, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error_type !== "") {
      writer.uint32(10).string(message.error_type);
    }
    if (message.error_message !== "") {
      writer.uint32(18).string(message.error_message);
    }
    if (message.function_name !== "") {
      writer.uint32(26).string(message.function_name);
    }
    if (message.file_path !== "") {
      writer.uint32(34).string(message.file_path);
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
          if (tag !== 10) {
            break;
          }

          message.error_type = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.error_message = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.function_name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.file_path = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.line = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GenericResultV1_GenericError {
    return {
      error_type: isSet(object.error_type) ? String(object.error_type) : "",
      error_message: isSet(object.error_message) ? String(object.error_message) : "",
      function_name: isSet(object.function_name) ? String(object.function_name) : "",
      file_path: isSet(object.file_path) ? String(object.file_path) : "",
      line: isSet(object.line) ? Number(object.line) : undefined,
    };
  },

  toJSON(message: GenericResultV1_GenericError): unknown {
    const obj: any = {};
    message.error_type !== undefined && (obj.error_type = message.error_type);
    message.error_message !== undefined && (obj.error_message = message.error_message);
    message.function_name !== undefined && (obj.function_name = message.function_name);
    message.file_path !== undefined && (obj.file_path = message.file_path);
    message.line !== undefined && (obj.line = Math.round(message.line));
    return obj;
  },

  create<I extends Exact<DeepPartial<GenericResultV1_GenericError>, I>>(base?: I): GenericResultV1_GenericError {
    return GenericResultV1_GenericError.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GenericResultV1_GenericError>, I>>(object: I): GenericResultV1_GenericError {
    const message = createBaseGenericResultV1_GenericError();
    message.error_type = object.error_type ?? "";
    message.error_message = object.error_message ?? "";
    message.function_name = object.function_name ?? "";
    message.file_path = object.file_path ?? "";
    message.line = object.line ?? undefined;
    return message;
  },
};

function createBaseSyntheticResult(): SyntheticResult {
  return {
    synthetic_test_framework_result_v1: undefined,
    synthetic_generic_result_v1: undefined,
    runtime_metadata: {},
    start_time: "",
    end_time: "",
  };
}

export const SyntheticResult = {
  encode(message: SyntheticResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.synthetic_test_framework_result_v1 !== undefined) {
      TestFrameworkResultV1.encode(message.synthetic_test_framework_result_v1, writer.uint32(10).fork()).ldelim();
    }
    if (message.synthetic_generic_result_v1 !== undefined) {
      GenericResultV1.encode(message.synthetic_generic_result_v1, writer.uint32(18).fork()).ldelim();
    }
    Object.entries(message.runtime_metadata).forEach(([key, value]) => {
      SyntheticResult_RuntimeMetadataEntry.encode({ key: key as any, value }, writer.uint32(34).fork()).ldelim();
    });
    if (message.start_time !== "") {
      writer.uint32(42).string(message.start_time);
    }
    if (message.end_time !== "") {
      writer.uint32(50).string(message.end_time);
    }
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
          if (tag !== 10) {
            break;
          }

          message.synthetic_test_framework_result_v1 = TestFrameworkResultV1.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.synthetic_generic_result_v1 = GenericResultV1.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          const entry4 = SyntheticResult_RuntimeMetadataEntry.decode(reader, reader.uint32());
          if (entry4.value !== undefined) {
            message.runtime_metadata[entry4.key] = entry4.value;
          }
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.start_time = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.end_time = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SyntheticResult {
    return {
      synthetic_test_framework_result_v1: isSet(object.synthetic_test_framework_result_v1)
        ? TestFrameworkResultV1.fromJSON(object.synthetic_test_framework_result_v1)
        : undefined,
      synthetic_generic_result_v1: isSet(object.synthetic_generic_result_v1)
        ? GenericResultV1.fromJSON(object.synthetic_generic_result_v1)
        : undefined,
      runtime_metadata: isObject(object.runtime_metadata)
        ? Object.entries(object.runtime_metadata).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      start_time: isSet(object.start_time) ? String(object.start_time) : "",
      end_time: isSet(object.end_time) ? String(object.end_time) : "",
    };
  },

  toJSON(message: SyntheticResult): unknown {
    const obj: any = {};
    message.synthetic_test_framework_result_v1 !== undefined &&
      (obj.synthetic_test_framework_result_v1 = message.synthetic_test_framework_result_v1
        ? TestFrameworkResultV1.toJSON(message.synthetic_test_framework_result_v1)
        : undefined);
    message.synthetic_generic_result_v1 !== undefined &&
      (obj.synthetic_generic_result_v1 = message.synthetic_generic_result_v1
        ? GenericResultV1.toJSON(message.synthetic_generic_result_v1)
        : undefined);
    obj.runtime_metadata = {};
    if (message.runtime_metadata) {
      Object.entries(message.runtime_metadata).forEach(([k, v]) => {
        obj.runtime_metadata[k] = v;
      });
    }
    message.start_time !== undefined && (obj.start_time = message.start_time);
    message.end_time !== undefined && (obj.end_time = message.end_time);
    return obj;
  },

  create<I extends Exact<DeepPartial<SyntheticResult>, I>>(base?: I): SyntheticResult {
    return SyntheticResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<SyntheticResult>, I>>(object: I): SyntheticResult {
    const message = createBaseSyntheticResult();
    message.synthetic_test_framework_result_v1 =
      (object.synthetic_test_framework_result_v1 !== undefined && object.synthetic_test_framework_result_v1 !== null)
        ? TestFrameworkResultV1.fromPartial(object.synthetic_test_framework_result_v1)
        : undefined;
    message.synthetic_generic_result_v1 =
      (object.synthetic_generic_result_v1 !== undefined && object.synthetic_generic_result_v1 !== null)
        ? GenericResultV1.fromPartial(object.synthetic_generic_result_v1)
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
    message.start_time = object.start_time ?? "";
    message.end_time = object.end_time ?? "";
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
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
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

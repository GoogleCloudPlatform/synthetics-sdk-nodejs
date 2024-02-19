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
  /** The raw stack trace associated with the error. */
  stack_trace: string;
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
  /** The name of the function where the error occurred. */
  function_name: string;
  /** The name of the file that reported the error. */
  file_path: string;
  /** Line number that reported the error. */
  line?:
    | number
    | undefined;
  /** The raw stack trace that is associated with this error. */
  stack_trace: string;
}

/**
 * A status to accept. Either a status code class like "2xx", or an
 * integer status code like "200".
 */
export interface ResponseStatusCode {
  /** A status code to accept. */
  status_value?:
    | number
    | undefined;
  /** A class of status codes to accept. */
  status_class?: ResponseStatusCode_StatusClass | undefined;
}

/** An HTTP status code class. */
export enum ResponseStatusCode_StatusClass {
  /** STATUS_CLASS_UNSPECIFIED - Default value that matches no status codes. */
  STATUS_CLASS_UNSPECIFIED = 0,
  /** STATUS_CLASS_1XX - The class of status codes between 100 and 199. */
  STATUS_CLASS_1XX = 100,
  /** STATUS_CLASS_2XX - The class of status codes between 200 and 299. */
  STATUS_CLASS_2XX = 200,
  /** STATUS_CLASS_3XX - The class of status codes between 300 and 399. */
  STATUS_CLASS_3XX = 300,
  /** STATUS_CLASS_4XX - The class of status codes between 400 and 499. */
  STATUS_CLASS_4XX = 400,
  /** STATUS_CLASS_5XX - The class of status codes between 500 and 599. */
  STATUS_CLASS_5XX = 500,
  /** STATUS_CLASS_ANY - The class of all status codes. */
  STATUS_CLASS_ANY = 1000,
  UNRECOGNIZED = -1,
}

export function responseStatusCode_StatusClassFromJSON(object: any): ResponseStatusCode_StatusClass {
  switch (object) {
    case 0:
    case "STATUS_CLASS_UNSPECIFIED":
      return ResponseStatusCode_StatusClass.STATUS_CLASS_UNSPECIFIED;
    case 100:
    case "STATUS_CLASS_1XX":
      return ResponseStatusCode_StatusClass.STATUS_CLASS_1XX;
    case 200:
    case "STATUS_CLASS_2XX":
      return ResponseStatusCode_StatusClass.STATUS_CLASS_2XX;
    case 300:
    case "STATUS_CLASS_3XX":
      return ResponseStatusCode_StatusClass.STATUS_CLASS_3XX;
    case 400:
    case "STATUS_CLASS_4XX":
      return ResponseStatusCode_StatusClass.STATUS_CLASS_4XX;
    case 500:
    case "STATUS_CLASS_5XX":
      return ResponseStatusCode_StatusClass.STATUS_CLASS_5XX;
    case 1000:
    case "STATUS_CLASS_ANY":
      return ResponseStatusCode_StatusClass.STATUS_CLASS_ANY;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ResponseStatusCode_StatusClass.UNRECOGNIZED;
  }
}

export function responseStatusCode_StatusClassToJSON(object: ResponseStatusCode_StatusClass): string {
  switch (object) {
    case ResponseStatusCode_StatusClass.STATUS_CLASS_UNSPECIFIED:
      return "STATUS_CLASS_UNSPECIFIED";
    case ResponseStatusCode_StatusClass.STATUS_CLASS_1XX:
      return "STATUS_CLASS_1XX";
    case ResponseStatusCode_StatusClass.STATUS_CLASS_2XX:
      return "STATUS_CLASS_2XX";
    case ResponseStatusCode_StatusClass.STATUS_CLASS_3XX:
      return "STATUS_CLASS_3XX";
    case ResponseStatusCode_StatusClass.STATUS_CLASS_4XX:
      return "STATUS_CLASS_4XX";
    case ResponseStatusCode_StatusClass.STATUS_CLASS_5XX:
      return "STATUS_CLASS_5XX";
    case ResponseStatusCode_StatusClass.STATUS_CLASS_ANY:
      return "STATUS_CLASS_ANY";
    case ResponseStatusCode_StatusClass.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** Information on an error that occurred. */
export interface BaseError {
  /** The name of the error. */
  error_type: string;
  /** The full error message. */
  error_message: string;
}

/** Aggregate and individual results of a Broken Link Synthetic execution */
export interface BrokenLinksResultV1 {
  /** the total number of links checked as part of the execution */
  link_count?:
    | number
    | undefined;
  /** the total number of links that passed as part of the execution */
  passing_link_count?:
    | number
    | undefined;
  /** the total number of links that failed */
  failing_link_count?:
    | number
    | undefined;
  /** the total number of links that count not be reached */
  unreachable_count?:
    | number
    | undefined;
  /** the total number of links that returned 2xx status codes */
  status2xx_count?:
    | number
    | undefined;
  /** the total number of links that returned 3xx status codes */
  status3xx_count?:
    | number
    | undefined;
  /** the total number of links that returned 4xx status codes */
  status4xx_count?:
    | number
    | undefined;
  /** the total number of links that returned 5xx status codes */
  status5xx_count?:
    | number
    | undefined;
  /** Options set for broken link synthetic. */
  options:
    | BrokenLinksResultV1_BrokenLinkCheckerOptions
    | undefined;
  /** link result for origin_uri. */
  origin_link_result:
    | BrokenLinksResultV1_SyntheticLinkResult
    | undefined;
  /** link results for all scraped and followed links. */
  followed_link_results: BrokenLinksResultV1_SyntheticLinkResult[];
  /**
   * Path to the Cloud Storage folder where all artifacts (e.g. screenshots)
   * will be stored for this execution. e.g.
   * gs://<my_bucket_name/check-id-123/2024-01-01/123exec_id123/
   */
  execution_data_storage_path: string;
  /** Errors associated with the broken link checker execution. */
  errors: BaseError[];
}

export interface BrokenLinksResultV1_BrokenLinkCheckerOptions {
  /**
   * Origin uri from which to scrape all other links, this is the only
   * required field.
   */
  origin_uri: string;
  /** Number of links to follow, default 50. */
  link_limit?:
    | number
    | undefined;
  /** HTML elements to scrape from origin_uri, default 'a'. */
  query_selector_all: string;
  /** Attributes to scrape from queried HTML elements, default ['href']. */
  get_attributes: string[];
  /** order to check links scraped */
  link_order: BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder;
  /**
   * Maximum amount of time to wait for HTTP response to complete per link,
   * default 30000 milliseconds.
   */
  link_timeout_millis?:
    | number
    | undefined;
  /**
   * Maximum number of times to retry a link that does not return the
   * “expected_status_code”.
   */
  max_retries?:
    | number
    | undefined;
  /**
   * HTML element to wait for before scraping links on origin_uri.
   * Method documentation:
   * https://pptr.dev/api/puppeteer.page.waitforselector. Type documentation:
   * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
   */
  wait_for_selector: string;
  /**
   * individual link options, default None. string must be formatted as a
   * fully qualified url
   */
  per_link_options: { [key: string]: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption };
  /** Timeout set for the entire Synthetic Monitor, default 60000 milliseconds */
  total_synthetic_timeout_millis?:
    | number
    | undefined;
  /** Screenshot options, default to 'FAILING' and synthetic wide bucket. */
  screenshot_options: BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions | undefined;
}

/** Possible orders for checking links that have been scraped. */
export enum BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder {
  /** LINK_ORDER_UNSPECIFIED - Default value that indicates no order. */
  LINK_ORDER_UNSPECIFIED = 0,
  /** FIRST_N - First "n" number of links scraped. */
  FIRST_N = 1,
  /** RANDOM - Random selection of links scraped. */
  RANDOM = 2,
  UNRECOGNIZED = -1,
}

export function brokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrderFromJSON(
  object: any,
): BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder {
  switch (object) {
    case 0:
    case "LINK_ORDER_UNSPECIFIED":
      return BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.LINK_ORDER_UNSPECIFIED;
    case 1:
    case "FIRST_N":
      return BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N;
    case 2:
    case "RANDOM":
      return BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM;
    case -1:
    case "UNRECOGNIZED":
    default:
      return BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.UNRECOGNIZED;
  }
}

export function brokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrderToJSON(
  object: BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
): string {
  switch (object) {
    case BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.LINK_ORDER_UNSPECIFIED:
      return "LINK_ORDER_UNSPECIFIED";
    case BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N:
      return "FIRST_N";
    case BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM:
      return "RANDOM";
    case BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** Individual link options. */
export interface BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption {
  /** The expected status code or class. */
  expected_status_code:
    | ResponseStatusCode
    | undefined;
  /**
   * Maximum amount of time to wait for HTTP response to complete, for
   * the given specified link passed in "per_link_options" map.
   */
  link_timeout_millis?: number | undefined;
}

export interface BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry {
  key: string;
  value: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption | undefined;
}

/** Required options for broken link checker screenshot capability. */
export interface BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions {
  /** Input bucket or folder provided by the user. */
  storage_location: string;
  /**
   * Controls when to capture screenshots during broken link checks, default
   * is FAILING.
   */
  screenshot_condition: BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition;
}

export enum BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition {
  NONE = 0,
  FAILING = 1,
  ALL = 2,
  UNRECOGNIZED = -1,
}

export function brokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotConditionFromJSON(
  object: any,
): BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition {
  switch (object) {
    case 0:
    case "NONE":
      return BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition.NONE;
    case 1:
    case "FAILING":
      return BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition.FAILING;
    case 2:
    case "ALL":
      return BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition.ALL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition.UNRECOGNIZED;
  }
}

export function brokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotConditionToJSON(
  object: BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition,
): string {
  switch (object) {
    case BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition.NONE:
      return "NONE";
    case BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition.FAILING:
      return "FAILING";
    case BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition.ALL:
      return "ALL";
    case BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** Result of a single link checked / network request */
export interface BrokenLinksResultV1_SyntheticLinkResult {
  /** Whether or not the status code is the same as "expected_status_code". */
  link_passed?:
    | boolean
    | undefined;
  /** The expected status code or status class. */
  expected_status_code:
    | ResponseStatusCode
    | undefined;
  /** Source_uri from which the target_uri is navigated from. */
  source_uri: string;
  /** Target_uri navigated to from the source_uri. */
  target_uri: string;
  /** Anchor text on the source URI. */
  anchor_text: string;
  /** HTML element from which target_uri was scraped. */
  html_element: string;
  /** Status code returned by the target_uri. */
  status_code?:
    | number
    | undefined;
  /**
   * 'BrokenLinksSynthetic_IncorrectStatusCode' if the expected and actual
   * status codes differ. Otherwise, the class of the error thrown, eg
   * 'connectionaborted', docs: https://pptr.dev/api/puppeteer.errorcode.
   */
  error_type: string;
  /** Error Message, if any */
  error_message: string;
  /** The start time of the link navigation in iso format. */
  link_start_time: string;
  /** The end time of the link navigation in iso format. */
  link_end_time: string;
  /** These fields only apply to the origin link. */
  is_origin?:
    | boolean
    | undefined;
  /** Output of screenshot upload attempt. */
  screenshot_output: BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput | undefined;
}

/** Result of Screenshot Upload to GCS. */
export interface BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput {
  /** Name of screenshot_file. */
  screenshot_file: string;
  /** Error that occurred throughout screenshot workflow. */
  screenshot_error: BaseError | undefined;
}

export interface SyntheticResult {
  synthetic_test_framework_result_v1?: TestFrameworkResultV1 | undefined;
  synthetic_generic_result_v1?: GenericResultV1 | undefined;
  synthetic_broken_links_result_v1?:
    | BrokenLinksResultV1
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
  return { error_type: "", error_message: "", stack_frames: [], stack_trace: "" };
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
    if (message.stack_trace !== "") {
      writer.uint32(34).string(message.stack_trace);
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
        case 4:
          if (tag !== 34) {
            break;
          }

          message.stack_trace = reader.string();
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
      stack_trace: isSet(object.stack_trace) ? String(object.stack_trace) : "",
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
    message.stack_trace !== undefined && (obj.stack_trace = message.stack_trace);
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
    message.stack_trace = object.stack_trace ?? "";
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
  return { error_type: "", error_message: "", function_name: "", file_path: "", line: undefined, stack_trace: "" };
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
    if (message.stack_trace !== "") {
      writer.uint32(50).string(message.stack_trace);
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
        case 6:
          if (tag !== 50) {
            break;
          }

          message.stack_trace = reader.string();
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
      stack_trace: isSet(object.stack_trace) ? String(object.stack_trace) : "",
    };
  },

  toJSON(message: GenericResultV1_GenericError): unknown {
    const obj: any = {};
    message.error_type !== undefined && (obj.error_type = message.error_type);
    message.error_message !== undefined && (obj.error_message = message.error_message);
    message.function_name !== undefined && (obj.function_name = message.function_name);
    message.file_path !== undefined && (obj.file_path = message.file_path);
    message.line !== undefined && (obj.line = Math.round(message.line));
    message.stack_trace !== undefined && (obj.stack_trace = message.stack_trace);
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
    message.stack_trace = object.stack_trace ?? "";
    return message;
  },
};

function createBaseResponseStatusCode(): ResponseStatusCode {
  return { status_value: undefined, status_class: undefined };
}

export const ResponseStatusCode = {
  encode(message: ResponseStatusCode, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status_value !== undefined) {
      writer.uint32(8).int32(message.status_value);
    }
    if (message.status_class !== undefined) {
      writer.uint32(16).int32(message.status_class);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseStatusCode {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseStatusCode();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.status_value = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.status_class = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ResponseStatusCode {
    return {
      status_value: isSet(object.status_value) ? Number(object.status_value) : undefined,
      status_class: isSet(object.status_class)
        ? responseStatusCode_StatusClassFromJSON(object.status_class)
        : undefined,
    };
  },

  toJSON(message: ResponseStatusCode): unknown {
    const obj: any = {};
    message.status_value !== undefined && (obj.status_value = Math.round(message.status_value));
    message.status_class !== undefined && (obj.status_class = message.status_class !== undefined
      ? responseStatusCode_StatusClassToJSON(message.status_class)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<ResponseStatusCode>, I>>(base?: I): ResponseStatusCode {
    return ResponseStatusCode.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ResponseStatusCode>, I>>(object: I): ResponseStatusCode {
    const message = createBaseResponseStatusCode();
    message.status_value = object.status_value ?? undefined;
    message.status_class = object.status_class ?? undefined;
    return message;
  },
};

function createBaseBaseError(): BaseError {
  return { error_type: "", error_message: "" };
}

export const BaseError = {
  encode(message: BaseError, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error_type !== "") {
      writer.uint32(10).string(message.error_type);
    }
    if (message.error_message !== "") {
      writer.uint32(18).string(message.error_message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BaseError {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBaseError();
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
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BaseError {
    return {
      error_type: isSet(object.error_type) ? String(object.error_type) : "",
      error_message: isSet(object.error_message) ? String(object.error_message) : "",
    };
  },

  toJSON(message: BaseError): unknown {
    const obj: any = {};
    message.error_type !== undefined && (obj.error_type = message.error_type);
    message.error_message !== undefined && (obj.error_message = message.error_message);
    return obj;
  },

  create<I extends Exact<DeepPartial<BaseError>, I>>(base?: I): BaseError {
    return BaseError.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BaseError>, I>>(object: I): BaseError {
    const message = createBaseBaseError();
    message.error_type = object.error_type ?? "";
    message.error_message = object.error_message ?? "";
    return message;
  },
};

function createBaseBrokenLinksResultV1(): BrokenLinksResultV1 {
  return {
    link_count: undefined,
    passing_link_count: undefined,
    failing_link_count: undefined,
    unreachable_count: undefined,
    status2xx_count: undefined,
    status3xx_count: undefined,
    status4xx_count: undefined,
    status5xx_count: undefined,
    options: undefined,
    origin_link_result: undefined,
    followed_link_results: [],
    execution_data_storage_path: "",
    errors: [],
  };
}

export const BrokenLinksResultV1 = {
  encode(message: BrokenLinksResultV1, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.link_count !== undefined) {
      writer.uint32(8).int64(message.link_count);
    }
    if (message.passing_link_count !== undefined) {
      writer.uint32(16).int64(message.passing_link_count);
    }
    if (message.failing_link_count !== undefined) {
      writer.uint32(24).int64(message.failing_link_count);
    }
    if (message.unreachable_count !== undefined) {
      writer.uint32(32).int64(message.unreachable_count);
    }
    if (message.status2xx_count !== undefined) {
      writer.uint32(40).int64(message.status2xx_count);
    }
    if (message.status3xx_count !== undefined) {
      writer.uint32(48).int64(message.status3xx_count);
    }
    if (message.status4xx_count !== undefined) {
      writer.uint32(56).int64(message.status4xx_count);
    }
    if (message.status5xx_count !== undefined) {
      writer.uint32(64).int64(message.status5xx_count);
    }
    if (message.options !== undefined) {
      BrokenLinksResultV1_BrokenLinkCheckerOptions.encode(message.options, writer.uint32(74).fork()).ldelim();
    }
    if (message.origin_link_result !== undefined) {
      BrokenLinksResultV1_SyntheticLinkResult.encode(message.origin_link_result, writer.uint32(82).fork()).ldelim();
    }
    for (const v of message.followed_link_results) {
      BrokenLinksResultV1_SyntheticLinkResult.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    if (message.execution_data_storage_path !== "") {
      writer.uint32(98).string(message.execution_data_storage_path);
    }
    for (const v of message.errors) {
      BaseError.encode(v!, writer.uint32(106).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BrokenLinksResultV1 {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrokenLinksResultV1();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.link_count = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.passing_link_count = longToNumber(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.failing_link_count = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.unreachable_count = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.status2xx_count = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.status3xx_count = longToNumber(reader.int64() as Long);
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.status4xx_count = longToNumber(reader.int64() as Long);
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.status5xx_count = longToNumber(reader.int64() as Long);
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.options = BrokenLinksResultV1_BrokenLinkCheckerOptions.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.origin_link_result = BrokenLinksResultV1_SyntheticLinkResult.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.followed_link_results.push(BrokenLinksResultV1_SyntheticLinkResult.decode(reader, reader.uint32()));
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.execution_data_storage_path = reader.string();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.errors.push(BaseError.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrokenLinksResultV1 {
    return {
      link_count: isSet(object.link_count) ? Number(object.link_count) : undefined,
      passing_link_count: isSet(object.passing_link_count) ? Number(object.passing_link_count) : undefined,
      failing_link_count: isSet(object.failing_link_count) ? Number(object.failing_link_count) : undefined,
      unreachable_count: isSet(object.unreachable_count) ? Number(object.unreachable_count) : undefined,
      status2xx_count: isSet(object.status2xx_count) ? Number(object.status2xx_count) : undefined,
      status3xx_count: isSet(object.status3xx_count) ? Number(object.status3xx_count) : undefined,
      status4xx_count: isSet(object.status4xx_count) ? Number(object.status4xx_count) : undefined,
      status5xx_count: isSet(object.status5xx_count) ? Number(object.status5xx_count) : undefined,
      options: isSet(object.options)
        ? BrokenLinksResultV1_BrokenLinkCheckerOptions.fromJSON(object.options)
        : undefined,
      origin_link_result: isSet(object.origin_link_result)
        ? BrokenLinksResultV1_SyntheticLinkResult.fromJSON(object.origin_link_result)
        : undefined,
      followed_link_results: Array.isArray(object?.followed_link_results)
        ? object.followed_link_results.map((e: any) => BrokenLinksResultV1_SyntheticLinkResult.fromJSON(e))
        : [],
      execution_data_storage_path: isSet(object.execution_data_storage_path)
        ? String(object.execution_data_storage_path)
        : "",
      errors: Array.isArray(object?.errors) ? object.errors.map((e: any) => BaseError.fromJSON(e)) : [],
    };
  },

  toJSON(message: BrokenLinksResultV1): unknown {
    const obj: any = {};
    message.link_count !== undefined && (obj.link_count = Math.round(message.link_count));
    message.passing_link_count !== undefined && (obj.passing_link_count = Math.round(message.passing_link_count));
    message.failing_link_count !== undefined && (obj.failing_link_count = Math.round(message.failing_link_count));
    message.unreachable_count !== undefined && (obj.unreachable_count = Math.round(message.unreachable_count));
    message.status2xx_count !== undefined && (obj.status2xx_count = Math.round(message.status2xx_count));
    message.status3xx_count !== undefined && (obj.status3xx_count = Math.round(message.status3xx_count));
    message.status4xx_count !== undefined && (obj.status4xx_count = Math.round(message.status4xx_count));
    message.status5xx_count !== undefined && (obj.status5xx_count = Math.round(message.status5xx_count));
    message.options !== undefined &&
      (obj.options = message.options
        ? BrokenLinksResultV1_BrokenLinkCheckerOptions.toJSON(message.options)
        : undefined);
    message.origin_link_result !== undefined && (obj.origin_link_result = message.origin_link_result
      ? BrokenLinksResultV1_SyntheticLinkResult.toJSON(message.origin_link_result)
      : undefined);
    if (message.followed_link_results) {
      obj.followed_link_results = message.followed_link_results.map((e) =>
        e ? BrokenLinksResultV1_SyntheticLinkResult.toJSON(e) : undefined
      );
    } else {
      obj.followed_link_results = [];
    }
    message.execution_data_storage_path !== undefined &&
      (obj.execution_data_storage_path = message.execution_data_storage_path);
    if (message.errors) {
      obj.errors = message.errors.map((e) => e ? BaseError.toJSON(e) : undefined);
    } else {
      obj.errors = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BrokenLinksResultV1>, I>>(base?: I): BrokenLinksResultV1 {
    return BrokenLinksResultV1.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrokenLinksResultV1>, I>>(object: I): BrokenLinksResultV1 {
    const message = createBaseBrokenLinksResultV1();
    message.link_count = object.link_count ?? undefined;
    message.passing_link_count = object.passing_link_count ?? undefined;
    message.failing_link_count = object.failing_link_count ?? undefined;
    message.unreachable_count = object.unreachable_count ?? undefined;
    message.status2xx_count = object.status2xx_count ?? undefined;
    message.status3xx_count = object.status3xx_count ?? undefined;
    message.status4xx_count = object.status4xx_count ?? undefined;
    message.status5xx_count = object.status5xx_count ?? undefined;
    message.options = (object.options !== undefined && object.options !== null)
      ? BrokenLinksResultV1_BrokenLinkCheckerOptions.fromPartial(object.options)
      : undefined;
    message.origin_link_result = (object.origin_link_result !== undefined && object.origin_link_result !== null)
      ? BrokenLinksResultV1_SyntheticLinkResult.fromPartial(object.origin_link_result)
      : undefined;
    message.followed_link_results =
      object.followed_link_results?.map((e) => BrokenLinksResultV1_SyntheticLinkResult.fromPartial(e)) || [];
    message.execution_data_storage_path = object.execution_data_storage_path ?? "";
    message.errors = object.errors?.map((e) => BaseError.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions(): BrokenLinksResultV1_BrokenLinkCheckerOptions {
  return {
    origin_uri: "",
    link_limit: undefined,
    query_selector_all: "",
    get_attributes: [],
    link_order: 0,
    link_timeout_millis: undefined,
    max_retries: undefined,
    wait_for_selector: "",
    per_link_options: {},
    total_synthetic_timeout_millis: undefined,
    screenshot_options: undefined,
  };
}

export const BrokenLinksResultV1_BrokenLinkCheckerOptions = {
  encode(message: BrokenLinksResultV1_BrokenLinkCheckerOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.origin_uri !== "") {
      writer.uint32(10).string(message.origin_uri);
    }
    if (message.link_limit !== undefined) {
      writer.uint32(16).int64(message.link_limit);
    }
    if (message.query_selector_all !== "") {
      writer.uint32(26).string(message.query_selector_all);
    }
    for (const v of message.get_attributes) {
      writer.uint32(34).string(v!);
    }
    if (message.link_order !== 0) {
      writer.uint32(40).int32(message.link_order);
    }
    if (message.link_timeout_millis !== undefined) {
      writer.uint32(48).int64(message.link_timeout_millis);
    }
    if (message.max_retries !== undefined) {
      writer.uint32(56).int64(message.max_retries);
    }
    if (message.wait_for_selector !== "") {
      writer.uint32(74).string(message.wait_for_selector);
    }
    Object.entries(message.per_link_options).forEach(([key, value]) => {
      BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry.encode(
        { key: key as any, value },
        writer.uint32(82).fork(),
      ).ldelim();
    });
    if (message.total_synthetic_timeout_millis !== undefined) {
      writer.uint32(88).int64(message.total_synthetic_timeout_millis);
    }
    if (message.screenshot_options !== undefined) {
      BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions.encode(
        message.screenshot_options,
        writer.uint32(98).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BrokenLinksResultV1_BrokenLinkCheckerOptions {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.origin_uri = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.link_limit = longToNumber(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.query_selector_all = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.get_attributes.push(reader.string());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.link_order = reader.int32() as any;
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.link_timeout_millis = longToNumber(reader.int64() as Long);
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.max_retries = longToNumber(reader.int64() as Long);
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.wait_for_selector = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          const entry10 = BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry.decode(
            reader,
            reader.uint32(),
          );
          if (entry10.value !== undefined) {
            message.per_link_options[entry10.key] = entry10.value;
          }
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.total_synthetic_timeout_millis = longToNumber(reader.int64() as Long);
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.screenshot_options = BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions.decode(
            reader,
            reader.uint32(),
          );
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrokenLinksResultV1_BrokenLinkCheckerOptions {
    return {
      origin_uri: isSet(object.origin_uri) ? String(object.origin_uri) : "",
      link_limit: isSet(object.link_limit) ? Number(object.link_limit) : undefined,
      query_selector_all: isSet(object.query_selector_all) ? String(object.query_selector_all) : "",
      get_attributes: Array.isArray(object?.get_attributes) ? object.get_attributes.map((e: any) => String(e)) : [],
      link_order: isSet(object.link_order)
        ? brokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrderFromJSON(object.link_order)
        : 0,
      link_timeout_millis: isSet(object.link_timeout_millis) ? Number(object.link_timeout_millis) : undefined,
      max_retries: isSet(object.max_retries) ? Number(object.max_retries) : undefined,
      wait_for_selector: isSet(object.wait_for_selector) ? String(object.wait_for_selector) : "",
      per_link_options: isObject(object.per_link_options)
        ? Object.entries(object.per_link_options).reduce<
          { [key: string]: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption }
        >((acc, [key, value]) => {
          acc[key] = BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption.fromJSON(value);
          return acc;
        }, {})
        : {},
      total_synthetic_timeout_millis: isSet(object.total_synthetic_timeout_millis)
        ? Number(object.total_synthetic_timeout_millis)
        : undefined,
      screenshot_options: isSet(object.screenshot_options)
        ? BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions.fromJSON(object.screenshot_options)
        : undefined,
    };
  },

  toJSON(message: BrokenLinksResultV1_BrokenLinkCheckerOptions): unknown {
    const obj: any = {};
    message.origin_uri !== undefined && (obj.origin_uri = message.origin_uri);
    message.link_limit !== undefined && (obj.link_limit = Math.round(message.link_limit));
    message.query_selector_all !== undefined && (obj.query_selector_all = message.query_selector_all);
    if (message.get_attributes) {
      obj.get_attributes = message.get_attributes.map((e) => e);
    } else {
      obj.get_attributes = [];
    }
    message.link_order !== undefined &&
      (obj.link_order = brokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrderToJSON(message.link_order));
    message.link_timeout_millis !== undefined && (obj.link_timeout_millis = Math.round(message.link_timeout_millis));
    message.max_retries !== undefined && (obj.max_retries = Math.round(message.max_retries));
    message.wait_for_selector !== undefined && (obj.wait_for_selector = message.wait_for_selector);
    obj.per_link_options = {};
    if (message.per_link_options) {
      Object.entries(message.per_link_options).forEach(([k, v]) => {
        obj.per_link_options[k] = BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption.toJSON(v);
      });
    }
    message.total_synthetic_timeout_millis !== undefined &&
      (obj.total_synthetic_timeout_millis = Math.round(message.total_synthetic_timeout_millis));
    message.screenshot_options !== undefined && (obj.screenshot_options = message.screenshot_options
      ? BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions.toJSON(message.screenshot_options)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<BrokenLinksResultV1_BrokenLinkCheckerOptions>, I>>(
    base?: I,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions {
    return BrokenLinksResultV1_BrokenLinkCheckerOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrokenLinksResultV1_BrokenLinkCheckerOptions>, I>>(
    object: I,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions {
    const message = createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions();
    message.origin_uri = object.origin_uri ?? "";
    message.link_limit = object.link_limit ?? undefined;
    message.query_selector_all = object.query_selector_all ?? "";
    message.get_attributes = object.get_attributes?.map((e) => e) || [];
    message.link_order = object.link_order ?? 0;
    message.link_timeout_millis = object.link_timeout_millis ?? undefined;
    message.max_retries = object.max_retries ?? undefined;
    message.wait_for_selector = object.wait_for_selector ?? "";
    message.per_link_options = Object.entries(object.per_link_options ?? {}).reduce<
      { [key: string]: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption }
    >((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption.fromPartial(value);
      }
      return acc;
    }, {});
    message.total_synthetic_timeout_millis = object.total_synthetic_timeout_millis ?? undefined;
    message.screenshot_options = (object.screenshot_options !== undefined && object.screenshot_options !== null)
      ? BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions.fromPartial(object.screenshot_options)
      : undefined;
    return message;
  },
};

function createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption(): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption {
  return { expected_status_code: undefined, link_timeout_millis: undefined };
}

export const BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption = {
  encode(
    message: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.expected_status_code !== undefined) {
      ResponseStatusCode.encode(message.expected_status_code, writer.uint32(10).fork()).ldelim();
    }
    if (message.link_timeout_millis !== undefined) {
      writer.uint32(16).int64(message.link_timeout_millis);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expected_status_code = ResponseStatusCode.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.link_timeout_millis = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption {
    return {
      expected_status_code: isSet(object.expected_status_code)
        ? ResponseStatusCode.fromJSON(object.expected_status_code)
        : undefined,
      link_timeout_millis: isSet(object.link_timeout_millis) ? Number(object.link_timeout_millis) : undefined,
    };
  },

  toJSON(message: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption): unknown {
    const obj: any = {};
    message.expected_status_code !== undefined && (obj.expected_status_code = message.expected_status_code
      ? ResponseStatusCode.toJSON(message.expected_status_code)
      : undefined);
    message.link_timeout_millis !== undefined && (obj.link_timeout_millis = Math.round(message.link_timeout_millis));
    return obj;
  },

  create<I extends Exact<DeepPartial<BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption>, I>>(
    base?: I,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption {
    return BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption>, I>>(
    object: I,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption {
    const message = createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption();
    message.expected_status_code = (object.expected_status_code !== undefined && object.expected_status_code !== null)
      ? ResponseStatusCode.fromPartial(object.expected_status_code)
      : undefined;
    message.link_timeout_millis = object.link_timeout_millis ?? undefined;
    return message;
  },
};

function createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry(): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry {
  return { key: "", value: undefined };
}

export const BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry = {
  encode(
    message: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption.encode(message.value, writer.uint32(18).fork())
        .ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry();
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

          message.value = BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value)
        ? BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption.fromJSON(object.value)
        : undefined,
    };
  },

  toJSON(message: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value
      ? BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption.toJSON(message.value)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry>, I>>(
    base?: I,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry {
    return BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry>, I>>(
    object: I,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry {
    const message = createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOptionsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions(): BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions {
  return { storage_location: "", screenshot_condition: 0 };
}

export const BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions = {
  encode(
    message: BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.storage_location !== "") {
      writer.uint32(10).string(message.storage_location);
    }
    if (message.screenshot_condition !== 0) {
      writer.uint32(16).int32(message.screenshot_condition);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.storage_location = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.screenshot_condition = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions {
    return {
      storage_location: isSet(object.storage_location) ? String(object.storage_location) : "",
      screenshot_condition: isSet(object.screenshot_condition)
        ? brokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotConditionFromJSON(
          object.screenshot_condition,
        )
        : 0,
    };
  },

  toJSON(message: BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions): unknown {
    const obj: any = {};
    message.storage_location !== undefined && (obj.storage_location = message.storage_location);
    message.screenshot_condition !== undefined &&
      (obj.screenshot_condition =
        brokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotConditionToJSON(
          message.screenshot_condition,
        ));
    return obj;
  },

  create<I extends Exact<DeepPartial<BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions>, I>>(
    base?: I,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions {
    return BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions>, I>>(
    object: I,
  ): BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions {
    const message = createBaseBrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions();
    message.storage_location = object.storage_location ?? "";
    message.screenshot_condition = object.screenshot_condition ?? 0;
    return message;
  },
};

function createBaseBrokenLinksResultV1_SyntheticLinkResult(): BrokenLinksResultV1_SyntheticLinkResult {
  return {
    link_passed: undefined,
    expected_status_code: undefined,
    source_uri: "",
    target_uri: "",
    anchor_text: "",
    html_element: "",
    status_code: undefined,
    error_type: "",
    error_message: "",
    link_start_time: "",
    link_end_time: "",
    is_origin: undefined,
    screenshot_output: undefined,
  };
}

export const BrokenLinksResultV1_SyntheticLinkResult = {
  encode(message: BrokenLinksResultV1_SyntheticLinkResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.link_passed !== undefined) {
      writer.uint32(8).bool(message.link_passed);
    }
    if (message.expected_status_code !== undefined) {
      ResponseStatusCode.encode(message.expected_status_code, writer.uint32(18).fork()).ldelim();
    }
    if (message.source_uri !== "") {
      writer.uint32(26).string(message.source_uri);
    }
    if (message.target_uri !== "") {
      writer.uint32(34).string(message.target_uri);
    }
    if (message.anchor_text !== "") {
      writer.uint32(42).string(message.anchor_text);
    }
    if (message.html_element !== "") {
      writer.uint32(50).string(message.html_element);
    }
    if (message.status_code !== undefined) {
      writer.uint32(56).int64(message.status_code);
    }
    if (message.error_type !== "") {
      writer.uint32(66).string(message.error_type);
    }
    if (message.error_message !== "") {
      writer.uint32(74).string(message.error_message);
    }
    if (message.link_start_time !== "") {
      writer.uint32(82).string(message.link_start_time);
    }
    if (message.link_end_time !== "") {
      writer.uint32(90).string(message.link_end_time);
    }
    if (message.is_origin !== undefined) {
      writer.uint32(96).bool(message.is_origin);
    }
    if (message.screenshot_output !== undefined) {
      BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput.encode(
        message.screenshot_output,
        writer.uint32(106).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BrokenLinksResultV1_SyntheticLinkResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrokenLinksResultV1_SyntheticLinkResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.link_passed = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.expected_status_code = ResponseStatusCode.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.source_uri = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.target_uri = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.anchor_text = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.html_element = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.status_code = longToNumber(reader.int64() as Long);
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.error_type = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.error_message = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.link_start_time = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.link_end_time = reader.string();
          continue;
        case 12:
          if (tag !== 96) {
            break;
          }

          message.is_origin = reader.bool();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.screenshot_output = BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput.decode(
            reader,
            reader.uint32(),
          );
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrokenLinksResultV1_SyntheticLinkResult {
    return {
      link_passed: isSet(object.link_passed) ? Boolean(object.link_passed) : undefined,
      expected_status_code: isSet(object.expected_status_code)
        ? ResponseStatusCode.fromJSON(object.expected_status_code)
        : undefined,
      source_uri: isSet(object.source_uri) ? String(object.source_uri) : "",
      target_uri: isSet(object.target_uri) ? String(object.target_uri) : "",
      anchor_text: isSet(object.anchor_text) ? String(object.anchor_text) : "",
      html_element: isSet(object.html_element) ? String(object.html_element) : "",
      status_code: isSet(object.status_code) ? Number(object.status_code) : undefined,
      error_type: isSet(object.error_type) ? String(object.error_type) : "",
      error_message: isSet(object.error_message) ? String(object.error_message) : "",
      link_start_time: isSet(object.link_start_time) ? String(object.link_start_time) : "",
      link_end_time: isSet(object.link_end_time) ? String(object.link_end_time) : "",
      is_origin: isSet(object.is_origin) ? Boolean(object.is_origin) : undefined,
      screenshot_output: isSet(object.screenshot_output)
        ? BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput.fromJSON(object.screenshot_output)
        : undefined,
    };
  },

  toJSON(message: BrokenLinksResultV1_SyntheticLinkResult): unknown {
    const obj: any = {};
    message.link_passed !== undefined && (obj.link_passed = message.link_passed);
    message.expected_status_code !== undefined && (obj.expected_status_code = message.expected_status_code
      ? ResponseStatusCode.toJSON(message.expected_status_code)
      : undefined);
    message.source_uri !== undefined && (obj.source_uri = message.source_uri);
    message.target_uri !== undefined && (obj.target_uri = message.target_uri);
    message.anchor_text !== undefined && (obj.anchor_text = message.anchor_text);
    message.html_element !== undefined && (obj.html_element = message.html_element);
    message.status_code !== undefined && (obj.status_code = Math.round(message.status_code));
    message.error_type !== undefined && (obj.error_type = message.error_type);
    message.error_message !== undefined && (obj.error_message = message.error_message);
    message.link_start_time !== undefined && (obj.link_start_time = message.link_start_time);
    message.link_end_time !== undefined && (obj.link_end_time = message.link_end_time);
    message.is_origin !== undefined && (obj.is_origin = message.is_origin);
    message.screenshot_output !== undefined && (obj.screenshot_output = message.screenshot_output
      ? BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput.toJSON(message.screenshot_output)
      : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<BrokenLinksResultV1_SyntheticLinkResult>, I>>(
    base?: I,
  ): BrokenLinksResultV1_SyntheticLinkResult {
    return BrokenLinksResultV1_SyntheticLinkResult.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrokenLinksResultV1_SyntheticLinkResult>, I>>(
    object: I,
  ): BrokenLinksResultV1_SyntheticLinkResult {
    const message = createBaseBrokenLinksResultV1_SyntheticLinkResult();
    message.link_passed = object.link_passed ?? undefined;
    message.expected_status_code = (object.expected_status_code !== undefined && object.expected_status_code !== null)
      ? ResponseStatusCode.fromPartial(object.expected_status_code)
      : undefined;
    message.source_uri = object.source_uri ?? "";
    message.target_uri = object.target_uri ?? "";
    message.anchor_text = object.anchor_text ?? "";
    message.html_element = object.html_element ?? "";
    message.status_code = object.status_code ?? undefined;
    message.error_type = object.error_type ?? "";
    message.error_message = object.error_message ?? "";
    message.link_start_time = object.link_start_time ?? "";
    message.link_end_time = object.link_end_time ?? "";
    message.is_origin = object.is_origin ?? undefined;
    message.screenshot_output = (object.screenshot_output !== undefined && object.screenshot_output !== null)
      ? BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput.fromPartial(object.screenshot_output)
      : undefined;
    return message;
  },
};

function createBaseBrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput(): BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput {
  return { screenshot_file: "", screenshot_error: undefined };
}

export const BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput = {
  encode(
    message: BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.screenshot_file !== "") {
      writer.uint32(10).string(message.screenshot_file);
    }
    if (message.screenshot_error !== undefined) {
      BaseError.encode(message.screenshot_error, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.screenshot_file = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.screenshot_error = BaseError.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput {
    return {
      screenshot_file: isSet(object.screenshot_file) ? String(object.screenshot_file) : "",
      screenshot_error: isSet(object.screenshot_error) ? BaseError.fromJSON(object.screenshot_error) : undefined,
    };
  },

  toJSON(message: BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput): unknown {
    const obj: any = {};
    message.screenshot_file !== undefined && (obj.screenshot_file = message.screenshot_file);
    message.screenshot_error !== undefined &&
      (obj.screenshot_error = message.screenshot_error ? BaseError.toJSON(message.screenshot_error) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput>, I>>(
    base?: I,
  ): BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput {
    return BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput>, I>>(
    object: I,
  ): BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput {
    const message = createBaseBrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput();
    message.screenshot_file = object.screenshot_file ?? "";
    message.screenshot_error = (object.screenshot_error !== undefined && object.screenshot_error !== null)
      ? BaseError.fromPartial(object.screenshot_error)
      : undefined;
    return message;
  },
};

function createBaseSyntheticResult(): SyntheticResult {
  return {
    synthetic_test_framework_result_v1: undefined,
    synthetic_generic_result_v1: undefined,
    synthetic_broken_links_result_v1: undefined,
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
    if (message.synthetic_broken_links_result_v1 !== undefined) {
      BrokenLinksResultV1.encode(message.synthetic_broken_links_result_v1, writer.uint32(26).fork()).ldelim();
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
        case 3:
          if (tag !== 26) {
            break;
          }

          message.synthetic_broken_links_result_v1 = BrokenLinksResultV1.decode(reader, reader.uint32());
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
      synthetic_broken_links_result_v1: isSet(object.synthetic_broken_links_result_v1)
        ? BrokenLinksResultV1.fromJSON(object.synthetic_broken_links_result_v1)
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
    message.synthetic_broken_links_result_v1 !== undefined &&
      (obj.synthetic_broken_links_result_v1 = message.synthetic_broken_links_result_v1
        ? BrokenLinksResultV1.toJSON(message.synthetic_broken_links_result_v1)
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
    message.synthetic_broken_links_result_v1 =
      (object.synthetic_broken_links_result_v1 !== undefined && object.synthetic_broken_links_result_v1 !== null)
        ? BrokenLinksResultV1.fromPartial(object.synthetic_broken_links_result_v1)
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

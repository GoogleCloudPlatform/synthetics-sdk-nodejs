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

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  BatchSpanProcessor,
  AlwaysOnSampler,
} from '@opentelemetry/sdk-trace-base';
import { Span, TraceFlags } from '@opentelemetry/api';
import { GoogleAuth, GoogleAuthOptions } from 'google-auth-library';
import { Logger } from 'winston';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';

const LOGGING_TRACE_KEY = 'logging.googleapis.com/trace';
const LOGGING_SPAN_KEY = 'logging.googleapis.com/spanId';
const LOGGING_SAMPLED_KEY = 'logging.googleapis.com/trace_sampled';
const LOGGING_SEVERITY_KEY = 'severity';

const levelToSeverityMap: { [key: string]: string } = {
  error: 'ERROR',
  warn: 'WARNING',
  info: 'INFO',
  http: 'INFO',
  verbose: 'DEBUG',
  debug: 'DEBUG',
  silly: 'DEBUG',
};

let singletonAutoInstrumentation: SyntheticsAutoInstrumentation | null;

/**
 * @public
 *
 * This function sets up user authored synthetic code with a baseline open
 * telemetry setup that will write traces and logs to cloud trace and cloud
 * logging.
 *
 * NOTE: For this module to be used effectively, it needs to be included
 * and ran before any other code within your synthetic application runs.
 */
export const instantiateAutoInstrumentation = (
  args: { googleAuthOptions?: GoogleAuthOptions } = {}
) => {
  singletonAutoInstrumentation = new SyntheticsAutoInstrumentation(args);
};

/**
 * @public
 *
 * Returns a winston logger that is instrumented to use the console transport.
 *
 * If {@link #instantiateAutoInstrumentation} is ran prior to any other code,
 * and a project id is detected according to the logs will be instrumented
 * with trace information that is formated in gcp's
 * {@link https://cloud.google.com/logging/docs/structured-logging|structured logging}
 * format.
 */
export const getInstrumentedLogger = async (): Promise<Logger> => {
  if (singletonAutoInstrumentation) {
    return await singletonAutoInstrumentation.getInstrumentedLogger();
  } else {
    const winston = require('winston');
    return winston.createLogger({
      transports: [new winston.transports.Console()],
    });
  }
};

class SyntheticsAutoInstrumentation {
  provider: NodeTracerProvider;

  private logger: Logger;
  private gcpProjectId?: string | null;
  private authArgs: GoogleAuthOptions;

  constructor(args: { googleAuthOptions?: GoogleAuthOptions } = {}) {
    this.authArgs = args.googleAuthOptions || {};

    this.provider = new NodeTracerProvider({
      sampler: new AlwaysOnSampler(),
    });
    const exporter = new TraceExporter();
    this.provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    this.provider.register();

    // add node auto instrumentation
    registerInstrumentations({
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-winston': {
            logHook: (span: Span, record: Record<string, string | boolean>) => {
              // If the auto instrumentation has detected a project id, convert
              // otel fields that are automatically added to the record to use
              // structured logging fields instead.
              if (this.gcpProjectId) {
                record[LOGGING_TRACE_KEY] = `projects/${
                  this.gcpProjectId
                }/traces/${span.spanContext().traceId}`;
                record[LOGGING_SPAN_KEY] = span.spanContext().spanId;
                record[LOGGING_SAMPLED_KEY] =
                  span.spanContext().traceFlags === TraceFlags.SAMPLED;
                record[LOGGING_SEVERITY_KEY] =
                  levelToSeverityMap[String(record.level)] ?? 'DEFAULT';
                delete record['span_id'];
                delete record['trace_flags'];
                delete record['level'];
                delete record['trace_id'];
              }
            },
          },
        }),
      ],
    });

    // Require dependencies after instrumentation is registered,
    // otherwise they wont be instrumented.
    const winston = require('winston');
    const logger = winston.createLogger({
      transports: [new winston.transports.Console()],
    });
    this.logger = logger;
  }

  async getInstrumentedLogger(): Promise<Logger> {
    this.gcpProjectId = await resolveProjectId(
      this.gcpProjectId,
      this.authArgs
    );
    return this.logger;
  }
}

/**
 * @public
 *
 * Resolves and caches the project ID, a field that is required for formatting
 * structured logs.
 */
export const resolveProjectId = async (
  gcpProjectId?: string | null,
  googleAuthOptions?: GoogleAuthOptions
): Promise<string | null> => {
  // if gcpProjectId has been instantiated, return it. Otherwise attempt to
  // resolve at most 1 times, assign to null otherwise.
  if (typeof gcpProjectId === 'string' || gcpProjectId === null) {
    return gcpProjectId;
  }

  const auth = new GoogleAuth({
    credentials: googleAuthOptions?.credentials,
    keyFile: googleAuthOptions?.keyFile,
    keyFilename: googleAuthOptions?.keyFilename,
    projectId: googleAuthOptions?.projectId,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  try {
    return await auth.getProjectId();
  } catch (e) {
    console.log(
      'Unable to resolve gcpProjectId, logs will not be written in GCP Structured Logging format'
    );
  }

  return null;
};

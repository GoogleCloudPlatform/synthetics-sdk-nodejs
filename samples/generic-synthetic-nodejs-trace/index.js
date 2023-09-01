// Obfuscated within @google-cloud/synthetics-sdk-api
// This would be within an exported function `registerSyntheticOtel`, that is called
// first line of code in synthetic code (see index.js below)
const { trace, context } = require("@opentelemetry/api");
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { AlwaysOnSampler } = require('@opentelemetry/core');
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');

// exported from '@google-cloud/synthetics-sdk-api', see index.js below for usge
function registerSyntheticOtel() {
        const provider = new NodeTracerProvider({
                sampler: new AlwaysOnSampler()
        });

        const exporter = new TraceExporter();
        provider.addSpanProcessor(new BatchSpanProcessor(exporter));

        // register globally
        provider.register();

        // add node auto instrumentation
        registerInstrumentations({
                instrumentations: [
                    getNodeAutoInstrumentations()
                ],
        });
	return provider;
}

// Some version of this code  would be added to runSyntheticHandler http://shortn/_hxDARqaHwQ
function instrumentHandler(handler) {
	return (req, res) => {
                const span = trace.getSpan(context.active());

                if (span != null) {
                        span.updateName('Synthetic Monitor');
                }

                handler(req, res);
                // Add custom attributes to the span based off of success / failure after handler runs? 
	};
}

function getLogger(winston) {
	return winston.createLogger({
		transports: [new winston.transports.Console()],
	});
	return logger;
}

// index.js
//
// registerSyntheticOtel would be its own exported function that users call before any code runs
// By having this be an optional call, users can opt out and set up their own otel experience 
// Node: consider returning a logger from registerSyntheticOtel instead of a separate getLogger?
const { runSyntheticHandler/*, registerSyntheticOtel, getLogger*/} = require('@google-cloud/synthetics-sdk-api');
// Call before any code runs or dependencies are installed
// as registerSyntheticOtel monkey patches native libraries
registerSyntheticOtel();
const winston = require('winston'); // this would be required in getLogger call, after registerSyntheticOtel is called.

const logger = getLogger(winston);
const axios = require('axios');
const assert = require('node:assert');

// instrumentHandler code would be added to runSyntheticHandler
// pretend its not in the following line of code
exports.SyntheticFunction = instrumentHandler(runSyntheticHandler(async() => {
  const url = 'https://www.example.com';
  logger.info('about to make the request');
  await assert.doesNotReject(axios(url));
  await assert.doesNotReject(axios('https://www.google.com'));
  logger.info('made the request');
}));

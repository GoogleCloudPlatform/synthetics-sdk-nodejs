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

import { expect } from 'chai';
import * as http from 'http';
import { AddressInfo } from 'net';
import { resolveProjectNumber } from '../../src/project_number_resolver';

describe('resolveProjectNumber', () => {
  let originalMetadataHost: string | undefined;
  let server: http.Server | null = null;

  beforeEach(() => {
    originalMetadataHost = process.env.GCE_METADATA_HOST;
  });

  afterEach(async () => {
    if (originalMetadataHost === undefined) {
      delete process.env.GCE_METADATA_HOST;
    } else {
      process.env.GCE_METADATA_HOST = originalMetadataHost;
    }
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
      server = null;
    }
  });

  it('returns the numeric project number from the metadata server', async () => {
    let receivedFlavor: string | string[] | undefined;
    let receivedUrl: string | undefined;

    server = http.createServer((req, res) => {
      receivedFlavor = req.headers['metadata-flavor'];
      receivedUrl = req.url;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('123456789012\n');
    });

    await new Promise<void>((resolve) =>
      server!.listen(0, '127.0.0.1', () => resolve())
    );
    const port = (server.address() as AddressInfo).port;
    process.env.GCE_METADATA_HOST = `127.0.0.1:${port}`;

    const result = await resolveProjectNumber();
    expect(result).to.equal('123456789012');
    expect(receivedFlavor).to.equal('Google');
    expect(receivedUrl).to.equal(
      '/computeMetadata/v1/project/numeric-project-id'
    );
  });

  it('strips an optional http:// scheme from GCE_METADATA_HOST', async () => {
    server = http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('987654321');
    });

    await new Promise<void>((resolve) =>
      server!.listen(0, '127.0.0.1', () => resolve())
    );
    const port = (server.address() as AddressInfo).port;
    process.env.GCE_METADATA_HOST = `http://127.0.0.1:${port}`;

    const result = await resolveProjectNumber();
    expect(result).to.equal('987654321');
  });

  it('returns null when metadata server responds with non-200 status', async () => {
    server = http.createServer((_req, res) => {
      res.writeHead(404);
      res.end('Not Found');
    });

    await new Promise<void>((resolve) =>
      server!.listen(0, '127.0.0.1', () => resolve())
    );
    const port = (server.address() as AddressInfo).port;
    process.env.GCE_METADATA_HOST = `127.0.0.1:${port}`;

    const result = await resolveProjectNumber();
    expect(result).to.be.null;
  });

  it('returns null when metadata server returns non-numeric content', async () => {
    server = http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('not-a-project-number');
    });

    await new Promise<void>((resolve) =>
      server!.listen(0, '127.0.0.1', () => resolve())
    );
    const port = (server.address() as AddressInfo).port;
    process.env.GCE_METADATA_HOST = `127.0.0.1:${port}`;

    const result = await resolveProjectNumber();
    expect(result).to.be.null;
  });

  it('returns null when metadata server is unreachable', async () => {
    server = http.createServer();
    await new Promise<void>((resolve) =>
      server!.listen(0, '127.0.0.1', () => resolve())
    );
    const port = (server.address() as AddressInfo).port;
    await new Promise<void>((resolve) => server!.close(() => resolve()));
    server = null;

    process.env.GCE_METADATA_HOST = `127.0.0.1:${port}`;

    const result = await resolveProjectNumber();
    expect(result).to.be.null;
  });
});

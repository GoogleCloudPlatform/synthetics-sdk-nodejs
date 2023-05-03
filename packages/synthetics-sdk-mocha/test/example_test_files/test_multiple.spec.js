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

const {expect} = require('chai');

describe('Running multiple tests', async () => {
  let an_uninitialized_variable;
  beforeEach(() => {
    an_uninitialized_variable = 5;
  });

  it('an_uninitialized_variable is set', () => {
    expect(an_uninitialized_variable).to.equal(5);
  });

  it('an_uninitialized_variable is set to the wrong thing', () => {
    expect(an_uninitialized_variable).to.equal(-1);
  });

  describe('a sub suite', () => {
    it('throws an error', () => {
      throw new Error('I threw it');
    });

    it('is pending');
  });
});

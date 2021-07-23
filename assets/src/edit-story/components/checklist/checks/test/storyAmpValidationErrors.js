/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Internal dependencies
 */
import { getStoryAmpValidationErrors } from '../storyAmpValidationErrors';

describe('getStoryAmpValidationErrors', () => {
  afterEach(() => {
    global.fetch.mockClear();
  });

  it('should return false if no link or status is draft', async () => {
    expect(
      await getStoryAmpValidationErrors({ link: null, status: 'draft' })
    ).toBe(false);
  });

  it('should return false if there are no violations', async () => {
    expect(
      await getStoryAmpValidationErrors({
        link: 'http://test/web-stories/123',
        status: 'publish',
      })
    ).toBe(false);
  });

  it('should return true if there are AMP violations', async () => {
    expect(
      await getStoryAmpValidationErrors({
        link: 'http://test/web-stories/123',
        status: 'publish',
      })
    ).toBe(true);
  });
});

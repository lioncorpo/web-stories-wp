/*
 * Copyright 2020 Google LLC
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
 * External dependencies
 */
import { createNewStory } from '@web-stories-wp/e2e-test-utils';

describe('Inserting 3P Media', () => {
  it('should dismiss message', async () => {
    await createNewStory();

    await expect(page).toClick('#library-tab-media3p');
    await expect(page).toClick('button', { text: 'Dismiss' });
    await expect(page).not.toMatch(
      'Your use of stock content is subject to third party terms'
    );
  });
  it('should insert an Unsplash image', async () => {
    await createNewStory();

    await expect(page).toClick('#library-tab-media3p');

    await expect(page).toMatchElement('button', { text: 'Image' });
    await expect(page).toClick('button', { text: 'Image' });

    await page.waitForSelector(
      '#library-pane-media3p [data-testid="mediaElement-image"]'
    );
    // Clicking will only act on the first element.
    await expect(page).toClick(
      '#library-pane-media3p [data-testid="mediaElement-image"]'
    );

    await page.waitForSelector('[data-testid="imageElement"]');
    await expect(page).toMatchElement('[data-testid="imageElement"]');
  });
  // Skipped for https://github.com/google/web-stories-wp/issues/7481
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should insert an coverr video', async () => {
    await createNewStory();

    await expect(page).toClick('#library-tab-media3p');

    await expect(page).toMatchElement('button', { text: 'Video' });
    await expect(page).toClick('button', { text: 'Video' });

    await page.waitForSelector(
      '#library-pane-media3p [data-testid="mediaElement-video"]'
    );
    // Clicking will only act on the first element.
    await expect(page).toClick(
      '#library-pane-media3p [data-testid="mediaElement-video"]'
    );

    await page.waitForSelector('[data-testid="videoElement"]');
    await expect(page).toMatchElement('[data-testid="videoElement"]');
  });
  it('should insert an tenor gif', async () => {
    await createNewStory();

    await expect(page).toClick('#library-tab-media3p');

    await expect(page).toMatchElement('button', { text: 'GIFs' });
    await expect(page).toClick('button', { text: 'GIFs' });

    await page.waitForSelector(
      '#library-pane-media3p [data-testid="mediaElement-gif"]'
    );
    // Clicking will only act on the first element.
    await expect(page).toClick(
      '#library-pane-media3p [data-testid="mediaElement-gif"]'
    );

    await page.waitForSelector('[data-testid="imageElement"]');
    await expect(page).toMatchElement('[data-testid="imageElement"]');
  });
});

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
import { createResource, getResourceSize } from '@web-stories-wp/media';

/**
 * Generates a resource object from a WordPress media picker object.
 *
 * @param {Object} mediaPickerEl WP Media Picker object.
 * @return {import('@web-stories-wp/media').Resource} Resource object.
 */
const getResourceFromMediaPicker = (mediaPickerEl) => {
  const {
    src,
    url,
    mime: mimeType,
    title,
    alt,
    description,
    date,
    id,
    featured_media: posterId,
    featured_media_src: {
      src: poster,
      width: posterWidth,
      height: posterHeight,
      generated: posterGenerated,
    } = '',
    media_details: {
      width,
      height,
      length,
      length_formatted: lengthFormatted,
      sizes,
    },
    media_source: mediaSource,
    meta: { web_stories_is_muted: isMuted },
  } = mediaPickerEl;

  return createResource({
    mimeType,
    uploadDate: date,
    src: url || src,
    ...getResourceSize({
      width,
      height,
      posterGenerated,
      posterWidth,
      posterHeight,
    }),
    poster,
    posterId,
    id,
    length,
    lengthFormatted,
    alt: alt || description || title,
    title,
    sizes,
    local: false,
    isOptimized: 'video-optimization' === mediaSource,
    isMuted,
  });
};

export default getResourceFromMediaPicker;

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
import {
  createResource,
  getTypeFromMime,
  getResourceSize,
} from '@web-stories-wp/media';

/**
 * MediaDetails object.
 *
 * @typedef {Object} MediaDetails Media details object.
 * @property {number} width Media width.
 * @property {number} height Media height.
 * @property {number} length Video duration.
 * @property {string} length_formatted Formatted video duration.
 */

/**
 * WPAttachment object.
 *
 * @typedef {Object} WPAttachment WordPress media object.
 * @property {number} id Numeric attachment ID.
 * @property {string} date_gmt Creation date in GMT.
 * @property {string} mime_type Media mime type.
 * @property {number} featured_media ID of the media item's poster ID.
 * @property {string} alt_text Alt text.
 * @property {string} source_url Media URL.
 * @property {string} media_source Media source.
 * @property {MediaDetails} media_details Media details.
 */

function getImageResourceFromAttachment(attachment) {
  const {
    id,
    date_gmt,
    media_details: { width, height, sizes },
    title: { raw: title },
    mime_type: mimeType,
    alt_text: alt,
    source_url: src,
  } = attachment;

  return createResource({
    mimeType,
    creationDate: date_gmt,
    src,
    width,
    height,
    id,
    // TODO(#8286): Remove or move to server.
    alt: alt || title,
    title,
    sizes,
    local: false,
  });
}

function getVideoResourceFromAttachment(attachment) {
  const {
    id,
    date_gmt,
    media_details: { width, height, length, length_formatted: lengthFormatted },
    title: { raw: title },
    mime_type: mimeType,
    featured_media: posterId,
    featured_media_src: {
      src: poster,
      width: posterWidth,
      height: posterHeight,
      generated: posterGenerated,
    },
    meta: { web_stories_is_muted: isMuted },
    alt_text: alt,
    source_url: src,
    media_source: mediaSource,
  } = attachment;

  return createResource({
    mimeType,
    creationDate: date_gmt,
    src,
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
    // TODO(#8286): Remove or move to server.
    alt: alt || title,
    title,
    local: false,
    isOptimized: 'video-optimization' === mediaSource,
    isMuted,
  });
}

function getGifResourceFromAttachment(attachment) {
  const {
    id,
    date_gmt,
    media_details: { width, height },
    title: { raw: title },
    mime_type: mimeType,
    featured_media: posterId,
    featured_media_src: {
      src: poster,
      width: posterWidth,
      height: posterHeight,
      generated: posterGenerated,
    },
    alt_text: alt,
    source_url: src,
  } = attachment;

  return createResource({
    type: 'gif',
    mimeType: 'image/gif',
    creationDate: date_gmt,
    src,
    ...getResourceSize({
      width,
      height,
      posterGenerated,
      posterWidth,
      posterHeight,
    }),
    posterId,
    poster,
    id,
    // TODO(#8286): Remove or move to server.
    alt: alt || title,
    title,
    local: false,
    isOptimized: true,
    output: {
      mimeType: mimeType,
      src: src,
    },
  });
}

/**
 * Generates a resource object from a WordPress attachment.
 *
 * @param {WPAttachment} attachment WP Attachment object.
 * @return {import('./createResource').Resource} Resource object.
 */
function getResourceFromAttachment(attachment) {
  const { mime_type: mimeType, media_source: mediaSource } = attachment;

  if ('gif-conversion' === mediaSource) {
    return getGifResourceFromAttachment(attachment);
  }

  const type = getTypeFromMime(mimeType);

  if (type === 'image') {
    return getImageResourceFromAttachment(attachment);
  } else {
    return getVideoResourceFromAttachment(attachment);
  }
}

export default getResourceFromAttachment;

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
import { getTimeTracker } from '@web-stories-wp/tracking';
import { DATA_VERSION, migrate } from '@web-stories-wp/migration';

async function loadTemplate(title, imageBaseUrl) {
  const data = await import(
    /* webpackChunkName: "chunk-web-stories-template-[index]" */ `./raw/${title}`
  );

  const template = {
    ...data.default,
    pages: (data.default.pages || []).map((page) => ({
      ...page,
      elements: page.elements?.map((elem) => {
        if (elem?.resource?.sizes) {
          elem.resource.sizes = [];
        }
        if (elem?.resource?.src) {
          // imageBaseUrl (cdnURL) will always have a trailing slash,
          // so make sure to avoid double slashes when replacing.
          elem.resource.src = elem.resource.src.replace(
            '__WEB_STORIES_TEMPLATE_BASE_URL__/',
            imageBaseUrl
          );
        }

        if (elem?.resource?.poster) {
          // imageBaseUrl (cdnURL) will always have a trailing slash,
          // so make sure to avoid double slashes when replacing.
          elem.resource.poster = elem.resource.poster.replace(
            '__WEB_STORIES_TEMPLATE_BASE_URL__/',
            imageBaseUrl
          );
        }

        return elem;
      }),
    })),
  };

  return {
    ...migrate(template, template.version),
    version: DATA_VERSION,
  };
}

async function getTemplates(imageBaseUrl) {
  const templateNames = [
    'fresh-and-bright',
    'food-and-stuff',
    'doers-get-more-done',
    'weekly-entertainment',
    'fashion-on-the-go',
    'no-days-off',
    'experience-thailand',
    'sleep',
    'baking-bread-guide',
    'sangria-artichoke',
    'ways-to-eat-avocado',
    'kitchen-stories',
    'album-releases',
    'almodos-films',
    'pizzas-in-nyc',
    '12-hours-in-barcelona',
    'ultimate-comparison',
    'fitness-apps-ranked',
    'street-style-on-the-go',
    'plant-based-dyes',
    'indoor-garden-oasis',
    'belly-fat-workout',
    'tv-show-recap',
    'pride-month-watchlist',
    'honeymooning-in-italy',
    'ace-hotel-kyoto-review',
    'how-video-calls-saved-the-day',
    'laptop-buying-guide',
    'beauty-quiz',
    'diy-home-office',
    'kitchen-makeover',
    'self-care-guide',
  ];

  const trackTiming = getTimeTracker('load_templates');

  const templates = await Promise.all(
    templateNames.map((title) => {
      return loadTemplate(title, imageBaseUrl);
    })
  );

  trackTiming();

  return templates;
}

export default getTemplates;

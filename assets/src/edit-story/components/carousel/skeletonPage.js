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
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { generatePatternStyles } from '@web-stories-wp/patterns';

/**
 * Internal dependencies
 */
import { getDefinitionForType } from '../../elements';
import useCarousel from './useCarousel';

const EmptyPage = styled.li.attrs({ role: 'presentation' })`
  display: block;
  position: relative;
  flex: 0 0;
  margin: 0;
  padding: 0;
  border-radius: 4px;
`;

function getPatternFromArray([r, g, b]) {
  return { color: { r, g, b } };
}

function SkeletonPage({ pageId, index }) {
  const { pageThumbWidth, pageThumbHeight, pageThumbMargin, page } =
    useCarousel(
      ({
        state: { pageThumbWidth, pageThumbHeight, pageThumbMargin, pages },
      }) => ({
        pageThumbWidth,
        pageThumbHeight,
        pageThumbMargin,
        page: pages.find(({ id }) => id === pageId),
      })
    );

  if (!page || !page.id) {
    return null;
  }

  const bgElement = page.elements[0];
  const { isMedia } = getDefinitionForType(bgElement.type);
  const bgColor =
    isMedia && bgElement.resource?.baseColor
      ? getPatternFromArray(bgElement.resource.baseColor)
      : page.backgroundColor;

  return (
    <EmptyPage
      style={{
        flexBasis: `${pageThumbWidth}px`,
        height: `${pageThumbHeight}px`,
        marginLeft: `${index === 0 ? pageThumbMargin : 0}px`,
        marginRight: `${pageThumbMargin}px`,
        ...generatePatternStyles(bgColor),
      }}
    />
  );
}

SkeletonPage.propTypes = {
  pageId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default SkeletonPage;

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
import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import styled from 'styled-components';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import DropDown from '../../dropDown';
import { Numeric, Row } from '../../form';
import { PAGE_HEIGHT } from '../../../constants';
import { useFont } from '../../../app/font';
import { getCommonValue } from '../utils';

const Space = styled.div`
  flex: 0 0 10px;
`;

const BoxedNumeric = styled(Numeric)`
  padding: 6px 6px;
  border-radius: 4px;
`;

function FontControls({ selectedElements, pushUpdate }) {
  const fontFamily = getCommonValue(selectedElements, 'fontFamily');
  const fontSize = getCommonValue(selectedElements, 'fontSize');
  const fontWeight = getCommonValue(selectedElements, 'fontWeight');

  const {
    state: { fonts },
    actions: { getFontWeight, getFontFallback },
  } = useFont();
  const fontWeights = useMemo(() => getFontWeight(fontFamily), [
    getFontWeight,
    fontFamily,
  ]);

  // Backfill some of the font parameters.
  // @todo: Find a better place to do backfill, closer to the insertion
  // time or maybe display logic.
  useEffect(() => {
    pushUpdate(
      ({ fontFallback: prevFontFallback, fontFamily: prevFontFamily }) => {
        if (prevFontFallback) {
          return null;
        }
        return { fontFallback: getFontFallback(prevFontFamily) || '' };
      },
      true
    );
  }, [getFontFallback, pushUpdate]);

  return (
    <>
      {fonts && (
        <Row>
          <DropDown
            ariaLabel={__('Font family', 'web-stories')}
            options={fonts}
            value={fontFamily}
            onChange={(value) => {
              const currentFontWeights = getFontWeight(value);
              const currentFontFallback = getFontFallback(value);
              const fontWeightsArr = currentFontWeights.map(
                ({ value: weight }) => weight
              );

              // The default weight is 400 or empty if there are none available.
              let defaultWeight = fontWeightsArr?.length ? 400 : '';
              // If the font doesn't have 400 as an option, let's take the first available option.
              if (
                fontWeightsArr?.length &&
                !fontWeightsArr.includes(defaultWeight.toString())
              ) {
                defaultWeight = fontWeightsArr[0];
              }
              const newFontWeight =
                fontWeightsArr && fontWeightsArr.includes(fontWeight.toString())
                  ? fontWeight
                  : defaultWeight;
              pushUpdate(
                {
                  fontFamily: value,
                  fontWeight: parseInt(newFontWeight),
                  fontFallback: currentFontFallback,
                },
                true
              );
            }}
          />
        </Row>
      )}
      <Row>
        {fontWeights && (
          <>
            <DropDown
              ariaLabel={__('Font weight', 'web-stories')}
              options={fontWeights}
              value={fontWeight}
              onChange={(value) =>
                pushUpdate({ fontWeight: parseInt(value) }, true)
              }
            />
            <Space />
          </>
        )}
        <BoxedNumeric
          ariaLabel={__('Font size', 'web-stories')}
          value={fontSize}
          max={PAGE_HEIGHT}
          flexBasis={58}
          textCenter
          onChange={(value) => pushUpdate({ fontSize: value })}
        />
      </Row>
    </>
  );
}

FontControls.propTypes = {
  selectedElements: PropTypes.array.isRequired,
  pushUpdate: PropTypes.func.isRequired,
};

export default FontControls;

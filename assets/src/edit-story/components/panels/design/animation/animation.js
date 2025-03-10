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
import { useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { shallowEqual } from 'react-pure-render';
import { useDebouncedCallback } from '@web-stories-wp/react';
import { __ } from '@web-stories-wp/i18n';
import styled from 'styled-components';
import { Text, THEME_CONSTANTS } from '@web-stories-wp/design-system';
import {
  BACKGROUND_ANIMATION_EFFECTS,
  BG_MAX_SCALE,
  BG_MIN_SCALE,
  DIRECTION,
  SCALE_DIRECTION,
  progress,
  hasOffsets,
  STORY_ANIMATION_STATE,
  getAnimationEffectDefaults,
} from '@web-stories-wp/animation';
/**
 * Internal dependencies
 */
import StoryPropTypes, { AnimationPropType } from '../../../../types';
import { Row } from '../../../form';
import { SimplePanel } from '../../panel';
import { states, styles, useFocusHighlight } from '../../../../app/highlights';
import EffectPanel, { getEffectName, getEffectDirection } from './effectPanel';
import { EffectChooserDropdown } from './effectChooserDropdown';

const ANIMATION_PROPERTY = 'animation';

const StyledRow = styled(Row)`
  margin-bottom: -1px;
`;

const Note = styled(Text)`
  color: ${({ theme }) => theme.colors.fg.secondary};
`;

const GroupWrapper = styled.div`
  ${({ hasAnimation, theme }) =>
    hasAnimation &&
    `
    border: 1px solid ${theme.colors.border.defaultNormal};
    border-radius: ${theme.borders.radius.small};
  `}
  margin-bottom: 16px;
`;

const backgroundAnimationTooltip = __(
  'The background image is too small to animate. Double click on the bg & scale the image before applying the animation.',
  'web-stories'
);

function AnimationPanel({
  selectedElements,
  selectedElementAnimations,
  pushUpdateForObject,
  updateAnimationState,
}) {
  const playUpdatedAnimation = useRef(false);
  const dropdownRef = useRef(null);
  const highlight = useFocusHighlight(states.ANIMATION, dropdownRef);

  const isBackground =
    selectedElements.length === 1 && selectedElements[0].isBackground;
  const updatedAnimations = useMemo(() => {
    // Combining local element updates with the
    // page level applied updates
    const updated = selectedElements
      .map((element) => element.animation)
      .filter(Boolean);
    return selectedElementAnimations
      .map((anim) => ({
        ...(updated.find((a) => a.id === anim.id) || anim),
      }))
      .filter((a) => !a.delete);
  }, [selectedElements, selectedElementAnimations]);

  const handlePanelChange = useCallback(
    (animation, submitArg = false) => {
      if (shallowEqual(animation, updatedAnimations[0])) {
        return;
      }
      pushUpdateForObject(ANIMATION_PROPERTY, animation, null, submitArg);
      playUpdatedAnimation.current = true;
    },
    [pushUpdateForObject, updatedAnimations]
  );

  const handleAddOrUpdateElementEffect = useCallback(
    ({ animation, ...options }) => {
      if (!animation) {
        return;
      }

      const id = selectedElementAnimations[0]?.id || uuidv4();
      const defaults = getAnimationEffectDefaults(animation);
      const persisted =
        selectedElementAnimations[0]?.type === animation
          ? {
              duration: selectedElementAnimations[0]?.duration,
              delay: selectedElementAnimations[0]?.delay,
            }
          : {};

      pushUpdateForObject(
        ANIMATION_PROPERTY,
        {
          id,
          type: animation,
          ...defaults,
          ...persisted,
          ...options,
        },
        null,
        true
      );

      // There's nothing unique to the animation data to signify that it
      // was changed by the effect chooser, so we track it here.
      playUpdatedAnimation.current = true;
    },
    [selectedElementAnimations, pushUpdateForObject]
  );

  // Play animation of selected elements when effect chooser signals
  // that it has changed the data and the data comes back changed.
  //
  // Currently, animations get reset whenever the designInspector
  // gains focus, adding this debouncer and scheduling it after
  // the all the focus updates go through prevents the reset from
  // overriding this play call.
  const activeElement = document.activeElement;
  const debouncedUpdateAnimationState = useDebouncedCallback(() => {
    if (playUpdatedAnimation.current) {
      updateAnimationState({
        animationState: STORY_ANIMATION_STATE.PLAYING_SELECTED,
      });
      playUpdatedAnimation.current = false;
    }
  }, 300);
  useEffect(debouncedUpdateAnimationState, [
    selectedElementAnimations,
    updateAnimationState,
    activeElement,
    debouncedUpdateAnimationState,
  ]);

  const handleRemoveEffect = useCallback(() => {
    pushUpdateForObject(
      ANIMATION_PROPERTY,
      {
        ...updatedAnimations[0],
        delete: true,
      },
      null,
      true
    );
  }, [pushUpdateForObject, updatedAnimations]);

  // Figure out if any options are disabled
  // for an animation type input
  const disabledTypeOptionsMap = useMemo(() => {
    if (selectedElements[0]?.isBackground) {
      const hasOffset =
        ['media', 'image', 'video', 'gif'].includes(selectedElements[0].type) &&
        hasOffsets({ element: selectedElements[0] });
      const normalizedScale = progress(selectedElements[0]?.scale || 0, [
        BG_MIN_SCALE,
        BG_MAX_SCALE,
      ]);
      return {
        [BACKGROUND_ANIMATION_EFFECTS.PAN.value]: {
          tooltip: backgroundAnimationTooltip,
          options: [
            !hasOffset.bottom && DIRECTION.TOP_TO_BOTTOM,
            !hasOffset.left && DIRECTION.RIGHT_TO_LEFT,
            !hasOffset.top && DIRECTION.BOTTOM_TO_TOP,
            !hasOffset.right && DIRECTION.LEFT_TO_RIGHT,
          ].filter(Boolean),
        },
        [BACKGROUND_ANIMATION_EFFECTS.ZOOM.value]: {
          tooltip: backgroundAnimationTooltip,
          options: [
            normalizedScale <= 0.01 && SCALE_DIRECTION.SCALE_IN,
            normalizedScale >= 0.99 && SCALE_DIRECTION.SCALE_OUT,
          ].filter(Boolean),
        },
        [BACKGROUND_ANIMATION_EFFECTS.PAN_AND_ZOOM.value]: {
          tooltip: backgroundAnimationTooltip,
          options: [
            !hasOffset.bottom && DIRECTION.TOP_TO_BOTTOM,
            !hasOffset.left && DIRECTION.RIGHT_TO_LEFT,
            !hasOffset.top && DIRECTION.BOTTOM_TO_TOP,
            !hasOffset.right && DIRECTION.LEFT_TO_RIGHT,
            normalizedScale <= 0.01 && SCALE_DIRECTION.SCALE_IN,
            normalizedScale >= 0.99 && SCALE_DIRECTION.SCALE_OUT,
          ].filter(Boolean),
        },
      };
    }
    return {};
  }, [selectedElements]);

  const selectedEffectTitle = getEffectName(updatedAnimations[0]?.type);
  return selectedElements.length > 1 ? (
    <SimplePanel name="animation" title={__('Animation', 'web-stories')}>
      <Row>
        <Note
          forwardedAs="span"
          size={THEME_CONSTANTS.TYPOGRAPHY.PRESET_SIZES.SMALL}
        >
          {__('Group animation support coming soon.', 'web-stories')}
        </Note>
      </Row>
    </SimplePanel>
  ) : (
    <SimplePanel
      name="animation"
      title={__('Animation', 'web-stories')}
      css={highlight?.showEffect && styles.FLASH}
      isPersistable={!highlight}
    >
      <GroupWrapper hasAnimation={selectedEffectTitle}>
        <StyledRow>
          <EffectChooserDropdown
            ref={dropdownRef}
            onAnimationSelected={handleAddOrUpdateElementEffect}
            onNoEffectSelected={handleRemoveEffect}
            isBackgroundEffects={isBackground}
            disabledTypeOptionsMap={disabledTypeOptionsMap}
            direction={getEffectDirection(updatedAnimations[0])}
            selectedEffectType={updatedAnimations[0]?.type}
            selectButtonStylesOverride={highlight?.focus && styles.OUTLINE}
          />
        </StyledRow>
        {updatedAnimations[0] && (
          <EffectPanel
            animation={updatedAnimations[0]}
            onChange={handlePanelChange}
            disabledTypeOptionsMap={disabledTypeOptionsMap}
          />
        )}
      </GroupWrapper>
    </SimplePanel>
  );
}

AnimationPanel.propTypes = {
  selectedElements: PropTypes.arrayOf(StoryPropTypes.element).isRequired,
  selectedElementAnimations: PropTypes.arrayOf(AnimationPropType),
  pushUpdateForObject: PropTypes.func.isRequired,
  updateAnimationState: PropTypes.func,
};

export default AnimationPanel;

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
import { getRelativeDisplayDate } from '@web-stories-wp/date';
import { __, sprintf } from '@web-stories-wp/i18n';
import { useFeatures } from 'flagged';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { css } from 'styled-components';
/**
 * Internal dependencies
 */
import { StoryMenu } from '../../../../../components';
import { generateStoryMenu } from '../../../../../components/popoverMenu/story-menu-generator';
import { STORY_STATUS } from '../../../../../constants';
import {
  PageSizePropType,
  RenameStoryPropType,
  StoryMenuPropType,
  StoryPropType,
} from '../../../../../types';
import { titleFormatted } from '../../../../../utils';
import { useConfig } from '../../../../config';
import {
  CardWrapper,
  Container,
  CustomCardGridItem,
  Gradient,
  Poster,
  Scrim,
} from './components';
import StoryDisplayContent from './storyDisplayContent';

const StoryGridItem = ({
  handleFocus,
  isActive,
  itemRefs = {},
  pageSize,
  renameStory,
  story,
  storyMenu,
}) => {
  const { enablePostLocking } = useFeatures();
  const { userId } = useConfig();
  const tabIndex = isActive ? 0 : -1;
  const titleRenameProps = renameStory
    ? {
        editMode: renameStory?.id === story?.id,
        onEditComplete: (newTitle) =>
          renameStory?.handleOnRenameStory(story, newTitle),
        onEditCancel: renameStory?.handleCancelRename,
      }
    : {};

  const isLocked = useMemo(
    () => enablePostLocking && story?.locked && userId !== story?.lockUser.id,
    [enablePostLocking, story, userId]
  );

  const generatedMenuItems = useMemo(
    () =>
      generateStoryMenu({
        menuItemActions: storyMenu.menuItemActions,
        menuItems: storyMenu.menuItems,
        story,
        isLocked,
      }),
    [storyMenu, story, isLocked]
  );

  const storyDate = getRelativeDisplayDate(
    story?.status === STORY_STATUS.DRAFT
      ? story?.modified_gmt
      : story?.created_gmt
  );

  const formattedTitle = titleFormatted(story.title);

  const memoizedStoryMenu = useMemo(
    () => (
      <StoryMenu
        menuLabel={
          isLocked
            ? sprintf(
                /* translators: 1: story title. 2: user currently editing the story. */
                __('Context menu for %1$s (locked by %2$s)', 'web-stories'),
                formattedTitle,
                story?.lockUser.name
              )
            : sprintf(
                /* translators: %s: story title.*/
                __('Context menu for %s', 'web-stories'),
                formattedTitle
              )
        }
        itemActive={isActive}
        tabIndex={tabIndex}
        onMoreButtonSelected={storyMenu.handleMenuToggle}
        contextMenuId={storyMenu.contextMenuId}
        storyId={story.id}
        isInverted
        menuItems={generatedMenuItems}
        menuStyleOverrides={css`
          /* force menu position to bottom corner */
          margin: 0 0 0 auto;
        `}
      />
    ),
    [
      isLocked,
      formattedTitle,
      isActive,
      tabIndex,
      storyMenu,
      story.id,
      story?.lockUser,
      generatedMenuItems,
    ]
  );

  return (
    <CustomCardGridItem
      data-testid={`story-grid-item-${story.id}`}
      onFocus={handleFocus}
      $posterHeight={pageSize.posterHeight}
      ref={(el) => {
        itemRefs.current[story.id] = el;
      }}
      title={sprintf(
        /* translators: %s: story title.*/
        __('Details about %s', 'web-stories'),
        formattedTitle
      )}
    >
      <Container>
        <CardWrapper>
          <Poster
            {...(story.featuredMediaUrl
              ? {
                  alt: sprintf(
                    /* translators: %s: Story title. */
                    __('%s Poster image', 'web-stories'),
                    formattedTitle
                  ),
                  as: 'img',
                  src: story.featuredMediaUrl,
                }
              : null)}
          />
          <Gradient />
          <Scrim>
            <StoryDisplayContent
              author={story.author}
              contextMenu={memoizedStoryMenu}
              displayDate={storyDate}
              formattedTitle={formattedTitle}
              id={story.id}
              isLocked={isLocked}
              lockUser={story?.lockUser}
              status={story?.status}
              tabIndex={tabIndex}
              title={story.title}
              titleLink={story.editStoryLink}
              {...titleRenameProps}
            />
          </Scrim>
        </CardWrapper>
      </Container>
    </CustomCardGridItem>
  );
};

StoryGridItem.propTypes = {
  handleFocus: PropTypes.func,
  isActive: PropTypes.bool,
  itemRefs: PropTypes.shape({
    current: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    ]),
  }),
  pageSize: PageSizePropType,
  renameStory: RenameStoryPropType,
  storyMenu: StoryMenuPropType,
  story: StoryPropType,
};

export default StoryGridItem;

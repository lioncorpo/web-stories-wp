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
import { useEffect, useRef } from 'react';

/**
 * Internal dependencies
 */
import KeyboardShortcutsMenu from '../keyboardShortcutsMenu';
import { HelpCenter } from '../helpCenter';
import { useHelpCenter } from '../../app';
import {
  Checklist,
  ChecklistCountProvider,
  useChecklist,
  useCheckpoint,
} from '../checklist';
import { useKeyboardShortcutsMenu } from '../keyboardShortcutsMenu/keyboardShortcutsMenuContext';

const Wrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
`;

const MenuItems = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 16px 16px;
`;

const Box = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Space = styled.span`
  width: 8px;
`;

function SecondaryMenu() {
  const isHelpCenterOpenRef = useRef(false);
  const isChecklistOpenRef = useRef(false);
  const isKeyboardShortcutsMenuOpenRef = useRef(false);

  const { close: closeHelpCenter, isHelpCenterOpen } = useHelpCenter(
    ({ actions: { close }, state: { isOpen: isHelpCenterOpen } }) => ({
      close,
      isHelpCenterOpen,
    })
  );

  const {
    close: closeChecklist,
    open: openChecklist,
    isChecklistOpen,
  } = useChecklist(
    ({ actions: { close, open }, state: { isOpen: isChecklistOpen } }) => ({
      close,
      open,
      isChecklistOpen,
    })
  );

  const { close: closeKeyboardShortcutsMenu, isKeyboardShortcutsMenuOpen } =
    useKeyboardShortcutsMenu(
      ({
        actions: { close },
        state: { isOpen: isKeyboardShortcutsMenuOpen },
      }) => ({
        close,
        isKeyboardShortcutsMenuOpen,
      })
    );

  const { onResetReviewDialogRequest, reviewDialogRequested } = useCheckpoint(
    ({
      actions: { onResetReviewDialogRequest },
      state: { reviewDialogRequested },
    }) => ({
      reviewDialogRequested,
      onResetReviewDialogRequest,
    })
  );

  // Only one popup is open at a time
  // we want to close an open popup if a new one is opened.
  useEffect(() => {
    if (isChecklistOpen && !isChecklistOpenRef.current) {
      closeHelpCenter();
      closeKeyboardShortcutsMenu();

      isChecklistOpenRef.current = true;
      isKeyboardShortcutsMenuOpenRef.current = false;
      isHelpCenterOpenRef.current = false;
    }
  }, [closeHelpCenter, closeKeyboardShortcutsMenu, isChecklistOpen]);

  useEffect(() => {
    if (isHelpCenterOpen && !isHelpCenterOpenRef.current) {
      closeChecklist();
      closeKeyboardShortcutsMenu();
      isHelpCenterOpenRef.current = true;
      isChecklistOpenRef.current = false;
      isKeyboardShortcutsMenuOpenRef.current = false;
    }
  }, [closeChecklist, closeKeyboardShortcutsMenu, isHelpCenterOpen]);

  useEffect(() => {
    if (
      isKeyboardShortcutsMenuOpen &&
      !isKeyboardShortcutsMenuOpenRef.current
    ) {
      closeChecklist();
      closeHelpCenter();
      isKeyboardShortcutsMenuOpenRef.current = true;
      isHelpCenterOpenRef.current = false;
      isChecklistOpenRef.current = false;
    }
  }, [closeChecklist, closeHelpCenter, isKeyboardShortcutsMenuOpen]);

  useEffect(() => {
    if (reviewDialogRequested) {
      isChecklistOpenRef.current = false;
      onResetReviewDialogRequest();
      openChecklist();
    }
  }, [reviewDialogRequested, onResetReviewDialogRequest, openChecklist]);

  return (
    <Wrapper>
      <MenuItems>
        <HelpCenter />
        <Space />
        <ChecklistCountProvider>
          <Checklist />
        </ChecklistCountProvider>
        <Space />
        <Box>
          <KeyboardShortcutsMenu />
        </Box>
      </MenuItems>
    </Wrapper>
  );
}

export default SecondaryMenu;

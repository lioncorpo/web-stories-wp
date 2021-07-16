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
 * External dependencies
 */
import { waitFor } from '@testing-library/react';
/**
 * Internal dependencies
 */
import { Fixture } from '../../../karma';
import { useInsertElement } from '../../canvas';
import { ACCESSIBILITY_COPY, DESIGN_COPY, PRIORITY_COPY } from '../constants';

describe('Checklist integration', () => {
  let fixture;

  beforeEach(async () => {
    fixture = new Fixture();
    await fixture.render();
  });

  afterEach(() => {
    fixture.restore();
  });

  const emptyContent = () => {
    return fixture.screen.queryByText(
      /You are all set for now. Return to this checklist as you build your Web Story for tips on how to improve it./
    );
  };

  const addPages = async (count) => {
    let clickCount = 1;
    while (clickCount <= count) {
      // eslint-disable-next-line no-await-in-loop
      await fixture.events.click(fixture.editor.canvas.framesLayer.addPage);
      // eslint-disable-next-line no-await-in-loop, no-loop-func
      await waitFor(() => {
        expect(fixture.editor.carousel.pages.length).toBe(clickCount + 1);
      });
      clickCount++;
    }
  };

  const openChecklist = async () => {
    const { toggleButton } = fixture.editor.checklist;
    await fixture.events.click(toggleButton);
    // wait for animation
    await fixture.events.sleep(500);
  };

  /**
   * Inserts an image without assistive text. This will trigger
   * an a11y issue in the checklist.
   */
  const addAccessibilityIssue = async () => {
    const insertElement = await fixture.renderHook(() => useInsertElement());
    await fixture.act(() =>
      insertElement('image', {
        x: 0,
        y: 0,
        width: 640 / 2,
        height: 529 / 2,
        resource: {
          type: 'image',
          mimeType: 'image/jpg',
          src: 'http://localhost:9876/__static__/earth.jpg',
        },
      })
    );
  };

  const openChecklistWithKeyboard = async () => {
    const { toggleButton } = fixture.editor.checklist;
    await fixture.events.focus(toggleButton);
    await fixture.events.keyboard.press('Enter');
    // wait for animation
    await fixture.events.sleep(500);
  };

  describe('initial state', () => {
    it('should begin with empty message on a new story', async () => {
      await openChecklist();

      const emptyMessage = fixture.screen.getByText(
        'You are all set for now. Return to this checklist as you build your Web Story for tips on how to improve it.'
      );

      expect(emptyMessage).toBeTruthy();
    });
  });

  describe('open and close', () => {
    it('should toggle the checklist', async () => {
      const { toggleButton } = fixture.editor.checklist;

      await fixture.events.click(toggleButton);
      // wait for animation
      await fixture.events.sleep(500);
      expect(
        fixture.editor.checklist.issues.getAttribute('data-isexpanded')
      ).toBe('true');

      await fixture.events.click(toggleButton);
      // wait for animation
      await fixture.events.sleep(500);
    });

    it('should close the checklist when the "close" button is clicked', async () => {
      await openChecklist();

      await fixture.events.click(fixture.editor.checklist.closeButton);
      await fixture.events.sleep(500);
    });
  });

  describe('Checklist cursor interaction', () => {
    it('should open the high priority section by default when 4 pages are added to the story', async () => {
      // need to add some pages, the add page button is under the checklist so do this before expanding
      await addPages(4);
      await openChecklist();
      expect(fixture.editor.checklist.priorityPanel).toBeDefined();
    });

    it('should open the design section when clicked', async () => {
      // need to add some pages, the add page button is under the checklist so do this before expanding
      await addPages(4);
      await openChecklist();
      await fixture.events.click(fixture.editor.checklist.designTab);
      expect(fixture.editor.checklist.designPanel).toBeDefined();
    });

    it('should open the design section by default when 2 pages are added to the story', async () => {
      // need to add some pages, the add page button is under the checklist so do this before expanding
      await addPages(2);
      await openChecklist();

      expect(fixture.editor.checklist.designPanel).toBeDefined();
    });

    it('should open the accessibility section', async () => {
      // need to add some pages, the add page button is under the checklist so do this before expanding
      await addPages(2);
      await addAccessibilityIssue();
      await openChecklist();

      await fixture.events.click(fixture.editor.checklist.accessibilityTab);
      expect(fixture.editor.checklist.accessibilityPanel).toBeDefined();
    });
  });

  describe('Checklist keyboard interaction', () => {
    it('should toggle the Checklist with keyboard', async () => {
      await fixture.events.focus(fixture.editor.checklist.toggleButton);
      await fixture.events.keyboard.press('Enter');
      // wait for animation
      await fixture.events.sleep(500);
      expect(
        fixture.editor.checklist.issues.getAttribute('data-isexpanded')
      ).toBe('true');

      await fixture.events.keyboard.press('Enter');
      // wait for animation
      await fixture.events.sleep(500);
    });

    it('should close the Checklist when pressing enter on the "close" button', async () => {
      await openChecklistWithKeyboard();

      // will already be focused on the close button
      expect(
        fixture.editor.checklist.issues.getAttribute('data-isexpanded')
      ).toBe('true');
      expect(fixture.editor.checklist.closeButton).toEqual(
        document.activeElement
      );

      await fixture.events.keyboard.press('Enter');
      await fixture.events.sleep(500);
    });

    it('should open the tab panels with tab and enter', async () => {
      // need to add some pages, the add page button is under the checklist so do this before expanding
      await addPages(4);

      await openChecklistWithKeyboard();

      // tab to priority section
      await fixture.events.keyboard.press('tab');

      await fixture.events.keyboard.press('Enter');
      expect(fixture.editor.checklist.priorityPanel).toBeDefined();
      expect(fixture.editor.checklist.designPanel).toBeNull();
      expect(fixture.editor.checklist.accessibilityPanel).toBeNull();

      // tab to design section
      await fixture.events.keyboard.press('tab');

      await fixture.events.keyboard.press('Enter');
      expect(fixture.editor.checklist.priorityPanel).toBeNull();
      expect(fixture.editor.checklist.designPanel).toBeDefined();
      expect(fixture.editor.checklist.accessibilityPanel).toBeNull();

      // add accessibility section
      await addAccessibilityIssue();
      // tab to accessibility section
      let tabCount = 1;
      while (
        tabCount < 4 &&
        fixture.editor.checklist.accessibilityTab !== document.activeElement
      ) {
        // eslint-disable-next-line no-await-in-loop
        await fixture.events.keyboard.press('tab');
        tabCount++;
      }

      await fixture.events.keyboard.press('Enter');
      expect(fixture.editor.checklist.priorityPanel).toBeNull();
      expect(fixture.editor.checklist.designPanel).toBeNull();
      expect(fixture.editor.checklist.accessibilityPanel).toBeDefined();
    });
  });

  describe('checkpoints', () => {
    it('empty story should begin in the empty state', async () => {
      await openChecklist();

      const { priorityPanel, designPanel, accessibilityPanel } =
        fixture.editor.checklist;

      expect(await emptyContent()).toBeDefined();
      expect(priorityPanel).toBeNull();
      expect(designPanel).toBeNull();
      expect(accessibilityPanel).toBeNull();
    });

    it('should expand the design panel after adding 2 pages', async () => {
      await addPages(1);
      await openChecklist();

      const {
        expandedDesignTab,
        priorityPanel,
        designPanel,
        accessibilityPanel,
      } = fixture.editor.checklist;

      expect(await emptyContent()).toBeNull();
      expect(priorityPanel).toBeNull();
      expect(designPanel).toBeDefined();
      expect(accessibilityPanel).toBeNull();

      expect(expandedDesignTab).toBeDefined();
    });

    it('should add the accessibility panel after adding 2 pages if there is an a11y problem. This will not open the panel.', async () => {
      await addPages(1);
      await openChecklist();

      await addAccessibilityIssue();

      const {
        priorityPanel,
        designPanel,
        accessibilityPanel,
        expandedDesignTab,
      } = fixture.editor.checklist;

      expect(await emptyContent()).toBeNull();
      expect(priorityPanel).toBeNull();
      expect(designPanel).toBeDefined();
      expect(accessibilityPanel).toBeDefined();

      expect(expandedDesignTab).toBeDefined();
    });

    it('should expand the priority panel after adding 5 pages', async () => {
      await addPages(4);
      await openChecklist();

      const {
        expandedPriorityTab,
        priorityPanel,
        designPanel,
        accessibilityPanel,
      } = fixture.editor.checklist;

      expect(await emptyContent()).toBeNull();
      expect(priorityPanel).toBeDefined();
      expect(designPanel).toBeDefined();
      expect(accessibilityPanel).toBeNull();

      expect(expandedPriorityTab).toBeDefined();
    });
  });

  describe('checklist should have no aXe accessibility violations', () => {
    it('should pass accessibility tests with with a closed checklist', async () => {
      await expectAsync(fixture.editor.checklist.node).toHaveNoViolations();
    });

    it('should pass accessibility tests with an open empty checklist', async () => {
      await openChecklist();

      await expectAsync(fixture.editor.checklist.node).toHaveNoViolations();
    });

    it('should pass accessibility tests with a open non-empty checklist', async () => {
      await addPages(4);

      await openChecklist();

      await expectAsync(fixture.editor.checklist.node).toHaveNoViolations();
    });
  });

  it('should open the checklist after following "review checklist" button in dialog on publishing story', async () => {
    fixture.events.click(fixture.editor.titleBar.publish);
    // Ensure the debounced callback has taken effect.
    await fixture.events.sleep(800);

    const reviewButton = await fixture.screen.getByRole('button', {
      name: /^Review Checklist$/,
    });
    await fixture.events.click(reviewButton);
    // This is the initial load of the checklist tab so we need to wait for it to load
    // before we can see tabs.
    await fixture.events.sleep(300);

    expect(
      fixture.editor.checklist.issues.getAttribute('data-isexpanded')
    ).toBe('true');
    expect(fixture.editor.checklist.priorityPanel).toBeDefined();
  });
});

[true, false].forEach((hasUploadMediaAction) => {
  describe('Checklist integration - hasUploadMediaAction=false', () => {
    let fixture;

    beforeEach(async () => {
      fixture = new Fixture();
      fixture.setConfig({ capabilities: { hasUploadMediaAction } });
      await fixture.render();

      // mock the wordpress media explorer
      const media = () => ({
        state: () => ({
          get: () => ({
            first: () => ({
              toJSON: () => ({
                id: 10,
                url: 'http://localhost:9876/__static__/earth.jpg',
                mime: 'image/jpeg',
                width: 400,
                height: 480,
              }),
            }),
          }),
        }),
        on: (_type, callback) => callback(),
        once: (_type, callback) =>
          callback({
            id: 10,
            url: 'http://localhost:9876/__static__/earth.jpg',
            mime: 'image/jpeg',
            width: 400,
            height: 480,
          }),
        open: () => {},
        close: () => {},
        setState: () => {},
      });

      class Library {}

      class CustomizeImageCropper {}

      media.controller = {
        CustomizeImageCropper,
        Library,
      };
      media.query = () => {};

      // Create fake media browser
      window.wp = {
        ...window.wp,
        media,
      };
    });

    afterEach(() => {
      fixture.restore();
    });

    const addPages = async (count) => {
      let clickCount = 1;
      while (clickCount <= count) {
        // eslint-disable-next-line no-await-in-loop
        await fixture.events.click(fixture.editor.canvas.framesLayer.addPage);
        // eslint-disable-next-line no-await-in-loop, no-loop-func
        await waitFor(() => {
          expect(fixture.editor.carousel.pages.length).toBe(clickCount + 1);
        });
        clickCount++;
      }
    };

    const openChecklist = async () => {
      const { toggleButton } = fixture.editor.checklist;
      await fixture.events.click(toggleButton);
      // wait for animation
      await fixture.events.sleep(500);
    };

    /**
     * Add poster image to story that has
     * - width less than the minimum allowed poster image width
     * - height less than the minimum allowed poster image height
     *
     * This will trigger an a11y issue in the checklist.
     */
    const addPosterImageWithIssues = async () => {
      // open the document panel
      await fixture.events.click(fixture.editor.inspector.documentTab);

      // open the menu - mock will add picture automatically
      await fixture.events.click(
        fixture.editor.inspector.documentPanel.posterMenuButton
      );
    };

    /**
     * Inserts an image that has
     * - width less than the minimum allowed image width (2 times element width)
     * - height less than the minimum allowed image height (2 times element height)
     *
     * This will trigger an a11y issue in the checklist.
     */
    const addImageWithIssues = async () => {
      const insertElement = await fixture.renderHook(() => useInsertElement());
      await fixture.act(() =>
        insertElement('image', {
          x: 0,
          y: 0,
          width: 640 / 2,
          height: 529 / 2,
          resource: {
            type: 'image',
            mimeType: 'image/jpg',
            src: 'http://localhost:9876/__static__/earth.jpg',
            sizes: {
              full: {
                width: 300,
                height: 400,
              },
            },
          },
        })
      );
    };

    /**
     * Inserts a video that has
     * - no poster image
     * - width less than the minimum allowed video width
     * - height less than the minimum allowed video height
     *
     * This will trigger an a11y issue in the checklist.
     */
    const addVideoWithIssues = async () => {
      const insertElement = await fixture.renderHook(() => useInsertElement());
      await fixture.act(() =>
        insertElement('video', {
          resource: {
            type: 'video',
            mimeType: 'video/webm',
            creationDate: '2021-05-21T00:09:18',
            src: 'http://localhost:8899/wp-content/uploads/2021/05/small-video-10.webm',
            width: 560,
            height: 320,
            // no poster image
            poster: null,
            posterId: null,
            id: 10,
            length: 6,
            lengthFormatted: '0:06',
            title: 'small-video',
            alt: 'small-video',
            sizes: {
              full: {
                // resolution too low
                height: 220,
                width: 320,
              },
            },
            local: false,
            isOptimized: false,
            baseColor: [115, 71, 39],
          },
          controls: false,
          loop: false,
          autoPlay: true,
          tracks: [],
          type: 'video',
          x: 66,
          y: 229,
          width: 280,
          height: 160,
          id: '6e7f5de8-7793-4aef-8835-c1d32477b4e0',
        })
      );
    };

    /**
     * Find card from title in checklist. Check existence based
     * on user's `hasUploadMediaAction` configuration
     *
     * @param {string} title Title of card
     */
    const checkIfCardExists = async (title) => {
      const card = await fixture.screen.queryByText(title);

      if (hasUploadMediaAction) {
        expect(card).not.toBeNull();
      } else {
        expect(card).toBeNull();
      }
    };

    it(`should${
      hasUploadMediaAction ? '' : ' not'
    } show cards that require the \`hasUploadMediaAction\` permission when hasUploadMediaAction=\`${hasUploadMediaAction}\``, async () => {
      // add issues to checklist that need to be resolved by uploading media
      await addImageWithIssues();
      await addVideoWithIssues();

      // show all checkpoints
      await addPages(4);
      await openChecklist();

      const priorityIssuesRequiringMediaUploadPermissions = [
        PRIORITY_COPY.storyMissingPoster.title,
        PRIORITY_COPY.videoMissingPoster.title,
      ];

      // issues that show if there is a poster image
      const posterIssuesRequiringMediaUploadPermissions = [
        PRIORITY_COPY.posterTooSmall.title,
        PRIORITY_COPY.storyPosterWrongRatio.title,
      ];

      const designIssuesRequiringMediaUploadPermissions = [
        DESIGN_COPY.videoResolutionTooLow.title,
        DESIGN_COPY.lowImageResolution.title,
      ];

      const accessibilityIssuesRequiringMediaUploadPermissions = [
        ACCESSIBILITY_COPY.videoMissingCaptions.title,
      ];

      priorityIssuesRequiringMediaUploadPermissions.forEach(checkIfCardExists);

      // add poster image to see new problems
      await addPosterImageWithIssues();
      posterIssuesRequiringMediaUploadPermissions.forEach(checkIfCardExists);

      // open design tab
      await fixture.events.click(fixture.editor.checklist.designTab);

      designIssuesRequiringMediaUploadPermissions.forEach(checkIfCardExists);

      accessibilityIssuesRequiringMediaUploadPermissions.forEach(
        checkIfCardExists
      );
    });
  });
});

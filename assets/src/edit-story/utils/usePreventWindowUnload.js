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
import { useCallback } from 'react';
import { createContext, useContext } from '@web-stories-wp/react';

const PreventUnloadContext = createContext({ listeners: new Map() });

/**
 * This is a helper that to compliant the correct register/unregister system of `beforeunload` event
 *
 * @param {Event} event beforeunload Event object
 * @param {string} id Identifier to register beforeunload Event in the onbeforeunload listener
 */
const beforeUnloadListener = (event, id) => {
  event.preventDefault();
  event.returnValue = id;
};

function usePreventWindowUnload() {
  const context = useContext(PreventUnloadContext);
  const setPreventUnload = useCallback(
    (id, value) => {
      if (value) {
        // Register beforeunload by scope
        if (!context.listeners.has(id)) {
          context.listeners.set(id, (event) => beforeUnloadListener(event, id));
        }
        window.addEventListener('beforeunload', context.listeners.get(id));
      } else {
        // Unregister beforeunload by scope
        window.removeEventListener('beforeunload', context.listeners.get(id));
        context.listeners.delete(id);
      }
    },
    [context]
  );
  return setPreventUnload;
}

const shouldDisablePrevent = process.env.DISABLE_PREVENT === 'true';
export default shouldDisablePrevent ? () => () => {} : usePreventWindowUnload;

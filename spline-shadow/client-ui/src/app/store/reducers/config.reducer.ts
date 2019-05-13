/*
 * Copyright 2019 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as ConfigAction from '../actions/config.actions';

export type Action = ConfigAction.ConfigActions

export function configReducer(state: any, action: Action) {
    switch (action.type) {
        case ConfigAction.ConfigActionTypes.CONFIG_GET_SUCCESS: return { ...state, ...action.payload }
        default: return state
    }
}
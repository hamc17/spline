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

import { Action } from '@ngrx/store';
import { AttributeVM } from '../../model/viewModels/attributeVM';

export enum AttributesActionTypes {
    ATTRIBUTES_GET = '[Attribute] Get',
    ATTRIBUTES_RESET = '[Attribute] Reset'
}

export class Get implements Action {
    readonly type = AttributesActionTypes.ATTRIBUTES_GET
    constructor(public payload: AttributeVM) { }
}

export class Reset implements Action {
    readonly type = AttributesActionTypes.ATTRIBUTES_RESET
    constructor() { }
}

export type AttributeActions
    = Get
    | Reset

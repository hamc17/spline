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
import * as ExecutionPlanAction from '../actions/execution-plan.actions';
import { ExecutedLogicalPlanVM } from '../../model/viewModels/executedLogicalPlanVM';
import { OperationType } from '../../model/types/operationType';

export type Action = ExecutionPlanAction.ExecutionPlanActions

export function executionPlanReducer(state: ExecutedLogicalPlanVM, action: Action) {
    switch (action.type) {
        case ExecutionPlanAction.ExecutionPlanActionTypes.EXECUTION_PLAN_GET_SUCCESS: return { ...state, ...action.payload }
        default: return state
    }
}


export function getIconFromOperationType(operation: string): number {
    switch (operation) {
        case OperationType.Projection: return 0xf13a
        case OperationType.BatchRead: return 0xf085
        case OperationType.LogicalRelation: return 0xf1c0
        case OperationType.StreamRead: return 0xf085
        case OperationType.Join: return 0xf126
        case OperationType.Union: return 0xf0c9
        case OperationType.Generic: return 0xf0c8
        case OperationType.Filter: return 0xf0b0
        case OperationType.Sort: return 0xf161
        case OperationType.Aggregate: return 0xf1ec
        case OperationType.WriteCommand: return 0xf0c7
        case OperationType.BatchWrite: return 0xf0c7
        case OperationType.StreamWrite: return 0xf0c7
        case OperationType.Alias: return 0xf111
        default: return 0xf15b
    }
}

export function getColorFromOperationType(operation: string): string {
    switch (operation) {
        case OperationType.Projection: return "#337AB7"
        case OperationType.BatchRead: return "#337AB7"
        case OperationType.LogicalRelation: return "#e39255"
        case OperationType.StreamRead: return "#337AB7"
        case OperationType.Join: return "#e39255"
        case OperationType.Union: return "#337AB7"
        case OperationType.Generic: return "#337AB7"
        case OperationType.Filter: return "#F04100"
        case OperationType.Sort: return "#E0E719"
        case OperationType.Aggregate: return "#008000"
        case OperationType.BatchWrite: return "#e39255"
        case OperationType.WriteCommand: return "#e39255"
        case OperationType.StreamWrite: return "#e39255"
        case OperationType.Alias: return "#337AB7"
        default: return "#808080"
    }
}
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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { CytoscapeNgLibComponent } from 'cytoscape-ng-lib';
import { map, mergeMap, tap } from 'rxjs/operators';
import { AppState } from 'src/app/model/app-state';
import * as AttributesAction from 'src/app/store/actions/attributes.actions';
import * as ContextMenuAction from 'src/app/store/actions/context-menu.actions';
import * as DetailsInfosAction from 'src/app/store/actions/details-info.actions';
import * as ExecutionPlanAction from 'src/app/store/actions/execution-plan.actions';
import * as LayoutAction from 'src/app/store/actions/layout.actions';
import * as RouterAction from 'src/app/store/actions/router.actions';


@Component({
  selector: 'lineage-graph',
  templateUrl: './lineage-graph.component.html',
  styleUrls: ['./lineage-graph.component.less']
})
export class LineageGraphComponent implements OnInit, AfterViewInit {

  @ViewChild(CytoscapeNgLibComponent)
  private cytograph: CytoscapeNgLibComponent

  constructor(
    private store: Store<AppState>
  ) {
    this.getExecutedLogicalPlan()
    this.getLayoutConfiguration()
    this.getContextMenuConfiguration()
  }

  ngOnInit(): void {
    this.store.select('layout').pipe(
      mergeMap(layout => {
        return this.store.select('contextMenu').pipe(
          map(contextMenu => {
            return { layout: layout, contextMenu: contextMenu }
          })
        )
      }),
      mergeMap(res => {
        return this.store.select('executedLogicalPlan').pipe(
          tap(state => {
            if (state) {
              this.cytograph.cy.add(state.plan)
              this.cytograph.cy.nodeHtmlLabel([{
                tpl: function (data) {
                  if (data.icon) return '<i class="fa fa-4x" style="color:' + data.color + '">' + String.fromCharCode(data.icon) + '</i>'
                  return null
                }
              }])
              this.cytograph.cy.cxtmenu(res.contextMenu)
              this.cytograph.cy.panzoom()
              this.cytograph.cy.layout(res.layout).run()
            }
          })
        )
      })
    ).subscribe()
  }

  ngAfterViewInit(): void {
    this.cytograph.cy.ready(() => {
      this.cytograph.cy.on('click', (event) => {
        const clikedTarget = event.target
        const nodeId = (clikedTarget != this.cytograph.cy && clikedTarget.isNode()) ? clikedTarget.id() : null
        this.getDetailsInfo(nodeId)
        this.store.dispatch(new AttributesAction.Reset())
        const params: Params = { selectedNode: nodeId, schemaId: null, attribute: null }
        this.store.dispatch(new RouterAction.Go(params))
      })
    })

    this.cytograph.cy.on('layoutstop', () => {
      this.store.select('router', 'state', 'queryParams', 'selectedNode').subscribe((selectedNode: string) => {
        this.cytograph.cy.nodes().filter("[id='" + selectedNode + "']").select()
        this.getDetailsInfo(selectedNode)
      })
    })

  }

  getContextMenuConfiguration() {
    this.store.dispatch(new ContextMenuAction.Get())
  }

  getLayoutConfiguration() {
    this.store.dispatch(new LayoutAction.Get())
  }

  getExecutedLogicalPlan() {
    this.store.select('router', 'state', 'params', 'uid').subscribe(
      uid => this.store.dispatch(new ExecutionPlanAction.Get(uid))
    )

  }

  getDetailsInfo(nodeId: string) {
    if (nodeId) {
      this.store.dispatch(new DetailsInfosAction.Get(nodeId))
    } else {
      this.store.dispatch(new DetailsInfosAction.Reset())
    }
  }

}




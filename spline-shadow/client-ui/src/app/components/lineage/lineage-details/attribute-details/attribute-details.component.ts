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
import { Component, OnInit, ViewChild } from '@angular/core';
import { CytoscapeNgLibComponent } from 'cytoscape-ng-lib';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/model/app-state';
import { mergeMap, tap } from 'rxjs/operators';

@Component({
  selector: 'attribute-details',
  templateUrl: './attribute-details.component.html',
  styleUrls: ['./attribute-details.component.less']
})
export class AttributeDetailsComponent implements OnInit {

  @ViewChild(CytoscapeNgLibComponent)
  private cytograph: CytoscapeNgLibComponent

  constructor(
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.store.select('layout').pipe(
      mergeMap(layout => {
        return this.store.select('attributes').pipe(
          tap(state => {
            if (this.cytograph.cy) {
              this.cytograph.cy.remove(this.cytograph.cy.elements())
              if (state) {
                this.cytograph.cy.add(state)
                this.cytograph.cy.layout(layout).run()
                this.cytograph.cy.panzoom()
              }
            }
          })
        )
      })
    ).subscribe()
  }


}

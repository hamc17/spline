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
import { Component, ComponentFactoryResolver, ViewContainerRef, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { OperationType, ExpressionComponents } from 'src/app/model/types/operationType';
import { IExpression, ILiteral, IBinary, IAttrRef, IAlias, IUDF, IGenericLeaf, IGeneric } from 'src/app/model/expression-model';
import * as _ from 'lodash';
import { Expression } from 'src/app/model/expression';
import { ExpressionType } from 'src/app/model/types/expressionType';
import { ExecutedLogicalPlanVM } from 'src/app/model/viewModels/executedLogicalPlanVM';
import { OperationDetailsVM } from 'src/app/model/viewModels/operationDetailsVM';
import { AttributeVM } from 'src/app/model/viewModels/attributeVM';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/model/app-state';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { getIconFromOperationType, getColorFromOperationType } from 'src/app/store/reducers/execution-plan.reducer';


@Component({
  selector: 'schema-details',
  templateUrl: './schema-details.component.html',
  styleUrls: ['./schema-details.component.less']
})
export class SchemaDetailsComponent implements OnInit, AfterViewInit {

  @ViewChildren('expressionPanel', { read: ViewContainerRef })
  expressionPanel: QueryList<ViewContainerRef>

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private changedetectorRef: ChangeDetectorRef,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.expressionPanel.changes.pipe(
      switchMap(_ => {
        return this.store.select('detailsInfos')
      }),
      map(opDetails => {
        const container = this.expressionPanel.first
        if (container && opDetails) {
          container.remove(0)
          const type = opDetails.operation.name
          const factory = this.componentFactoryResolver.resolveComponentFactory(ExpressionComponents.get(type))
          let instance = container.createComponent(factory).instance
          instance.expressions = this.getExpressions(opDetails)
          instance.expressionType = type
          this.changedetectorRef.detectChanges()
        }
        return opDetails
      })
    )
  }

  getDetailsInfo(): Observable<OperationDetailsVM> {
    return this.store.select('detailsInfos')
  }

  getExecutionPlanVM(): Observable<ExecutedLogicalPlanVM> {
    return this.store.select('executedLogicalPlan')
  }

  getIcon(operationName: string): string {
    return String.fromCharCode(getIconFromOperationType(operationName))
  }

  getOperationColor(operationName: string): string {
    return getColorFromOperationType(operationName)
  }

  getType(attribute?: any): string {
    return attribute._type
  }

  getExpressions(attribute: any): Expression[] {
    let expressions = []
    switch (attribute._type) {
      case OperationType.Join:
        // Build the join expression
        const title = attribute.joinType
        const values = [attribute.condition.text]
        const expression = new Expression(title, values)
        expressions.push(expression)
        break
      case OperationType.Projection:
        // Build the transformations expressions
        if (attribute.transformations) {
          const title = "Transformations"
          const values = new Array()
          attribute.transformations.forEach(transformation => values.push(this.getText(transformation)))
          const transformationExpression: Expression = new Expression(title, values)
          expressions.push(transformationExpression)
        }
        // Build the dropped Attributes expressions
        let inputs = []
        _.each(attribute.inputs, schemaIndex => inputs = _.concat(inputs, attribute.schemas[schemaIndex]))
        const output = attribute.schemas[attribute.output]
        const diff = _.differenceBy(inputs, output, 'name')
        if (diff.length > 0) {
          const title = "Dropped Attributes"
          const values = diff.map(item => item.name);
          const droppedAttributes = new Expression(title, values)
          expressions.push(droppedAttributes)
        }
        break
      //TODO : Implement the other expressions for the other types
    }
    return expressions

  }

  public getText(expr: IExpression): string {
    switch (this.getType(expr)) {
      case ExpressionType.Literal: {
        return (expr as ILiteral).value
      }
      case ExpressionType.Binary: {
        const binaryExpr = <IBinary>expr
        const leftOperand = binaryExpr.children[0]
        const rightOperand = binaryExpr.children[1]
        const render = (operand: IExpression) => {
          const text = this.getText(operand)
          return this.getType(operand) == "Binary" ? `(${text})` : text
        }
        //TODO : This should be the same, to verify. 
        //console.log(`${render(leftOperand)} ${binaryExpr.symbol} ${render(rightOperand)}`)
        //this.renderValue(leftOperand) + " " + binaryExpr + " "+ this.renderValue(rightOperand) 
        return `${render(leftOperand)} ${binaryExpr.symbol} ${render(rightOperand)}`
      }
      case ExpressionType.Alias: {
        const ae = <IAlias>expr
        return this.getText(ae.child) + " AS " + ae.alias
      }
      case ExpressionType.UDF: {
        const udf = <IUDF>expr
        const paramList = _.map(udf.children, child => this.getText(child))
        return "UDF:" + udf.name + "(" + _.join(paramList, ", ") + ")"
      }
      case ExpressionType.AttrRef: {
        const ar = <IAttrRef>expr
        //TODO : put the expression in the mock data not the reference to it
        return ar.refId
      }
      case ExpressionType.GenericLeaf: {
        return this.renderAsGenericLeafExpr(expr as IGenericLeaf)
      }
      case ExpressionType.Generic: {
        const leafText = this.renderAsGenericLeafExpr(expr as IGenericLeaf)
        const childrenTexts = (expr as IGeneric).children.map(child => this.getText(child))
        return leafText + _.join(childrenTexts, ", ")
      }
    }
  }

  private renderAsGenericLeafExpr(gle: IGenericLeaf): string {
    const paramList = _.map(gle.params, (value, name) => name + "=" + this.renderValue(value))
    return _.isEmpty(paramList) ? gle.name : gle.name + "[" + _.join(paramList, ", ") + "]"
  }

  private renderValue(obj: any): string {
    if (this.getType(obj)) {
      return this.getText(obj as IExpression)
    } else {
      return JSON.stringify(obj)
    }
  }

  getInputSchemas(operationDetails: OperationDetailsVM): AttributeVM[] {
    if (operationDetails) {
      let inputSchemas = []
      operationDetails.inputs.forEach(input => {
        inputSchemas.push(operationDetails.schemas[input])
      })
      return inputSchemas
    } else {
      return null
    }
  }

  getOutputSchema(operationDetails: OperationDetailsVM): AttributeVM[] {
    return operationDetails ? operationDetails.schemas[operationDetails.output] : null
  }

}


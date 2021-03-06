/*
 * Copyright 2017 ABSA Group Limited
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

import {Injectable} from "@angular/core";
import {IPersistedDatasetDescriptor} from "../../../generated-ts/lineage-model";
import {HttpClient} from "@angular/common/http";
import {SearchRequest} from "./dataset-browser.model";

@Injectable()
export class DatasetBrowserService {
    constructor(private httpClient: HttpClient) {}

    getLineageDescriptors(searchRequest: SearchRequest): Promise<IPersistedDatasetDescriptor[]> {
            return this.httpClient.get<IPersistedDatasetDescriptor[]>(
                "rest/dataset/descriptors",
                {
                    params: {
                        q: searchRequest.text,
                        asAtTime: `${extract(searchRequest, 'asAtTime')}`,
                        offset: `${extract(searchRequest, 'offset')}`,
                        from: `${extract(searchRequest, 'from')}`,
                        to: `${extract(searchRequest, 'to')}`,
                    size: "20"
                }
            }
        ).toPromise()
    }

}

function extract(searchRequest: SearchRequest, name: string): string {
    let val = searchRequest[name]
    if (typeof val != 'undefined') {
        return val
    } else {
        return ''
    }
}

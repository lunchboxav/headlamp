import { apiFactoryWithNamespace } from './apiProxy';
import { KubeObjectInterface, LabelSelector, makeKubeObject } from './cluster';

export interface KubeStatefulSet extends KubeObjectInterface {
  spec: {
    selector: LabelSelector;
    updateStrategy: {
      rollingUpdate: {
        partition: number;
      };
      type: string;
    };
    [other: string]: any;
  };
}

class StatefulSet extends makeKubeObject<KubeStatefulSet>('StatefulSet') {
  static apiEndpoint = apiFactoryWithNamespace('apps', 'v1', 'statefulsets', true);

  get spec() {
    return this.jsonData!.spec;
  }

  get status() {
    return this.jsonData!.status;
  }
}

export default StatefulSet;

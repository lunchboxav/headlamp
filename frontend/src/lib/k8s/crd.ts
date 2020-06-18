import { apiFactory } from './apiProxy';
import { KubeCRD, makeKubeObject } from './cluster';

class CustomResourceDefinition extends makeKubeObject<KubeCRD>('crd') {
  static apiEndpoint = apiFactory('apiextensions.k8s.io', 'v1beta1', 'customresourcedefinitions');

  get spec() {
    return this.jsonData!.spec;
  }
}

export default CustomResourceDefinition;

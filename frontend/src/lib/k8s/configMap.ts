import { apiFactoryWithNamespace } from './apiProxy';
import { KubeConfigMap, makeKubeObject } from './cluster';

class ConfigMap extends makeKubeObject<KubeConfigMap>('configMap') {
  static apiEndpoint = apiFactoryWithNamespace('', 'v1', 'configmaps');

  get data() {
    return this.jsonData?.data;
  }
}

export default ConfigMap;

import { createRouteURL } from '../router';
import { timeAgo } from '../util';
import { useConnectApi } from './api';
import { apiFactory, apiFactoryWithNamespace } from './apiProxy';
import { KubeReplicaSet } from './replicaSet';
import { KubeStatefulSet } from './statefulSet';

export interface KubeObjectInterface {
  kind: string;
  apiVersion?: string;
  metadata: KubeMetadata;
  [otherProps: string]: any;
}

export interface StringDict {
  [key: string]: string;
}

export interface KubeMetadata {
  uid: string;
  name: string;
  namespace?: string;
  creationTimestamp: string;
  resourceVersion: string;
  selfLink: string;
  labels?: StringDict;
  annotations?: StringDict;
}

export function makeKubeObject<T extends KubeObjectInterface>(detailsRouteName: string) {
  class KubeObject {
    static apiEndpoint: ReturnType<(typeof apiFactoryWithNamespace) | (typeof apiFactory)>;
    jsonData: T | null = null;

    constructor(json: T) {
      this.jsonData = json;
    }

    get detailsRoute(): string {
      return detailsRouteName;
    }

    get listRoute(): string {
      return this.detailsRoute + 's';
    }

    getDetailsLink() {
      const params = {
        namespace: this.getNamespace(),
        name: this.getName(),
      };
      let link = createRouteURL(this.detailsRoute, params);
      return link;
    }

    getName() {
      return this.metadata.name;
    }

    getNamespace() {
      return this.metadata.namespace;
    }

    getCreationTs() {
      return this.metadata.creationTimestamp;
    }

    getAge() {
      return timeAgo(this.getCreationTs());
    }

    get metadata() {
      return this.jsonData!.metadata;
    }

    get kind() {
      return this.jsonData!.kind;
    }

    static apiList<U extends KubeObject>(onList: (arg: U[]) => void) {
      const createInstance = (item: T) => this.create(item) as U;

      let args: any[] = [(list: T[]) => onList(list.map((item: T) => createInstance(item) as U))];

      if (this.apiEndpoint.isNamespaced) {
        args.unshift(null);
      }

      return this.apiEndpoint.list.bind(null, ...args);
    }

    static useApiList<U extends KubeObject>(onList: (...arg: any[]) => any) {
      const listCallback = onList as (arg: U[]) => void;
      useConnectApi(this.apiList(listCallback))
    }

    static create<U extends KubeObject>(this: new (arg: T) => U, item: T): U {
      return (new this(item)) as U;
    }

    static apiGet<U extends KubeObject>(onGet: (...args: any) => void, name: string, namespace?: string) {
      const createInstance = (item: T) => this.create(item) as U;
      let args: any[] = [name, (obj: T) => onGet(createInstance(obj))];

      if (this.apiEndpoint.isNamespaced) {
        args.unshift(namespace);
      }

      return this.apiEndpoint.get.bind(null, ...args);
    }

    static useApiGet<U extends KubeObject>(onGet: (...args: any) => any, name: string, namespace?: string) {
      // We do the type conversion here because we want to be able to use hooks that may not have
      // the exact signature as get callbacks.
      const getCallback = onGet as (item: U) => void;
      useConnectApi(this.apiGet(getCallback, name, namespace))
    }
  }

  return KubeObject;
}

export interface KubeCondition {
  type: string;
  status: string;
  lastProbeTime: number;
  lastTransitionTime?: string;
  lastUpdateTime?: string;
  reason?: string;
  message?: string;
}

export interface KubeContainer {
  name: string;
  image: string;
  command?: string[];
  args?: string[];
  ports: {
    name?: string;
    containerPort: number;
    protocol: string;
  }[];
  resources?: {
    limits: {
      cpu: string;
      memory: string;
    };
    requests: {
      cpu: string;
      memory: string;
    };
  };
  env?: {
    name: string;
    value?: string;
    valueFrom?: {
      fieldRef?: {
        apiVersion: string;
        fieldPath: string;
      };
      secretKeyRef?: {
        key: string;
        name: string;
      };
      configMapKeyRef?: {
        key: string;
        name: string;
      };
    };
  }[];
  envFrom?: {
    configMapRef?: {
      name: string;
    };
  }[];
  volumeMounts?: {
    name: string;
    readOnly: boolean;
    mountPath: string;
  }[];
  livenessProbe?: KubeContainerProbe;
  readinessProbe?: KubeContainerProbe;
  imagePullPolicy: string;
}

interface KubeContainerProbe {
  httpGet?: {
    path?: string;
    port: number;
    scheme: string;
    host?: string;
  };
  exec?: {
    command: string[];
  };
  tcpSocket?: {
    port: number;
  };
  initialDelaySeconds?: number;
  timeoutSeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

export interface KubeEvent {
  type: string;
  reason: string;
  message: string;
  metadata: KubeMetadata;
  involvedObject: {
    kind: string;
    namespace: string;
    name: string;
    uid: string;
    apiVersion: string;
    resourceVersion: string;
    fieldPath: string;
  };
  [otherProps: string]: any;
}

export interface KubeConfigMap extends KubeObjectInterface {
  data: StringDict;
}

export interface LabelSelector {
  matchExpressions?: {
    key: string;
    operator: string;
    values: string[];
  };
  matchLabels?: {
    [key: string]: string;
  };
}

export interface KubeMetrics {
  metadata: KubeMetadata;
  usage: {
    cpu: string;
    memory: string;
  };
  status: {
    capacity: {
      cpu: string;
      memory: string;
    };
  };
}

export interface KubeContainerStatus {
  containerID: string;
  image: string;
  imageID: string;
  lastState: string;
  name: string;
  ready: boolean;
  restartCount: number;
  state: {
    running: {
      startedAt: number;
    };
    terminated: {
      containerID: string;
      exitCode: number;
      finishedAt: number;
      message: string;
      reason: string;
      signal: number;
      startedAt: number;
    };
    waiting: {
      message: string;
      reason: string;
    };
  };
}

export type KubeWorkload = KubeReplicaSet | KubeStatefulSet | (KubeObjectInterface & {
  spec: {
    selector?: LabelSelector;
    strategy?: {
      type: string;
      [otherProps: string]: any;
    };
    [otherProps: string]: any;
  };
});

export interface KubeCRD extends KubeObjectInterface {
  spec: {
    group: string;
    version: string;
    versions: {
      name: string;
      served: boolean;
      storage: boolean;
    };
    scope: string;
    [other: string]: any;
  };
}

export interface KubePersistentVolume extends KubeObjectInterface {
  spec: {
    capacity: {
      storage: string;
    };
    [other: string]: any;
  };
  status: {
    message: string;
    phase: string;
    reason: string;
  };
}

export interface KubePersistentVolumeClaim extends KubeObjectInterface {
  spec: {
    accessModes: string[];
    resources: {
      limits: object;
      requests: {
        storage?: string;
        [other: string]: any;
      };
    };
    storageClassName: string;
    volumeMode: string;
    volumeName: string;
    [other: string]: any;
  };
  status: {
    capacity?: {
      storage?: string;
    };
    phase: string;
  };
}

export interface KubeStorageClass extends KubeObjectInterface {
  provisioner: string;
  reclaimPolicy: string;
  volumeBindingMode: string;
}

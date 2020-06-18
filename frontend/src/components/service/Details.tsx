import chevronRight from '@iconify/icons-mdi/chevron-right';
import { InlineIcon } from '@iconify/react';
import React from 'react';
import { useParams } from 'react-router-dom';
import Service from '../../lib/k8s/service';
import { ValueLabel } from '../common/Label';
import Loader from '../common/Loader';
import { MainInfoSection, MetadataDictGrid, PageGrid } from '../common/Resource';
import { SectionBox } from '../common/SectionBox';
import SimpleTable from '../common/SimpleTable';

export default function ServiceDetails() {
  const { namespace, name } = useParams();
  const [item, setItem] = React.useState<Service | null>(null);

  Service.useApiGet(setItem, name, namespace);

  return (
    !item ? <Loader /> :
    <PageGrid>
      <MainInfoSection

        resource={item}
        extraInfo={item && [
          {
            name: 'Type',
            value: item.spec.type,
          },
          {
            name: 'Cluster IP',
            value: item.spec.clusterIP,
          },
          {
            name: 'Selector',
            value: <MetadataDictGrid dict={item.spec.selector} />,
          },
        ]}
      />
      <SectionBox title="Ports">
        <SimpleTable
          data={item.spec.ports}
          columns={[
            {
              label: 'Protocol',
              datum: 'protocol',
            },
            {
              label: 'Name',
              datum: 'name',
            },
            {
              label: 'Ports',
              getter: ({port, targetPort}) =>
                <React.Fragment>
                  <ValueLabel>{port}</ValueLabel>
                  <InlineIcon icon={chevronRight} />
                  <ValueLabel>{targetPort}</ValueLabel>
                </React.Fragment>
            },
          ]}
        />
      </SectionBox>
    </PageGrid>
  );
}

import Paper from '@material-ui/core/Paper';
import React from 'react';
import { useParams } from 'react-router-dom';
import api, { useConnectApi } from '../../lib/api';
import { KubeConfigMap } from '../../lib/cluster';
import Empty from '../common/EmptyContent';
import Loader from '../common/Loader';
import { DataField, MainInfoSection, PageGrid } from '../common/Resource';
import { SectionBox } from '../common/SectionBox';
import SectionHeader from '../common/SectionHeader';

export default function ConfigDetails() {
  const { namespace, name } = useParams();
  const [item, setItem] = React.useState<KubeConfigMap | null>(null);
  const itemData = item?.data;

  useConnectApi(
    api.configMap.get.bind(null, namespace, name, setItem),
  );

  return (
    !item ? <Loader /> :
    <PageGrid
      sections={[
        <MainInfoSection resource={item} />,
        <Paper>
          <SectionHeader title="Data" />
          {!itemData ?
            <Empty>No data in this config map</Empty>
            : Object.keys(itemData).map((key, i) =>
              <React.Fragment key={i}>
                <SectionBox marginBottom="2rem">
                  <DataField label={key} value={itemData[key]} />
                </SectionBox>
              </React.Fragment>
            )
          }
        </Paper>
      ]}
    />
  );
}

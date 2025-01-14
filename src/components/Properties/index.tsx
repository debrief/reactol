import React from 'react';
import { Table, Tooltip } from 'antd';
import { useAppContext } from '../../context/AppContext';
import { useAppSelector } from '../../app/hooks';
import './index.css';

const formatItem = (value: any) => {
  switch(typeof value) {
    case 'boolean':
      return (value) ? 'true' : 'false';
    case 'string':
      return value;
    case 'number':
      return value.toString();
    case 'object':
      if (Array.isArray(value)) {
        return `[Array of ${(value as []).length} items]`;
      }
      return JSON.stringify(value);
    default:
      return '';
  }
}

const Properties: React.FC = () => {
  const { selection } = useAppContext();
  const allFeatures = useAppSelector(state => state.featureCollection.features)
  const selectedFeatureIds = selection;
  const features = allFeatures.filter(feature => selectedFeatureIds.includes(feature.id as string))

  if (!features || features.length === 0) {
    return <div>No feature selected</div>;
  } else if (features && features.length > 1) {
    return <div>Multiple features selected</div>;
  }

  const dataSource = Object.entries(features[0].properties || {}).map(([key, value], index) => {
    return {
      key: index,
      property: key,
      value: formatItem(value),
    }});

  const columns = [
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
      width: '80px'
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      ellipsis: {
        showTitle: false,
      },
      render: (value: string) => (
        <Tooltip placement="topLeft" title={value}>
          {value}
        </Tooltip>
      ),
    },
  ];

  return <Table bordered dataSource={dataSource} columns={columns} pagination={false} />;
};

export default Properties;

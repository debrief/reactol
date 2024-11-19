import React from 'react';
import { Table, Tooltip } from 'antd';
import { useAppSelector } from '../app/hooks';
import { selectedFeatureSelection } from '../features/selection/selectionSlice';
import './Properties.css';

const Properties: React.FC = () => {
  const feature = useAppSelector(selectedFeatureSelection);
  if (!feature) {
    return <div>No feature selected</div>;
  }

  const dataSource = Object.entries(feature.properties || {}).map(([key, value], index) => {
    const valStr = Array.isArray(value) ? value.join(', ') : value;
    return {
      key: index,
      property: key,
      value: valStr,
    }});

  const columns = [
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
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

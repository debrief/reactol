import React from 'react';
import { Table } from 'antd';
import { Feature } from 'geojson';

interface PropertiesProps {
  feature: Feature | null;
}

const Properties: React.FC<PropertiesProps> = ({ feature }) => {
  if (!feature) {
    return <div>No feature selected</div>;
  }

  const dataSource = Object.entries(feature.properties || {}).map(([key, value], index) => ({
    key: index,
    property: key,
    value: value,
  }));

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
    },
  ];

  return <Table bordered dataSource={dataSource} columns={columns} pagination={false} />;
};

export default Properties;

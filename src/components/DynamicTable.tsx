import React, { useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TablePaginationConfig } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import "../css/dataTable.css";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  dataIndex?: string;
}

interface DynamicTableProps {
  columns: Column[];
  data: any[];
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
  };
  onPageChange?: (page: number, pageSize: number) => void;
  rowSelection?: boolean;
  pathToNavigate?: string;
  label?: string;
  rowKey?: string;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  pagination,
  onPageChange,
  rowSelection = false,
  pathToNavigate,
  label = "All",
  rowKey = "key",
}) => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const antColumns: ColumnsType<any> = columns.map((col) => ({
    title: col.label,
    dataIndex: col.dataIndex || col.key,
    key: col.key,
    sorter: col.sortable
      ? (a, b) => a[col.key]?.toString().localeCompare(b[col.key]?.toString())
      : false,
    render: col.render,
    className: "text-sm font-medium",
  }));

  const onSelectChange = (newSelectedRowKeys: any[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-100">
        <h2 className="font-semibold text-base text-gray-800 flex items-center gap-2">
          <span>{label}</span>
          {typeof pagination?.total === 'number' ? (
            <span className="text-gray-500">({pagination?.total})</span>
          ) : null}
        </h2>
      </div>

      {/* 👇 Scroll wrapper */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-[1000px]">
          <Table
            className="custom-table"
            columns={antColumns}
            dataSource={data}
            rowKey={rowKey}
            rowSelection={
              rowSelection
                ? {
                    selectedRowKeys,
                    onChange: onSelectChange,
                  }
                : undefined
            }
            pagination={{
              current: pagination?.current,
              total: pagination?.total,
              pageSize: pagination?.pageSize,
              showSizeChanger: false,
              locale: { items_per_page: "/ page" },
              nextIcon: <RightOutlined />,
              prevIcon: <LeftOutlined />,
              onChange: onPageChange,
              showTotal: (total: number, range: number[]) =>
                `Showing ${range[0]} - ${range[1]} of ${total} entries`,
              position: ["bottomRight"] as TablePaginationConfig["position"],
            }}
            scroll={{ x: "max-content" }}
            onRow={
              pathToNavigate
                ? (record: any) => ({
                    onClick: (e: any) => {
                      if ((e.target as HTMLElement).closest(".action-icon"))
                        return;
                      navigate(`${pathToNavigate}/${record[rowKey]}`);
                    },
                  })
                : undefined
            }
          />
        </div>
      </div>

      {/* Custom styles */}
      <style>
        {`
        .custom-table .ant-table {
          background: transparent;
          font-family: Roboto, sans-serif;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .custom-table .ant-table-thead > tr > th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 600;
          padding: 8px 12px; /* reduced padding */
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .custom-table .ant-table-tbody > tr > td {
          padding: 8px 12px; /* reduced padding */
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-weight: 450;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc;
        }
        .custom-table .ant-pagination-item {
          border-radius: 6px;
          margin: 0 4px;
        }
        .custom-table .ant-pagination-item-active {
          background: #f8fafc;
          border-color: #e2e8f0;
        }
        .custom-table .ant-pagination-item-active a {
          color: #0f172a;
        }
        .custom-table .ant-pagination-prev .ant-pagination-item-link,
        .custom-table .ant-pagination-next .ant-pagination-item-link {
          border-radius: 6px;
          border-color: #e2e8f0;
        }
        `}
      </style>
    </div>
  );
};

export default DynamicTable;

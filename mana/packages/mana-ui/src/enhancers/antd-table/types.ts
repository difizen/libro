import type { TableProps } from 'antd';

import type { Options, Result } from '../request/types';

export type Data<TData> = { total: number; list: TData[] };

export type TableQueryParams = {
  current: number;
  pageSize: number;
  sorter?: any;
  filter?: any;
  extra?: any;
  [key: string]: any;
};

export type TableParams<
  FormValues extends Record<string, any> | undefined = undefined,
> =
  FormValues extends Record<string, any>
    ? [TableQueryParams, FormValues?]
    : [TableQueryParams];

export type Pagination = {
  current: number;
  pageSize: number;
  total: number;
};

export interface TableResult<TData, TParams> extends Result<TData, TParams> {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPage: number;
    onChange: (current: number, pageSize: number) => void;
    changeCurrent: (current: number) => void;
    changePageSize: (pageSize: number) => void;
  };
  tableProps: {
    dataSource: TData[];
    loading: boolean;
    onChange: TableProps<TData>['onChange'];
    pagination: Pagination;
  };
  search: {
    submit: () => void;
    reset: () => void;
  };
}

export const TableOptions = Symbol('mana-request-table-options');
export interface TableOptions<TData, TParams> extends Options<Data<TData>, TParams> {
  defaultPageSize?: number;
  defaultCurrent?: number;
}

export const TableService = Symbol('mana-antd-table-service');
export type TableService<TData, TParams> = (params: TParams) => Promise<Data<TData>>;

export type TableRefreshDep = [Record<string, any>, string | string[]];

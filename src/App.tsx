import {
  Avatar,
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import {
  Column,
  Table as ReactTable,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  FilterFn,
  SortingFn,
  sortingFns,
  ColumnDef,
  getSortedRowModel,
  flexRender,
  PaginationState,
} from '@tanstack/react-table';
import {
  RankingInfo,
  rankItem,
  compareItems,
} from '@tanstack/match-sorter-utils';
import usersRaw from './users.json';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { paginate } from './paginate';
import ReactPaginate from 'react-paginate';

const users = usersRaw.map((u) => ({ ...u, id: Number(u.id) }));

interface User {
  createdAt: string;
  name: string;
  avatar: string;
  address: string;
  birthday: string;
  phone: string;
  email: string;
  id: number;
}

declare module '@tanstack/table-core' {
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({
    itemRank,
  });

  return itemRank.passed;
};

const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;

  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    );
  }

  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

function App() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        footer: (props) => props.column.id,
      },
      {
        accessorKey: 'avatar',
        header: 'Avatar',
        cell: (info) => <Avatar src={info.getValue()} />,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        footer: (props) => props.column.id,
        filterFn: fuzzyFilter,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        footer: (props) => props.column.id,
      },
      {
        accessorKey: 'address',
        header: 'Address',
        footer: (props) => props.column.id,
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        footer: (props) => props.column.id,
      },
    ],
    []
  );
  const [data, setData] = useState<User[]>(() => users);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable<User>({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      pagination,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return (
    <ChakraProvider>
      <Box maxW={960} mt={8} mx='auto'>
        <Box display='flex' alignItems='center' gap={5} mb={4}>
          <Box>{table.getPrePaginationRowModel().rows.length} Rows</Box>
          <Box>
            <Popover>
              <PopoverTrigger>
                <Box
                  display='inline-flex'
                  alignItems='center'
                  justifyContent='space-between'
                  w={60}
                  borderWidth={1}
                  borderColor='gray.100'
                  px={4}
                  py={2}
                  borderRadius='8px'
                >
                  <Text fontSize='md'>
                    {table.getAllLeafColumns().length -
                      Object.values(columnVisibility).filter((v) => !v)
                        .length}{' '}
                    of {table.getAllLeafColumns().length} columns
                  </Text>
                  <ChevronDownIcon w={6} h={6} />
                </Box>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverBody>
                  <Stack direction='column'>
                    {table.getAllLeafColumns().map((column) => {
                      return (
                        <Checkbox
                          {...{
                            isChecked: column.getIsVisible(),
                            onChange: column.getToggleVisibilityHandler(),
                          }}
                        >
                          {column.id}
                        </Checkbox>
                      );
                    })}
                  </Stack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>
        </Box>
        <TableContainer
          borderWidth={1}
          borderColor={'gray.100'}
          borderRadius={12}
        >
          <Table>
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <Th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <>
                            <Box
                              display='flex'
                              alignItems='center'
                              justifyContent={'space-between'}
                              gap={2}
                            >
                              <Text>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </Text>
                              <Popover
                                placement={
                                  index === 0 ? 'bottom-start' : 'bottom-end'
                                }
                              >
                                <PopoverTrigger>
                                  <IconButton
                                    icon={<ChevronDownIcon />}
                                    aria-label='chevron-down icon'
                                  ></IconButton>
                                </PopoverTrigger>
                                <PopoverContent w={300}>
                                  <PopoverBody px={0} pb={4}>
                                    <Box>
                                      <Box
                                        display='flex'
                                        alignItems='center'
                                        gap={3}
                                        px={4}
                                        py={2}
                                        _hover={{
                                          bgColor: 'gray.100',
                                        }}
                                        cursor='pointer'
                                        onClick={() =>
                                          header.column.toggleSorting(false)
                                        }
                                      >
                                        <ArrowUpIcon w={6} h={6} />
                                        <Text
                                          textTransform='capitalize'
                                          fontSize='md'
                                          fontWeight={400}
                                        >
                                          Ascending
                                        </Text>
                                      </Box>
                                      <Box
                                        display='flex'
                                        alignItems='center'
                                        gap={3}
                                        px={4}
                                        py={2}
                                        _hover={{
                                          bgColor: 'gray.100',
                                        }}
                                        cursor='pointer'
                                        onClick={() =>
                                          header.column.toggleSorting(true)
                                        }
                                      >
                                        <ArrowDownIcon w={6} h={6} />
                                        <Text
                                          textTransform='capitalize'
                                          fontWeight={400}
                                          fontSize='md'
                                        >
                                          Descending
                                        </Text>
                                      </Box>
                                    </Box>
                                    <Filter
                                      table={table}
                                      column={header.column}
                                    />
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                            </Box>
                            {header.column.getCanFilter() ? (
                              <div>
                                {/* <Filter column={header.column} table={table} /> */}
                              </div>
                            ) : null}
                          </>
                        )}
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <Tr key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <Td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
        <Box mt={5} display='flex' gap={3} alignItems='center'>
          <Box w={240} mb={-1}>
            <Select
              size='sm'
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 15, 25, 30].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize} item per page
                </option>
              ))}
            </Select>
          </Box>
          <Box display='flex' gap={1} alignItems='flex-end'>
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label='chevron-left icon'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant='outline'
              size='sm'
            ></IconButton>
            {paginate(
              table.getState().pagination.pageIndex + 1,
              table.getPageCount(),
              2
            ).map((pageIndex, index) =>
              pageIndex !== -1 ? (
                <Button
                  key={`${pageIndex}-${index}`}
                  onClick={() => {
                    table.setPageIndex(pageIndex - 1);
                    console.log('pageIndex ', pageIndex);
                  }}
                  variant={
                    pageIndex - 1 === table.getState().pagination.pageIndex
                      ? 'solid'
                      : 'outline'
                  }
                  colorScheme='blue'
                  size='sm'
                >
                  {pageIndex}
                </Button>
              ) : (
                <Box
                  key={`${pageIndex}-${index}`}
                  fontSize='2xl'
                  px={2}
                  letterSpacing={3}
                  display='inline-block'
                  alignItems='flex-end'
                  h='100%'
                >
                  ...
                </Box>
              )
            )}
            <IconButton
              icon={<ChevronRightIcon />}
              aria-label='chevron-right icon'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant='outline'
              size='sm'
            ></IconButton>
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

const Filter = ({
  column,
  table,
}: {
  column: Column<any, unknown>;
  table: ReactTable<any>;
}) => {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);
  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = useMemo(
    () =>
      typeof firstValue === 'number'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  );

  return (
    <Box mt={2} px={5}>
      {typeof firstValue === 'number' ? (
        <RangeSlider
          aria-label={['min', 'max']}
          defaultValue={[
            (columnFilterValue as [number, number])?.[0] ||
              column.getFacetedMinMaxValues()?.[0]!,
            (columnFilterValue as [number, number])?.[1] ||
              column.getFacetedMinMaxValues()?.[1]!,
          ]}
          onChangeEnd={(value) => {
            column.setFilterValue(value);
          }}
        >
          <RangeSliderTrack bg='red.100'>
            <RangeSliderFilledTrack bg='tomato' />
          </RangeSliderTrack>
          <Tooltip
            label={
              (columnFilterValue as [number, number])?.[0] ||
              column.getFacetedMinMaxValues()?.[0]!
            }
          >
            <RangeSliderThumb boxSize={6} index={0}>
              <Box color='tomato'>
                {(columnFilterValue as [number, number])?.[0] ||
                  column.getFacetedMinMaxValues()?.[0]!}
              </Box>
            </RangeSliderThumb>
          </Tooltip>
          <Tooltip
            label={
              (columnFilterValue as [number, number])?.[1] ||
              column.getFacetedMinMaxValues()?.[1]!
            }
          >
            <RangeSliderThumb boxSize={6} index={1}>
              <Box color='tomato'>
                {(columnFilterValue as [number, number])?.[1] ||
                  column.getFacetedMinMaxValues()?.[1]!}
              </Box>
            </RangeSliderThumb>
          </Tooltip>
        </RangeSlider>
      ) : (
        <InputGroup>
          <Input
            value={(columnFilterValue as string) ?? ''}
            onChange={(e) => column.setFilterValue(e.target.value)}
          ></Input>
          <InputRightElement>
            <SearchIcon />
          </InputRightElement>
        </InputGroup>
      )}
    </Box>
  );
};

export default App;

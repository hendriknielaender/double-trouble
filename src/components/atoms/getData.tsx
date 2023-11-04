import * as React from 'react'
import ReactDOM from 'react-dom/client'

import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'

type Person = {
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
}

const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]
type DataItem = {
  Name: string;
  GithubIssues: number;
  BootstrapTime: number;
  FirstDeploymentTime: number;
  CodeDeploymentTime: number;
  DirtyDeploymentTime: number;
  LocalExecution: number;
  LocalDebugging: number;
  StreamedCloudExecution: number;
  OverallDX: number;
  VersatilityRating: number;
  Score: number;
};


const columnHelper = createColumnHelper<DataItem>()

const columns = [
  columnHelper.accessor('Name', {
    id: 'Name',
    header: () => <span>Tool</span>,
    footer: (props) => props.column.id,
    cell: (info) => <b>{info.row.original.Name}</b>
  }),
  columnHelper.accessor('GithubIssues', {
    id: 'lastName',
    header: () => <span>Github Issues</span>,
    footer: (props) => props.column.id,
    cell: (info) => info.row.original.GithubIssues,
  }),
  columnHelper.accessor('BootstrapTime', {
    header: () => 'Bootstrap Time',
    cell: (info) => info.row.original.BootstrapTime + "s",
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('FirstDeploymentTime', {
    header: () => "First Depl Time",
    cell: (info) => <div className={"text-blue-" + (100 * Math.round(info.row.original.FirstDeploymentTime / 10))}>{info.row.original.FirstDeploymentTime + "s"}</div>,
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('CodeDeploymentTime', {
    header: 'Code Depl Time',
    cell: (info) => <div className="text-blue-500">{info.row.original.CodeDeploymentTime + "s"}</div>,
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('LocalExecution', {
    header: 'Local Execution',
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('LocalDebugging', {
    header: 'Local Debugging',
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('StreamedCloudExecution', {
    header: 'Streamed Cloud Execution',
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('OverallDX', {
    header: 'Overall DX',
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('VersatilityRating', {
    header: 'Versatility Rating',
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('Score', {
    header: 'Score',
    cell: (info) => calculateScore(info.row.original).toFixed(1),
    footer: (props) => props.column.id,
  }),
];

function calculateScore(input: DataItem) {
  const { BootstrapTime, CodeDeploymentTime, DirtyDeploymentTime, FirstDeploymentTime, GithubIssues, LocalDebugging,
    LocalExecution, Name, OverallDX, StreamedCloudExecution, VersatilityRating
  } = input
  const times = (BootstrapTime + CodeDeploymentTime + DirtyDeploymentTime + FirstDeploymentTime) / 60

  return (GithubIssues / 1000) + times + VersatilityRating + StreamedCloudExecution + OverallDX + LocalExecution + LocalDebugging

}

function App() {
  const [data, setData] = React.useState(() => [...invertedData])
  const rerender = React.useReducer(() => ({}), {})[1]
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <pre>{JSON.stringify(sorting, null, 2)}</pre>
    </div>
  )
}



const invertedData = [
  {
    Name: 'Terraform',
    GithubIssues: 5500,
    BootstrapTime: 18,
    FirstDeploymentTime: 25,
    CodeDeploymentTime: 15,
    DirtyDeploymentTime: 15,
    LocalExecution: 0,
    LocalDebugging: 0,
    StreamedCloudExecution: 0,
    OverallDX: 2,
    VersatilityRating: 3,
    Score: 0,
  },
  {
    Name: 'Open Tofu',
    GithubIssues: 119,
    BootstrapTime: 18,
    FirstDeploymentTime: 35,
    CodeDeploymentTime: 15,
    DirtyDeploymentTime: 15,
    LocalExecution: 0,
    LocalDebugging: 0,
    StreamedCloudExecution: 0,
    OverallDX: 2,
    VersatilityRating: 3,
    Score: 0,
  },
  {
    Name: 'CDK',
    GithubIssues: 1900,
    BootstrapTime: 61,
    FirstDeploymentTime: 70,
    CodeDeploymentTime: 32,
    DirtyDeploymentTime: 12,
    LocalExecution: 0.5,
    LocalDebugging: -1,
    StreamedCloudExecution: 0,
    OverallDX: 1.5,
    VersatilityRating: 2.5,
    Score: 0,
  },
  {
    Name: 'CDKTF',
    GithubIssues: 296,
    BootstrapTime: -1,
    FirstDeploymentTime: 0,
    CodeDeploymentTime: 0,
    DirtyDeploymentTime: 0,
    LocalExecution: 0,
    LocalDebugging: 0,
    StreamedCloudExecution: 0,
    OverallDX: 1,
    VersatilityRating: 1,
    Score: 0,
  },
  {
    Name: 'SAM',
    GithubIssues: 383,
    BootstrapTime: 47,
    FirstDeploymentTime: 49,
    CodeDeploymentTime: 31,
    DirtyDeploymentTime: 10,
    LocalExecution: 0.5,
    LocalDebugging: -1,
    StreamedCloudExecution: 0,
    OverallDX: 1.5,
    VersatilityRating: 2,
    Score: 0,
  },
  {
    Name: 'SST',
    GithubIssues: 660,
    BootstrapTime: -1,
    FirstDeploymentTime: -1,
    CodeDeploymentTime: -1,
    DirtyDeploymentTime: -1,
    LocalExecution: -1,
    LocalDebugging: -1,
    StreamedCloudExecution: 1,
    OverallDX: 3,
    VersatilityRating: 1,
    Score: 0,
  },
  {
    Name: 'Serverless Framework',
    GithubIssues: -1,
    BootstrapTime: -1,
    FirstDeploymentTime: -1,
    CodeDeploymentTime: -1,
    DirtyDeploymentTime: -1,
    LocalExecution: -1,
    LocalDebugging: -1,
    StreamedCloudExecution: 0,
    OverallDX: 3,
    VersatilityRating: 1,
    Score: 0,
  },

]
export default App

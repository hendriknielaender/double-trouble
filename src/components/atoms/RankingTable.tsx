import * as React from 'react'
import ReactDOM from 'react-dom/client'
import InfoText from './InfoText.tsx'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
} from '@tanstack/react-table'

type Ranking = {
  Name: string;
  GithubStars: number;
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

type Weight = {
  Name: string,
  Weight: number
}
const weightsInit: Weight[] = [
  { Name: "Popularity", Weight: 1 },
  { Name: "Issues", Weight: 1 },
  { Name: "Speed", Weight: 1 },
  { Name: "DX", Weight: 2 },
  { Name: "Versatility", Weight: 1 }
]

const columnHelper = createColumnHelper<Ranking>()

const columns = [
  columnHelper.accessor('Name', {
    header: () => <span>Tool</span>,
    footer: (props) => props.column.id,
    cell: (info) => <b>{info.row.original.Name}</b>
  }),
  columnHelper.accessor('GithubStars', {
    header: () => <span>Github Stars</span>,
    footer: (props) => props.column.id,
    cell: (info) => {
      const val = info.row.original.GithubStars
      return <div>{val >= 1000 ? (val / 1000 + "k") : val}</div>
    },
  }),
  columnHelper.accessor('GithubIssues', {
    header: () => <span>Github Issues</span>,
    footer: (props) => props.column.id,
    cell: (info) => {
      const val = info.row.original.GithubIssues
      return <div>{val >= 1000 ? (val / 1000 + "k") : val}</div>
    },
  }),
  columnHelper.accessor('BootstrapTime', {
    header: () => 'Init Time',
    cell: (info) => info.row.original.BootstrapTime + "s",
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('FirstDeploymentTime', {
    header: () => "First Depl Time",
    cell: (info) => <div className={"text-blue-" + (600 - 100 * Math.round(info.row.original.FirstDeploymentTime / 10))}>{info.row.original.FirstDeploymentTime + "s"}</div>,
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('CodeDeploymentTime', {
    header: 'Code Depl Time',
    cell: (info) => <div className={"text-blue-" + (600 - 100 * Math.round(info.row.original.CodeDeploymentTime / 5))}>{info.row.original.CodeDeploymentTime + "s"}</div>,
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('DirtyDeploymentTime', {
    header: 'Dirty Depl Time',
    cell: (info) => <div className={"text-blue-" + (600 - 100 * Math.round(info.row.original.DirtyDeploymentTime / 5))}>{info.row.original.DirtyDeploymentTime + "s"}</div>,
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('LocalExecution', {
    header: 'Local Execution',
    cell: (info) => {
      const val = info.row.original.LocalExecution
      return <div className={val == 1 ? "text-blue-600" : "text-blue-300"}>{val}{getInfoText(info.row.original.Name, "LocalExecution")}</div>
    },
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('LocalDebugging', {
    header: 'Local Debugging',
    cell: (info) => {
      const val = info.row.original.LocalDebugging
      return <div className={val == 1 ? "text-blue-600" : "text-blue-300"}>{val}</div>
    },
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('StreamedCloudExecution', {
    header: 'Streamed Cloud Execution',
    cell: (info) => {
      const val = info.row.original.StreamedCloudExecution
      return <div className={val == 1 ? "text-blue-600" : "text-blue-300"}>{val}</div>
    },
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('OverallDX', {
    header: 'DX',
    cell: (info) => <div>{info.row.original.OverallDX}{getInfoText(info.row.original.Name, "OverallDX")}</div>,
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('VersatilityRating', {
    header: 'Versatility Rating',
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('Score', {
    header: 'Total',
    cell: (info) => info.row.original.Score.toFixed(1),
    footer: (props) => props.column.id,

  }),
];

function getInfoText(tool: string, category: string) {
  let text: string | undefined
  if (infoData[tool] && infoData[tool][category]) text = infoData[tool][category]
  if (text) {
    return <> <InfoText text={text} /></>
  }
}

function calculateScore(input: Ranking, weights: Weight[]) {
  const { BootstrapTime, CodeDeploymentTime, DirtyDeploymentTime, FirstDeploymentTime, GithubIssues, LocalDebugging,
    LocalExecution, OverallDX, StreamedCloudExecution, VersatilityRating, GithubStars
  } = input
  const speed = (BootstrapTime + CodeDeploymentTime + DirtyDeploymentTime + FirstDeploymentTime) / 60

  const popWeight = getWeight(weights, "Popularity")
  const speedWeight = getWeight(weights, "Speed")
  const issueWeight = getWeight(weights, "Issues")
  const dxWeight = getWeight(weights, "DX")
  const versatilityWeight = getWeight(weights, "Versatility")

  const score = (GithubIssues / 1000) * issueWeight * (-1) +
    (GithubStars / 10000) * popWeight +
    (speed * speedWeight) * (-1) +
    VersatilityRating * versatilityWeight * 0.5 +
    (StreamedCloudExecution + OverallDX + LocalExecution + LocalDebugging) * dxWeight

  return score
}

// helper function, can be refactored with map
function getWeight(weights: Weight[], name: string): number {
  const weight = weights.find(weight => weight.Name === name)
  if (!weight) {
    console.error("Couldnt find weight " + name)
    return 0
  }
  return weight.Weight
}

function RankingTable() {
  const [data, setData] = React.useState(() => [...rankingData.map((row) => ({ ...row, Score: calculateScore(row, weightsInit) }))])
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "Score",
      desc: true,
    },
  ])
  const [weights, setWeights] = React.useState(weightsInit)

  function updateWeight(name: string) {
    setWeights(weights.map((weight) => {
      const maxCounter = 3
      if (weight.Name == name) {
        console.log("Weight:" + weight.Weight)
        if (weight.Weight < maxCounter) {
          weight.Weight++
        } else {
          weight.Weight = 0
        }
      }
      return weight
    }))
  }

  React.useEffect(() => {
    console.log("Weight state update!")
    setData([
      ...rankingData.map((row) => ({ ...row, Score: calculateScore(row, weights) }))
    ])
  }, [weights])


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
      <p>Weights: {weights.map((weight) => <><button className={`rounded-full px-2 bg-blue-${600 + weight.Weight * 100}`} onClick={() => updateWeight(weight.Name)}>{weight.Name}: {weight.Weight}</button> </>)
      }</p>
    </div >
  )
}

// extra info for specific fields to explain a given score or rating
const infoData: { [key: string]: { [key: string]: string } } = {
  "CDK": {
    "LocalExecution": "Works by leveraging AWS SAM. Same limitation as sam, plus it doesn't support hot reloading (aws-sam-cli/issues/4000)",
    "OverallDX": "The amount of work-arounds and hacks needed to make the CDK work right is crazy. Local execution only by hooking in SAM."
  },
  "CDKTF": {
    "OverallDX": "Not a drop-in replacement to the normal CDK dependency at all as one might expect. Completely new packages that need to be seperately downloaded which are also not typed."
  },
  "SAM": {
    "LocalExecution": "Does work in general but not for the bun lambda layer. Bun runtime wont start because sam local won't pass a traceId."
  },
  "Terraform": {
    "OverallDX": "It is simple and does what it's supposed to do. No local execution but also no surprises. Faster than all the other tools."
  },
  "Serverless Framework": {
    "DirtyDeploymentTime": "Dirty deployments are currently not supported (serverless/issues/4454), but certain delpoyments can still be sped up either with the --update-config flag, only for config updates, and --aws-s3-accelerate for artifact upload speed improvements."
  }
}

const rankingData = [
  {
    Name: 'Terraform',
    GithubStars: 48100,
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
    GithubStars: 15300,
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
    GithubStars: 10700,
    GithubIssues: 1900,
    BootstrapTime: 61,
    FirstDeploymentTime: 70,
    CodeDeploymentTime: 32,
    DirtyDeploymentTime: 12,
    LocalExecution: 0.5,
    LocalDebugging: 0.5,
    StreamedCloudExecution: 0,
    OverallDX: 1.5,
    VersatilityRating: 2.5,
    Score: 0,
  },
  {
    Name: 'CDKTF',
    GithubStars: 4600,
    GithubIssues: 296,
    BootstrapTime: -1,
    FirstDeploymentTime: -1,
    CodeDeploymentTime: -1,
    DirtyDeploymentTime: -1,
    LocalExecution: 0,
    LocalDebugging: 0,
    StreamedCloudExecution: 0,
    OverallDX: 1,
    VersatilityRating: 1,
    Score: 0,
  },
  {
    Name: 'SAM',
    GithubStars: 6400,
    GithubIssues: 383,
    BootstrapTime: 47,
    FirstDeploymentTime: 49,
    CodeDeploymentTime: 31,
    DirtyDeploymentTime: 10,
    LocalExecution: 0.5,
    LocalDebugging: 0.5,
    StreamedCloudExecution: 0,
    OverallDX: 1.5,
    VersatilityRating: 2,
    Score: 0,
  },
  {
    Name: 'SST',
    GithubStars: 18100,
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
    GithubStars: 45300,
    GithubIssues: 1000,
    BootstrapTime: 43,
    FirstDeploymentTime: 55,
    CodeDeploymentTime: 32,
    DirtyDeploymentTime: 32,
    LocalExecution: 1,
    LocalDebugging: 1,
    StreamedCloudExecution: 0,
    OverallDX: 3,
    VersatilityRating: 1,
    Score: 0,
  },

]
export default RankingTable

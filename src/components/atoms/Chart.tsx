// biome-ignore lint/correctness/noUnusedImports: the import is needed for the charts to work
import Chart from "chart.js/auto";
import type { FunctionComponent } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";

const transparency = 0.1;
const backgroundColor = [
  `rgba(75, 192, 192, ${transparency})`,
  `rgba(54, 162, 235, ${transparency})`,
  `rgba(153, 102, 255, ${transparency})`,
  `rgba(201, 203, 207, ${transparency})`,
  `rgba(255, 99, 132, ${transparency})`,
  `rgba(255, 159, 64, ${transparency})`,
  `rgba(255, 205, 86, ${transparency})`,
];
const borderColor = [
  "rgb(75, 192, 192)",
  "rgb(54, 162, 235)",
  "rgb(153, 102, 255)",
  "rgb(201, 203, 207)",
  "rgb(255, 99, 132)",
  "rgb(255, 159, 64)",
  "rgb(255, 205, 86)",
];

type ChartData = { [key: string]: number };
type IndexAxis = "x" | "y";

function BarChart(props: {
  className: string;
  data: ChartData[];
  title: string;
  vertical: boolean;
  dataLabels: string[];
  source?: string;
  type: "bar" | "pie" | "line";
}) {
  const { data, title, vertical, source, dataLabels, type } = props;

  const chartData = {
    // for simplicity it is assumed that if multiple datasets are given, they share their labels
    labels: Object.keys(data[0]),
    datasets: data.map((dataset, index) => ({
      data: Object.values(dataset),
      label: dataLabels ? dataLabels[index] : undefined,
      backgroundColor:
        type !== "line" ? backgroundColor : backgroundColor[index],
      borderColor: type !== "line" ? borderColor : borderColor[index],
      borderWidth: 2,
    })),
  };

  const options = {
    indexAxis: (vertical ? "y" : "x") as IndexAxis,
    plugins: {
      title: {
        display: true,
        text: title,
      },
      legend: {
        display: ["pie", "line"].includes(type),
      },
    },
  };

  return (
    <div className="flex flex-col">
      {type === "pie" && (
        <div className="w-full max-w-[300px] mx-auto my-2 text-center">
          <Pie data={chartData} options={options} />
          {source && <Source source={source} />}
        </div>
      )}
      {type === "bar" && (
        <div className="w-full max-w-[600px] mx-auto my-2 text-right">
          <Bar data={chartData} options={options} />
          {source && <Source source={source} />}
        </div>
      )}
      {type === "line" && (
        <div className="w-full max-w-[600px] mx-auto my-2 text-right">
          <Line data={chartData} options={options} />
          {source && <Source source={source} />}
        </div>
      )}
    </div>
  );
}

const Source: FunctionComponent<{ source: string }> = ({ source }) => {
  return (
    <span className="text-xs text-gray-400">
      source: <a href={source}>{source}</a>
    </span>
  );
};

export default BarChart;

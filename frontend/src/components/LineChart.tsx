import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface Log {
  id: string;
  event: string;
  habitId: string;
  createdAt: string;
  points_added: number;
  habit_score: number;
  total_score: number;
}

interface LogChartProps {
  logs: Log[];
}
interface LogSummary {
	createdAt: string;
	total: number;
  }

const LogChart: React.FC<LogChartProps> = ({ logs }) => {
	const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(logs.length);


    // Transform the sorted logs array into a new array with LogSummary objects
	const transformedLogs: LogSummary[] = logs.reduce((acc: LogSummary[], log: Log, index: number) => {
		const total = index === 0 ? log.points_added : acc[index - 1].total + log.points_added;
		const logSummary: LogSummary = { createdAt: log.createdAt, total };
		acc.push(logSummary);
		return acc;
	  }, []);

  // Transforming logs into chart data format
  const chartData = {
    labels: transformedLogs.map((log) => log.createdAt.split("T")[0]).reverse().slice(start,end),
    datasets: [
      {
        label: "Habit Score",
        data: transformedLogs.map((log) => log.total).slice(start,end),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0,
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <h2>Total score Chart</h2>
      {/* start{transformedLogs[start].createdAt.split("T")[0]}
      end {transformedLogs[end].createdAt.split("T")[0]} */}
      <div className="slidecontainer">
		start
	  <input
          type="range"
          min={1}
          max={logs.length}
          value={start}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setStart(parseInt(e.target.value));
          }}
          className="slider"
          id="myRange"
        />
		end<input
		type="range"
		min={1}
		max={logs.length}
		value={end}
		onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
		  setEnd(parseInt(e.target.value));
		}}
		className="slider"
		id="myRange"
	  />
      </div>
      <Line data={chartData} />
    </div>
  );
};

export default LogChart;

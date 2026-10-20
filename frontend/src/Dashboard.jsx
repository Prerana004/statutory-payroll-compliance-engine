import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Dashboard({ rules }) {
  const data = {
    labels: rules.map((r) => r.country),
    datasets: [
      {
        label: "PF %",
        data: rules.map((r) => r.pfPercentage),
        backgroundColor: "#833ab4",
      },
      {
        label: "ESI %",
        data: rules.map((r) => r.esiPercentage),
        backgroundColor: "#fd1d1d",
      },
      {
        label: "Professional Tax",
        data: rules.map((r) => r.professionalTax),
        backgroundColor: "#fcb045",
      },
    ],
  };

  return (
    <div className="card fade-in">
      <h3 style={{ textAlign: "center" }}>Statutory Dashboard</h3>
      <Bar data={data} />
    </div>
  );
}

export default Dashboard;

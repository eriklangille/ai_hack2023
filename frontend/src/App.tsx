import ChartFrame from './components/ChartFrame';
import './App.css';
import sampleData from './assets/mission_launches.json';
import { useEffect, useState } from 'react';

function App() {

  const [data, setData] = useState<any>([]);
  const testChartNames = [
    'Chart 1',
    'Chart 2',
    'Chart 3',
    'Chart 4',
    'Chart 5',
  ];


  useEffect(() => {
    (window as any).data = sampleData;
    if (sampleData) {
      setData(sampleData);
    }
    // console.log('sample data', sampleData)
    // console.log(data);
  }, [data])

  const headerJS =`
  const data = window.data;

  if (!data) {
    return;
  }

  const canvas = document.getElementById("chart1");
  const context = canvas.getContext("2d");

  if (window.chart1 && window.chart1.destroy) {
    window.chart1.destroy();
  }

`

  const sampleJS = `
  const orgMissions = {};
  data.forEach((mission) => {
    if (orgMissions[mission.Organisation]) {
      orgMissions[mission.Organisation]++;
    } else {
      orgMissions[mission.Organisation] = 1;
    }
  });
  
  const sortedOrgMissions = Object.entries(orgMissions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  const labels = sortedOrgMissions.map(([org]) => org);
  const dataPoints = sortedOrgMissions.map(([, count]) => count);
  
  const chartConfig = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Number of Missions by Organization',
          data: dataPoints,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Missions',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Organizations',
          },
        },
      },
    },
  };
  
  const chart1 = new Chart(document.getElementById('chart1'), chartConfig);
  window.chart1 = chart1;
    
`;

  return data ? (
    <section className='flex flex-row flex-wrap gap-4'>
      {
        testChartNames.map((name, index) => (
          <ChartFrame
            key={index}
            title={name}
            index={index + 1}
            javascript={index == 0 ? (headerJS + sampleJS) : undefined}
            prompt='console.log("Hello World")'
          />
        ))
      }
    </section>
  ) : null
}

export default App

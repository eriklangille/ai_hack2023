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

  if (window.chart) {
    window.chart.destroy();
  }

`

  const sampleJS = `
  // Assuming the JSON data is stored in a variable named 'data'
  // Extract the organizations and the number of missions by each organization
  const organizations = {};
  for (const mission of data) {
    if (mission.Organisation in organizations) {
      organizations[mission.Organisation]++;
    } else {
      organizations[mission.Organisation] = 1;
    }
  }
  
  // Create an array of the organization names and an array of the corresponding mission counts
  const organizationNames = Object.keys(organizations);
  const missionCounts = Object.values(organizations);
  
  // Create a bar chart using Chart.js and attach it to the element with ID 'chart1'
  const ctx = document.getElementById('chart1').getContext('2d');
  window.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: organizationNames,
      datasets: [{
        label: 'Number of missions by each organization',
        data: missionCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
  });
    
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

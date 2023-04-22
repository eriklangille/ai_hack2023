import ChartFrame from './components/ChartFrame';
import './App.css';
import sampleData from './assets/mission_launches.json';
import { useEffect, useState } from 'react';
import { chart_names, formatList, format_data, generate_chart_js, potential_charts } from './services/gptService';

const CSV_NAME = 'mission_launches.csv';

function App() {

  const [data, setData] = useState<any>([]);
  const [chartTitles, setChartTitles] = useState<string[]>([]);
  const [formattedJson, setFormattedJson] = useState<any>([]);
  const [chart2JS, setChart2JS] = useState<string>('');
  const testChartNames = [
    'Chart 1',
    'Chart 2',
    'Chart 3',
    'Chart 4',
    'Chart 5',
  ];

  useEffect(() => {
    if (chartTitles.length > 0) {
      return;
    }

    potential_charts(CSV_NAME).then((res) => {
      console.log(res);
      const formatted_list = formatList(res);
      setChartTitles(formatted_list);
      // format_data(CSV_NAME).then((res2) => {
        // console.log(res2);
        // const json_data: any[] = JSON.parse(res2);
        // setFormattedJson(json_data);
        // generate_chart_js(JSON.stringify(json_data.slice(0, 2)), formatted_list[1], "1").then((res3) => {
        //   console.log(res3);
        //   setChart2JS(res3);
        // });
      // });
    });
  }, [])


  // useEffect(() => {
  //   (window as any).data = sampleData;
  //   if (sampleData) {
  //     setData(sampleData);
  //   }
  //   // console.log('sample data', sampleData)
  //   // console.log(data);
  // }, [data])

  useEffect(() => {
    (window as any).data = sampleData;
    if (sampleData && chartTitles.length > 0) {
      setData(sampleData);
      generate_chart_js(JSON.stringify(sampleData.slice(0, 2)), chartTitles[2], "2").then((res3) => {
        console.log(res3);
        setChart2JS(res3);
      });
    }
    // console.log('sample data', sampleData)
    // console.log(data);
  }, [data, chartTitles])

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

  return data && data.length > 1 ? (
    <section className='flex flex-row flex-wrap gap-4'>
      {
        chartTitles.map((name, index) => (
          <ChartFrame
            key={index}
            title={index === 0 ? 'Frequency of Launches by Organization' : name}
            index={index + 1}
            javascript={index == 0 ? (headerJS + sampleJS) : (index == 1 && chart2JS ? (headerJS + chart2JS) : undefined)}
            prompt='console.log("Hello World")'
          />
        ))
      }
    </section>
  ) : (
    <section className='flex flex-row flex-wrap gap-4'>
      {
        testChartNames.map((name, index) => (
          <ChartFrame
            key={index}
            title={name}
            index={index + 1}
            // javascript={index == 0 ? (headerJS + sampleJS) : (index == 2 && chart2JS ? (headerJS + chart2JS) : undefined)}
            prompt='console.log("Hello World")'
          />
        ))
      }</section>)
}

export default App

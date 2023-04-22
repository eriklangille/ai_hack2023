import ChartFrame from './components/ChartFrame';
import './App.css';


function App() {
  const testChartNames = [
    'Chart 1',
    'Chart 2',
    'Chart 3',
    'Chart 4',
    'Chart 5',
  ];

  (window as any).data = [
    {
      "Unnamed: 0.1": 0,
      "Unnamed: 0": 0,
      "Organisation": "SpaceX",
      "Location": "LC-39A, Kennedy Space Center, Florida, USA",
      "Date": 1596777120000,
      "Detail": "Falcon 9 Block 5 | Starlink V1 L9 & BlackSky",
      "Rocket_Status": "StatusActive",
      "Price": 50.0,
      "Mission_Status": "Success"
    },
    {
      "Unnamed: 0.1": 1,
      "Unnamed: 0": 1,
      "Organisation": "CASC",
      "Location": "Site 9401 (SLS-2), Jiuquan Satellite Launch Center, China",
      "Date": 1596686460000,
      "Detail": "Long March 2D | Gaofen-9 04 & Q-SAT",
      "Rocket_Status": "StatusActive",
      "Price": 29.75,
      "Mission_Status": "Success"
    },
  ];

  // useEffect(() => {
  //   // (window as any).data.forEach(console.log)
  // }, [])

  const headerJS =`
  const data = window.data;

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

  return (
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
  )
}

export default App

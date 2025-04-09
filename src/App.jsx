import "./App.css";
import { useState , useEffect} from "react";
import axios from "axios";  
import { use } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';


const OPEN_WEATHER_API_KEY = "56353444d49a9e572f3a6791f941a291"

function App() {
  const [cityInputValue, setCityInputValue] = useState("");
  const [letitude,setLetitude] = useState(null);
  const [longitude,setLongitude] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [currentCity, setCurrentCity] = useState("");
  const [currentTemp, setCurrentTemp] = useState("");
  const [weatherType, setWeatherType] = useState("");
  const [weatherDescription, setWeatherDescription] = useState("");
  const [weatherIconCode, setWeatherIconCode] = useState("");

   const handleSubmit = (event) => {
    event.preventDefault();
    axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityInputValue}&limit=1&appid=${OPEN_WEATHER_API_KEY}`
      )
      // City geo data is in response.data[0]
      // Arrow functions with no curly braces return value after arrow
      .then((response) => response.data[0])

      .then((cityGeoData) =>

        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${cityGeoData.lat}&lon=${cityGeoData.lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
        )
        


      )
      .then((response) => {

        const { data: weatherData } = response;
        console.log(weatherData);
        setLetitude(weatherData.coord.lat);
        setLongitude(weatherData.coord.lon);
        setCurrentCity(weatherData.name); 
        setCurrentTemp(weatherData.main.temp);
        setWeatherType(weatherData.weather[0].main);
        setWeatherDescription(weatherData.weather[0].description);
        setWeatherIconCode(weatherData.weather[0].icon);
        

      }
  
  ) 

};

useEffect(() => {
  if (letitude && longitude) {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${letitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}`
      )
      .then((response) => {
        const { data: forecastdata } = response;
        console.log(forecastdata);
        const rawList = response.data.list;
              // Step 1: Group temperatures by day
      const grouped = {};

      rawList.forEach(entry => {
        const date = dayjs(entry.dt_txt).format('YYYY-MM-DD');
        const time = dayjs(entry.dt_txt).format('HH:mm');
        const tempC = parseFloat((entry.main.temp - 273.15).toFixed(1));

        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({ time, temperature: tempC });
      });
      console.log(grouped);

      // Step 2: Create unique time slots for x-axis
      const allTimes = new Set();
      Object.values(grouped).flat().forEach(e => allTimes.add(e.time));
      const sortedTimes = Array.from(allTimes).sort();
      console.log(sortedTimes);

      // Step 3: Format for Recharts
      const formatted = sortedTimes.map(time => {
        const row = { time };
        for (const date in grouped) {
          const match = grouped[date].find(item => item.time === time);
          row[date] = match ? match.temperature : null;
        }
        return row;
      });
      console.log(formatted);

      setChartData(formatted);
    })
    .catch((error) => {
      console.error("Error fetching forecast data:", error);
    });
  } 
}, [letitude, longitude]);


const colors = [
  "#1f77b4", // Blue
  "#ff7f0e", // Orange
  "#2ca02c", // Green
  "#d62728", // Red
  "#9467bd", // Purple
  "#8c564b", // Brown
  "#e377c2", // Pink
  "#7f7f7f", // Gray
  "#bcbd22", // Olive
  "#17becf", // Cyan
];

const dateKeys = chartData.length > 0
  ? Object.keys(chartData[0]).filter(key => key !== "time")
  : [];


const weatherinfo = currentCity? (

    // Format the weather icon URL
    <div>
    <img
      src={`https://openweathermap.org/img/wn/${weatherIconCode}@2x.png`}
      alt="weather-icon"
    />
    <p>Current City: {currentCity}</p>
    <p>Current Temperature: {currentTemp}°C</p>
    <p>
      Current Weather: {weatherType}, {weatherDescription}
    </p>
  </div>
):(
<div>
  <p>Please enter a city name to get the weather information.</p>
</div>
);


const weatherChart = () => {
  if (chartData.length > 0) {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {dateKeys.map((date, index) => (
            <Line
              key={date}
              type="monotone"
              dataKey={date}
              stroke={colors[index % colors.length]}
              activeDot={index === 0 ? { r: 8 } : undefined}
            />
          ))}


        </LineChart>
      </ResponsiveContainer>
    );
  }
}

  return (
    <>
      <h1>Weather App</h1>
      <div className="card">
      <form onSubmit={handleSubmit}>    
        <input
          type="text"     
          placeholder="Enter city name"
          value={cityInputValue}       
          onChange={(e) => setCityInputValue(e.target.value)} 
        />
        <button type="submit">Get Weather</button>  
      </form>
      {/* Follow the weather app instructions in the exercise brief to implement this exercise */}
      </div>
      
      {weatherinfo}
     
      {weatherChart()}



    </>
  );
}

export default App;
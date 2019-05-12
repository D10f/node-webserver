console.log('loading client-side Javacript')

document.getElementById('weather-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const location = document.querySelector('#weather-form input').value;

  const msg = document.getElementById('msg')
  const summary = document.getElementById('summary')
  const temp = document.getElementById('temperature')
  const rain = document.getElementById('rain')

  msg.textContent = 'Fetching weather data...'
  temp.textContent = ''
  rain.textContent = ''

  fetch(`http://localhost:3000/weather?location=${location}`)
    .then(res => res.json())
    .then(data => {
      if(data.error){
        msg.textContent = data.error
        return console.log(data.error)
      }
      if(!data.location){
        msg.textContent = 'Unable to find data for that location'
        return console.log('Unable to find data for that location')
      }
      msg.textContent = `The weather for: ${data.location}`
      summary.textContent = `${data.forecast.summary}`
      temp.textContent = `Temperature: ${data.forecast.temperature}`
      rain.textContent = `Chance of Rain: ${data.forecast.rain}`
    })
    .catch(err => {
      console.log(err);
      res.send(`Error: ${err}`);
    })
});

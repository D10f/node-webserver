const path = require('path');
const express = require('express');
const chalk = require('chalk');
const hbs = require('hbs');
const request = require('request');

const app = express();

const port = process.env.PORT || 3000;

// Define path for Express config
const publicDirectory = path.join(__dirname, '../public');
const viewsDirectory = path.join(__dirname, '../templates/views');
const partialsDirectory = path.join(__dirname, '../templates/partials');

// Setup handlebars view engine and its location
app.set('view engine', 'hbs');
app.set('views', viewsDirectory); // default is 'views', this changes it.
hbs.registerPartials(partialsDirectory)

// Setup static directory to serve
app.use(express.static(path.join(publicDirectory)));

app.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Weather App',
    author: 'Random Dude'
  })
});

app.get('/help', (req, res, next) => {
  res.render('help', {
    title: 'Something not working?',
    author: 'Random Dude'
  })
});

app.get('/about', (req, res, next) => {
  res.render('about', {
    title: 'About this site',
    author: 'Random Dude'
  });
});

const forecast = (lat, lon, callback) => {
  const darkskyurl = `https://api.darksky.net/forecast/${config.api}/${lat},${lon}/?units=si&limit=1`
  // applying destructuring...
  request({url: darkskyurl, json: true}, (err, {body}) => {
    if(err){
      callback(err);
    } else if(body.error) {
      callback(body.error)
    } else {
      const { temperature, precipProbability } = body.currently;
      const { summary } = body.hourly;
      callback(null, {
        temperature,
        precipProbability,
        summary
      });
    }
  });
};

const geocode = (location, callback) => {
  const mapboxurl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${config.jwt}`
  request({ url: mapboxurl, json: true}, (err, {body}) => {
    if (err){
      callback(err)
    } else if (body.message) {
      callback(body.message)
    } else if (!body.features || body.features.length === 0) {
      callback('Unable to find geocode data')
    } else {
      callback(undefined, {
        latitude: body.features[0].center[1],
        longitude: body.features[0].center[0],
        location: body.features[0].place_name
      })
    }
  });
}

app.get('/weather', (req, res, next) => {
  if(!req.query.address){
    return res.send({
      error: 'You must provide a location'
    })
  }

  geocode(req.query.address.toLowerCase(), (error, data) => {
    if(error){
      return res.send({error});
    }

    const geolocation = data.location

    forecast(data.longitude, data.latitude, (error, data) => {
      if(error){
        return res.send(error)
      }
      res.send({
        location: geolocation,
        forecast: {
          temperature: data.temperature,
          rain: data.precipProbability,
          summary: data.summary
        }
      })
    });
  });
});

app.get('/help/*', (req, res) => {
  res.render('404', {
    title: 'Help article not found',
    author: 'Randome Dude'
  })
})

app.get('*', (req, res) => {
  res.render('404', {
    title: 'You lost, friend?',
    author: 'Random Dude'
  });
});

app.listen(port, () => {
  console.log(chalk.bold(`${chalk.underline('Server running on port:')} ${chalk.yellow.bold(port)}`))
});

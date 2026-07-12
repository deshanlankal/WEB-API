const express = require('express');
const data = require('./seedTuk.json');

const app = express();
const port = Number(process.env.PORT) || 3000;

const sendNotFound = (res, entityName) => {
  res.status(404).json({ error: `${entityName} not found` });
};

const parseId = value => Number(value);

const getLatestPing = vehicleId => {
  const latestPing = data.pings
    .filter(ping => ping.vehicle_id === vehicleId)
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))[0];

  if (!latestPing) {
    return null;
  }

  return {
    ping_id: String(latestPing.id),
    vehicle_id: String(latestPing.vehicle_id),
    timestamp: latestPing.timestamp,
    lat: latestPing.latitude,
    lng: latestPing.longitude,
    speed: 0
  };
};

const listCollection = (items, mapItem) => items.map(mapItem);
const findById = (items, id) => items.find(item => item.id === id);

app.get('/', (req, res) => {
  res.json({ status: 'ok', session: 'NB6007CEM S2' });
});

app.get('/provinces', (req, res) => {
  res.json(listCollection(data.provinces, province => ({ province_id: province.id, name: province.name })));
});

app.get('/provinces/:provinceId', (req, res) => {
  const province = findById(data.provinces, parseId(req.params.provinceId));

  if (!province) {
    return sendNotFound(res, 'Province');
  }

  res.json({ province_id: province.id, name: province.name });
});

app.get('/districts', (req, res) => {
  res.json(
    listCollection(data.districts, district => ({
      district_id: district.id,
      name: district.name,
      province_id: district.province_id
    }))
  );
});

app.get('/districts/:districtId', (req, res) => {
  const district = findById(data.districts, parseId(req.params.districtId));

  if (!district) {
    return sendNotFound(res, 'District');
  }

  res.json({ district_id: district.id, name: district.name, province_id: district.province_id });
});

app.get('/stations', (req, res) => {
  res.json(
    listCollection(data.stations, station => ({
      station_id: station.id,
      name: station.name,
      district_id: station.district_id
    }))
  );
});

app.get('/stations/:stationId', (req, res) => {
  const station = findById(data.stations, parseId(req.params.stationId));

  if (!station) {
    return sendNotFound(res, 'Station');
  }

  res.json({ station_id: station.id, name: station.name, district_id: station.district_id });
});

app.get('/vehicles', (req, res) => {
  res.json(
    listCollection(data.vehicles, vehicle => ({
      vehicle_id: vehicle.id,
      reg_number: vehicle.register_number,
      device_id: vehicle.device_id,
      station_id: vehicle.station_id
    }))
  );
});

app.get('/vehicles/:vehicleId', (req, res) => {
  const vehicle = findById(data.vehicles, parseId(req.params.vehicleId));

  if (!vehicle) {
    return sendNotFound(res, 'Vehicle');
  }

  res.json({
    vehicle_id: String(vehicle.id),
    reg_number: vehicle.register_number,
    device_id: vehicle.device_id,
    station_id: String(vehicle.station_id),
    last_ping: getLatestPing(vehicle.id)
  });
});

app.get('/vehicles/:vehicleId/pings', (req, res) => {
  const vehicle = findById(data.vehicles, parseId(req.params.vehicleId));

  if (!vehicle) {
    return sendNotFound(res, 'Vehicle');
  }

  const pings = data.pings.filter(ping => ping.vehicle_id === vehicle.id);

  res.json(
    pings.map(ping => ({
      ping_id: ping.id,
      vehicle_id: ping.vehicle_id,
      timestamp: ping.timestamp,
      lat: ping.latitude,
      lng: ping.longitude,
      speed: 0
    }))
  );
});

app.get('/vehicles/:vehicleId/last-position', (req, res) => {
  const vehicle = findById(data.vehicles, parseId(req.params.vehicleId));

  if (!vehicle) {
    return sendNotFound(res, 'Vehicle');
  }

  const latestPing = getLatestPing(vehicle.id);

  if (!latestPing) {
    return res.status(404).json({ error: 'No pings found for this vehicle' });
  }

  res.json({
    vehicle_id: latestPing.vehicle_id,
    timestamp: latestPing.timestamp,
    lat: latestPing.lat,
    lng: latestPing.lng,
    speed: 0
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

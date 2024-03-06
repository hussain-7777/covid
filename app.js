const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const dbPath = path.join(__dirname, 'covid19India.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let db = null
const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initDbAndServer()
//Get list of states
app.get('/states/', async (request, response) => {
  const getStatesQuery = `select 
  state_id as stateId,
  state_name as stateName, 
  population from state;`
  const states = await db.all(getStatesQuery)
  response.send(states)
})
//Get state
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getStateQuery = `select 
  state_id as stateId,
  state_name as stateName,
  population from state 
  where state_id = ${stateId};`
  const state = await db.get(getStateQuery)
  response.send(state)
})
//Create district
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const createDistrictQuery = `insert into district
  (district_name, state_id, cases, cured, active, deaths)
  values('${districtName}', '${stateId}', '${cases}', 
  '${cured}', '${active}', '${deaths}');`
  const newDistrict = await db.run(createDistrictQuery)
  response.send('District Successfully Added')
})
//Get district
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictQuery = `select 
  district_id as districtId, district_name as districtName,
  state_id as stateId, cases, cured, active, deaths 
  from district where district_id = ${districtId};`
  const district = await db.get(getDistrictQuery)
  response.send(district)
})
//Delete district
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteDistrictQuery = `delete from district
  where district_id = ${districtId};`
  const deletedDistrict = await db.run(deleteDistrictQuery)
  response.send('District Removed')
})
//Update district
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const updateDistrictQuery = `update district set
  district_name = '${districtName}', state_id = '${stateId}',
  cases = '${cases}', cured = '${cured}', active = '${active}',
  deaths = '${deaths}' where district_id = ${districtId};`
  const updatedDistrict = await db.run(updateDistrictQuery)
  response.send('District Details Updated')
})
// Get statistics of total cases, cured, active, deaths of
// a specific state based on state ID
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getStatsQuery = `select 
  sum(cases) as totalCases, sum(cured) as totalCured,
  sum(active) as totalActive, sum(deaths) as totalDeaths 
  from district where state_id = ${stateId};`
  const stats = await db.get(getStatsQuery)
  response.send(stats)
})
//Get state based on districtId
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getStateQuery = `select state_name as stateName
  from district inner join state on district.state_id = state.state_id
  where district_id = ${districtId};`
  const state = await db.get(getStateQuery)
  response.send(state)
})
module.exports = app

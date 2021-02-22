const client = require('./client')

const timeoutCodes = scope => {
  const codes = {
    'metrics': () => '04',
    'physicians': () => '05',
    'patients': () => '06',
    'clinics': () => '07',
  }

  return codes[scope]
}

const errorStrategy = (error, scope, code) => {
  if (error.code === 'ECONNABORTED')
    throw {
      error,
      code,
      scope
    }
  else
    throw error
}

module.exports = ({
  apiConfig,
  Logger,
  cacheClient
}) => {
  const generateKey = (scope, id) => `${scope}#${key}`
  const cacheStrategy = (key, handler) => 
    cacheClient.get(key)
      .then(cachedData => 
        cachedData || cacheClient.fetchData(handler, key, apiConfig.patientsTtl)
      )

  const physiciansService = idPatient =>{
    const key = `physicians#${idPatient}`
    const handler = () => 
      client({
        token: apiConfig.physiciansToken,
        retryTimes: apiConfig.physiciansRetryTimes,
        scope: 'physiciansService',
        Logger
      })
        .get(`physician/${idPatient}`)
        .catch(error => errorStrategy(error, 'physician', timeoutCodes('physician')))
    
    return cacheStrategy(key, handler, apiConfig.physiciansTtl)
  }

  const clinicsService = idPatient => {
    const key = `clinics#${idPatient}`
    const handler = () => 
      client({
        token: apiConfig.clinicsToken,
        retryTimes: apiConfig.clinicsRetryTimes,
        scope: 'clinicsService',
        Logger
      })
        .get(`clinics/${idPatient}`)
        .catch(error => errorStrategy(error, 'clinics', timeoutCodes('clinics')))
    
    return cacheStrategy(key, handler, apiConfig.clinicsTtl)
  }

  const patientsService = idPatient => {
    const key = `patients#${idPatient}`
    const handler = () => 
      client({
        token: apiConfig.patientsToken,
        retryTimes: apiConfig.patientsRetryTimes,
        scope: 'patientsService',
        Logger
      })
        .get(`patients/${idPatient}`)
        .catch(error => errorStrategy(error, 'patients', timeoutCodes('patients')))

    return cacheStrategy(key, handler, apiConfig.patientsTtl)
  }

  const metricsService = payload => {
    const key = `metrics#${idPatient}`
    const handler = () => 
      client({
        token: apiConfig.metricsToken,
        retryTimes: apiConfig.metricsRetryTimes,
        scope: 'metricsService',
        Logger
      })
        .post(`metrics/${idPatient}`, payload)
        .catch(error => errorStrategy(error, 'metrics', timeoutCodes('metrics')))
    
    return cacheStrategy(key, handler, apiConfig.metricsTtl)
  }

  return {
    physiciansService,
    clinicsService,
    patientsService,
    metricsService
  }
}

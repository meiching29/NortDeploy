module.exports = {
  PORT:         process.env.PORT         || 4000,
  ROBLE_TOKEN:  process.env.ROBLE_TOKEN  || 'nortdeploy_3e0806f857',
  ROBLE_AUTH:   'https://roble-api.openlab.uninorte.edu.co/auth',
  ROBLE_DB:     'https://roble-api.openlab.uninorte.edu.co/database',
  DOCKER_HOST:  process.env.DOCKER_HOST  || null,
  BASE_PORT:    parseInt(process.env.BASE_PORT) || 9000,
  REPOS_DIR:    process.env.REPOS_DIR    || '/app/repos',
  INACTIVITY_MINUTES: parseInt(process.env.INACTIVITY_MINUTES) || 30,
}
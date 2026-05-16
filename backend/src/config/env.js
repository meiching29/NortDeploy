const path = require('path')

module.exports = {
  PORT:         process.env.PORT         || 4000,
  ROBLE_TOKEN:  process.env.ROBLE_TOKEN  || 'nortdeploy_3e0806f857',
  ROBLE_AUTH:   'https://roble-api.openlab.uninorte.edu.co/auth',
  ROBLE_DB:     'https://roble-api.openlab.uninorte.edu.co/database',
  DOCKER_HOST:  process.env.DOCKER_HOST  || null,
  BASE_PORT:    parseInt(process.env.BASE_PORT) || 9000,
  // BUG FIX: '/app/repos' is a container path that doesn't exist on Windows.
  // Default to a 'repos' folder next to the backend process instead.
  REPOS_DIR:    process.env.REPOS_DIR    || path.join(process.cwd(), 'repos'),
  INACTIVITY_MINUTES: parseInt(process.env.INACTIVITY_MINUTES) || 30,
}
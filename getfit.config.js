module.exports = {
  // Application configuration section
  // http://pm2.keymetrics.io/docs/usage/application-declaration/

  apps: [
    // First application
    {
      name: 'getfit',
      script: 'yarn',
      args: 'prod',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  // Deployment section
  // http://pm2.keymetrics.io/docs/usage/deployment/

  deploy: {
    production: {
      user: 'sam',
      host: 'samhinshaw.com',
      ref: 'origin/master',
      repo: 'git@github.com:samhinshaw/get_fit.git',
      path: '/home/sam/serve/get_fit',
      ssh_options: 'ForwardAgent=yes',
      'post-deploy':
        'yarn install && yarn build && pm2 startOrRestart getfit.config.js --env production'
    }
    // dev: {
    //   user: 'node',
    //   host: '212.83.163.1',
    //   ref: 'origin/master',
    //   repo: 'git@github.com:repo.git',
    //   path: '/var/www/development',
    //   'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env dev',
    //   env: {
    //     NODE_ENV: 'dev'
    //   }
    // }
  }
};

#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CLIConnectionService } from "./connectionService.mjs";


import { SERVICE_PROVIDERS } from '../services/index.js';

yargs(hideBin(process.argv))
  .scriptName('timing71-service')
  .command(
    'start <service>',
    'Runs a timing service',
    yargs => {
      yargs.positional('service', { type: 'string' })
    },
    (args) => {
      const Service = SERVICE_PROVIDERS.find(s => s.name === args.service);
      if (Service) {
        const service = new Service(console.log, console.log);
        console.log(`Starting service ${Service.name}...`);
        service.start(CLIConnectionService);
      }
      else {
        console.error(`Unknown service: ${args.service}`);
      }
    }
  );

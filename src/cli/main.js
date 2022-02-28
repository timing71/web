import { Argument, Command } from 'commander';

import { serviceCommand } from './service';
import { Services } from './services';

const t71 = new Command();

t71.name('timing71')
   .description('Timing71 command-line client');

t71.command('start')
   .description('Start a timing service')
   .addArgument(
     new Argument('<service>', 'Name of timing service to run').choices(Object.keys(Services))
   ).action(serviceCommand);

t71.parse();

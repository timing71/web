import { CarMessages } from './CarMessages';
import { Classification } from './Classification';
import { DriverComparison } from './driverComparison';
import { DriverStints } from './driverStints';
import { DriveTime } from './driveTime';
import { LapHistory } from './lapHistory';
import { Messages } from './Messages';
import { PitStops } from './pitStops';
import { SessionStats } from './sessionStats';
import { StrategyOverview } from './strategy';

export const routes = [
  {
    path: '/session',
    name: 'Session statistics',
    component: SessionStats
  },
  {
    path: '/classification',
    name: 'Classification',
    component: Classification
  },
  {
    path: '/strategy',
    name: 'Strategy overview',
    component: StrategyOverview
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages
  },
  {
    path: '/driver-comparison',
    name: 'Driver comparison',
    component: DriverComparison
  },
  {
    path: '/drive-time',
    name: 'Drive time',
    component: DriveTime
  }
];

export const perCarRoutes = [
  {
    path: '/cars/:raceNum/messages',
    name: 'Car messages',
    component: CarMessages
  },
  {
    path: '/cars/:raceNum/driver-stints',
    name: 'Driver stints',
    component: DriverStints
  },
  {
    path: '/cars/:raceNum/pit-stops',
    name: 'Pit stops',
    component: PitStops
  },
  {
    path: '/cars/:raceNum/lap-history',
    name: 'Lap history',
    component: LapHistory
  },
];

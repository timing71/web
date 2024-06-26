import { CarMessages } from './CarMessages';
import { Classification } from './Classification';
import { DriverStints } from './driverStints';
import { DriveTime } from './driveTime';
import { FastLapClassification } from './FastLapClassification';
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
    path: '/strategy',
    name: 'Strategy overview',
    component: StrategyOverview
  },
  {
    path: '/classification',
    name: 'Classification',
    component: Classification
  },
  {
    path: '/fastest-lap-classification',
    name: 'Fastest lap classification',
    component: FastLapClassification
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages
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

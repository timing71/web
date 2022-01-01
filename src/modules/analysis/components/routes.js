import { DriveTime } from './driveTime';
import { Messages } from './Messages';
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

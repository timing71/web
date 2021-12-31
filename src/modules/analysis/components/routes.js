import { DriveTime } from './driveTime';
import { Messages } from './Messages';
import { SessionStats } from './sessionStats';

export const routes = [
  {
    path: '/session',
    name: 'Session statistics',
    component: SessionStats
  },
  {
    path: '/strategy',
    name: 'Strategy overview'
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

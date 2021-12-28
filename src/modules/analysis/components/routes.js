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
  }
];

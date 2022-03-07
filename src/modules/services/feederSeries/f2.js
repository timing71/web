import { FeederSeries } from './service';

export class F2 extends FeederSeries {
  series = 'F2';
  host = 'ltss.fiaformula2.com'
}

F2.regex = /www\.fiaformula2.com/;

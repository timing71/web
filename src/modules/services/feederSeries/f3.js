import { FeederSeries } from './service';

export class F3 extends FeederSeries {
  series = 'F3';
  host = 'ltss.fiaformula3.com'
}

F3.regex = /www\.fiaformula3.com/;

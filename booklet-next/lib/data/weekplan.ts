import raw from './weekplan.generated.json';
import type { WeekPlan } from './types';

interface RawWeek {
  wknr: string;
  wkdate: string;
  wkfokus: string;
  days: { label: string; color: string | null; entries: { code: string; title: string }[] }[];
  homework_html: string | null;
  planb_html: string | null;
}

export const weekPlans: WeekPlan[] = (raw as RawWeek[]).map((w) => ({
  wknr: w.wknr,
  wkdate: w.wkdate,
  wkfokus: w.wkfokus,
  days: w.days,
  homeworkHtml: w.homework_html,
  planBHtml: w.planb_html,
}));
